# InsightIQ API Integration Reference for Justify.social


**Purpose:** This document outlines the relevant **InsightIQ** APIs identified for potential use within the Justify.social platform, based on initial discussions and available information. It includes descriptions of the APIs and their potential application to Justify's features.

---

## InsightIQ API Suite & Relevance to Justify.social

This section details the core **InsightIQ** API functionalities (based on previous provider information) and how they can be leveraged for Justify.social features like influencer discovery, vetting, campaign management, and measurement.

### 1. Discovery & Identification

*   **API Functionality:** `Creator Discovery`
    *   **What it Does:** Search for creators by filters like platform, followers, engagement, location, keywords, etc.
    *   **Use for Justify.social:**
        *   Powering the **Influencer Marketplace** search and filtering functionality.
        *   Identifying potential influencers based on initial campaign criteria (geography, niche, platform).
        *   Benchmarking the potential pool of influencers for a specific category.

*   **API Functionality:** `Identity Verification`
    *   **What it Does:** Verifies the creator's platform connection and legitimacy, likely when they connect via an **InsightIQ** SDK/flow.
    *   **Use for Justify.social:**
        *   Providing confidence in data accuracy for creators who connect their accounts.
        *   Flagging verified profiles (`isInsightIQVerified` flag) within the platform.
        *   Ensuring the platform interacts with authentic accounts.

### 2. Profile & Audience Analytics

*   **API Functionality:** `Profile & Audience Analytics`
    *   **What it Does:** Pulls comprehensive profile data including follower counts, growth rates, platform presence, top content, sponsored content details, engagement metrics (avg likes/comments/views), brand associations/affinities, estimated pricing hints, audience demographics (age, gender, location), and follower quality analysis (real/suspicious/influencers).
    *   **Use for Justify.social:**
        *   Populating the detailed **Influencer Profile pages** within the marketplace.
        *   Providing data for the **Justify Score** calculation (engagement quality, audience relevance, performance consistency).
        *   Enabling deeper audience analysis for brand alignment.
        *   Assessing follower authenticity as part of risk/safety evaluation.

*   **API Functionality:** `Content Demographics` (Status Unknown with InsightIQ)
    *   **What it Does (Previously):** Provided demographics of the audience engaging with specific pieces of content.
    *   **Use for Justify.social (Future):**
        *   Verifying audience alignment at the content level, not just profile level.
        *   Potentially refining campaign targeting based on content engagement patterns.

### 3. Content Analysis

*   **API Functionality:** `Content Retrieval (Public)`
    *   **What it Does:** Retrieves historical posts (metadata, media URLs) for a profile or fetches engagement details for a specific content URL.
    *   **Use for Justify.social:**
        *   Populating content examples on the Influencer Profile page.
        *   Providing inputs for **Creative Testing** features (analyzing past content performance).
        *   Potentially used in **Brand Safety** checks (retrieving content for analysis).
        *   Gathering data for post-campaign reporting.

*   **API Functionality:** `Video Intelligence (Visual Analysis)`
    *   **What it Does:** Analyzes video frames for brand presence, objects, themes, or specific content types.
    *   **Use for Justify.social:**
        *   Advanced **Brand Safety:** Detecting visual elements that violate brand guidelines in video content.
        *   **Creative Auditing:** Verifying brand logo placement or specific visual requirements in submitted campaign content.
        *   Potentially analyzing competitor brand presence in influencer videos.

### 4. Engagement & Sentiment

*   **API Functionality:** `Comments Retrieval (Public)`
    *   **What it Does:** Accesses public comments made on specific posts.
    *   **Use for Justify.social:**
        *   Providing raw comment data for manual review or input into custom **Sentiment Analysis** models.
        *   Initial data source for comment-level **Brand Safety** screening (if building custom analysis).

*   **API Functionality:** `Engagement Metrics`
    *   **What it Does:** Captures specific engagement metrics for content (likes, shares, views, comments count, etc.).
    *   **Use for Justify.social:**
        *   Calculating engagement rates displayed on profiles and used in the **Justify Score**.
        *   Comparing creator effectiveness and content performance.
        *   Benchmarking engagement for specific industries or content types.

*   **API Functionality:** `Engagement Relevance + Sentiment Analysis`
    *   **What it Does:** Provides AI-based analysis of comment relevance to the content and the sentiment (positive/negative/neutral) expressed.
    *   **Use for Justify.social:**
        *   Automated **Brand Safety:** Identifying toxic or irrelevant comments quickly.
        *   Measuring audience sentiment towards specific content or campaigns.
        *   Assessing **Creative Effectiveness:** Understanding audience reactions reflected in comments.
        *   *Note:* This may be a premium feature with **InsightIQ**.

