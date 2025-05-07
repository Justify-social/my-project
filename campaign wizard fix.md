# Campaign Wizard Step 1 Save Debug Notes

---

## 1. The Problem: Saving Step 1 Fails

**Symptom:** User attempts to save progress on Step 1 of the campaign wizard, but the operation fails.

**Client-Side Error:**

```
Error: [ERROR] \"Error creating new campaign draft:\" Error: Failed to create campaign draft: An unexpected error occurred. Our team has been notified.
```

_(Originates from `WizardContext.tsx -> saveProgress` -> `Step1Content.tsx -> handleSave`)_

**Observed Server-Side Error Progression:**

1.  **Initial Error:** `PrismaClientValidationError: Unknown argument \`userId\`. Did you mean \`user\`?`
    - _Root Cause:_ Prisma Client Generation Anomaly for `userId` field.
2.  **Second Error:** `PrismaClientValidationError: Unknown argument \`organizationId\`.`
    - _Root Cause:_ Schema-Code Mismatch - API tried to write non-existent field.
3.  **Current Error:** `PrismaClientKnownRequestError: ... No 'User' record(s) found for a nested connect on ... 'CampaignWizardToUser'. (P2025)`
    - _Context:_ Occurs after fixing #1 & #2, using `user: { connect: { id: userId } }`.

**Attempted Fixes Log:**

- Ran `npx prisma generate` multiple times.
- Restarted the Next.js development server (`npm run dev`).
- Modified `POST /api/campaigns` to use `user: { connect: { id: userId } }` instead of direct `userId`.
- Removed `organizationId` field from `POST /api/campaigns` data payload.

---

## 2. Root Cause Analysis

We identified a sequence of issues:

1.  **Prisma Client Generation Anomaly:**

    - **Finding:** `prisma generate` incorrectly omitted the scalar `userId` field from the generated `CampaignWizardCreateInput` type definition, despite `userId` being present in `schema.prisma`.
    - **Impact:** Forced the use of a relation-based workaround (`user: { connect: ... }`) in the API.

2.  **Schema-Code Mismatch (`organizationId`):**

    - **Finding:** The API code (`POST /api/campaigns`) attempted to write to an `organizationId` field.
    - **Schema:** The `CampaignWizard` model in `schema.prisma` lacks this field.
    - **Impact:** Caused the second `PrismaClientValidationError`.
    - **Resolution:** Confirmed field wasn't needed and removed it from the API payload.

3.  **Incorrect Nested Connect Field (P2025 Error):**
    - **Finding:** The workaround `user: { connect: { id: userId } }` failed because the `userId` variable (containing the Clerk ID `user_...`) was used to connect via the `User` model's primary key (`id`), which is actually a **UUID**.
    - **Schema:** The `User` model uses `id` (UUID) as the primary key and has a separate `clerkId` field.
    - **Current Root Cause:** The immediate P2025 error stems from attempting the nested connect using the wrong target field (`id` instead of `clerkId`) on the `User` model.

**Overarching Issue:** The initial Prisma Client Generation Anomaly (#1) forced a workaround that subsequently failed due to using the incorrect field in the nested connect (#3).

---

## 3. Next Diagnostic Steps

_(Status: Pending user action/confirmation)_

1.  **(HIGHLY RECOMMENDED)** **Verify User Record in DB:** Use Prisma Studio to check the `User` table. Confirm that a record exists where the `clerkId` column matches the Clerk ID of the logged-in user (e.g., `user_2tJOpc5JjRGZYTH9cBzu6jbAC9T`).

2.  **(Potential Fix)** **Modify API Code:** If the user record exists, change the connect logic in `POST /api/campaigns` (`src/app/api/campaigns/route.ts`) to use the correct field:

    ```typescript
    // Change from:
    // user: userId ? { connect: { id: userId } } : undefined,
    // To:
    user: userId ? { connect: { clerkId: userId } } : undefined,
    ```

3.  **Restart & Retest:** Stop and restart the `npm run dev` server, then attempt to save Step 1 again.

---

## 4. Campaign Wizard File Structure

```plaintext
src/
├── app/
│   ├── (campaigns)/
│   │   ├── campaigns/
│   │   │   ├── wizard/
│   │   │   │   ├── layout.tsx         # Layout for all wizard steps
│   │   │   │   │   ├── step-1/
│   │   │   │   │   │   └── page.tsx       # UI for Step 1
│   │   │   │   │   ├── step-2/
│   │   │   │   │   │   └── page.tsx       # UI for Step 2
│   │   │   │   │   ├── step-3/
│   │   │   │   │   │   └── page.tsx       # UI for Step 3
│   │   │   │   │   ├── step-4/
│   │   │   │   │   │   └── page.tsx       # UI for Step 4
│   │   │   │   │   ├── step-5/
│   │   │   │   │   │   └── page.tsx       # UI for Step 5 (or Submission)
│   │   │   │   │   └── submission/
│   │   │   │   │       └── page.tsx       # UI for Submission/Summary
│   │   │   │   └── [campaignId]/          # Detail view for existing campaigns
│   │   │   │       └── page.tsx
│   │   │   └── campaigns/
│   │   │       └── page.tsx             # Main campaign list view
│   │   ├── api/
│   │   │   ├── campaigns/
│   │   │   │   ├── route.ts             # Handles POST (create), PATCH (update), GET (for BrandLift?)
│   │   │   │   └── [campaignId]/
│   │   │   │       ├── route.ts         # Handles GET (single), DELETE, PATCH (single)
│   │   │   │       └── wizard/
│   │   │   │           └── [step]/
│   │   │   │               └── route.ts # Handles saving progress for specific steps (likely PATCH)
│   │   │   ├── list-campaigns/
│   │   │   │   └── route.ts             # New endpoint for campaign list page
│   │   │   └── wizard/ (?)              # Might contain wizard-specific logic
│   │   │       └── campaign.ts (?)      # Possibly unused or legacy?
│   │   └── components/
│   │       └── features/
│   │           └── campaigns/
│   │               ├── WizardContext.tsx    # Context provider for wizard state & logic
│   │               ├── Step1Content.tsx     # Component containing Step 1 form/logic
│   │               ├── Step2Content.tsx     # Component containing Step 2 form/logic
│   │               ├── Step3Content.tsx     # Component containing Step 3 form/logic
│   │               ├── Step4Content.tsx     # Component containing Step 4 form/logic
│   │               ├── SubmissionContent.tsx # Component containing Submission logic/summary
│   │               └── types.ts             # Shared types for campaign feature
│   │   └── ui/
│   │       └── progress-bar-wizard.tsx # UI component for wizard navigation/progress
│   ├── lib/
│   │   ├── data/
│   │   │   ├── campaigns.ts         # Contains getAllCampaignsForUser
│   │   │   └── dashboard.ts         # Contains getUpcomingCampaigns
│   │   └── db.ts / prisma.ts        # Prisma client instance
│   │   └── types/                         # Shared types across app
│   │   └── prisma-extensions.ts (?) # Might contain Prisma extensions
│   └── schema.prisma                      # Prisma schema definition
```

---
