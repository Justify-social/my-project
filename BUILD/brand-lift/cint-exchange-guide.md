
Home
Reference
Guides

ed
Ed Adams

Guides
Demand
How to Navigate
Getting Started
Account and User Credentials
Authentication Process
Idempotency
Versioning
Rate Limits
Creating a Project
Feasibility
Profiling - terminology
Profiling - how to set it up
Creating a Target Group
Automated Field Work - Fielding Assistant
Going live - launching a Target Group
Respondent Flow
Reconciliation
Migration Help
Notifications Webhooks
Cint Exchange Demand API
Welcome to the Cint Developer Portal.


The Cint Exchange is the world’s largest global research marketplace for getting your surveys answered. Connect your research questions to the right people, with access to millions of respondents across 130 countries from over 800 integrated suppliers – available any time, anywhere.


By integrating with Cint, you will be able to leverage the scale, speed, and quality of the Cint Exchange in the world’s most powerful, open, embeddable and customizable programmatic market research platform.


Start your journey of increased efficiency and automation with Cint!


Who is this for?
This developer portal intends to give guidance to anyone interested in integrating with the Cint Exchange, especially technical teams. If you’re looking for documentation, want to understand workflows and best practices, then you’re in the right place. The Cint team will be on hand to help if you need it.

How to navigate the developer portal
The Demand API documentation is split into two main sections: Guides and Reference.


Guides - Context, Connections, Workflows	API reference - Technical Details
Include helpful explanations around:	Include exact technical requirements such as:
• Market research workflows and best practices	• Required parameters
• Explanations of Cint Exchange and API concepts	• Call descriptions and requirements
• Examples on how to implement specific concepts	• Dependencies between calls and endpoints
As well as the OpenAPI specification file to download
For existing customers
While the Cint Exchange is a new product and follows new design patterns, many of its elements and approaches will be familiar to users of previous Cint products, including the Lucid Marketplace and Cint Buyer API.


Keep updated
Subscribe to our status page that displays real-time system performance. Any system downtime is posted here.


New to market research and surveys?
Check out our glossary for definitions of common terms.

Your Journey with Cint
When working with Cint, we’re focused on your success. You’ll be supported by:

The Cint Integration Consultants and general account management team
The Cint Support team
Supporting material via the Developer Portal and the support pages

Onboarding
To get you started and successfully integrated into Cint Exchange, we like to look at different milestones along the way.


Stage 1 - Introduction

Introduction to the Cint team, explaining their roles and responsibilities
Go through the different stages of the integration process
Provide access to the Developer Portal and a Cint Exchange Account
Provide account specific credentials

Stage 2 - API Access

Review the Developer Portal and all its documentation
Consult the Cint team for best practices
Design your workflows

Stage 3 - Testing

Utilize your access to the Cint Exchange to evaluate your integration
Review your test Projects in line with best practices
Review your end to end process (feasibility to reconciliation/invoicing)
Optimize and prepare for launch in the live environment

Stage 4 - Go live

Launch your first non-test Project
Evaluate if all workflows and processes function as intended
Shift to full roll out once all checks are completed

Recommendations
Focus on getting your core workflow set up first, then expand other functionality
Work with your integration consultant to discuss best practice for your optimal integration
Use the UI to review your Projects and check if they were created according to our best practices
Recommended workflow
The Demand APIs provide a simple way to connect to millions of people and get answers in real time. Whether you're building a simple automation script or a large platform-to-platform integration, the APIs provide tools and methods to accomplish most tasks.


Workflows are shared between the UI and API and concepts, objects, parameters, and terminology are consistent between the two, making it easier to debug and problem-solve.


Every interaction with the Cint Exchange starts with a Project. Within a Project, you can evaluate feasibility and pricing for specific audiences, then create Target Groups to express your research goals. Once you create a Target Group, a Fielding Plan exposes that Target Group to the Cint Exchange, allowing suppliers to send panelists to your survey instrument.


Recap:

Project = the umbrella setup on the Cint Exchange which entails one or multiple Target Groups. Key information and requirements for a Project are the Name and the Project manager responsible for the Project. Example: Global Pet’s survey
>Click here for a quick video Creating your first Project
Target Group = reflects the country/language specific details of a Project. This includes key information like LOI, IR, CPI, targeting, entrylinks and quotas. Example: UK Pets
>Click here for a quick video Creating a Target Group
Survey = the actual survey accessed by the respondents via the entrylink. Example: https://www.mypetssurvey.com?RID=[%RID%]

Here is how we recommend you design your API workflow:


Workflow Example
API Workflow Sequence
1. Create a Project

2. Check Feasibility

3. Create a Target Group

4. Finalize your Requirements

5. Launch your Target Group

6. Manage and update your Target Group

7. Close your Target Group

8. Pull Reports and Reconcile your Target Group

Getting started - API Basics
The following sections will address the basic concepts and critical pieces you need for connecting with the Cint Exchange:

Account and user credentials
Authentication process
Idempotency
Versioning
Rate limits
Account and user credentials
You will be asked to sign standard terms to access the Cint Exchange API documentation.

Once the terms are signed, your Cint Integration Consultant will provide you with account and user-specific access information.

Authentication process
OAuth - Getting and working with JWTs
The Cint Exchange uses OAuth and JWT (JSON Web Tokens) for request authentication. Compared to static API keys, JWTs offer extensive scoping and expiry options, increasing security for all users of the Cint Exchange.


JWTs are secure, compact tokens designed to assert claims between two parties and are typically encoded and encrypted. They facilitate the secure transmission of information using a verifiable, trusted JSON object.


Every API request to the Cint Exchange requires a JWT bearer token. To obtain a valid token, see our section “Your first call - requesting a JWT”.


Key points:
You can’t make a call without a valid token (JWT)
You can have multiple valid JWTs at the same time
Always include client ID, client secret and the headers in your token requests

Your First Call - Requesting a JWT
At the start of a session or key expiry, make an API call to the get token endpoint.


Use the https://auth.lucidhq.com/oauth/token endpoint to request your token.


The request body must include your client_id and client_secret as well as grant type parameters.


Requesting JWT Image
Expiry times:
In the Cint Exchange, all JWTs are valid for 86400 seconds (24 hours) following token creation.

Example:
curl -X "POST" "https://auth.lucidhq.com/oauth/token" \
    -H 'Content-Type: application/json' \
    -d $'{
"client_id": "insert your client ID",
"client_secret": "insert your client secret",
"grant_type": "client_credentials",
"lucid_scopes": "app:api",
"audience": "https://api.luc.id"
}'

The OAuth flow - Required OAuth parameters
Use the following parameters in your OAuth2 request flow. We recommend using a caching OAuth solution for your integration.


Parameter	Value
client_id	Provided by Integration Consultant
client_secret	Provided by Integration Consultant
audience	...
lucid_scopes	"app:api"
grant_type	"client_credentials"
Making API Calls with a JWT
Once you obtain a JWT, it must be included as a header argument in the format "Authorization": "Bearer <Your JWT>"


Making API Calls JWT Image
Renewing your JWT Authorization
As you approach expiry, request a new JWT using the same steps used to generate the original JWT, then begin using it on new requests. Currently, JWTs can overlap, and multiple JWTs can be used simultaneously.


Summary
Your JWT must be included in your request header via "Authorization": "Bearer <Your JWT>"
For the OAuth process the following parameters always need to be included: client_id, client_secret, audience, and lucid_scopes
For some requests like creating a Project, an idempotency key will also be required.
Idempotency
In the Cint Exchange, we introduce the usage of Idempotency keys.


The goal is to prevent accidental duplication of calls and prevent unintended consequences.


In the example below, the idempotency key helps the system recognise that it is still the same request, for the same Project.


Idempotency Example
If a request fails and requires a retry, the retry should use the same idempotency key as the initial request to avoid collisions or race conditions.


Generally, on the Cint Exchange requests that create or modify objects will require an idempotency-key.


How to create idempotency keys?
The idempotency key should be a randomly-generated UUID unique to each request.


Which Types of Requests Require an Idempotency Key
Requests that create an object, such as a Project, Target Group, or Report require an Idempotency Key. This ensures that you get a single object, regardless of how many times you retry the request.


Additional resources can be found here:

https://developer.squareup.com/docs/build-basics/common-api-patterns/idempotency
https://docs.stripe.com/api/idempotent_requests
https://stripe.com/blog/idempotency
Versioning
The Cint REST API is versioned. The API version name is based on the date when the API version was released. For example, the API version 2024-12-02 was released on 2 Dec 2024.


To access different API versions, the Cint-API-Version request header is mandatory for all API requests. There is no default API version, meaning that if this header is not provided, the request will fail with a validation error. This ensures that integrations explicitly specify the API version they are using, preventing unintended changes due to version updates.


Any breaking changes will be released in a new API version. Breaking changes are changes that can potentially break an integration. Breaking changes include:

removing an entire operation
removing or renaming a parameter
removing or renaming a response field
adding a new required parameter
making a previously optional parameter required
changing the type of a parameter or response field
removing enum values
adding a new validation rule to an existing parameter
changing authentication or authorization requirements

Any additive (non-breaking) changes will be available in all supported API versions. Additive changes are changes that should not break an integration. Additive changes include:

adding an operation
adding an optional parameter
adding an optional request header
adding a response field
adding a response header
adding enum values
Rate limits
We encourage innovation with minimal limits. We ask that you please be practical and considerate when determining call frequencies. We rate limit when needed to protect the system and ensure the highest level of service.

Projects and best practices
Projects are the core fielding object for the Cint Exchange. They are made up of Target Groups and create logical groupings of related work.


Each Project is associated with an account and a Project manager. We recommend mapping users as much as possible so that each Project corresponds to an actual Cint Exchange user. If your workflows don’t assign individual users to Projects, you can assign a generic API user.


Project Workflow Example Image
Several endpoints for reporting and management focus on Projects. While in field, you can retrieve information at the Project level, which will aggregate information from the Project's member Target Groups. These are discussed in more detail in the In-Field Management section.


Key points:
Every Project is tied to an account
Every Project is tied to a Project manager (group or individual)
A Project has to be created before a Target Group can be created

Key Project parameters
A Project acts as a container for Target Groups and has relatively few arguments.


The name field should be descriptive and human-readable. If you need parameters to identify a Project, such as a CRM record ID or internal management identifier, we recommend adding them to the human-readable name for your Project.
>For example: [PO-123456] Example Project, where the [PO-123456] parameter comes from your CRM.
Projects also have a Project_manager_id parameter, which associates a Project to its Project manager. The Project manager will receive notifications about the Project and will be the primary point of contact for any issues during fielding. For large integrations without a specific Project manager, we recommend setting up a generic API User with contact details for your primary technical point of contact.
Idempotency-key parameter is a shallow unique ID that serves as a deduping mechanism. For mutable operations, this header is mandatory. It has a limit of 255 characters. The Idempotency Key should be a randomly-generated UUID unique to each request. If a request fails and requires a retry, the retry should use the same Idempotency Key as the initial request to avoid collisions or race conditions.
>Example: 96C65204-90C2-4DCB-9393-B8226DD50C76,01BTGNYV6HRNK8K8VKZASZCFP0

How to group work into Projects
Determining what work fits into your Project varies based on your integration architecture and the makeup of the work that you run with Cint. We recommend relatively small, logical groupings of work, rather than large containers with many Target Groups.


For example, if you run a monthly tracker, all work for each month should be part of one Project. As you start work for the following month, create a new Project to hold that work.


If your work is more ad-hoc, a Project might represent a single engagement and might contain as little as one Target Group. A large multi-country engagement might generate significantly more Target Groups, all of which should belong to the same Project.


As an overall rule, if a Project spans more than two months or contains more than 100 Target Groups, consider creating a new Project to hold further related work.


Key points:
Every adhoc Project on your side should have it’s own Project & Target Group on CintX
Multi-country Projects should have one Project with the individual countries as Target Groups
Trackers can have multiple countries or waves in one Project. How many depends on your setup

Tips for Trackers:
We recommend running multiple waves in the same Project to make exclusions easier for you. A new feature will be released in H1 2025 that will automatically exclude Target Groups within a Project from each other
To exclude Target Groups across Projects, you can use the parameter excluded_target_group_ids at various points in your Target Group creation and setup
How to create a Project
To create a new Project, you must provide a Project name, which does not need to be unique, and a valid Project manager ID.


The mandatory request parameters are:

Account ID
Idempotency key
Name to describe the project e.g. MyDrinksSurveyQ1
Project manager ID

Tip:
To obtain a list of Project managers for an account, call the /accounts/{account_id}/users endpoint with the user_type=Project_manager query parameter.


The registered Project Manager will receive updates on the Project, and will also see the Project when logged into the Cint Exchange UI.


If your users do not access the Cint Exchange UI, your account team will help you set up a generic Project Manager to assign to all API-created projects.


Example:
curl -X "POST" "https://api.cint.com/v1/demand/accounts/{account_id}/projects" \
     -H 'Authorization: Bearer <YOUR_JWT>' \
     -H 'Content-Type: application/json' \
     -H 'idempotency-key: <Your_IdempotencyKey>' \
     -H 'Cint-API-Version: 2025-02-17' \
     -d $'{
  "name": "Test Project",
  "Project_manager_id": "<YourPMID>"
}'

Access-Control-Allow-Headers: *
Access-Control-Allow-Methods: OPTIONS,POST,GET,DELETE,PATCH,PUT
Access-Control-Allow-Origin: *
Content-Type: application/json
Date: Wed, 01 May 2024 13:37:11 GMT
Vary: Accept-Encoding
Content-Length: 35
Connection: close
{
  "id": "01GV070G3SJECZAGE3Q3J6FV56"
}
How to get Project Overview
A Project is the umbrella for all Target Groups.


In some cases, it might be beneficial to get the overall statistics for the Project e.g. your current number of completes, IR, length of interview etc.


In cases where a Project has only one Target Group, the Project Details or Target Group Details endpoint can be used.


Respondent Journey Image
To view top-level details for all Target Groups within the Project see below an example request and response.

