import csv
import json
import re

# Load kpi_config and code_mappings
with open('kpi_config.json', 'r', encoding='utf-8') as f:
    kpi_config = json.load(f)

with open('code_mapping.json', 'r', encoding='utf-8') as f:
    full_code_map = json.load(f)
    code_mapping = full_code_map["code_mappings"]

def get_question_id(q_text):
    match = re.match(r"(Q\d+)_", q_text)
    if match:
        return match.group(1)
    else:
        return q_text.split('_')[0] if '_' in q_text else q_text

question_to_subcols = {}
for q_text, subs in code_mapping.items():
    q_id = get_question_id(q_text)
    question_to_subcols[q_text] = {
        "question_id": q_id,
        "options": subs
    }

with open('original.csv', 'r', newline='', encoding='utf-8-sig') as infile, \
     open('survey_responses_long.csv', 'w', newline='', encoding='utf-8') as outfile:

    dict_reader = csv.DictReader(infile, delimiter=',')
    print("Fieldnames found:", dict_reader.fieldnames)

    # Ensure "Respondent ID" is exactly one of the fieldnames
    if "Respondent ID" not in dict_reader.fieldnames:
        raise ValueError("No 'Respondent ID' column found. Check CSV headers or adjust code.")
    if "Panel_Group" not in dict_reader.fieldnames:
        raise ValueError("No 'Panel_Group' column found. Check CSV headers or adjust code.")

    fieldnames = ["Respondent_ID", "Panel_Group", "Question_ID", "Response_Code"]
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in dict_reader:
        respondent_id = row["Respondent ID"]
        panel_group = row["Panel_Group"]

        for kpi_category, question_list in kpi_config["kpi_mappings"].items():
            for q_text in question_list:
                if q_text not in question_to_subcols:
                    continue

                q_id = question_to_subcols[q_text]["question_id"]
                options = question_to_subcols[q_text]["options"]

                for col_name, label in options.items():
                    if col_name in row and row[col_name].strip() == '1':
                        writer.writerow({
                            "Respondent_ID": respondent_id,
                            "Panel_Group": panel_group,
                            "Question_ID": q_id,
                            "Response_Code": label
                        })

print("Conversion complete. 'survey_responses_long.csv' created.")

