My Workspace
illustration-create-flow
Your flows will appear here
Resources

View Flows docs

Share feedback
InsighIQ APIs Documentation
Version
CURRENT
Language
InsighIQ APIs Documentation
Getting Started
For the full documentation, refer to https://docs.insightiq.ai.

The InsightIQ API is built on RESTful principles. It returns JSON encoded responses and accepts JSON payloads on HTTPS connections. APIs must be called only from your server and never from your app / frontend as this is a security issue.

﻿
Modes
The API is available in two modes detailed below. Each mode operates using separate API credentials.

Mode	Host	Description
Sandbox
﻿https://api.sandbox.insightiq.ai﻿
Use Sandbox mode to build and test your integration. In this mode, you can use any random credentials to log into platforms. All API endpoints will return mocked data and no changes are made to any account.
Production
﻿https://api.insightiq.ai﻿
Use Production mode to go live with your integration. On production, your users will need to use their real credentials to log in to the diferent platforms. API endpoints return real data and updates are made to accounts. Note that all account connections and data syncing via APIs in this mode are billable.
﻿
Authentication
We use API credentials to uniquely identify your access to InsightIQ. Your client ID and secret must be included in all requests to the API via an Authorization HTTP header.

To get your API credentials, please register on our dashboard.

If your API credentials are compromised or you want to rotate your API credentials, please reach out to us at support@insightiq.ai.

Header	Description
Authorization
Basic
﻿
Rate Limit / Throttling
We currently allow a max of 10 requests per second (rate limit) per developer, combining all API endpoints, with an additional limit on concurrently open requests. These limits follow a fixed window approach, meaning the limits are maintained in distinct units of a full second and not on a partial or rolling basis.

If you make requests in excess of these limits, we will throttle the request and throw an error with HTTP status code 429. We also return a Retry-After header with value in seconds. This error is expected to be handled at your end just like all other API errors, along with the Retry-After header to guide you with the resolution.

You can read our full guide on how to handle rate limits here.

﻿
Errors
We send descriptive errors in response, when such a case arises. Each error response has enough information to be able to debug and resolve the issue. You can read more about it here.﻿

If you are facing issues in debugging or resolving, feel free to write to us with your request_id and other details at support@insightiq.ai.

﻿
Status
We run weekly maintenance on a schedule - every Friday at 5:30 AM - 5:45 AM PST (which is 9:30 AM - 9:45 AM UTC and 3:00 PM - 3:15 PM IST). You might experience minor glitches or, very sporadically, downtimes, during this period. Make sure to check with us if you face any issues beyond this period.

Additionally, you can check the availability of APIs on our status page.

﻿
Integrating InsightIQ into your app
Try the sample app to see how creators use InsightIQ to share their data with apps like yours. Once you have familiarized yourself with this, you can set up the same "Connect" experience on your apps using our SDKs and start fetching data.

1. Setup webhooks
The first step to using InsightIQ APIs is to set up webhooks, as these will be your primary source of any updates and changes in the status of account linking and data availability. They are a crucial component of an optimized InsightIQ integration. Your application needs to listen for incoming webhook events and process them to confirm that data is available after connecting with the work platform. Read more about our webhooks here and find our webhook APIs here.

2. Create a user
Start the user journey by creating a user on InsightIQ for every creator who needs to share their data, using the create a user API.

The id returned in the response can be used to uniquely identify your users even when they return to your app.

3. Create an SDK token
﻿Create an SDK token using the id returned in Step 2. This token can now be used to initialize the SDK and start the account connection process. This token is valid for precisely one week from the time of creation.

Remember to set IDENTITY, IDENTITY.AUDIENCE, ENGAGEMENT, ENGAGEMENT.AUDIENCE or INCOME (or a combination of these) as the value for the products parameter in the API request. This is based on the data points you wish to collect about the creator and which product do they fall under.

4. Start connecting accounts
Initialize the Connect SDK using the token from Step 3 and launch the SDK. This will open the page from where your users can log in to platforms like Instagram and start sharing data with you.

Depending on the platform (web, iOS, Android, Flutter, etc.), you will need to call the associated SDK function to launch this page.

Read more about our different SDKs here.

5. Fetch data of connected accounts
There are several ways of getting notified about a new account connection:

* Listening to events on your front-end: All our SDKs support instantaneous events to tell you when a new connection happens. You can use these events to build a good app experience for your users and use the data from these events (account_id, etc.) to start making relevant API calls via your backend.
* Listen for webhooks on your backend: This is a more reliable way of getting notified about events, but not as instantaneous as a front-end event. Again, you can use the data from these events (account_id, etc.) to start making relevant API calls.
* Poll our APIs: This is not a recommended method for integration and might result in causing issues such as running into rate-limiting related errors.