curl 
"https://api.cint.com/v1/demand/accounts/{account_id}/Projects/{project_id}/overview" \
     -H 'Authorization: Bearer <YOUR_JWT>' \ 
     -H 'Cint-API-Version: 2025-02-17' 

HTTP/1.1 200 OK
Date: Wed, 08 May 2024 15:05:54 GMT
Content-Type: application/json
Content-Length: 35
Connection: close
Access-Control-Allow-Headers: *
Access-Control-Allow-Methods: OPTIONS,POST,GET,DELETE,PATCH,PUT
Access-Control-Allow-Origin: *
Vary: Accept-Encoding
X-Ratelimit-Limit: 0
X-Ratelimit-Remaining: 0
X-Ratelimit-Reset: 0
X-Tyk-Trace-Id: 9c148fbf1bda64cf6fca66fc7efe0364
{
  "id": "<YourProjectID>",
  "name": "Test Project",
  "account_id": <YourAccountID>,
  "status": "active",
  "statistics": {
    "filling_goal": 1000,
    "current_completes": 412,
    "current_prescreens": 546,
    "incidence_rate_median": 0.05,
    "length_of_interview_median_seconds": 1,
    "conversion_rate_average": 0.05,
    "drop_off_rate_average": 0.05
  },
  "Project_manager_id": "<YourPMID>",
  "created_at": "2023-01-01T23:00:00.000Z"
}

For more information around the displayed statistics and/or how they are calculated, please go to our support page and speak to your Cint account team.


For Target Group specific details, please see How to get target group statistics.

Feasibility
The Cint Exchange offers two endpoints to request feasibility. Both require you to create a Project first.


Feasibility Workflow Example
Our recommended workflow:
Create a Project
Check feasibility based on the Project ID using this endpoint
Create a Target Group if you intend to proceed with the Project e.g. run the study

Tips:
You can re-use the same Project for multiple feasibility requests e.g. use the same Project for all your general feasibility requests not connected to specific Projects
Once you have a Target Group ID, you can use it to re-run the feasibility request at any point in time (pre- or during field work) using this endpoint

How does the Cint Feasibility work?
Cint’s feasibility mode takes various factors into account like incidence rate, length of interview but also how long the field work is and how we predict the platform will be at the time you plan to run the survey.


The goal is to have a predictive, yet realistic tool to help our customers to get insights into what is feasible, in what timeframe and at what price. A tool that evolves, is flexible and not reliant on historical data alone.


What to use the Cint Feasibility Tool for?

Estimates on feasibility
Estimates on pricing

When working with the Cint Feasibility Tool, we recommend to take the following factors into account:

Length of interview (LOI)
Cost per interview (CPI)
Time in field e.g. how many days/hours?
Time of year e.g. is it a holiday season, a bank holiday in the country?
Are some respondents easier/harder to reach in your Target Group and might require a higher CPI?
Will the incidence rate remain consistent during field or vary?
Is the Target Group quite niche or rather easy to contact?

Tip for Dynamic Pricing Customers:

Adjust the start and end dates to see how the costs will change. The longer the field time, the more flexible the CPI
Feasibility for Dynamic Pricing customers
When using dynamic pricing, your Target Groups are offered to suppliers at the price you set. If a supplier is willing to supply at that price, they will send respondents to your Target Group.


In order to determine optimal price for a given combination of metrics and profiles, you can make an API call to e.g. the Target Group feasibility endpoint to receive price suggestions.


We recommend interpreting the ranges specified, then setting your cost_per_interview accordingly.


Key points:
The returned feasibility will depend on what was specified in your Project or Target Group
Besides incidence rate, factors like time in field or seasonality will run will be taken into account
Cint will not set the CPI for your project. As a Dynamic Pricing customers, you will control the price.

A Dynamic Pricing customer is fully in control of and fully responsible for the CPI selected.


Example response:
{
 "suggested_price": {
    "value": "1.027375339",
    "currency_code": "USD",
    "currency_scale": 2
  },
  "suggested_price_range": {
    "min": {
      "value": "0.667425097",
      "currency_code": "USD",
      "currency_scale": 2
    },
    "max": {
      "value": "1.027375339",
      "currency_code": "USD",
      "currency_scale": 2
    }
  },
  "suggested_filling_goal_range": {
    "min": 500,
    "max": 500
  }
}

Recommendation:
Use our automated pricing and fielding option to optimize your CPI during field.


See how or where to add your Fielding Assistant below. Additional information can be found on our support page.


Helpful endpoints:
Create or update the fielding assistant modules assignment
Returns Fielding Assistant assignment details for a Target Group
Create a target group in draft status
Feasibility for Rate Card customers
When using rate card pricing, your Target Groups are offered to suppliers at the price determined by your rate card. Which price (CPI) is selected depends on the incidence rate (IR) and length of interview (LOI) of a Target Group. If a supplier is willing to supply at that price, they will send respondents to your Target Group.


In order to determine optimal price for a given combination of metrics and profiles, you can make an API call to the Target Group feasibility endpoint to receive price suggestions.


Key points:
The returned feasibility will depend on what was specified in your Project or Target Group
Besides incidence rate, factors like time in field or seasonality will be taken into account
Cint will return the recommended CPI based on your IR and LOI from your rate card

Example response:
{
  "suggested_price": {
    "value": "4.140000000",
    "currency_code": "USD",
    "currency_scale": 2
  },
  "suggested_filling_goal_range": {
    "min": 500,
    "max": 500
  }
}
Profiling - Explaining the terminology and general concepts
Every Target Group has a profile attribute that describes the intended audience for the attached survey. For example, if you want to run a Project about pets, you would use the profile section to implement questions from our profile library to define your Target Group. For example choosing a question about type of pets in your household.


When creating a draft Target Group, the profiles can be specified as an array. Each profile is associated with a specific question object and includes groupings of allowed answers. The allowed answers options are added to the conditions object, then grouped further into quotas, which can have an allowable cap (quota) and a filling_goal, used for Fielding Assistant. In our example from above, the answer options relevant for your survey could be cats and dogs.


Example: Pet survey

Target Group: 18-65 year olds that have either cats, dogs or birds.

Quotas: age 18-65 year olds = 100%, cats 39% of respondents, dog(s) 56% of respondents, Bird(s) 5% of respondents.


Profiling Example
>Watch our video walkthrough in the UI


A question has several answer options and may also offer raw or range inputs. When used to create a Profile, these answers are referred to as conditions. We will go into more detail about conditions in our Creating a Target Group section.


Example: For the standard Gender question in the US-English

{
  "category_id": 8,
  "id": 43,
  "response_type": "single_punch",
  "scope": "standard",
  "name": "GENDER",
  "text": "Are you...?",
  "text_translated": "",
  "options": [
    {
      "precode": "1",
      "name": "Male",
      "translated_name": ""
    },
    {
      "precode": "2",
      "name": "Female",
      "translated_name": ""
    }
  ],
  "dependency": {
    "origin_option_precodes": null,
    "data": null
  }
}

Options:
List all available questions - here
Individual questions plus answer options - here

Several API endpoints are available to list questions and answer options for each locale. These may be different to your question and answer options. We recommend adding the Cint questions and answer options to a database or cache databasing and mapping these to values in your system.


Cint regularly adds and/or updates questions and answer options to the Profile Library to be in line with industry standards and customer needs.


All changes will be communicated in the quarterly Profile Library updates newsletter, including a description and roll out date of the change.


Tip:
If you can adopt the Cint Profile Library in your system you will automatically have a one to one mapping. It will remove the need to review and update your Library on a regular basis. Cint will handle this task for you. It will also remove the need for mapping which will reduce the time spent on development and maintenance.

Profiling - Using Templates, Profiles, Conditions and Quotas
Before we dive into Target Group conditions, here’s a quick recap of terms.


Profiles: also called characteristics or questions. The questions are used to target or screen respondents accessing your survey in order to ensure you’ve got the right participants.
Profile Library: the Cint library of questions. They will help you target the respondents you’re looking for. For more information, click here.
Condition: can be simply the answer option of the screening question e.g. the profile question is “Are you..?” and the answer options or conditions are male/female
Quota: percentage for a characteristic e.g. cats. The quota defines the amount of respondents who should fit this criteria out of the overall target. For example 50% cat owners out of 100 respondents overall.

The Profiling section in your Target Group creation process is where you will add and define who you are looking for and how many respondents you need for each of these characteristics.


Example:
Below you can see an example from the UI which correlates to the API.

The profiling section below considers the profile “age” and has defined age ranges as the conditions.

It also includes the number of people or the percentage required for each of these age ranges.

Profiling Example
{
  "name": "AgeRangeExample",
  "business_unit_id": "<<YourBUID>>",
  "project_manager_id": "<<YourID>>",
  "study_type_code": "adhoc",
  "industry_code": "sports",
  "locale": "eng_us",
  "collects_pii": false,
  "filling_goal": 500,
  "expected_length_of_interview_minutes": 10,
  "expected_incidence_rate": 0.50,
  "fielding_specification": {
    "start_at": "2025-01-28T08:22:18.822Z",
    "end_at": "2025-01-30T08:22:18.821Z"
        },
  "cost_per_interview": {
    "value": "1.000000000",
     "currency_code": "USD",
     "currency_scale": 2
        },
  "live_url": "https://mytestsurvey.com/?RID=[%RID%]",
  "test_url": "https://mytestsurvey.com/?RID=[%RID%]",
  "pricing_model": "dynamic",
  "fielding_assistant_assignment": {
    "pricing": {
        "type": "dynamic",
        "total_budget": {
        "value": "5.0000",
        "currency_code": "USD"
      }
          },
    "quota_overlay": {
          "prevent_overfill": true,
          "balance_fill": false
        }
  },
  "profile": {
    "profile_adjustment_type": "percentage",
    "drafts": [
      {
        "question_id": 42,
        "quotas_enabled": true,
        "conditions": {
          "object": "range_conditions_details_template",
          "data": [
            {
              "min": 18,
              "max": 24,
              "text": "18 to 24"
            },
            {
              "min": 25,
              "max": 34,
              "text": "25 to 34"
            },
            {
              "min": 35,
              "max": 44,
              "text": "35 to 44"
            },
            {
              "min": 45,
              "max": 54,
              "text": "45 to 54"
            },
            {
              "min": 55,
              "max": 64,
              "text": "55 to 64"
            },
            {
              "min": 65,
              "max": 99,
              "text": "65 to 99"
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "index": 0,
              "quota_percentage": 12
            },
            {
              "index": 1,
              "quota_percentage": 18
            },
            {
              "index": 2,
              "quota_percentage": 16
            },
            {
              "index": 3,
              "quota_percentage": 16
            },
            {
              "index": 4,
              "quota_percentage": 17
            },
            {
              "index": 5,
              "quota_percentage": 21
            }
          ],
          "grouped": []
        }
      }
    ]
  }
  }

Profiling can be added in two ways

Ad hoc, meaning that every Target Group Profiling is defined individually and new every time
Via templates. Cint Exchange offers the option to either create and utilize existing standard templates or create account specific templates.

Recommendations
If you have Target Groups that are repetitive e.g. for Tracker projects, consider creating a template for your Profile section
Check out the Cint templates to help standardize your setups e.g. census representative templates
Avoid creating quota cells that are too narrow or too small. This might make it difficult to achieve your overall target. → for on additional tips on Quota best practices, see https://help.cint.com/s/ and speak to your Customer Success representative
Profiles - Templates
Cint has created Global Templates to help customers get setup quickly.


Our most used template is currently the census representative template for the US. We offer similar templates across various countries and languages.


We recommend creating profile templates for commonly-used audiences and study types. Rather than needing to specify all parameters for a complex profile each time, the profile can be stored for future use, then applied to a given Target Group as needed.


To use a Template, retrieve its JSON description, then use that JSON description in your draft Target Group configuration. Templates can also be used to update a Target Group using the same approach.


Useful endpoints:
Create a profile template
Edit a profile template
Delete a profile template
Get a profile template
List profile templates

Example
Census representative template for Thailand ID:

{
    "id": "08d0d681-bc41-4a99-a9f4-c06b3df56abd",
    "name": "census-representation-thailand",
    "description": "Source: Official Statistical Registration Systems (2018)",
    "label": "Census Representation",
    "locales": [
    "eng_th",
    "tha_th"
    ],
    "scope": "global"
},

Full description for the Census representative template for Thailand:

{
  "id": "08d0d681-bc41-4a99-a9f4-c06b3df56abd",
  "name": "census-representation-thailand",
  "description": "Source: Official Statistical Registration Systems (2018)",
  "label": "Census Representation",
  "locales": [
    "eng_th",
    "tha_th"
  ],
  "profiles": [
    {
      "question_id": 42,
      "name": "age",
      "description": "20 years old or older",
      "conditions": {
        "data": [
          {
            "text": "20 to 24",
            "min": 20,
            "max": 24
          },
          {
            "text": "25 to 34",
            "min": 25,
            "max": 34
          },
          {
            "text": "35 to 44",
            "min": 35,
            "max": 44
          },
          {
            "text": "45 to 54",
            "min": 45,
            "max": 54
          },
          {
            "text": "55 to 64",
            "min": 55,
            "max": 64
          },
          {
            "text": "65 to 99",
            "min": 65,
            "max": 99
          }
        ],
        "object": "range_conditions_details_template"
      },
      "quotas": {
        "ungrouped": [
          {
            "index": 0,
            "quota_percentage": 10
          },
          {
            "index": 1,
            "quota_percentage": 22
          },
          {
            "index": 2,
            "quota_percentage": 23
          },
          {
            "index": 3,
            "quota_percentage": 20
          },
          {
            "index": 4,
            "quota_percentage": 13
          },
          {
            "index": 5,
            "quota_percentage": 12
          }
        ],
        "grouped": []
      }
    },
    {
      "question_id": 43,
      "name": "gender",
      "description": "All genders",
      "conditions": {
        "data": [
          {
            "option": "1"
          },
          {
            "option": "2"
          }
        ],
        "object": "selection_conditions_details_template"
      },
      "quotas": {
        "ungrouped": [
          {
            "index": 0,
            "quota_percentage": 49
          },
          {
            "index": 1,
            "quota_percentage": 51
          }
        ],
        "grouped": []
      }
    }
  ]
}
Profiles - Grouped vs. ungrouped
Quotas can be built on either grouped or ungrouped conditions. ungrouped conditions represent individual answer/condition choices with a quantity attached, while grouped objects can include several conditions in an OR grouping.


