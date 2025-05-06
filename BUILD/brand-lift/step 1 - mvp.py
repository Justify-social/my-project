# Install required packages
!pip install --upgrade openai==0.27.8 gspread google-api-python-client google-auth-httplib2 google-auth-oauthlib

import os
import json
import openai
import pandas as pd

from google.colab import auth
auth.authenticate_user()

import gspread
import google.auth
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# ========== CONFIGURATIONS ==========
# openai.api_key = 
# TODO: Load API key from a secure source like environment variables or a secrets manager
openai.api_key = os.environ.get("OPENAI_API_KEY") 

SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1it0naKqdI1WUBeFYq900W3ez09_oYmOFw1svpaNOu7Y/edit?gid=1725119119"
WORKSHEET_NAME = "Form responses 1"
PROCESSED_INDEX_FILE = "processed_index.txt"

# Replace this with your actual folder ID
FOLDER_ID = "1ZAFeZivHpt1gZZBfkzQ-rkdAyUo7lRax"

# Local directory path (Google Drive mounted in Colab)
LOCAL_SAVE_DIR = "/content/drive/MyDrive/Build! 👷‍♂️/V1 MVP/Survey Creation Tool"
if not os.path.exists(LOCAL_SAVE_DIR):
    os.makedirs(LOCAL_SAVE_DIR)

# Obtain credentials
creds, _ = google.auth.default(scopes=[
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents"
])

gc = gspread.authorize(creds)
drive_service = build('drive', 'v3', credentials=creds)
docs_service = build('docs', 'v1', credentials=creds)

def get_gsheet_data(spreadsheet_url: str, worksheet_name: str) -> pd.DataFrame:
    sh = gc.open_by_url(spreadsheet_url)
    worksheet = sh.worksheet(worksheet_name)
    data = worksheet.get_all_values()
    df = pd.DataFrame(data[1:], columns=data[0])
    return df

def extract_campaign_info_from_row(row: pd.Series):
    campaign_name = row['Campaign Name']
    brand_goal = row['What is the wider business goal for the brand that this campaign feeds into?']
    messaging = row["What is the key messaging that the campaign wants to land? \n\nWhat do you want people to take away from the campaign?"]
    assumptions = row.get('Are there any assumptions that you have for the campaign?', 'None provided')

    kpi_cols = [c for c in row.index if 'Hero + Secondary KPIs' in c]
    kpi_info = {}
    main_kpi = None
    for c in kpi_cols:
        val = row[c]
        kpi_type = c.split('[')[-1].replace(']', '').strip()
        kpi_info[kpi_type] = val
        if isinstance(val, str) and 'Hero KPI' in val:
            main_kpi = kpi_type

    age_gender_cols = [c for c in row.index if 'Age Groups + Gender' in c]
    selected_age_genders = [c for c in age_gender_cols if pd.notna(row[c]) and row[c].strip() != 'Not Applicable']

    platform_usage_cols = [c for c in row.index if 'Platfrom Usage' in c]
    selected_platforms = [c for c in platform_usage_cols if pd.notna(row[c]) and row[c].strip() != 'Not Applicable']

    countries = row.get('Countries', '')
    location = row.get('Particular Location within selected country (optional)', '')
    other_screeners = row.get('Other Audience Screener Questions - Including Exclusions (optional)', '')

    competitors = row.get('Competitors', 'None provided')
    platform = row.get('Platform', '')
    media_spend = row.get('Media Spend [total budget, specify currency e.g. GBP]', '')

    brand_name = campaign_name.split()[0] if ' ' in campaign_name else campaign_name

    brand_context_narrative = f"""
Brand: {brand_name}
Goal: {brand_goal}
Messaging: {messaging}
Assumptions: {assumptions if pd.notna(assumptions) else 'None provided'}

Platforms involved: {platform}
Media Spend: {media_spend}
Competitors: {competitors}

Target Audience:
- Age/Gender segments selected: {', '.join(selected_age_genders) if selected_age_genders else 'None specified'}
- Platform usage selected: {', '.join(selected_platforms) if selected_platforms else 'None specified'}
- Countries: {countries}
- Location: {location}
- Additional Screeners: {other_screeners}

KPI Info:
{json.dumps(kpi_info, indent=2)}

Main KPI Identified: {main_kpi if main_kpi else 'No Hero KPI explicitly identified'}
    """

    return campaign_name, brand_name, brand_context_narrative.strip(), main_kpi, kpi_info

def generate_survey_and_analysis(brand_context: str, main_kpi: str) -> str:
    main_kpi_note = f"note: the main kpi for this campaign is '{main_kpi}'. ensure robust measurement of this kpi." if main_kpi else "if no hero kpi is identified, treat all kpis equally."

    prompt = f"""
develop an enjoyable, conversational, social media-friendly survey from the campaign brief form below – using a jargon-free tone with all text in lowercase except brand names and proper nouns. utilizing the campaign brief details, structure the survey with 10 questions starting with simple, intent-related questions to refine the audience, followed by increasingly complex brand lift questions that delve into key insights such as awareness, perception, and engagement. incorporate one or two competitor analysis questions to evaluate the brand's market position relative to key competitors, and conclude with two demographic questions strictly formatted as follows:

demographic questions (9 and 10) must be exactly:

9. age
answer options:
- age ranges: 18-24, 25-34, 35-44, 45-54, 55-64, 65+

10. gender
text: please select your age range and gender identity.
type: demographic
objective: collect demographic data for audience segmentation
gender options: male, female, non-binary/third gender, prefer to self-describe, prefer not to say
kpi(s): demographic distribution of respondents

each question should be formatted in yaml with the question number, text, type, objective, answer options with image/gif descriptions, and kpi(s)/hypotheses addressed. ensure single-choice or multiple-choice formats with 2-5 inclusive, unbiased, mutually exclusive options, including "none of the above" when appropriate, and accompany each answer option with a brief description of a culturally sensitive image or gif. maintain a logical flow from general awareness to specific attitudes and behaviors, employ progress indicators, and consider strategies like gamification and interactive media to boost participation and insights. reference established theoretical frameworks (aida model, brand resonance model), and tailor all questions to the campaign goals, ensuring comprehensive coverage. {main_kpi_note}

below is the campaign brief context:
{brand_context}

additionally:
1. propose questions that measure purchase intent, brand awareness, ad recall, brand perception, and consideration/action intent.
2. outline essential data points for brand lift analysis, mapping responses to kpis.
3. suggest any necessary audience screeners/demographic questions.
4. do not mention this prompt or that it was generated by ai.

format output with:
- a section for the proposed surveymonkey questions (in yaml)
- a section for essential data points & analysis guidance
- a section for recommended screening/demographic questions (including the specified age/gender format).
"""

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant and a highly skilled marketing strategist."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=3000,
        temperature=0.7
    )
    return response.choices[0].message.content.strip()

