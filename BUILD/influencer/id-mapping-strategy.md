# InsightIQ Account ID Mapping Strategy

**Purpose:** To define how Justify will manage and map its internal identifiers (e.g., Justify User IDs, Campaign IDs) with the various identifiers provided by InsightIQ (User ID, Account ID, Profile ID) for connected influencer accounts.

**Status:** Planning / Discussion

**Context:**
- InsightIQ provides multiple IDs:
  - `User ID`: Represents the creator entity created via `POST /v1/users`. Associated with `external_id` provided by Justify.
  - `Account ID`: Represents a specific platform connection made by an InsightIQ User (e.g., User X connecting their Instagram).
  - `Profile ID`: Represents the identity data associated with a specific connected Account.
- Justify has its own internal User model (likely linked to Clerk Auth).
- Justify has internal Campaign models.
- We need to link Justify Campaigns to specific influencer platform presences (represented by InsightIQ Profiles/Accounts).

**Key Questions to Address:**

1.  **Primary Linkage:** Which InsightIQ ID should be the primary key stored within Justify's data models (e.g., in a `CampaignInfluencer` table or similar) to represent a selected influencer for a campaign?
    *   *Option A: InsightIQ `Profile ID`?* (Pros: Directly represents the identity/data we display. Cons: Might change if the user reconnects? Unlikely but possible.)
    *   *Option B: InsightIQ `Account ID`?* (Pros: Represents the specific connection instance. Cons: Less directly tied to the display profile data?)
    *   *Option C: InsightIQ `User ID`?* (Pros: Represents the creator across platforms. Cons: Doesn't specify *which* platform account is relevant for a campaign if they connect multiple.)
    *   *Option D: Store Multiple IDs?* (e.g., Store `Profile ID` for display lookup and `Account ID` for potential future actions?) (Pros: Flexibility. Cons: Complexity.)

2.  **Justify User <-> InsightIQ User Mapping:** How do we associate a Justify user (e.g., a Brand Marketer) with the InsightIQ users *they* create via the `/v1/users` endpoint (or potentially via a future influencer-facing connection flow)?
    *   *Requirement:* Likely need to store the Justify user ID who initiated the creation alongside the InsightIQ `User ID` and `external_id` somewhere in the Justify DB.

3.  **Data Model Impact:** What changes are needed to the Justify database schema (Prisma)?
    *   Do we need a dedicated `InsightIQConnection` table linking Justify Users to InsightIQ User/Account/Profile IDs?
    *   How should the `CampaignInfluencer` (or equivalent) table store the selected influencer reference?

4.  **Workflow Impact:** How does this mapping affect:
    *   Adding an influencer to a campaign?
    *   Displaying data for a selected influencer in the Campaign Wizard review step?
    *   Future features like direct messaging or triggering actions via InsightIQ (if APIs exist)?

**Initial Proposal / Recommendation:**

*   **Justify <-> InsightIQ User:** Not strictly required for the *current* MVP (standalone marketplace). However, for future connection flows (influencer portal), we will need a mapping. **Recommendation:** Create a `InsightIQUserMapping` table `(justifyUserId, insightiqUserId, insightiqExternalId)` when implementing the connection flow.

**Final Decision (2025-04-30):**

1.  **Primary Linkage:** To ensure both current display needs and future flexibility/scalability (e.g., refreshing specific connections), Justify will store **both** the **InsightIQ `Profile ID`** and the associated **InsightIQ `Account ID`** when linking an influencer. Example: In a `CampaignInfluencer` table, include `insightiqProfileId` and `insightiqAccountId` columns.
2.  **Data Fetching:** For displaying profile information (MVP), the backend will primarily use the stored `insightiqProfileId` to fetch data via InsightIQ's `GET /v1/profiles/:id` endpoint.
3.  **Justify User Mapping:** Defer implementation of explicit Justify User <-> InsightIQ User mapping until required by features like an influencer portal or direct connection management.
4.  **Data Model Impact (MVP):** No immediate *new tables* required for MVP. Ensure any existing or planned table linking influencers to campaigns (e.g., `CampaignInfluencer`) includes columns for `insightiqProfileId` (String/UUID) and `insightiqAccountId` (String/UUID).

**Next Steps:**
*   **[✔]** Final decision documented here.
*   **[ ] (BE Team)** Ensure relevant Prisma schema includes `insightiqProfileId` and `insightiqAccountId` where influencers are referenced (e.g., in `CampaignInfluencer` model when developed).

*   Document the final decision here.

**Proposed Prisma Schema Modification (Example):**

(Assuming a model exists or will be created to link Campaigns and Influencers)

```prisma
// Example: In your prisma/schema.prisma

model Campaign {
  id            String  @id @default(cuid())
  // ... other campaign fields
  influencers   CampaignInfluencer[]
}

// This model links a Campaign to a specific Influencer selection
model CampaignInfluencer {
  id            String   @id @default(cuid())
  campaignId    String
  campaign      Campaign @relation(fields: [campaignId], references: [id])

  // --- InsightIQ Identifiers ---
  insightiqProfileId String  @unique // The primary ID used for fetching profile data
  insightiqAccountId String? // Optional but recommended for future actions (e.g., refresh)
  // We store the username/handle used for the initial lookup for reference
  lookupIdentifier String  
  workPlatformId   String? // Store the platform UUID for context

  // --- Denormalized Data (Optional - for display in campaign context) ---
  // Store key summary data fetched at the time of adding to avoid constant lookups?
  // Or fetch summaries via GET /api/influencers/summaries when needed?
  // Decision: For MVP, fetch summaries on demand. Add denormalized fields later if performance requires.
  // name      String?
  // handle    String?
  // avatarUrl String?

  // --- Justify Specific Status/Data ---
  status        String   // e.g., 'Invited', 'Negotiating', 'Active', 'Declined'
  addedAt       DateTime @default(now())
  // ... other fields like agreed rate, contract links etc.

  @@index([campaignId])
  @@index([insightiqProfileId])
}

// Optional: Table to map Justify internal users (e.g., brand marketers) to InsightIQ Users 
// they might create via an admin/connection flow (Deferred Post-MVP)
// model InsightIQUserMapping {
//   id                 String @id @default(cuid())
//   justifyUserId      String // FK to your User model
//   insightiqUserId    String @unique // The User ID returned by InsightIQ
//   insightiqExternalId String? // The external_id Justify provided when creating the InsightIQ user
//   createdAt          DateTime @default(now())
// }
```

**Considerations:**
*   The `lookupIdentifier` (likely the `platform_username`) is stored alongside the IDs for traceability, showing what was originally selected/searched.
*   Storing `workPlatformId` provides essential context.
*   Decided against denormalizing summary data into `CampaignInfluencer` for MVP simplicity; summaries will be fetched as needed. 