Note: A lot of setups are unlikely to require grouping.


Grouping works best for profile questions with a long list of answer options e.g. regions or income ranges that are then grouped together.


Example:
Grouping different pets together and setting a quota on each Group.

Profiles - Grouped vs. ungrouped
"profile": {
    "profile_adjustment_type": "percentage",
    "drafts": [
      {
        "question_id": 639,
        "quotas_enabled": true,
        "conditions": {
          "object": "selection_conditions_details_template",
          "data": [
            {
              "option": "1",
              "text": "Cat(s)"
            },
            {
              "option": "2",
              "text": "Dog(s)"
            },
            {
              "option": "3",
              "text": "Bird(s)"
            },
            {
              "option": "4",
              "text": "Fish"
            },
            {
              "option": "5",
              "text": "Amphibians (frogs, toads, etc.)"
            },
            {
              "option": "6",
              "text": "Small animals or rodents (hamsters, mice, rabbits, ferrets, etc.)"
            },
            {
              "option": "7",
              "text": "Reptiles (turtles, snakes, lizards, etc.)"
            },
            {
              "option": "8",
              "text": "Horse(s)"
            },
            {
              "option": "9",
              "text": "I do not have any pets"
            },
            {
              "option": "10",
              "text": "Other"
            }
          ]
        },
        "quotas": {
          "ungrouped": [],
          "grouped": [
            {
              "name": "Group 1",
              "indexes": [
                0,
                1
              ],
              "quota_percentage": 67
            },
            {
              "name": "Group 2",
              "indexes": [
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9
              ],
              "quota_percentage": 34
            }
          ]
        }
      }
    ],
}
Profiles - Nested/Interlocked Quotas
Interlocked or Nested Quotas are quotas that combine two or more characteristics,for instance age and gender.


Researchers use this to break down the respondents into smaller groups and try to ensure a good distribution across all characteristics in their overall sample size. It also helps to prevent skews towards a more dominant or more available group. Controlling your respondent pool that way can have a negative impact if done incorrectly. It can easily limit feasibility, increase costs and extend field time. For additional Tips and Tricks on how to best set up interlocked quotas, please see https://help.cint.com/s/ and speak to your Customer Success representative.


ExampleProfiles - Nested/Interlocked Quotas
Profiles - How to implement Interlocked Quotas to a draft Target Group
This section covers the basic workflows on how to create interlocked quotas on the Cint Exchange.


Important endpoints this section covers:

Generate interlocked profile from provided profiles
Create an interlocked profile
Get Profiles

The Cint Exchange provides two endpoints to create an interlocked quota in your target group:

Generate interlocked profile from provided profiles - Used for Draft target group with no existing profilers
Create an interlocked profile - Used for non-draft target group with existing profilers

Tip:
Cint is trying to make interlocked quotas easier, reduce the chance of errors and take out the potential headache of writing a lengthy, complex codeblock.


Use the Generate interlocked profile from provided profiles endpoint to generate the payload that goes into the interlocked quota section of your target group.


Below, you will find a step by step guide on how to implement an interlock quota to your draft Target Group.


1. Identify the questions and options that you want to interlock via List all available questions endpoint and Provides question with all available options endpoint.

2. Pass each question and required options as separate objects within the profiler array in the request body for Generate interlocked profile from provided profiles endpoint.

3. Copy the response from the above step and paste it in the interlocked_profiles array while Creating the target group in draft status or Updating target group in draft status.


Once the above set of operations are complete, you will have a target group in draft status with interlocked quotas.


Example:
Interlocking Age and Gender as below

15-19 Male

15-19 Female

20-29 Male

20-29 Female

30-39 Male

30-39 Female


Below is the request you need to pass to the Generate interlocked profile from provided profiles endpoint


Example request
{
  "filling_goal": 100,
  "locale": "eng_us",
  "start_at": "2025-01-02T12:00:00.000Z",
  "end_at": "2025-01-02T12:00:00.000Z",
  "collects_pii": false,
  "profiles": [
    {
      "question_id": 43,
      "quotas_enabled": true,
      "conditions": {
        "object": "selection_conditions_details_template",
        "data": [
          {
            "text": "",
            "option": "1"
          },
          {
            "text": "",
            "option": "2"
          }
        ]
      },
      "quotas": {
        "ungrouped": [
          {
            "index": 0,
            "quota_percentage": 49,
            "quota_nominal": 0
          },
          {
            "index": 1,
            "quota_percentage": 51,
            "quota_nominal": 0
          }
        ],
        "grouped": []
      }
    },
    {
      "question_id": 42,
      "quotas_enabled": true,
      "conditions": {
        "object": "range_conditions_details_template",
        "data": [
          {
            "text": "",
            "min": 15,
            "max": 19
          },
          {
            "text": "",
            "min": 20,
            "max": 29
          },
          {
            "text": "",
            "min": 35,
            "max": 39
          },
          {
            "text": "",
            "min": 40,
            "max": 49
          }
        ]
      },
      "quotas": {
        "ungrouped": [
          {
            "index": 0,
            "quota_percentage": 20,
            "quota_nominal": 0
          },
          {
            "index": 1,
            "quota_percentage": 20,
            "quota_nominal": 0
          },
          {
            "index": 2,
            "quota_percentage": 30,
            "quota_nominal": 0
          },
          {
            "index": 3,
            "quota_percentage": 30,
            "quota_nominal": 0
          }
        ],
        "grouped": []
      }
    }
]
}

Example response
[
  {
    "id": "01JP0M57XAWSMNPSW5M62A035H",
    "name": "GENDER, AGE",
    "quotas_enabled": true,
    "depends_on_questions": [
      43,
      42
    ],
    "quotas": {
      "ungrouped": [
        {
          "id": "01JP0M57XAWSMNPSW5M62A035J",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035J",
            "text": "15-19, Male",
            "text_translated": "15-19, Male",
            "option": "1",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "15-19",
                    "text_translated": "15-19",
                    "min": 15,
                    "max": 19
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Male",
                    "text_translated": "Male",
                    "option": "1"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        },
        {
          "id": "01JP0M57XAWSMNPSW5M62A035K",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035K",
            "text": "15-19, Female",
            "text_translated": "15-19, Female",
            "option": "2",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "15-19",
                    "text_translated": "15-19",
                    "min": 15,
                    "max": 19
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Female",
                    "text_translated": "Female",
                    "option": "2"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        },
        {
          "id": "01JP0M57XAWSMNPSW5M62A035M",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035M",
            "text": "20-29, Male",
            "text_translated": "20-29, Male",
            "option": "3",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "20-29",
                    "text_translated": "20-29",
                    "min": 20,
                    "max": 29
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Male",
                    "text_translated": "Male",
                    "option": "1"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        },
        {
          "id": "01JP0M57XAWSMNPSW5M62A035N",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035N",
            "text": "20-29, Female",
            "text_translated": "20-29, Female",
            "option": "4",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "20-29",
                    "text_translated": "20-29",
                    "min": 20,
                    "max": 29
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Female",
                    "text_translated": "Female",
                    "option": "2"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        },
        {
          "id": "01JP0M57XAWSMNPSW5M62A035P",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035P",
            "text": "35-39, Male",
            "text_translated": "35-39, Male",
            "option": "5",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "35-39",
                    "text_translated": "35-39",
                    "min": 35,
                    "max": 39
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Male",
                    "text_translated": "Male",
                    "option": "1"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        },
        {
          "id": "01JP0M57XAWSMNPSW5M62A035Q",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035Q",
            "text": "35-39, Female",
            "text_translated": "35-39, Female",
            "option": "6",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "35-39",
                    "text_translated": "35-39",
                    "min": 35,
                    "max": 39
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Female",
                    "text_translated": "Female",
                    "option": "2"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        },
        {
          "id": "01JP0M57XAWSMNPSW5M62A035R",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035R",
            "text": "40-49, Male",
            "text_translated": "40-49, Male",
            "option": "7",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "40-49",
                    "text_translated": "40-49",
                    "min": 40,
                    "max": 49
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Male",
                    "text_translated": "Male",
                    "option": "1"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        },
        {
          "id": "01JP0M57XAWSMNPSW5M62A035S",
          "condition": {
            "id": "01JP0M57XAWSMNPSW5M62A035S",
            "text": "40-49, Female",
            "text_translated": "40-49, Female",
            "option": "8",
            "related_condition": [
              {
                "question_id": 42,
                "conditions": [
                  {
                    "text": "40-49",
                    "text_translated": "40-49",
                    "min": 40,
                    "max": 49
                  }
                ]
              },
              {
                "question_id": 43,
                "conditions": [
                  {
                    "text": "Female",
                    "text_translated": "Female",
                    "option": "2"
                  }
                ]
              }
            ]
          },
          "quota_percentage": 0,
          "filling_goal": 0,
          "quota_nominal": 0
        }
      ],
      "grouped": []
    },
    "profiles": [
      {
        "id": "01JP0M58010ZWK2VPS4BEA5Q0N",
        "question_id": 43,
        "name": "GENDER",
        "quotas_enabled": true,
        "description": "Are you...?",
        "description_translated": "Are you...?",
        "conditions": {
          "object": "selection_conditions_details_template",
          "data": [
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0P",
              "option": "1"
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0Q",
              "option": "2"
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0P",
              "index": 0,
              "conditions": [
                "01JP0M58010ZWK2VPS4BEA5Q0P"
              ],
              "quota": 0,
              "quota_percentage": 49,
              "filling_goal": 0,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 0
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0Q",
              "index": 1,
              "conditions": [
                "01JP0M58010ZWK2VPS4BEA5Q0Q"
              ],
              "quota": 0,
              "quota_percentage": 51,
              "filling_goal": 0,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 0
            }
          ],
          "grouped": []
        },
        "interlock_id": "01JP0M57XAWSMNPSW5M62A035H"
      },
      {
        "id": "01JP0M58010ZWK2VPS4BEA5Q0R",
        "question_id": 42,
        "name": "AGE",
        "quotas_enabled": true,
        "description": "What is your age?",
        "description_translated": "What is your age?",
        "conditions": {
          "object": "range_conditions_details_template",
          "data": [
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0S",
              "min": 15,
              "max": 19
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0T",
              "min": 20,
              "max": 29
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0V",
              "min": 35,
              "max": 39
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0W",
              "min": 40,
              "max": 49
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0S",
              "index": 0,
              "conditions": [
                "01JP0M58010ZWK2VPS4BEA5Q0S"
              ],
              "quota": 0,
              "quota_percentage": 20,
              "filling_goal": 0,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 0
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0T",
              "index": 1,
              "conditions": [
                "01JP0M58010ZWK2VPS4BEA5Q0T"
              ],
              "quota": 0,
              "quota_percentage": 20,
              "filling_goal": 0,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 0
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0V",
              "index": 2,
              "conditions": [
                "01JP0M58010ZWK2VPS4BEA5Q0V"
              ],
              "quota": 0,
              "quota_percentage": 30,
              "filling_goal": 0,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 0
            },
            {
              "id": "01JP0M58010ZWK2VPS4BEA5Q0W",
              "index": 3,
              "conditions": [
                "01JP0M58010ZWK2VPS4BEA5Q0W"
              ],
              "quota": 0,
              "quota_percentage": 30,
              "filling_goal": 0,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 0
            }
          ],
          "grouped": []
        },
        "interlock_id": "01JP0M57XAWSMNPSW5M62A035H"
      }
    ]
  }
]

Profiles - How to implement Interlocked Quotas to Non-draft Target Groups
Whenever you have:

Launched your Target Group
Attached a Fielding Run to the Target Group

without interlocking your Profiles, the Cint Exchange offers you the option to update your setup to incorporate this more granular way of setting your Quotas.


Cint Exchange provides a dedicated endpoint called Create an interlocked profile using which the user can interlock their profiles.


Below, you will find our recommended flow on how to implement an interlock quota to your Target Group.


1. Get the profiler IDs for your non-draft target group by making a GET to Get Profiles endpoint

2. Identify the profilers that you want to interlock and make a POST to Create an interlocked profile endpoint with all the profiler IDs that you want to interlock passed in the body of the request.


As a result of these steps, an interlocked quota will be applied to your non-draft target group, and the corresponding profilers will be removed from the non-interlocked section.


Below is an example request and response for Create an interlocked profile where we have two non-interlocked profiler with id: 01JP2JKW9ZC2VHR9WKYP9SD4KV and 01JP2JKW9ZC2VHR9WKYP9SD4KZ


Example request:
{
  "target_group_filling_goal": "50",
  "profiles": [
    "01JP2JKW9ZC2VHR9WKYP9SD4KV",
    "01JP2JKW9ZC2VHR9WKYP9SD4KZ"
  ]
}