In general, webhooks are a more reliable source of data.

* They are delivered directly from our server to your server, providing security and integrity.
* They are not dependent on the user's device or internet connection.

But relying on webhooks to update your frontend might not be a great idea since webhooks are not as quick and real-time as the events being triggered on the frontend itself.

An ideal scenario is to use front-end events to provide feedback to the user and update your app and use the webhooks to start the actual data fetching via InsightIQ.

Once your users have connected their accounts with InsightIQ (Step 4), you can start fetching their data from the platforms (Instagram, YouTube, etc.).

Call the retrieve all accounts API to get all the accounts connected by your users in Step 4. The response also indicates the account connection status and the data sync status for the different products you have requested access to (e.g., IDENTITY).

Once the data is synced, you will receive a webhook notification for each type of data.

Upon receiving the profile related notification, you can fetch the profile information of an account using the retrieve a profile API. This API returns profile-level information like username, bio, number of followers, etc., and can be used to verify account ownership and identity of your users.

Upon receiving the content related notification, you can fetch the media content of an account using the retrieve all content items API. This API returns the content posted by creators and its associated engagement metrics, including likes, shares, impressions, and others.

And so on for other products.

﻿
Sample code and apps
Don't want to set up the Connect SDK on your app yet? We have boilerplate sample apps available with our SDKs already installed to help you build and try the InsightIQ Connect experience and hit the APIs.

You can download any of our sample apps, configure your API credentials in the environment file, and you are ready to get started. These apps use the InsightIQ SDK and APIs internally. These can also be used as a starting point to build your own InsightIQ integrations.

Authorization
Basic Auth
Username
{{CLIENT_ID}}
Password
{{CLIENT_SECRET}}
Connect
﻿