def create_google_doc(title: str, campaign_name: str, brand_context: str, survey_and_analysis: str) -> str:
    # Create the document in the specified folder by using the parents field
    file_metadata = {
        'name': title,
        'mimeType': 'application/vnd.google-apps.document',
        'parents': [FOLDER_ID]
    }
    doc = drive_service.files().create(body=file_metadata, fields='id').execute()
    doc_id = doc.get('id')

    requests = [
        {
            'insertText': {
                'location': {'index': 1},
                'text': f"{campaign_name}\n"
            }
        },
        {
            'updateParagraphStyle': {
                'range': {'startIndex': 1, 'endIndex': 1 + len(campaign_name) + 1},
                'paragraphStyle': {'namedStyleType': 'TITLE'},
                'fields': 'namedStyleType'
            }
        },
        {
            'insertText': {
                'location': {
                    'index': 1 + len(campaign_name) + 1
                },
                'text': "\nBrand Context\n"
            }
        },
        {
            'updateParagraphStyle': {
                'range': {
                    'startIndex': 1 + len(campaign_name) + 2,
                    'endIndex': 1 + len(campaign_name) + 2 + len("Brand Context") + 1
                },
                'paragraphStyle': {'namedStyleType': 'HEADING_1'},
                'fields': 'namedStyleType'
            }
        },
        {
            'insertText': {
                'location': {
                    'index': 1 + len(campaign_name) + 2 + len("Brand Context") + 1
                },
                'text': f"{brand_context}\n\n"
            }
        },
        {
            'insertText': {
                'location': {
                    'index': 1 + len(campaign_name) + 2 + len("Brand Context") + 1 + len(brand_context) + 2
                },
                'text': "Survey & Analysis\n"
            }
        },
        {
            'updateParagraphStyle': {
                'range': {
                    'startIndex': 1 + len(campaign_name) + 2 + len("Brand Context") + 1 + len(brand_context) + 2,
                    'endIndex': 1 + len(campaign_name) + 2 + len("Brand Context") + 1 + len(brand_context) + 2 + len("Survey & Analysis") + 1
                },
                'paragraphStyle': {'namedStyleType': 'HEADING_1'},
                'fields': 'namedStyleType'
            }
        },
        {
            'insertText': {
                'location': {
                    'index': 1 + len(campaign_name) + 2 + len("Brand Context") + 1 + len(brand_context) + 2 + len("Survey & Analysis") + 1
                },
                'text': f"{survey_and_analysis}\n"
            }
        }
    ]

    docs_service.documents().batchUpdate(documentId=doc_id, body={'requests': requests}).execute()
    return doc_id

def save_json_locally_and_to_drive(filename: str, data: dict) -> str:
    local_path = os.path.join(LOCAL_SAVE_DIR, filename)
    with open(local_path, "w", encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Upload to the same folder in Google Drive
    file_metadata = {'name': filename, 'parents': [FOLDER_ID]}
    media = MediaFileUpload(local_path, mimetype='application/json')
    uploaded = drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    file_id = uploaded.get('id')
    return file_id

def main():
    df = get_gsheet_data(SPREADSHEET_URL, WORKSHEET_NAME)

    if os.path.exists(PROCESSED_INDEX_FILE):
        with open(PROCESSED_INDEX_FILE, 'r') as f:
            processed_count = int(f.read().strip())
    else:
        processed_count = 0

    new_rows = df.iloc[processed_count:]
    if new_rows.empty:
        print("No new submissions to process.")
        return

    for index, row in new_rows.iterrows():
        campaign_name, brand_name, brand_context, main_kpi, kpi_info = extract_campaign_info_from_row(row)
        survey_and_analysis = generate_survey_and_analysis(brand_context, main_kpi)

        doc_title = f"{campaign_name} - Survey Questions"
        doc_id = create_google_doc(doc_title, campaign_name, brand_context, survey_and_analysis)
        print(f"Google Doc created with ID: {doc_id}")

        output_data = {
            "campaign_name": campaign_name,
            "brand_context": brand_context,
            "main_kpi": main_kpi,
            "kpi_info": kpi_info,
            "survey_questions_and_analysis_guide": survey_and_analysis
        }

        json_filename = f"{campaign_name.replace(' ','_')}_campaign_data.json"
        file_id = save_json_locally_and_to_drive(json_filename, output_data)
        print(f"JSON file created and uploaded with ID: {file_id}")

    with open(PROCESSED_INDEX_FILE, 'w') as f:
        f.write(str(len(df)))

if __name__ == "__main__":
    main()