Example response:
{
  "data": [],
  "interlocked_profile": {
    "id": "01JP2K4BKAAVS6RFRZ8NXMR3CA",
    "name": "AGE, GENDER",
    "quotas_enabled": true,
    "depends_on_questions": [
      42,
      43
    ],
    "quotas": {
      "ungrouped": [
        {
          "id": "01JP2K4BKB35DE38AGEWT3F2GK",
          "legacy_id": "303559998",
          "quota_percentage": 0,
          "quota": 0,
          "filling_goal": 0,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 0,
          "condition": {
            "id": "01JP2K4BKB35DE38AGEWT3F2GK",
            "text": "18-24, Male",
            "text_translated": "18-24, Male",
            "option": "1",
            "related_condition": {
              "42": [
                {
                  "text": "18-24",
                  "text_translated": "18-24",
                  "min": 18,
                  "max": 24
                }
              ],
              "43": [
                {
                  "text": "Male",
                  "text_translated": "Male",
                  "option": "1"
                }
              ]
            }
          }
        },
        {
          "id": "01JP2K4BKB35DE38AGEWT3F2GM",
          "legacy_id": "303559999",
          "quota_percentage": 20,
          "quota": 1,
          "filling_goal": 1,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 1,
          "condition": {
            "id": "01JP2K4BKB35DE38AGEWT3F2GM",
            "text": "18-24, Female",
            "text_translated": "18-24, Female",
            "option": "2",
            "related_condition": {
              "42": [
                {
                  "text": "18-24",
                  "text_translated": "18-24",
                  "min": 18,
                  "max": 24
                }
              ],
              "43": [
                {
                  "text": "Female",
                  "text_translated": "Female",
                  "option": "2"
                }
              ]
            }
          }
        },
        {
          "id": "01JP2K4BKB35DE38AGEWT3F2GN",
          "legacy_id": "303560000",
          "quota_percentage": 20,
          "quota": 1,
          "filling_goal": 1,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 1,
          "condition": {
            "id": "01JP2K4BKB35DE38AGEWT3F2GN",
            "text": "25-35, Male",
            "text_translated": "25-35, Male",
            "option": "3",
            "related_condition": {
              "42": [
                {
                  "text": "25-35",
                  "text_translated": "25-35",
                  "min": 25,
                  "max": 35
                }
              ],
              "43": [
                {
                  "text": "Male",
                  "text_translated": "Male",
                  "option": "1"
                }
              ]
            }
          }
        },
        {
          "id": "01JP2K4BKB35DE38AGEWT3F2GP",
          "legacy_id": "303560001",
          "quota_percentage": 20,
          "quota": 1,
          "filling_goal": 1,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 1,
          "condition": {
            "id": "01JP2K4BKB35DE38AGEWT3F2GP",
            "text": "25-35, Female",
            "text_translated": "25-35, Female",
            "option": "4",
            "related_condition": {
              "42": [
                {
                  "text": "25-35",
                  "text_translated": "25-35",
                  "min": 25,
                  "max": 35
                }
              ],
              "43": [
                {
                  "text": "Female",
                  "text_translated": "Female",
                  "option": "2"
                }
              ]
            }
          }
        },
        {
          "id": "01JP2K4BKB35DE38AGEWT3F2GQ",
          "legacy_id": "303560002",
          "quota_percentage": 20,
          "quota": 1,
          "filling_goal": 1,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 1,
          "condition": {
            "id": "01JP2K4BKB35DE38AGEWT3F2GQ",
            "text": "36-45, Male",
            "text_translated": "36-45, Male",
            "option": "5",
            "related_condition": {
              "42": [
                {
                  "text": "36-45",
                  "text_translated": "36-45",
                  "min": 36,
                  "max": 45
                }
              ],
              "43": [
                {
                  "text": "Male",
                  "text_translated": "Male",
                  "option": "1"
                }
              ]
            }
          }
        },
        {
          "id": "01JP2K4BKB35DE38AGEWT3F2GR",
          "legacy_id": "303560003",
          "quota_percentage": 20,
          "quota": 1,
          "filling_goal": 1,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 1,
          "condition": {
            "id": "01JP2K4BKB35DE38AGEWT3F2GR",
            "text": "36-45, Female",
            "text_translated": "36-45, Female",
            "option": "6",
            "related_condition": {
              "42": [
                {
                  "text": "36-45",
                  "text_translated": "36-45",
                  "min": 36,
                  "max": 45
                }
              ],
              "43": [
                {
                  "text": "Female",
                  "text_translated": "Female",
                  "option": "2"
                }
              ]
            }
          }
        }
      ],
      "grouped": []
    },
    "profiles": [
      {
        "id": "01JP2JKW9ZC2VHR9WKYP9SD4KV",
        "legacy_id": "246353061",
        "question_id": 42,
        "name": "AGE",
        "quotas_enabled": true,
        "description": "What is your age?",
        "description_translated": "What is your age?",
        "conditions": {
          "object": "range_conditions_details_template",
          "data": [
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4KW",
              "text": "18 to 24",
              "text_translated": "18 to 24",
              "min": 18,
              "max": 24
            },
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4KX",
              "text": "25 to 35",
              "text_translated": "25 to 35",
              "min": 25,
              "max": 35
            },
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4KY",
              "text": "36 to 45",
              "text_translated": "36 to 45",
              "min": 36,
              "max": 45
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4KW",
              "quota_percentage": 40,
              "quota": 2,
              "filling_goal": 2,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 2,
              "condition": "01JP2JKW9ZC2VHR9WKYP9SD4KW"
            },
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4KX",
              "quota_percentage": 40,
              "quota": 2,
              "filling_goal": 2,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 2,
              "condition": "01JP2JKW9ZC2VHR9WKYP9SD4KX"
            },
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4KY",
              "quota_percentage": 20,
              "quota": 1,
              "filling_goal": 1,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 1,
              "condition": "01JP2JKW9ZC2VHR9WKYP9SD4KY"
            }
          ],
          "grouped": []
        },
        "interlock_id": "01JP2K4BKAAVS6RFRZ8NXMR3CA"
      },
      {
        "id": "01JP2JKW9ZC2VHR9WKYP9SD4KZ",
        "legacy_id": "246353063",
        "question_id": 43,
        "name": "GENDER",
        "quotas_enabled": true,
        "description": "Are you...?",
        "description_translated": "Are you...?",
        "conditions": {
          "object": "selection_conditions_details_template",
          "data": [
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4M0",
              "text": "Male",
              "text_translated": "Male",
              "option": "1"
            },
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4M1",
              "text": "Female",
              "text_translated": "Female",
              "option": "2"
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4M0",
              "quota_percentage": 60,
              "quota": 3,
              "filling_goal": 3,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 3,
              "condition": "01JP2JKW9ZC2VHR9WKYP9SD4M0"
            },
            {
              "id": "01JP2JKW9ZC2VHR9WKYP9SD4M1",
              "quota_percentage": 60,
              "quota": 3,
              "filling_goal": 3,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 3,
              "condition": "01JP2JKW9ZC2VHR9WKYP9SD4M1"
            }
          ],
          "grouped": []
        },
        "interlock_id": "01JP2K4BKAAVS6RFRZ8NXMR3CA"
      }
    ]
  }
}

Profiles - How to remove Interlocked Quotas
The Cint Exchange gives you the flexibility to add and remove interlocked Quotas via a dedicated endpoint called Remove interlocks. It will convert your interlocked to non-interlocked, individual Quotas.


Below, you will find our recommended flow on how to remove an interlock quota.


1. Get the profiler id of interlocked profiler of your non-draft target group by making a GET to Get Profiles endpoint

2. Make a POST to Remove interlocks endpoint with a valid interlocked profiler id.


As a result, your non-draft target group will now contain multiple non-interlocked profiles for each question that was previously in the interlocked section, with quotas enabled for each.


Example:
A target group in Paused status with an interlocked Age/Gender quota bearing profiler id: 01JP2K4BKAAVS6RFRZ8NXMR3CA. To convert it into a non-interlocked quota, use the below request and recieve response for the Remove interlocks endpoint.


Example request:
POST https://api.cint.com/v1/demand/v2/accounts/{accountid}/projects/{projectid}/target-groups/{targetgroupid}/profiles/01JP2K4BKAAVS6RFRZ8NXMR3CA/remove-interlocks

Example response:
{
  "data": [
    {
      "id": "01JP2JKW9ZC2VHR9WKYP9SD4KV",
      "legacy_id": "246353061",
      "question_id": 42,
      "name": "AGE",
      "quotas_enabled": true,
      "description": "What is your age?",
      "description_translated": "What is your age?",
      "conditions": {
        "object": "range_conditions_details_template",
        "data": [
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4KW",
            "text": "18 to 24",
            "text_translated": "18 to 24",
            "min": 18,
            "max": 24
          },
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4KX",
            "text": "25 to 35",
            "text_translated": "25 to 35",
            "min": 25,
            "max": 35
          },
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4KY",
            "text": "36 to 45",
            "text_translated": "36 to 45",
            "min": 36,
            "max": 45
          }
        ]
      },
      "quotas": {
        "ungrouped": [
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4KY",
            "legacy_id": "303572962",
            "quota_percentage": 40,
            "quota": 2,
            "filling_goal": 2,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 2,
            "condition": "01JP2JKW9ZC2VHR9WKYP9SD4KY"
          },
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4KX",
            "legacy_id": "303572961",
            "quota_percentage": 40,
            "quota": 2,
            "filling_goal": 2,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 2,
            "condition": "01JP2JKW9ZC2VHR9WKYP9SD4KX"
          },
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4KW",
            "legacy_id": "303572960",
            "quota_percentage": 20,
            "quota": 1,
            "filling_goal": 1,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 1,
            "condition": "01JP2JKW9ZC2VHR9WKYP9SD4KW"
          }
        ],
        "grouped": []
      },
      "is_interlocked": false
    },
    {
      "id": "01JP2JKW9ZC2VHR9WKYP9SD4KZ",
      "legacy_id": "246353063",
      "question_id": 43,
      "name": "GENDER",
      "quotas_enabled": true,
      "description": "Are you...?",
      "description_translated": "Are you...?",
      "conditions": {
        "object": "selection_conditions_details_template",
        "data": [
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4M0",
            "text": "Male",
            "text_translated": "Male",
            "option": "1"
          },
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4M1",
            "text": "Female",
            "text_translated": "Female",
            "option": "2"
          }
        ]
      },
      "quotas": {
        "ungrouped": [
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4M0",
            "legacy_id": "303572963",
            "quota_percentage": 40,
            "quota": 2,
            "filling_goal": 2,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 2,
            "condition": "01JP2JKW9ZC2VHR9WKYP9SD4M0"
          },
          {
            "id": "01JP2JKW9ZC2VHR9WKYP9SD4M1",
            "legacy_id": "303572964",
            "quota_percentage": 60.000004,
            "quota": 3,
            "filling_goal": 3,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 3,
            "condition": "01JP2JKW9ZC2VHR9WKYP9SD4M1"
          }
        ],
        "grouped": []
      },
      "is_interlocked": false
    }
  ]
}

Profiles - How to update Quota and Target Group Filling Goals on a Launched Target Group
Looking at the typical workflow of a Project and its Target Groups, it is very common to update the Filling Goals of a Quota.


Workflow Example
Below are our recommended steps:

1. Get the Profile ID and Quota IDs from Get Profiles endpoint. Identify and cache the IDs you want to update.

2. To update your filling goal, make a PUT call to the Update quotas endpoint including the relevant Profile and Quota IDs. Below is the example code snippet for your quick reference

3. Verify the counts by making a call to the Get Profiles endpoint to see whether all the associated quotas are updated with correct filling_goal.


Please note that the filling_goal you want to update will be displayed with the actual number of completes and not in percentages.


curl --request PUT \
  --url https://api.cint.com/v1/demand/v2/accounts/2428/projects/01JMY4R3R9SFGWJ6TK080Y0NC5/target-groups/01JN1FTC33C5QRW2S7X09V5RFC/profiles/filling-goal \
  --header 'authorization: Bearer {{bearerToken}}' \
  --header 'content-type: application/json' \
  --header 'Cint-API-Version: 2025-02-17' \
  --header 'idempotency-key: {{idempotency-key}}' \
  --data '
{
  "filling_goal": 50,
  "profiles": [
    {
      "profile_id": "01JN3WYAXKN1DCHX9WF5617505",
      "quotas":[
        {
        "quota_id":"01JN3WYAXKN1DCHX9WF5617506",
          "filling_goal": "15"
      },
        {
        "quota_id":"01JN3WYAXKN1DCHX9WF5617507",
          "filling_goal": "10"
      },
        {
        "quota_id":"01JN3WYAXKN1DCHX9WF5617508",
          "filling_goal": "9"
      },
        {
        "quota_id":"01JN3WYAXKN1DCHX9WF5617509",
          "filling_goal": "16"
      }
               ]
      
    }
  ]
}'

Response:

{
  "data": [
    {
      "id": "01JN3WYAXKN1DCHX9WF5617505",
      "legacy_id": "244536971",
      "question_id": 200842,
      "name": "Cardinal regions",
      "quotas_enabled": true,
      "description": "In which region do you live?",
      "description_translated": "In which region do you live?",
      "conditions": {
        "object": "selection_conditions_details_template",
        "data": [
          {
            "id": "01JN3WYAXKN1DCHX9WF5617506",
            "text": "North Eastern Scotland",
            "text_translated": "North Eastern Scotland",
            "option": "1"
          },
          {
            "id": "01JN3WYAXKN1DCHX9WF5617507",
            "text": "Midlands",
            "text_translated": "Midlands",
            "option": "2"
          },
          {
            "id": "01JN3WYAXKN1DCHX9WF5617508",
            "text": "South",
            "text_translated": "South",
            "option": "3"
          },
          {
            "id": "01JN3WYAXKN1DCHX9WF5617509",
            "text": "Northern Ireland",
            "text_translated": "Northern Ireland",
            "option": "4"
          }
        ]
      },
      "quotas": {
        "ungrouped": [
          {
            "id": "01JN3WYAXKN1DCHX9WF5617506",
            "legacy_id": "302560732",
            "quota_percentage": 150,
            "quota": 1,
            "filling_goal": 15,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 15,
            "condition": "01JN3WYAXKN1DCHX9WF5617506"
          },
          {
            "id": "01JN3WYAXKN1DCHX9WF5617507",
            "legacy_id": "302560736",
            "quota_percentage": 100,
            "quota": 4,
            "filling_goal": 10,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 10,
            "condition": "01JN3WYAXKN1DCHX9WF5617507"
          },
          {
            "id": "01JN3WYAXKN1DCHX9WF5617508",
            "legacy_id": "302560737",
            "quota_percentage": 90,
            "quota": 4,
            "filling_goal": 9,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 9,
            "condition": "01JN3WYAXKN1DCHX9WF5617508"
          },
          {
            "id": "01JN3WYAXKN1DCHX9WF5617509",
            "legacy_id": "302560738",
            "quota_percentage": 160,
            "quota": 1,
            "filling_goal": 16,
            "prescreens": 0,
            "completes": 0,
            "completes_goal": 16,
            "condition": "01JN3WYAXKN1DCHX9WF5617509"
          }
        ],
        "grouped": []
      }
    }
]}

Profiles - How to enable or disable Quotas once a Target Group is launched
The Cint Exchange offers customers robust capabilities to update and manage their quotas and conditions, regardless of the target group status.