Authorization
Basic Auth
This folder is using an authorization helper from collection InsighIQ APIs
GET
Retrieve a work platform
{{BASE_URL}}/v1/work-platforms/{{WORK_PLATFORM_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve all work platforms
{{BASE_URL}}/v1/work-platforms
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
limit
{{LIMIT}}
offset
{{OFFSET}}
name
{{WORK_PLATFORM_NAME}}
GET
Retrieve a user
{{BASE_URL}}/v1/users/{{USER_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve all users
{{BASE_URL}}/v1/users
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
limit
{{LIMIT}}
offset
{{OFFSET}}
POST
Create a user
{{BASE_URL}}/v1/users
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
  "name": "Arvind",
  "external_id": "c8b24285-e576-4c7a-9196-26c0c401afe84"
}
GET
Retrieve a user by external ID
{{BASE_URL}}/v1/users/external_id/{{EXTERNAL_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
POST
Create an SDK token
{{BASE_URL}}/v1/sdk-tokens
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "user_id": "{{USER_ID}}",
    "products": [
        "IDENTITY",
        "ENGAGEMENT",
        "ENGAGEMENT.AUDIENCE",
        "INCOME"
    ]
}
GET
Retrieve an account
{{BASE_URL}}/v1/accounts/{{ACCOUNT_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
PATCH
Update an account
{{BASE_URL}}/v1/accounts/{{ACCOUNT_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
View More
json
{
    "data": {
        "identity": {
            "monitoring_type": "STANDARD",
            "audience": {
                "monitoring_type": "STANDARD"
            }
        },
        "engagement": {
            "monitoring_type": "STANDARD",
            "audience": {
                "monitoring_type": "STANDARD"
            }
        },
        "income": {
            "monitoring_type": "STANDARD"}
    }
}
GET
Retrieve all accounts
{{BASE_URL}}/v1/accounts
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
limit
{{LIMIT}}
offset
{{OFFSET}}
user_id
{{USER_ID}}
work_platform_id
{{WORK_PLATFORM_ID}}
POST
Disconnect an account
{{BASE_URL}}/v1/accounts/{{ACCOUNT_ID}}/disconnect
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Identity
﻿

Authorization
Basic Auth
This folder is using an authorization helper from collection InsighIQ APIs
GET
Retrieve a profile
{{BASE_URL}}/v1/profiles/{{PROFILE_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve all profiles
{{BASE_URL}}/v1/profiles
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
limit
{{LIMIT}}
offset
{{OFFSET}}
account_id
{{ACCOUNT_ID}}
user_id
{{USER_ID}}
work_platform_id
{{WORK_PLATFORM_ID}}
POST
Refresh a profile
{{BASE_URL}}/v1/profiles/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
GET
Retrieve audience demographics
{{BASE_URL}}/v1/audience
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
account_id
{{ACCOUNT_ID}}
Engagement
﻿

Authorization
Basic Auth
This folder is using an authorization helper from collection InsighIQ APIs
GET
Retrieve a content item
{{BASE_URL}}/v1/social/contents/{{CONTENT_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve all content items
{{BASE_URL}}/v1/social/contents
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
from_date
{{FROM_DATE}}
to_date
{{TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
account_id
{{ACCOUNT_ID}}
filters
{{FILTER_QUERY}}
POST
Refresh content items
{{BASE_URL}}/v1/social/contents/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
POST
Fetch historic content items
{{BASE_URL}}/v1/social/contents/fetch-historic
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}",
    "from_date": "2020-04-01"
}
POST
Retrieve content items in bulk
{{BASE_URL}}/v1/social/contents/search
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "ids": [
        {{CONTENT_ID}}
    ]
}
GET
Retrieve a content group
{{BASE_URL}}/v1/social/content-groups/{{CONTENT_GROUP_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve all content groups
{{BASE_URL}}/v1/social/content-groups
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
from_date
{{FROM_DATE}}
to_date
{{TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
account_id
{{ACCOUNT_ID}}
filters
{{FILTER_QUERY}}
POST
Refresh content groups
{{BASE_URL}}/v1/social/content-groups/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
POST
Fetch historic content groups
{{BASE_URL}}/v1/social/content-groups/fetch-historic
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}",
    "from_date": "2020-04-01"
}
POST
Retrieve content groups in bulk
{{BASE_URL}}/v1/social/content-groups/search
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "ids": [
        {{CONTENT_GROUP_ID}}
    ]
}
GET
Retrieve all comments
{{BASE_URL}}/v1/social/comments?account_id={{ACCOUNT_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
account_id
{{ACCOUNT_ID}}
from_date
{{FROM_DATE}}
to_date
{{TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
filters
{{FILTER_QUERY}}
Income
﻿

Authorization
Basic Auth
This folder is using an authorization helper from collection InsighIQ APIs
GET
Retrieve a social transaction
{{BASE_URL}}/v1/social/income/transactions/{{SOCIAL_TRANSACTION_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve social transactions for an account
{{BASE_URL}}/v1/social/income/transactions?account_id={{ACCOUNT_ID}}&transaction_from_date={{TRANSACTION_FROM_DATE}}&transaction_to_date={{TRANSACTION_TO_DATE}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
type
account_id
{{ACCOUNT_ID}}
transaction_from_date
{{TRANSACTION_FROM_DATE}}
transaction_to_date
{{TRANSACTION_TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
POST
Refresh social transactions for an account
{{BASE_URL}}/v1/social/income/transactions/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
POST
Fetch historic social transactions for an account
{{BASE_URL}}/v1/social/income/transactions/fetch-historic
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}",
    "from_date":  "2020-04-01"
}
POST
Retrieve social transactions in bulk
{{BASE_URL}}/v1/social/income/transactions/search
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "ids": [
        {{SOCIAL_TRANSACTION_ID}}
    ]
}
GET
Retrieve a social payout
{{BASE_URL}}/v1/social/income/payouts/{{SOCIAL_PAYOUT_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve social payouts for an account
{{BASE_URL}}/v1/social/income/payouts?account_id={{ACCOUNT_ID}}&payout_from_date={{PAYOUT_FROM_DATE}}&payout_to_date={{PAYOUT_TO_DATE}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
type
account_id
{{ACCOUNT_ID}}
payout_from_date
{{PAYOUT_FROM_DATE}}
payout_to_date
{{PAYOUT_TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
POST
Refresh social payouts for an account
{{BASE_URL}}/v1/social/income/payouts/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
POST
Fetch historic social payouts for an account
{{BASE_URL}}/v1/social/income/payouts/fetch-historic
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}",
    "from_date":  "2020-04-01"
}
POST
Retrieve social payouts in bulk
{{BASE_URL}}/v1/social/income/payouts/search
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "ids": [
        {{SOCIAL_PAYOUT_ID}}
    ]
}
GET
Retrieve a e-commerce transaction
{{BASE_URL}}/v1/commerce/income/transactions/{{ECOMMERCE_TRANSACTION_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve e-commerce transactions for an account
{{BASE_URL}}/v1/commerce/income/transactions?account_id={{ACCOUNT_ID}}&transaction_from_date={{TRANSACTION_FROM_DATE}}&transaction_to_date={{TRANSACTION_TO_DATE}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
type
account_id
{{ACCOUNT_ID}}
transaction_from_date
{{TRANSACTION_FROM_DATE}}
transaction_to_date
{{TRANSACTION_TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
POST
Refresh e-commerce transactions for an account
{{BASE_URL}}/v1/commerce/income/transactions/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
POST
Fetch historic e-commerce transactions for an account
{{BASE_URL}}/v1/commerce/income/transactions/fetch-historic
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}",
    "from_date":  "2020-04-01"
}
POST
Retrieve e-commerce transactions in bulk
{{BASE_URL}}/v1/commerce/income/transactions/search
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "ids": [
        {{ECOMMERCE_TRANSACTION_ID}}
    ]
}
GET
Retrieve a e-commerce payout
{{BASE_URL}}/v1/commerce/income/payouts/{{ECOMMERCE_PAYOUT_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve e-commerce payouts for an account
{{BASE_URL}}/v1/commerce/income/payouts?account_id={{ACCOUNT_ID}}&payout_from_date={{PAYOUT_FROM_DATE}}&payout_to_date={{PAYOUT_TO_DATE}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
account_id
{{ACCOUNT_ID}}
payout_from_date
{{PAYOUT_FROM_DATE}}
payout_to_date
{{PAYOUT_TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
POST
Refresh e-commerce payouts for an account
{{BASE_URL}}/v1/commerce/income/payouts/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
POST
Fetch historic e-commerce payouts for an account
{{BASE_URL}}/v1/commerce/income/payouts/fetch-historic
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}",
    "from_date":  "2020-04-01"
}
POST
Retrieve e-commerce payouts in bulk
{{BASE_URL}}/v1/commerce/income/payouts/search
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "ids": [
        {{ECOMMERCE_PAYOUT_ID}}
    ]
}
GET
Retrieve a e-commerce balance
{{BASE_URL}}/v1/commerce/income/balances/{{ECOMMERCE_BALANCE_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve e-commerce balances for an account
{{BASE_URL}}/v1/commerce/income/balances?account_id={{ACCOUNT_ID}}&balance_from_date={{BALANCE_FROM_DATE}}&balance_to_date={{BALANCE_TO_DATE}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
account_id
{{ACCOUNT_ID}}
balance_from_date
{{BALANCE_FROM_DATE}}
balance_to_date
{{BALANCE_TO_DATE}}
limit
{{LIMIT}}
offset
{{OFFSET}}
POST
Refresh e-commerce balances for an account
{{BASE_URL}}/v1/commerce/income/balances/refresh
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}"
}
POST
Fetch historic e-commerce balances for an account
{{BASE_URL}}/v1/commerce/income/balances/fetch-historic
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "account_id": "{{ACCOUNT_ID}}",
    "from_date":  "2020-04-01"
}
POST
Retrieve e-commerce balances in bulk
{{BASE_URL}}/v1/commerce/income/balances/search
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "ids": [
        {{ECOMMERCE_BALANCE_ID}}
    ]
}
Webhook
﻿

Authorization
Basic Auth
This folder is using an authorization helper from collection InsighIQ APIs
GET
Retrieve a webhook
{{BASE_URL}}/v1/webhooks/{{WEBHOOK_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
PUT
Update a webhook
{{BASE_URL}}/v1/webhooks/{{WEBHOOK_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "url": "http://0.0.0.0:8000/webhook",
    "events": [
        "PROFILES.ADDED",
        "PROFILES.UPDATED"
    ]
}
DELETE
Delete a webhook
{{BASE_URL}}/v1/webhooks/{{WEBHOOK_ID}}
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
GET
Retrieve all webhooks
{{BASE_URL}}/v1/webhooks
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Query Params
limit
{{LIMIT}}
offset
{{OFFSET}}
POST
Create a webhook
{{BASE_URL}}/v1/webhooks
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
json
{
    "url": "http://0.0.0.0:8000/webhook",
    "events": [
        "PROFILES.ADDED",
        "PROFILES.UPDATED"
    ]
}
POST
Send a mock webhook notification
{{BASE_URL}}/v1/webhooks/send
﻿

Authorization
Basic Auth
This request is using an authorization helper from collection InsighIQ APIs
Body
raw (json)
View More
json
{
    "payload": {
        "event": "PROFILES.ADDED",
        "name": "profile added",
        "data": {
            "account_id": "4544993eac6f4c4a9ec27e23f6cb8c56",
            "user_id": "6bd84fa308f84e66abf108fd3d29f9ef",
            "profile_id": "74e5f67b9df04cbeba0894d749561447",
            "last_updated_time": "2021-11-10 12:59:51.874364"
        }
    }
}
Publisher
InsightIQ
JUMP TO
Introduction
Getting Started
Connect
Identity
Engagement
Income
Webhook
Online
