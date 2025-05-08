# Cint Integration Concepts

**Last Reviewed:** 2025-05-09
**Status:** Placeholder - Needs Content

## Overview

This document explains the conceptual role of Cint within the Justify platform, specifically in the context of the Brand Lift feature. It focuses on _what_ Cint provides and _why_ we integrate with it, separate from the technical implementation details found in [External Integrations](../architecture/external-integrations.md).

## What is Cint?

_(Action: Product Manager/Tech Lead for Brand Lift to provide a clear description of Cint and its core offering, particularly regarding survey panels.)_

- **Example Text:** Cint is a global software leader in digital insights gathering. For Justify, its primary role is providing access to large, diverse panels of online respondents who can participate in our Brand Lift surveys.

## Why We Integrate with Cint (for Brand Lift)

_(Action: Product Manager/Tech Lead to detail the strategic reasons for using Cint for survey distribution.)_

- **Access to Respondents**: Provides efficient access to large numbers of targetable survey respondents globally, which is essential for statistically significant Brand Lift measurement.
- **Audience Targeting**: Allows defining specific demographic and potentially behavioral criteria to target survey participants (control and exposed groups).
- **Panel Management**: Handles respondent recruitment, incentives, and panel quality, abstracting this complexity away from Justify.
- **Scalability**: Enables scaling Brand Lift studies across different campaigns and audience sizes.

## Key Concepts for Brand Lift Surveys via Cint

_(Action: Tech Lead to outline the key concepts relevant to the Cint integration for Brand Lift.)_

- **Survey Panels**: Pre-profiled groups of individuals willing to participate in online surveys.
- **Target Groups**: Defining the specific audience segments within Cint's panels that match the campaign's target audience and control group requirements.
- **Quotas**: Setting the desired number of completes for specific demographic segments within the target groups.
- **Incidence Rate (IR)**: The percentage of panelists who qualify for a survey based on screening questions (impacts feasibility and cost).
- **Length of Interview (LOI)**: Estimated time to complete the survey (impacts respondent engagement and cost).
- **Feasibility**: Cint's assessment of whether the desired number of completes can be achieved within the target group and timeframe.
- **Control vs. Exposed Groups**: The fundamental concept in Brand Lift where one group sees the campaign/ad (exposed) and another doesn't (control), allowing for comparison of survey responses.
- **Respondent Anonymity**: Ensuring respondent privacy is maintained according to Cint's and regulatory standards.

## Conceptual Data Flow

_(Action: Tech Lead to provide a high-level conceptual diagram or description of the data flow related to Cint.)_

- **Example:** Justify user defines study & target audience -> Justify Backend sends survey definition & audience criteria to Cint API -> Cint launches survey to its panel -> Respondents complete survey -> Cint notifies Justify (webhook/poll) -> Justify Backend retrieves anonymized response data from Cint API -> Justify processes responses for reporting.

Understanding these concepts helps clarify how Justify leverages Cint to power its Brand Lift measurement capabilities.