Below are our recommendations on how to

Use the available endpoints
How to structure your workflows
Manage these operations for non-draft Target Groups efficiently

We also recommend our two short support videos on

Set up your Target Group basic settings
Edit your Target Group profiling

Key points:
Enabled Quota: the respondents are counted against the set Quota Target
Disabled Quota: the respondents are not counted against this Profiler and no Quota Target is set

Useful endpoints:
Get Profiles
Disable quotas for a profile
Enable quotas for a profile
Remove interlocks
Create an interlocked profile

Scenario 1: Enabling Non-interlocked Quota
If you want your Profiles to be an active quota, you need to have the profile enabled.


Here is how you can check if it is enabled and if not, how to enable it.


1. Once your target group is in Non-draft status, make a GET call to Get Profiles endpoint. This will provide you with a list of Profiles along with their IDs.

2. Cache the Profile ID parameter of all profiles.

3. Make a POST request to Enables quotas for a profile endpoint including the specific Profile ID(s) you want to enable.

4. In order to verify that the desired quota is enabled, make a GET call to the Get Profiles endpoint and check if the quota_enabled parameter is set to “true” for a desired profiler.


Example snippet below:
{
  "data": [
    {
      "id": "01JN3WYAXKN1DCHX9WF5617505",
      "legacy_id": "244536971",
      "question_id": 200842,
      "name": "Cardinal regions",
      "quotas_enabled": true,
 .
 .
 .
]
}

Scenario 2: Disabling Non-interlocked Quota
We understand that sometimes, when Fieldwork might be slow, some criteria might be opened. In this case, you might want to disable a Profile and therefore remove the quota.


Important: if you disable the Profile, you remove it from being an active Quota. Respondents won’t be screened and allocated based on this anymore.


Once your target group is in Non-draft status, make a GET call to Get Profiles endpoint. This will provide you with a list of Profiles along with their IDs

Cache the Profile ID parameter of all profiles.

Make a POST call to Disables quotas for a profile endpoint including the specific Profile ID(s) you want to disable

In order to verify that the quota associated with a profiler is disabled,make a GET call to the Get Profiles endpoint and check if quota_enabled parameter is set to “false” for the desired profiler.


Example snippet below:
 "data": [
    {
      "id": "01JN3WYAXKN1DCHX9WF5617505",
      "legacy_id": "244536971",
      "question_id": 200842,
      "name": "Cardinal regions",
      "quotas_enabled": false,
.
.
.
}
      ]

Scenario 3: Removing the interlock condition from quotas
Interlocked Quotas are a useful tool for getting a specific distribution of the Profiles included. Depending on the scale and complexity of the Quotas combined, Interlocked Quotas can be difficult to fulfil during Fieldwork.


Removing the interlocking from Quotas can help ease complexity and speed up Fieldwork again.


Example: Age and Gender are interlocked and the aim is to remove the interlocking between the two.


1. Once your target group is in Non-draft status, make a GET call to Get Profiles endpoint. This will provide you with a list of Profiles along with their IDs

2. Cache the Profile ID parameter of all profiles

3. Use the Profile ID and make a POST call to the Remove Interlocks endpoints which will remove the interlocking and provide you a response with all the individual Profile Quotas.


Step 1-3 will remove the interlocking of the two conditions, for instance Age and Gender. It will not remove the Quota. The Quotas for Age and Gender will remain.


If you want to remove the Quota completely and disable it, you can add steps 3 and 4 from Scenario 2 which will remove the Quota completely.


Scenario 4: Enabling interlocked quotas
In case you have launched your Target Group without interlocked Quotas and now want to add them in, you can follow the below steps to switch from non-interlocked to interlocked Quotas.


The same steps apply if you previously removed your interlocked Quotas and now want to add them back in.


1. Take your previously cached Profile IDs or make a call to the Get Profiles endpoint.

2. Make a POST call to Create an interlocked profile by supplying target_group_filling_goal and Profile IDs that you want to interlock.

3. Once successful, an interlocked profile will be generated from the specified non-interlocked profiles and a new structure of profiling for the target group is returned in the response.


Example response snippet below:
Request data:
{
  "target_group_filling_goal": "5",
  "profiles": [
    "01JN1FRXKDTQBG6WE3FC4AN8CX",
    "01JN1FRXKERTZ3DYJKRC02M2ND"
  ]
}

Response:
"interlocked_profile": {
    "id": "01JNGRWK7AAE0J5KHST0MMJXNP",
    "name": "AGE, GENDER",
    "quotas_enabled": true,
    "depends_on_questions": [
      42,
      43
    ],
    "quotas": {
      "ungrouped": [
        {
          "id": "01JNGRWK7AAE0J5KHST0MMJXNQ",
          "legacy_id": "302550302",
          "quota_percentage": 20,
          "quota": 2,
          "filling_goal": 2,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 2,
          "condition": {
            "id": "01JNGRWK7AAE0J5KHST0MMJXNQ",
            "text": "18-25, Male",
            "text_translated": "18-25, Male",
            "option": "1",
            "related_condition": {
              "42": [
                {
                  "text": "18-25",
                  "text_translated": "18-25",
                  "min": 18,
                  "max": 25
                }
              ],
              "43": [
                {
                  "text": "Male",
                  "text_translated": "Male",
                  "option": "1"
                }
              ]
            }
          }
        },
        {
          "id": "01JNGRWK7AAE0J5KHST0MMJXNR",
          "legacy_id": "302550312",
          "quota_percentage": 20,
          "quota": 2,
          "filling_goal": 2,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 2,
          "condition": {
            "id": "01JNGRWK7AAE0J5KHST0MMJXNR",
            "text": "18-25, Female",
            "text_translated": "18-25, Female",
            "option": "2",
            "related_condition": {
              "42": [
                {
                  "text": "18-25",
                  "text_translated": "18-25",
                  "min": 18,
                  "max": 25
                }
              ],
              "43": [
                {
                  "text": "Female",
                  "text_translated": "Female",
                  "option": "2"
                }
              ]
            }
          }
        },
        {
          "id": "01JNGRWK7AAE0J5KHST0MMJXNS",
          "legacy_id": "302550313",
          "quota_percentage": 20,
          "quota": 2,
          "filling_goal": 2,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 2,
          "condition": {
            "id": "01JNGRWK7AAE0J5KHST0MMJXNS",
            "text": "26-35, Male",
            "text_translated": "26-35, Male",
            "option": "3",
            "related_condition": {
              "42": [
                {
                  "text": "26-35",
                  "text_translated": "26-35",
                  "min": 26,
                  "max": 35
                }
              ],
              "43": [
                {
                  "text": "Male",
                  "text_translated": "Male",
                  "option": "1"
                }
              ]
            }
          }
        },
        {
          "id": "01JNGRWK7AAE0J5KHST0MMJXNT",
          "legacy_id": "302550314",
          "quota_percentage": 20,
          "quota": 2,
          "filling_goal": 2,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 2,
          "condition": {
            "id": "01JNGRWK7AAE0J5KHST0MMJXNT",
            "text": "26-35, Female",
            "text_translated": "26-35, Female",
            "option": "4",
            "related_condition": {
              "42": [
                {
                  "text": "26-35",
                  "text_translated": "26-35",
                  "min": 26,
                  "max": 35
                }
              ],
              "43": [
                {
                  "text": "Female",
                  "text_translated": "Female",
                  "option": "2"
                }
              ]
            }
          }
        },
        {
          "id": "01JNGRWK7AAE0J5KHST0MMJXNV",
          "legacy_id": "302550315",
          "quota_percentage": 10,
          "quota": 1,
          "filling_goal": 1,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 1,
          "condition": {
            "id": "01JNGRWK7AAE0J5KHST0MMJXNV",
            "text": "36-45, Male",
            "text_translated": "36-45, Male",
            "option": "5",
            "related_condition": {
              "42": [
                {
                  "text": "36-45",
                  "text_translated": "36-45",
                  "min": 36,
                  "max": 45
                }
              ],
              "43": [
                {
                  "text": "Male",
                  "text_translated": "Male",
                  "option": "1"
                }
              ]
            }
          }
        },
        {
          "id": "01JNGRWK7AAE0J5KHST0MMJXNW",
          "legacy_id": "302550317",
          "quota_percentage": 10,
          "quota": 1,
          "filling_goal": 1,
          "prescreens": 0,
          "completes": 0,
          "completes_goal": 1,
          "condition": {
            "id": "01JNGRWK7AAE0J5KHST0MMJXNW",
            "text": "36-45, Female",
            "text_translated": "36-45, Female",
            "option": "6",
            "related_condition": {
              "42": [
                {
                  "text": "36-45",
                  "text_translated": "36-45",
                  "min": 36,
                  "max": 45
                }
              ],
              "43": [
                {
                  "text": "Female",
                  "text_translated": "Female",
                  "option": "2"
                }
              ]
            }
          }
        }
      ],
      "grouped": []
    },
    "profiles": [
      {
        "id": "01JN1FRXKDTQBG6WE3FC4AN8CX",
        "legacy_id": "244536972",
        "question_id": 42,
        "name": "AGE",
        "quotas_enabled": true,
        "description": "What is your age?",
        "description_translated": "What is your age?",
        "conditions": {
          "object": "range_conditions_details_template",
          "data": [
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NA",
              "text": "18 to 25",
              "text_translated": "18 to 25",
              "min": 18,
              "max": 25
            },
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NB",
              "text": "26 to 35",
              "text_translated": "26 to 35",
              "min": 26,
              "max": 35
            },
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NC",
              "text": "36 to 45",
              "text_translated": "36 to 45",
              "min": 36,
              "max": 45
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NA",
              "quota_percentage": 80,
              "quota": 8,
              "filling_goal": 8,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 8,
              "condition": "01JN1FRXKERTZ3DYJKRC02M2NA"
            },
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NB",
              "quota_percentage": 80,
              "quota": 8,
              "filling_goal": 8,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 8,
              "condition": "01JN1FRXKERTZ3DYJKRC02M2NB"
            },
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NC",
              "quota_percentage": 40,
              "quota": 4,
              "filling_goal": 4,
              "prescreens": 0,
              "completes": 0,
              "completes_goal": 4,
              "condition": "01JN1FRXKERTZ3DYJKRC02M2NC"
            }
          ],
          "grouped": []
        },
        "interlock_id": "01JNGRWK7AAE0J5KHST0MMJXNP"
      },
      {
        "id": "01JN1FRXKERTZ3DYJKRC02M2ND",
        "legacy_id": "244536975",
        "question_id": 43,
        "name": "GENDER",
        "quotas_enabled": false,
        "description": "Are you...?",
        "description_translated": "Are you...?",
        "conditions": {
          "object": "selection_conditions_details_template",
          "data": [
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NE",
              "text": "Male",
              "text_translated": "Male",
              "option": "1"
            },
            {
              "id": "01JN1FRXKERTZ3DYJKRC02M2NF",
              "text": "Female",
              "text_translated": "Female",
              "option": "2"
            }
          ]
        },
        "quotas": {
          "ungrouped": [],
          "grouped": []
        },
        "interlock_id": "01JNGRWK7AAE0J5KHST0MMJXNP"
      }
    ]
  }

Creating a Target Group
Once you've created a Project, you'll need to create at least one Target Group to allow sampling. Target Groups hold a substantial amount of information necessary for fielding, including the survey platform URL, pricing, and targeting data.


Each Target Group is associated with a single locale or country-language pairing. For Projects that require samples from multiple countries or languages, each unique country-language pair requires its own Target Group.


See two examples below:


Target Group Two Examples
Target Groups are created in draft status, with all fields editable until launch. Launching is not automatic; a Target Group must either be actively set live via API call or automatically via an assigned fielding assistant goal. Once set live, some fields are locked, but others can still be modified. Locked fields remain locked, even if the Target Group is later paused. We will address the various options and how to implement and manage them in the section “Fielding Plans”.

How to create a draft Target Group
To create a new Target Group in draft status, you must provide all required fields as outlined in the API reference.


Some fields in the example must be configured for your account and others must be set to the current date and time as follows:

Fielding specification times must be specified at least 1 hour in the future from the current time.
A valid Business Unit ID must be provided. To list available Business Units, call the Returns business unit ID for user's account endpoint. Note that Business Units are specified at the individual Target Group level.
A valid Project manager ID must be provided. To obtain Project manager IDs, call the Returns all users for an account endpoint with the user_type=Project_manager query parameter.

Example - Dynamic pricing

{
  "name": "NameOfYourProject",
  "business_unit_id": "<<yourBU>>",
  "project_manager_id": "<<yourPM-ID>>",
  "study_type_code": "adhoc",
  "industry_code": "other",
  "cost_per_interview": {
     "value":"2.7352",
     "currency_code":"USD"
     },
  "locale": "ger_de",
  "collects_pii": false,
  "filling_goal": 100,
  "expected_length_of_interview_minutes": 5,
  "expected_incidence_rate": 0.20,
  "fielding_specification": {
    "start_at": "2025-04-28T08:22:18.822Z",
    "end_at": "2025-04-30T08:22:18.821Z"
        },
  "live_url": "https://mytestsurvey.com/?RID=[%RID%]",
  "test_url": "https://mytestsurvey.com/?RID=[%RID%]",
  "fielding_assistant_assignment": {
    "pricing": {
        "type": "dynamic",
          "maximum_cpi": {
            "value":"2.7352",
            "currency_code":"USD"
            }
          },
    "quota_overlay": {
          "prevent_overfill": true,
          "balance_fill": false
        }
  },
  "profile": {
    "profile_adjustment_type": "percentage",
    "drafts": [
      {
        "question_id": 42,
        "quotas_enabled": true,
        "conditions": {
          "object": "range_conditions_details_template",
          "data": [
            {
              "min": 18,
              "max": 24,
              "text": "18 to 24"
            },
            {
              "min": 25,
              "max": 34,
              "text": "25 to 34"
            },
            {
              "min": 35,
              "max": 44,
              "text": "35 to 44"
            },
            {
              "min": 45,
              "max": 54,
              "text": "45 to 54"
            },
            {
              "min": 55,
              "max": 64,
              "text": "55 to 64"
            },
            {
              "min": 65,
              "max": 99,
              "text": "65 to 99"
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "index": 1,
              "quota_percentage": 50,
              "quota_nominal": 250
            },
            {
              "index": 0,
              "quota_percentage": 50,
              "quota_nominal": 250
            }
          ],
          "grouped": []
        }
      },
      {
        "question_id": 43,
        "quotas_enabled": true,
        "conditions": {
          "object": "selection_conditions_details_template",
          "data": [
            {
              "option": "1",
              "text": "Male"
            },
            {
              "option": "2",
              "text": "Female"
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "index": 0,
              "quota_percentage": 43,
              "quota_nominal": 215
            },
            {
              "index": 1,
              "quota_percentage": 57,
              "quota_nominal": 285
            }
          ],
          "grouped": []
        }
      }
    ],
    "interlocked_profiles": []
  },
  "exclusion": {
    "enabled": true,
    "list": []
  }
}