*   **API Functionality:** `Comment Analysis + Purchase Intent` (Likely Premium)
    *   **What it Does (Previously):** Built on basic Comments API to provide calculated metrics like sentiment breakdown, purchase intent expression detection, and relevant comments percentage.
    *   **Use for Justify.social:**
        *   More advanced sentiment tracking without building custom models.
        *   Identifying potential sales impact or leads generated from influencer content.
        *   *Note:* Likely a premium **InsightIQ** feature.

### 5. Brand Safety & Vetting

*   **API Functionality:** `Brand Safety / Social Screening`
    *   **What it Does:** Screens profiles and recent content for offensive language, controversial topics, or other customizable risk factors based on text and potentially image/video analysis.
    *   **Use for Justify.social:**
        *   Core component of the **Influencer Safety** feature set.
        *   Generating a risk score or flagging potential issues for brand review before collaboration.
        *   Ensuring influencer alignment with brand values and reducing reputational risk.

### 6. Measurement & Value

*   **API Functionality:** `Income Tracking`
    *   **What it Does:** Tracks creator income streams (likely requires creator connection via an **InsightIQ** SDK/flow).
    *   **Use for Justify.social (Future / Requires Creator Opt-in):**
        *   Potentially informing estimated rate benchmarks.
        *   Understanding influencer monetization strategies.
        *   Contributing to ROI calculations if direct income attribution is possible.

*   **API Functionality:** `Measurement / Attribution`
    *   **What it Does:** Tracks multi-touch engagement paths and helps attribute impact across different interactions (likely requires integration with other analytics).
    *   **Use for Justify.social (Advanced / Future):**
        *   Powering **Brand Lift** measurement features.
        *   Contributing to **Mixed Media Model (MMM)** analysis by quantifying influencer impact within the broader marketing mix.
        *   Requires careful setup and potentially integration with other Justify or client-side tracking.

*   **API Functionality:** `Social Listening`
    *   **What it Does:** Tracks keywords, hashtags, or brand mentions across creator posts (may require specific setup/keywords).
    *   **Use for Justify.social:**
        *   Monitoring campaign-specific hashtags or brand mentions.
        *   Supporting **Brand Health** monitoring by tracking brand conversation volume and context.
        *   Competitor analysis (tracking competitor mentions by relevant influencers).

### 7. Utility / Integration

*   **API Functionality:** `Connection SDK/Flow`
    *   **What it Does:** Secure mechanism (likely a front-end component or flow) allowing creators/users to connect their social media accounts directly to the Justify platform.
    *   **Use for Justify.social:**
        *   **Essential** for enabling any features requiring first-party, permissioned data (e.g., Income Tracking, detailed private analytics if offered to influencers).
        *   Provides the mechanism for identity verification.
        *   Could be used in a future "Influencer Portal" feature.

---

## Appendix: Initial Pricing Discussion (Email Extract - Pre-Rebrand - May Need Verification)

*The following details are based on initial email communication **before the InsightIQ rebrand** and may not reflect current pricing or packaging. Final volumes and costs need confirmation with **InsightIQ**.*

**From Email (Context: Pre-Rebrand):**

> Hi Ed, thanks for sharing the details...
> 
> We're looking for Creator discovery, their metrics which other social media platforms they're on, understanding their relevance to a specific brand, understand which brands they've worked with before and how successful they were, especially with sponsored posts. Understand the Creators value etc. We also want some security features, genuine vs fake followers / comments, have they posted obscene content, abusive comments that may tarnish a brand. Possibly the Linkage API too.

**API Pricing Estimates (from Pre-Rebrand Email):**

*   **Creator Search:** 1M results/year @ $4,000/year
*   **Profile Analytics:** 1000 profiles/month (Rolling Credits) @ $500/month
*   **Public Content:** 1000 calls/month (Rolling Credits) @ $500/month
*   **Public Comment:** 8500 calls/month (Rolling Credits) @ $500/month
*   **Comment Analysis and Purchase Intent (Premium):** 400 posts analysed/month (Rolling) @ $800/month
*   **Brand Safety / Social Screening (Example Pricing - Varies by Platform/Depth):**
    *   *IG/TikTok:* Basic (100 items) $12, Pro (250) $30, Advanced (500) $60
    *   *FB/X/LI:* Basic (100 items) ~$4.14, Pro (250) ~$10.34, Advanced (500) ~$20.68
    *   *Image Only:* Basic (1000 items) ~$1.36, Pro (2500) ~$3.40, Advanced (5000) ~$6.80

**Note:** The Connection SDK/Flow itself is typically free, but usage enables access to APIs that may have costs.

**Action Required:** Confirm current **InsightIQ** pricing, packaging, and credit definitions based on expected usage volumes for Justify.social.