Example - Rate Card

{
  "name": "NameOfYourProject",
  "business_unit_id": "<<yourBU>>",
  "project_manager_id": "<<yourPM-ID>>",
  "study_type_code": "adhoc",
  "industry_code": "other",
  "locale": "eng_us",
  "collects_pii": false,
  "filling_goal": 100,
  "expected_length_of_interview_minutes": 5,
  "expected_incidence_rate": 0.20,
  "fielding_specification": {
    "start_at": "2025-01-28T08:22:18.822Z",
    "end_at": "2025-01-30T08:22:18.821Z"
        },
  "live_url": "https://mytestsurveyrate.com/?RID=[%RID%]",
  "test_url": "https://mytestsurveyrate.com/?RID=[%RID%]",
  "fielding_assistant_assignment": {
    "pricing": {
        "type": "rate_card",
          "maximum_cpi": {
            "value":"2.7352",
            "currency_code":"USD"
            }
          },
    "quota_overlay": {
          "prevent_overfill": true,
          "balance_fill": false
        }
  },
  "profile": {
    "profile_adjustment_type": "percentage",
    "drafts": [
      {
        "question_id": 42,
        "quotas_enabled": true,
        "conditions": {
          "object": "range_conditions_details_template",
          "data": [
            {
              "min": 18,
              "max": 24,
              "text": "18 to 24"
            },
            {
              "min": 25,
              "max": 34,
              "text": "25 to 34"
            },
            {
              "min": 35,
              "max": 44,
              "text": "35 to 44"
            },
            {
              "min": 45,
              "max": 54,
              "text": "45 to 54"
            },
            {
              "min": 55,
              "max": 64,
              "text": "55 to 64"
            },
            {
              "min": 65,
              "max": 99,
              "text": "65 to 99"
            }
          ]
        },
        "quotas": {
          "ungrouped": [
            {
              "index": 1,
              "quota_nominal": 0,
              "quota_percentage": 50
            },
            {
              "index": 0,
              "quota_nominal": 0,
              "quota_percentage": 50
            }
          ],
          "grouped": []
        }
      }
    ]
  }
  }
How to update a draft Target Group
Once a draft Target Group has been created, changes can be made by calling PUT on the Target Group by ID. You can use the Update a Target Group in Draft status endpoint for any changes prior to launch.


Note: Once the Target Group is launched, use the Update Launched Target Group details endpoint to make any changes to a launched Target Group.


Recommendations:
Finalize your Target Group before you launch (go live).
Only make in-field changes to your Target Group when necessary e.g. increasing the required number of completes, extending field time.
Avoid removing profiling e.g. removing cats in your pet surveys about dogs and cats. Use your quota settings instead and simply set the required number of cats to zero.

Example
Updates to the Target Group in draft status, changing the PII setting, CPI, LOI, IR, Fielding Assistant activation and also making changes to the quotas.

PUT https://api.cint.com/v1/demand/accounts/2428/projects/01JK5YDJC3ZZX3TCZC3R368QZ6/target-groups/01JKB1ESTTEG7JXM9PXJ3V75PK
> idempotency-key: 6048527d-3b59-43fc-b925-ff4cd3c10b09
> Cint-API-Version: 2025-02-17
> Authorization: Bearer token > content-type: application/json
> data
{
	"human_readable_id": "CPGGLQM",
	"name": "TestTG_India_04022025_dynamic",
	"business_unit_id": 3848,
	"locale": "eng_in",
	"collects_pii": true,
	"study_type_code": "adhoc",
	"industry_code": "other",
	"pricing_model": "dynamic",
	"cost_per_interview": {
		"value":"2.000",
		"currency_code":"USD"
	},
	"client_cost_per_interview_note": {
		"value":"2.000",
		"currency_code":"USD"
	},
	"project_manager_id": "45f1c114-111e-4ca9-968a-715b65895dc0",
	"fielding_specification": {
		"start_at": "2025-02-27T23:00:00Z",
		"end_at": "2025-02-28T23:30:00Z"
	},
	"filling_goal": 150,
	"expected_length_of_interview_minutes": 5,
	"expected_incidence_rate": 0.8,
	"industry_lockout_code": "no_lock_out",
	"live_url": "https://survey.com?id=[%RID%]",
	"test_url": "https://survey.com?id=[%RID%]",
	"fielding_assistant_assignment": {
		"quota_overlay": {
			"prevent_overfill": true,
			"balance_fill": true
		}
	},
	"created_at": "2025-02-05T12:30:46Z",
	"profile": {
		"profile_adjustment_type": "percentage",
		"drafts": [
			{
				"question_id": 79332,
				"quotas_enabled": true,
				"conditions": {
					"object": "selection_conditions_details_template",
					"data": [
						{
							"option": "9",
							"text": "Bangalore"
						},
						{
							"option": "53",
							"text": "Mumbai"
						},
						{
							"option": "78",
							"text": "Delhi"
						},
						{
							"option": "41",
							"text": "Kolkata"
						}
					]
				},
				"quotas": {
					"ungrouped": [
						{
							"index": 0,
							"quota_percentage": 30,
							"quota_nominal": 25
						},
						{
							"index": 1,
							"quota_percentage": 30,
							"quota_nominal": 25
						},
						{
							"index": 2,
							"quota_percentage": 25,
							"quota_nominal": 25
						},
						{
							"index": 3,
							"quota_percentage": 15,
							"quota_nominal": 25
						}
					],
					"grouped": []
				}
			}
		],
		"interlocked_profiles": []
	},

		"exclusion": {
		"enabled": true,
		"list": []
	},
	"client_id": 10912,
	"links": {
		"test_client_survey": "https://www.samplicio.us/fulcrum/SurveyTestLink.aspx?SurveySID=bf426016-9759-475f-89b5-85a180bf23f8&passthrough=1"
	}
}
< 204 - No Content
< date: Tue, 18 Feb 2025 14:38:19 GMT
< connection: keep-alive
< server: Kestrel
< x-ratelimit-limit: 0
< x-ratelimit-remaining: 0
< x-ratelimit-reset: 0
< x-request-id: 0HNAFUCLQB49Q:00000001
< x-tyk-api-expires: Wed, 14 Jan 2026 00:00:00 UTC
< x-tyk-trace-id: <<TraceID>>
Supply Allocations in Cint Exchange:
The Supply Allocations allow you to control the supply partners for a Target Group by defining which suppliers see the opportunity and can send respondents into it and which suppliers should for instance be blocked.


Supply Allocations also provides the chance to allocate percentages to supplier groups e.g. for blends and to distribute sample more evenly across partners (e.g. through the usage of min and max values). This can be particularly helpful for Trackers.


The Cint Exchange API allows you to specify supply allocations within the supply_allocations array available at the root level of the Create target group endpoint.


The supply_allocations array has three main objects which determine the make-up of your supply blends:

group
exchange
blocked

Group:
Group is a type of supplier allocation which can be used to group a certain number of suppliers together to allocate a percentage of total completes.
The primary use case here would be: if you want to create a specific blend of supply partners e.g. for a Trackers. Simply include all the buyers in a group and allocate 100% complete to it. Predominantly used for tracker work

Exchange:
This is a default type of supplier allocation representing all the available suppliers on the platform. When no supply allocation is specified, the system by default applies an exchange allocation type.
Any supplier which is not in a group or blocked type will be in exchange type.
New suppliers added to the system will automatically be added to the Exchange group.
It is mandatory to specify an exchange allocation type if you have specified either group or blocked allocations for your target group.
Please note that it is not required to specify individual supplier IDs in this allocation type.

Blocked:
Blocked allocation type is used by buyers when they want to block certain suppliers from providing responses to their survey opportunities.
Reasons for blocking a supply partner can be for instance a company policy to not work with this particular partner or scoring low on your company internal quality ranking. Please note that blocking supply partners might impact your feasibility negatively.
Please note that there are no percentage_min or percentage_max parameters to be specified for this allocation type; both these parameters are defaulted to 0 by the system.

Common parameters and their definitions:

1. type: String; Specifying the type of allocation. For example: group, blocked or exchange.

2. name: String; Specifying the name of the allocation.

3. percentage_min: integer; Specifying the minimum percentage of total completes assigned to the specified allocation.

4. percentage_max: integer; Specifying the maximum percentage of total completes a specified allocation can contribute for the target group.

5. suppliers: array of objects; Specify the supplier ids which will form the allocation.


Example of supply allocations block to be included in Create TG is given below:

"supply_allocations": [
        {
            "type": "group",
            "name": "Test Supplier only",
            "percentage_min": 0,
            "percentage_max": 100,
            "suppliers": [
                {
                    "id": 980,
                }
            ]
        },
        {
            "type": "exchange",
            "percentage_min": 0,
            "percentage_max": 0,
            "suppliers": []
        }
    ]

More information can be found on our support site - here in particular this documents rules around validations that prevent unwary developers from creating Target Groups that are impossible to fill with contradictory specifications.


A future version of the Exchange API will refine the allocations object to support more supplier connection scenarios, including suppliers who are not generally visible to the rest of the Exchange and those that can be offered a different price to the main CPI of the Target Group. The existing model will continue to be supported alongside the appropriate version until further notice. Developers who wish to use the new capabilities will need to upgrade.

Automated Field Work - Fielding Assistant
The Cint Exchange offers smart tools like the Fielding Assistant to optimize Target Group performance. Rather than developing your own fielding algorithms and optimizations, you can use Fielding Assistant to leverage machine learning on aggregate data across the entire Cint Exchange.


Features include:

Prevent overfilling
Balanced fill
Optimize cost per interview (CPI) - only available for Dynamic Pricing customers
Pace your completes

These options are not exclusive and can be used in combination with each other.


See also our support site article:

https://help.cint.com/s/article/Create-a-Target-Group#auto-fielding


1. Prevent overfilling
This option is on by default in the CintX UI and we recommend enabling it on all API projects. It converts the complete target to the equivalent prescreen quota, ensuring that your quotas fill quickly without exceeding your limit.


2. Balanced fill
When enabled, the system paces your quotas to ensure that you are not left with difficult demographic alignments at the end of fielding.


3. Optimize cost per interview
Only available for Dynamic Pricing Customers: This feature uses your overall Target Group Budget and starts at a lower CPI.It slowly increases your CPI in case the traffic to your Target Group slows down. It will not go over the overall Target Group Budget.


4. Pace your completes
This feature allows you to schedule incremental quota increases for your Target Group. Often used for Trackers or projects that want to pace either by minute, hour or day.


There are two options to increase your quotas:

1. Linear: Quotas will be evenly incremented in regular intervals between start and end date.

2. Adaptive: Quotas will be adaptively incremented in regular intervals. Increments are recalculated at the start of each interval.


Automated Field Work
Recommendation
Always enable Prevent Overfilling

Examples:
Prevent overfilling and Balanced fill enabled.


"fielding_assistant_assignment": {
    "quota_overlay": {
      "prevent_overfill": true,
      "balance_fill": true

Optimized CPI

Important: you only need to define either your “Total Budget” OR your “Maximum CPI”


"fielding_assistant_assignment": {
    "pricing": {
        "type": "dynamic",
        "total_budget": {
          "value":"5.0000",
          "currency_code":"USD"
          },
        "minimum_cpi": {
          "value":"2.000",
   "currency_code":"USD"
}
          },

Or


"fielding_assistant_assignment": {
    "pricing": {
        "type": "dynamic",
        "maximum_cpi": {
          "value":"5.000",
   "currency_code":"USD"
            },
        "minimum_cpi": {
          "value":"2.000",
   "currency_code":"USD"
}
          },

Pacing enabled

Example: Adaptive pacing on a 30-minute interval


"pacing": {
      "type": "adaptive",
      "increment_interval": "PT30M"
    }

Example: Linear pacing once a day


"pacing": {
      "type": "linear",
      "increment_interval": "P1D"
    }

You always need to start your duration with P
To specify a duration in days, add a number and the letter D. 1 Day is expressed as P1D
To specify times, start with PT, then add a number followed by its unit (H, M, S).
Multiple units can be used i.e. 90 minutes can be specified as PT1H30M or PT90M.
Decimals are not permitted i.e. 30 minutes must be PT30M
How to add Fielding Assistant to your Target Group
1. In the Target Group creation process - pre launch


Endpoint: Create a target group in draft status


Use the section fielding_assistant_assignment to select which options should be enabled.


"fielding_assistant_assignment": {
    "quota_overlay": {
      "prevent_overfill": true,
      "balance_fill": true

A few helpful endpoints:

Create or update the fielding assistant modules assignment
Returns Fielding Assistant assignment details for a Target Group
Launching a Target Group - Introduction to Fielding Runs
You’re now at the last step to enable actual respondents to enter your survey. Launch your Target Group using a Fielding Run. Sometimes referred to as “setting your survey live”, this process exposes your Target Group to suppliers, allowing respondents to enter.


This simply means that

Your Target Group will change from an inactive draft to an active, launched Target Group
Your Target Group will be visible to suppliers
Your Target Group will receive traffic which means that actual respondents from our supply partners will try to access your survey

Some Target Group parameters cannot be changed after moving from “draft” to “launched”:

Business Unit
PII
Country/Language
Industry
Study Type

Workflow Example
In order to change the status of your Target Group, you will have to create a Fielding Run. A Fielding Run manages the visibility of your Target Group and can include scheduling and other related fielding parameters.


To launch, you create a Fielding Run for a draft Target Group.


Important:
Once launched, a Target Group is no longer in “draft” status. You must use non-draft endpoints to interact with your Target Group. A launched Target Group can never move back into “draft status”.


Key requirements for launching a Target Group are:

Your Account ID
Your Project ID
Your Target Group ID
Idempotency key
An end date for your field work e.g. when you want to have reached the full amount of completed surveys

We will go into detail on how and what to consider in the next paragraphs.


Generally, you use Fielding Runs to:

Go live / launch a Target Group
Update your Target Group’s fielding strategy and goals
Pause your Target Group
Relaunch your Target Group
Close your Target Group

Key points:
Launching your Target Group will make it visible to suppliers
Once your Target Group is launched, key attributes are locked in and you won’t be able to change them
Once your Target Group has been launched, you will need to use the in field endpoints for updating your Target Group
How to Launch a Target Group - from draft to launch
Once you have finalized your Target Group and want to launch it, make sure

Your survey is ready e.g. switched from test to live mode and fully tested
Your quotas are set and you are ready to monitor and manage your needs as required
You are able to successfully redirect respondents based on their different statuses back to Cint

When you first want to change the status of your Target Group, make a POST call to the endpoint Creates a 'launch fielding run from draft' job.

curl -X "POST" "https://api.cint.com/v1/demand/accounts/{account_id}/Projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/launch-from-draft" \
     -H 'Authorization: Bearer <YOUR_JWT>'
     -H 'Cint-API-Version: 2025-02-17'

HTTP/1.1 204 No Content
Access-Control-Allow-Headers: *
Access-Control-Allow-Methods: OPTIONS,POST,GET,DELETE,PATCH,PUT
Access-Control-Allow-Origin: *
Content-Encoding: gzip
Content-Type: application/json
Date: Wed, 01 May 2024 13:37:11 GMT
Vary: Accept-Encoding
Connection: close

If the call is successful, your Target Group will change the status and transition from “draft” to “launched”. Once your Target Group is launched, it is now considered in Fielding.

In the event of any errors preventing the creation of a fielding run, you can verify the status by making a GET request to Retrieves a 'launch fielding run from draft' job for further insights.


If you have multiple Target Group’s in your project and you want to launch all of them, instead of making individual calls you can utilize our endpoint Creates a bulk launch job for fielding runs of a set of target groups. This endpoint will launch all of your draft Target Groups at once.


You can check your Target Group status with

The Target Group Changelog
Webhooks

Upon successful execution of Create fielding run POST requests, it will return a job id in the “Location” response header.


Example
location: /v1/accounts/2428/projects/{project id}/target-groups/{target group id}/fielding-run-jobs/launch-from-draft/c1a13cfe-d59d-4cb1-a647-50b109958578

The last part in this header represents the job_id. So in the above example c1a13cfe-d59d-4cb1-a647-50b109958578 is the job_id. We recommend to cache this value as it will be required for numerous operations related to fielding runs.

Fielding Runs - which endpoint to use for what action
The Cint Exchange allows for a high level of flexibility to stop and start your Target Groups as needed.


In order to provide more flexibility to our users and avoid any accidental status changes while making updates via PUT methods, we have separated the fielding mechanism from the Target Groups by combining all the fielding related operations under a new resource called Fielding and Fielding(Batch).


Below is an overview of what endpoints are available and the recommended use case:


Endpoint	Description	Recommended use case
Creates a 'launch fielding run from draft' job	Changes your Target Group status from “Draft” to “Live”	This is the standard approach to “launch” a Target Group. This endpoint creates a new Fielding Run job for a Target Group, which will then queue for immediate exposure to suppliers.
Creates a 'schedule fielding run from draft' job	Doesn’t change your draft Target Group right away. Instead, you can schedule your launch time	Use this endpoint to schedule a launch in the future. This is useful for research outside of your time zone, where you might want to delay launching to align better with daylight hours.
Launches a fielding run now	Override a previously scheduled launch time/date and set your Target Group live right away	This endpoint requires an existing Fielding Run
Pause a fielding run	Changes your Target Group status from “live” to “paused”.	If you want to pause your Target Group to check data with the intention to resume your field work afterwards
Resume a fielding run	Changes your Target Group status from “paused” to “live”	Resume your field work from a previously paused Target Group
Complete a fielding run	Changes your Target Group status from “live” or any other status to “complete”	For closing your project. Suppliers will stop sending respondents.
Relaunch a fielding run	Changes your Target Group status from “complete” to “live” again	Recommended to use for Target Groups that you’ve closed but have to re-open e.g. to top up or get more completes
Fielding Runs - How to pause and complete a Fielding Run
Once you have successfully launched your Target Group, you have the option to pause or complete once you have reached your targeted number of respondents.


Workflow Example
Here are the steps to either pause or complete your Target Group:

Once your Target Group is launched by making a POST request to Creates a 'launch fielding run from draft' job endpoint. You will get a location response header holding your job_id.
Save the job_id in your database as specified in “How to launch your target group” section.
Utilize the job_id and make a GET request to Retrieves a 'launch fielding run from draft' job to get the status of your fielding run. If it is successful, your survey will be visible to our supply partners and respondents will be able to enter your survey. Cache the eTag header from this request.
Once you want to Pause or Complete your Target Group, make a request to Pause a fielding run or Complete a fielding run by passing appropriate eTag value (from above step) in the If-Match header.

We also have the Fielding(Batch) resource which does all the bulk Target Group fielding management for you.


Note:
If you want to check the details of various fielding runs associated with a specific Target Group, you can make a call to Get fielding runs by target group id endpoint.

The respondent journey and implementing secure redirects
The respondent is always at the heart of the integration experience. For the Cint Exchange, respondent flow is managed through redirection and placeholder values. Respondents are redirected to survey platforms, and survey platforms redirect respondents back to the Cint Exchange.


The interaction with the respondent begins once you launch a Target Group and can end either

When the respondent status is passed back or,
With sending through your final reconciliation

It is key for your Project and Target Group performance to make the respondent status feedback loop as secure and seamless as possible.


Respondent Journey Image
How to pass back the respondent status
Each survey-taker, or respondent, is assigned a unique session identifier prior to redirection to your survey. This is referred to as an RID (Response ID), and it is appended as a query string variable on the survey entry URL using a standardized Cint Exchange placeholder. While any variable name can be used, we recommend using the following syntax: https://www.example.com/survey?rid=[%RID%].


Note the placeholder syntax of [%RID%].


On completion of the survey or once you assign a status to a participant, it is mandatory to redirect the respondent back to the Exchange using a set of standard redirects. These cover four possible survey end conditions:

Complete
Terminate
Quality terminate
Overquota

The status has to be transmitted by either a secure hashed redirect or API call.


Your integration consultant will support you on the implementation and testing of this respondent flow.


Implementing a secure redirect solution: two options
Recommended Solution - S2S
The Cint Exchange will offer a server-to-server respondent security solution in the first half of 2025.


If you are using Decipher, a new S2S solution will be available to you in H1 2025. Speak to your integration consultant for any additional questions.


More information, see the Server-to-Server (S2S) section below.


Alternative - SHA-1
Since redirects are vulnerable to manipulation, Cint strongly recommends the implementation of a SHA-1 HMAC hashing approach for redirect URLs. For details on implementation, including code samples, please review https://hash.lucidhq.engineering/. Your CSM will assist with account setup and key generation, and your integration consultant will be available to answer any implementation questions.


The hashing option is also available for entry URLs as well and applies the same algorithm to the entry link provided for the survey.


If you are using Decipher, SHA-1 should be available to you automatically. Speak to your integration consultant for any additional questions.

Server-to-Server (S2S)
Overview
Cint offers a simple, secure API-powered workflow for customers who want to utilize server-to-server calls to communicate respondent outcomes. S2S API calls limit the risk of ghost completes and common respondent losses due to modified URLs, browser plugins affecting redirects, and internet connection issues.


Respondents still move between the Cint Exchange and your survey platform using redirects, but all sensitive session data moves within secure API calls.


Basic S2S Flow
The S2S API secures both the respondent entry to your survey platform and the respondent return to the Cint Exchange.


Survey Entry Steps
When a supplier sends a respondent to your survey, the Cint Exchange assigns the respondent an RID value. This value is embedded in the entry link for your survey, replacing the [%RID%] placeholder.


Once your survey platform receives a respondent, it should do the following:

1. Accept the respondent entry URL and retrieve the RID value.

2. Make an API call to the Validate Respondent endpoint.

If the respondent is valid, allow them to take the survey.
If the respondent is not valid, mark them as a Security Terminate and redirect back to Cint without making an API call.

Survey Exit Steps
When a respondent reaches the end of your survey as a Complete, Terminate, Overquota, or Security Terminate, your survey platform must take the following steps to return the respondent to Cint:

Make an API call to the Update Respondent Status endpoint with the appropriate respondent outcome.
After receiving a "success" response from the API endpoint, redirect the respondent using this URL: https://samplicio.us/s/ClientCallBack.aspx?RID=[insert_value].

Implementation Details
Authentication
Cint S2S uses basic HTTP authentication. Your account team will provide your API key for S2S during the integration process. The S2S API key is not part of your JWT/Oauth flow and can only be used for S2S requests.


All requests must include an "Authorization": "<your_api_key_here>" header parameter. This replaces the X-API-Key value on previous S2S flows.


How to Validate a Respondent
When a respondent enters your survey platform, retrieve their RID value. This value is embedded in the entry URL. Usually, the RID is appended as a query string parameter (e.g. https://example.com/mysurvey?rid=12345), but an RID can also be added to the URL path (e.g. https://example.com/mysurvey/12345).


While we use a numeric ID in this example, a standard RID is a 36-character alphanumeric UUID.


Using the captured RID, make a GET call to the https://s2s.cint.com/fulfillment/respondents/[%RID%] endpoint. The response will include the survey URL for the respondent and their current status.


The following example is for a respondent with RID 12345, entering survey https://example.com/mysurvey?rid=[%RID%].


The entry URL for Respondent 12345 is https://example.com/mysurvey?rid=12345.

{
    "id": "12345",
    "status": 1,
    "links": [
        {"href": "https://example.com/mysurvey?rid=12345"}
    ]
}

The respondent's status parameter value must be 1, indicating an "In Survey/Drop" status. If the respondent has any other value for status, or if the validation API call returns anything other than a 2XX HTTP status, redirect them using the generic redirect below without making an API call.


How to Return a Respondent
Once a respondent reaches the end of your survey, follow these steps to return them to Cint. These steps apply for all terminal statuses, regardless of whether the respondent is a complete.


Status Codes
For backwards compatibility, the Respondent Transition endpoint uses different codes than URL redirect flows. These codes also differ from reported/stored status codes within the Cint Exchange.


Cint Exchange Status	Legacy Cint Status	S2S Code	Exchange/
Marketplace Code
Complete	Complete	5	10
Terminate	Screenout	2	20
Overquota	Quota Full	3	40
Security Terminate	Quality Terminate	4	30
API Respondent Transition
First, POST to the https://s2s.cint.com/fulfillment/respondents/transition endpoint. You will need to include the respondent RID in the id field and the appropriate status. The status value must align with the values in the S2S Code column above.


Example Request Body:

{
    "id": "<respondent_id>",
    "status": <S2S_Code>
}

A Note on Order-of-Operations
You must wait for a "success" response prior to redirecting the respondent. The endpoint will return a 200 HTTP status once all respondent information has updated.


Redirection
Once the API call has successfully registered the respondent status update, redirect the respondent to https://samplicio.us/s/ClientCallBack.aspx?RID=[insert_value], including the RID in the URL. Note that the URL does not include a respondent status.


Reconciliation
Reconciliation allows you to adjust respondent statuses after survey completion. If you encounter poor-quality respondent answers in a survey, the Reconciliation workflow allows you to submit affected respondents to Cint and remove them from your invoicing.


Cint uses reconciliation data to improve supplier quality and automated security tools.


Reconciliation follows a trailing-month deadline. All IDs achieved in a given month may be reconciled until the 25th of the following month. For more details, see the Reconciliation Policy.


Submitting a reconciliation
Start by generating a reconciliation-eligible-rids report using the Generate report endpoint.


Retrieve the report using the Download report endpoint.


After determining the status of your respondents and creating a file, use the Submit reconciliations endpoint to post your request. Cache the request_id you get in the response from this POST request.


Note: the csv file needs to have two columns. Format each line as RID, reason code. Do not include a header row. The file can also not exceed 20.000 IDs.

Get the list of reason codes via the List of reconciliation reason codes and details endpoint.


Once you submit your reconciliation successfully, we recommend making a GET call to the Get a reconciliation by request id endpoint using the previously cached request_id to check the status of all the ids submitted in the request.


To check the status and the success of all your reconciliations, we recommend to use the Get a list of submitted reconciliations by account id endpoint: it will list all reconciliations submitted in the time frame you determine and indicate the status they are currently in.


If you want to cross verify the number of completes for specific Target Groups, you can use the Retrieve basic attributes and stats for a Target Group endpoint after a reconciliation to ensure counts in Cint’s system align with your system.


Key Points:
Ensure that the file format is correct when submitting a reconciliation
You can check the status of each or all reconciliations submitted
Your respondent IDs are only locked in once they are outside the reconciliation window. If you accidentally get the wrong ID list, simply resubmit the correct file in another request
Migration Help
The following sections provide reference information on how to migrate common workflows from the Cint Buyer API and the Lucid Marketplace API to the Cint Exchange.

Migration Help - BAPI to Cint Exchange Endpoints
Get Country Data
BAPI	Cint Exchange
/ordering/reference/countries	/locales
In CintX, every Target Group is associated with a country-language tuple, which we refer to as a locale. We encode these as a 3-letter language code, followed by an underscore and 2-letter country code. For example, English-US would be identified as Locale Code eng_us


Get Profiling Questions For a Country
BAPI	Cint Exchange
/ordering/reference/Questions/{countryId}	/demand/questions?locale=<localeCode>
The Questions endpoint lists all available questions for your account. There are several query string options for filtering and searching, along with an additional translation endpoint to show other languages.


There are two approaches for using the Questions endpoint:

1. Retrieve and cache all available questions on a periodic basis - standard questions are updated quarterly, and can be cached/databased

2. Use the endpoint for real-time/autocomplete search using the search query parameter to show users an interactive list of available questions for a search term.


Start a Study With Cint
BAPI	Cint Exchange
/ordering/surveys	/demand/accounts/{account_id}/projects/demand/accounts/{account_id}/projects/{project_id}/target-groups
Target Groups are analogous to the current "survey" or "study" concept, and are grouped into Projects in the Cint Exchange. A Target Group is associated with a single Project, but a Project may contain many Target Groups.


Depending on workflow and logical organization, it may make sense to create a Project for each Target Group, or to create cross-study groupings such as a daily or weekly Projects for several Target Groups.


Target Groups are created in "Draft" status and can be modified substantially both before and after launch.


Retrieve an existing study
BAPI	Cint Exchange
/ordering/surveys/{id}	• Draft:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}

• Launched:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/details
As discussed above, Target Groups are created in "Draft" status, and many of the modification and update endpoints vary based on whether a Target Group is in "Draft" or "Launched" state.


Both paths are listed here.


Unlike the Cint Buyer API, most Target Group parameters are editable after launch, including targeting, metrics, and fielding strategy.


Get CPI for a survey
BAPI	Cint Exchange
/ordering/quotes	/demand/accounts/{account_id}/projects/{project_id}/target-groups/calculate-feasibility
The Feasibility API offers detailed information about pricing and available respondents for a planned Target Group.


You must include a Project in the Feasibility API request - we recommend creating a single project used only for feasibility, and which contains no Target Groups, then using that project for all feasibility requests.


We also offer an endpoint to get feasibility for an existing Target Group, which can be used prior to or after launch to assess actual configuration.


Get the current cost of a study
BAPI	Cint Exchange
/ordering/surveys/{surveyId}/CurrentCost	/demand/accounts/{account_id}/reports/sample-bought
This information is available via the "Sample Bought" report.


Update study status
BAPI	Cint Exchange
/ordering/surveys/{pptCampaignId}	/ordering/surveys/{pptCampaignId}
Target Group status is managed by "Fielding Run" objects. Rather than modifying the Target Group object, you create or update Fielding Runs associated with Target Groups. The endpoint linked here is used to launch a Target Group, with others available to pause, unpause, or complete fielding.


Mark a response as a bad response
BAPI	Cint Exchange
/fulfillment/respondents/reconciliations	• Generate Reconciliation Report:
/demand/accounts/{account_id}/reports/reconciliation-eligible-rids

• Submit Reconciliation Request:
/demand/accounts/{account_id}/reconciliations
In the Cint Exchange, respondent statuses can be updated using a Reconciliation Request submission. The update must include a reason code, which expresses the rationale for a quality removal. A Reconciliation Request is formatted as a CSV, and can contain many RIDs in a single request. We offer a reporting endpoint to help keep track of reconcilable RIDs - it shows all RIDs for your account, along with their statuses.


Reconciliations must be submitted no later than the end of the month following the month in which the complete was achieved. See here for the Cint Exchange Reconciliation Policy: https://help.cint.com/s/article/Reconciliation-Policy


Get respondent data
BAPI	Cint Exchange
/fulfillment/respondents/{respondentId}	Please ask your Integration Consultant how to access respondent data from your individual Target Groups.
If you are interested in respondent data beyond survey specific data, please get in touch with your account team and ask them about our Data solutions Cint provides.
Get respondent statistics
BAPI	Cint Exchange
/ordering/surveys/{respondentId}/statistics	/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/overview
Create and manage a survey order
BAPI	Cint Exchange
/ordering/surveys/{Id}	• Launch draft Target Group:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/overview

• Schedule launch for a draft Target Group:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/schedule-from-draft

• Update start and end date for a live Target Group:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}

• Pause live Target Group:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}/pause

• Complete fieldwork (fielding run) for a live Target Group:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}/complete
Return respondent status to Cint
BAPI	Cint Exchange
/ordering/surveys/respondents/transition	/s2s.cint.com/fulfillment/respondents/transition
Part of the CintX S2S Solution - you may use this endpoint to return a respondent status to our system.


Run feasibility for a created Target Group
BAPI	Cint Exchange
/ordering/FeasibilityEstimates	• Feasibility for existing Target Group id. Currently only works for live Target Groups, not for draft Target Group but we are working on an update:
/demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/calculate-feasibility
Migration Help - Available Currencies and their ISO codes
The Cint Exchange supports a variety of currencies.


Which currencies you can use will depend on your commercial agreement.


The Business Unit(s) in your Account will be the level this information is stored. It will reflect your commercial terms e.g. your rate card or dynamic pricing agreement and the currency it is related to.


If you have multiple currencies in your commercial agreement, you will have multiple Business Units, one reflecting each currency.


If you attempt to make a call with a currency that doesn’t match the Business Unit, the system will return an error message.


For any queries around your Business Unit setup, please contact your Customer Success Representative.


ISO Currency Code	Full Name
AUD	Australian Dollar
GBP	British Pound Sterling
EUR	Euro
INR	Indian Rupee
SGD	Singapore Dollar
USD	US Dollar
JPY	Japanese Yen
SEK	Swedish Krona
TRY	Turkish Lira
CAD	Canadian Dollar
ZAR	South African Rand
CNY	Chinese Yuan renminbi
Notifications Webhooks
Cint uses webhooks to pass on information to customers about change events for their Target Groups, Quota fill, and Session Data.


Recommendations
Use this functionality to monitor your Target Groups
Use this functionality to action on changes in your Target Group
Use this functionality to alert your internal teams when they need to action and make changes to the Target Group
These streams, delivered via webhooks and designed to provide actionable insights.


Sessions Data: This webhook focuses on the respondent lifecycle within a survey. It provides granular details about individual respondents, such as their entry into the survey, status updates, completion times, and any issues encountered during their journey.
Demand Changelog: This webhook captures changes to target groups, including their creation and modifications such as status changes.
Quota Fill: This webhook provides data on changes to quota screens and completes.

See your notifications endpoint for more information - Notifications Webhooks


Response sample:

{
    "events": [
        "target-group-updated",
        "quota-fill-registered",
        "session-updated"
    ]
}

Event Envelope
Cint leverages the CloudEvents v1.0.2 specification to provide a consistent and structured format for all outbound webhook events. Each webhook payload is encapsulated within a CloudEvents envelope, ensuring a standardised metadata layer across all event types. This approach promotes interoperability, simplifies event processing, and allows consumers to rely on predictable event structure regardless of the underlying domain-specific data.


Event Structure
Every webhook event consists of two main components:


CloudEvents Envelope - Contains standard metadata fields such as:

Field	Description
id	Unique identifier for the event instance
specversion	CloudEvents specification version (1.0)
source	URI identifying the event source
type	Event type (e.g. com.cint.target-group.updated)
time	ISO 8601 timestamp indicating when the event occurred
datacontenttype	Payload format (always application/json)
dataschema	URI referencing the JSON Schema for the data payload
Event-specific Payload
The data field holds the actual event payload, whose structure varies based on the event type. Each data object is defined and validated against a dedicated JSON Schema.


What will pause your Target Group?
Target Groups can be paused in a number of ways. Firstly, they can be paused by your own users or applications using the Exchange UI or API. The changelog notification will contain the user ID of the person or token that made the change in this case.


Secondly the Target Group can be paused by one or more of Cint’s automations or Trust and Safety processes. For instance you could be using Fielding Run scheduling to start and stop a Target Group at a particular time, perhaps one that you have optimised with the Intelligent Calendar API. You could also have configured another automation such as pricing optimisation on your Target Group (for dynamically pricing Target Groups) or a Max CPI constraint for Rate Card Target Groups. These could pause your Target Group when one or more of the constraints you have configured would be breached.


Cint also has a series of systems that observe your Target Group and pause it if it looks ‘unhealthy’. Health in this case is defined as statistics or configuration that would negatively affect your buyer reputation in the Exchange with suppliers or respondents; cause you to conflict with the Cint Exchange Guidelines https://www.cint.com/legal/cint-exchange-guidelines-2024_01/ or in other ways collect respondents that you did not intend. These health metrics will vary by time, market and ongoing development but they are related closely to the key metrics used by suppliers to select surveys and include EPCM, Drop Rate, excessive divergence between expected and calculated LOI and IR and many more. Key statistics to watch here are provided on the target group statistics calls. In particular our models may pause on correlations between metrics that on their own may be acceptable but together create work that is unsustainable for the health of the Exchange.


Cint will continue to introduce new technology to predict, monitor and improve Target Groups on the Exchange to optimise conversion and speed to gather answers. In order to minimise these pauses we would encourage buyers to ensure that you have tested your survey, and in particular used the feasibility system both before and during your fielding as this can provide you with early identification of problems and solutions to tackle them during fielding before traffic drops off too much or the Target Group is paused.

Sessions Data
Schema		
Field	Type / Format	Example
account_id	Integer	1
response_session_id	String / UUID	67adda00-f3a4-f7b3-4dd2-f8494c3d5017
sequence_number	Integer	3
project_id	String / ULID	“01JH2Q9824364JXCT9R8HDKKR8”
target_group_id	String / ULID	“01BX5ZZKBKACTAV9WEVGEMMVS1”
survey_id	Integer	491982
supplier_id	Integer	18
supplier_name	String	“Supplier Name”
respondent_id	Integer	147376725
respondent_entry_date	Date time / RFC 3339	2018-04-11T16:25:54.416Z
panelist_id	String / UUID	“7d0fb32-f5d2-4897-8caa-e6e083bf82bf”
parent_sid	String / UUID	"674859c3-692a-427d-4e99-6addc5e705f0"
entry_type	Integer	1
mid	String	“603987075”
changes	Array of Changes	
changes.object	string	client_status_code_change
changes.new_value	String/Integer/Boolean	1

Example payload
{
  "account_id": 1,
  "response_session_id": "67adda00-f3a4-f7b3-4dd2-f8494c3d5017",
  "sequence_number": 5,
  "project_id": "01JH2Q9824364JXCT9R8HDKKR8",
  "target_group_id": "01BX5ZZKBKACTAV9WEVGEMMVS1",
  "survey_id": 491982,
  "supplier_id": 18,
  "supplier_name": "Supplier Name",
  "respondent_id": 147376725,
  "respondent_entry_date": "2018-04-11T16:25:54.416Z",
  "panelist_id": "97d0fb32-f5d2-4897-8caa-e6e083bf82bf",
  "parent_sid": "674859c3-692a-427d-4e99-6addc5e705f0",
  "entry_type": 1,
  "mid": "Targeted",
  "changes": [
    {
      "object": "respondent_last_date_change",
      "new_value": "2025-02-13T11:39:49.274Z"
    },
    {
      "object": "client_status_code_change",
      "new_value": 1
    }
  ]
}

Change objects
respondent-last-date-change
client-status-code-change
client-query-string-chang
redirect-url-change
exchange-status-code-change
is-live-change
Demand Changelog
Schema		
Field	Type / Format	Example
id	String / UUID	b00ad4d6-a477-4d7c-abcf-90558ffef804
account_id	Integer	1
project_id	String / ULID	“01JH2Q9824364JXCT9R8HDKKR8”
target_group_id	String / ULID	“01BX5ZZKBKACTAV9WEVGEMMVS1”
occurred_at	Date time / RFC 3339	2018-04-11T16:25:54.416Z
user	User Object	
user.type	string	“las_user”
user.las_user_id	String / GUID	“9fdf41e9-cbcc-43da-abe4-8a5d45eafd70”
changes	Array of Changes	
changes.object	string	filling_goal_change
changes.new_value	String/Integer/Boolean	110

Example payload
{
  "id": "ef4b7ed0-7408-4646-8750-cc6a33a3375a",
  "account_id": "1",
  "project_id": "01JH2Q9824364JXCT9R8HDKKR8",
  "target_group_id": "01BX5ZZKBKACTAV9WEVGEMMVS1",
  "occurred_at": "2025-02-13T11:39:49.274Z",
  "user": {
    "type": "las_user",
    "las_user_id": "9fdf41e9-cbcc-43da-abe4-8a5d45eafd70"
  },
  "changes": [
    {
      "object": "filling_goal_change",
      "new_value": 110
    },
    {
      "object": "live_url_change",
      "new_value": "https://example.com/test1"
    }
  ]
}

Change objects
name_change
external_name_change
collects_pii_change
business_unit_change
study_type_change
project_manager_change
filling_goal_change
filling_strategy_change
expected_length_of_interview_minutes_change
expected_incidence_rate_change
industry_lockout_code_change
cpi_note_change
cpi_change
live_url_change
test_url_change
status_change
currency_change
locale_change
project_id_change
pricing_assistance_change
pricing_dynamic_total_budget_change
pricing_dynamic_maximum_cpi_change
pricing_dynamic_minimum_cpi_change
pricing_dynamic_unlock_max_budget_usage_change
pricing_rate_card_maximum_cpi_change
quota_overlay_assisted_change
quota_overlay_balance_fill_change
quota_overlay_prevent_overfilling_change
pacing_assistance_change
pacing_adaptive_increment_interval_change
pacing_linear_increment_interval_change
soft_launch_assisted_change
soft_launch_demographics_strictness_percentage_change
soft_launch_filling_goal_percentage_change
soft_launch_end_date_change
fielding_period_start_date_change
fielding_period_end_date_change
Quota Fill
Schema		
Field	Type / Format	Example
account_id	Integer	1
target_group_id	String / ULID	01JPSECBPA847DD89PN9ZFFBE1
screens	Integer	113
completes	Integer	73
profile_quota_id	String / ULID	01JPSECY0CC2XAJEP5EV18SD9F

Example payload
{
  "account_id": 1,
  "target_group_id": "01JPSECBPA847DD89PN9ZFFBE1",
  "screens": 113,
  "completes": 73,
  "profile_quota_id": "01JPSECY0CC2XAJEP5EV18SD9F"
}
