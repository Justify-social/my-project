# Unresolved Imports

This document lists import statements that could not be automatically resolved during the codebase unification process.
These imports need to be manually reviewed and fixed.

## Files with Unresolved Imports

### src/**tests**/settings/shared/SettingsPageSkeleton.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/admin/layout.tsx

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/admin/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/api/icons/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'fs'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'path'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/api/validate-campaign/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/api-verification/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/database/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/debug-step/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/font-awesome-fixes/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/react-fontawesome'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/fontawesome-svg-core'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/pro-solid-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/pro-light-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/free-brands-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/font-awesome-test/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/test/page.tsx

- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/test-icons/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/test-kpi-icons/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/debug-tools/ui-components/layout.tsx

- `import ... from 'next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(admin)/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(auth)/accept-invitation/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next-auth/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(auth)/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(auth)/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(auth)/subscribe/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/ServerCampaigns.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/[id]/backup/page.original.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/ui/error-fallback'`
  - **Recommendation**: Update import to use the new location after unification or create the missing file
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'recharts'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/features/campaigns/wizard/shared/types'`
  - **Recommendation**: Update import to use the new location after unification or create the missing file

### src/app/(campaigns)/campaigns/[id]/components/ActionPanel.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/router'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/[id]/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/[id]/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/ui/error-fallback'`
  - **Recommendation**: Update import to use the new location after unification or create the missing file
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'recharts'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/features/campaigns/wizard/shared/types'`
  - **Recommendation**: Update import to use the new location after unification or create the missing file

### src/app/(campaigns)/campaigns/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/layout.tsx

- `import ... from '../../../context/WizardContext'`
  - **Recommendation**: May need to create the WizardContext component or update import to use a similar existing component

### src/app/(campaigns)/campaigns/wizard/step-1/ClientPage.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-1/FormContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-1/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-2/ClientPage.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-2/FormContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-2/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-3/ClientPage.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-3/FormContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-3/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-4/ClientPage.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-4/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-5/ClientPage.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/step-5/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/campaigns/wizard/submission/SubmissionContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/ui/error-fallback'`
  - **Recommendation**: Update import to use the new location after unification or create the missing file

### src/app/(campaigns)/campaigns/wizard/submission/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/[id]/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/features/campaigns/influencers/metrics/JustifyScoreDisplay'`
  - **Recommendation**: May need to create the JustifyScoreDisplay component or update import to use a similar existing component

### src/app/(campaigns)/influencer-marketplace/campaigns/[id]/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/campaigns/[id]/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/campaigns/create/content/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uuid'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/campaigns/create/influencers/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/campaigns/create/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/campaigns/create/review/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/campaigns/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/influencer-marketplace/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/features/campaigns/influencers/MarketplaceList'`
  - **Recommendation**: May need to create the MarketplaceList component or update import to use a similar existing component
- `import ... from '@/components/features/campaigns/influencers/AdvancedSearch'`
  - **Recommendation**: May need to create the AdvancedSearch component or update import to use a similar existing component

### src/app/(campaigns)/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(campaigns)/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/brand-lift/list/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/dashboard/DashboardContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/dynamic'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'recharts'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'swr'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'date-fns'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/dashboard/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/dashboard/page.tsx

- `import ... from 'next/dynamic'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/help/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/mmm/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(dashboard)/mmm/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/dynamic'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/features/analytics/mmm/CustomerJourney/SankeyDiagram'`
  - **Recommendation**: May need to create the SankeyDiagram component or update import to use a similar existing component

### src/app/(settings)/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(settings)/loading.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(settings)/pricing/PricingContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(settings)/pricing/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(settings)/pricing/not-found.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(settings)/pricing/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(settings)/settings/layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/(settings)/settings/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/admin/users/[id]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/admin/users/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/admin/users/suspend/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/admin/users/update-role/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/asset-proxy/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/assets/icon/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'fs'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'path'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/assets/orphaned/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/auth/[auth0]/route.ts

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/auth/callback/route.ts

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/auth/check-super-admin/route.ts

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/auth/refresh/route.ts

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/auth/verify-role/route.ts

- `import ... from '@auth0/nextjs-auth0/edge'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/brand-health/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/brand-lift/change-platform/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/brand-lift/report/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/brand-lift/save-draft/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/brand-lift/survey-preview/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/brand-lift/update-asset/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/campaigns/[id]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next-auth/next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/campaigns/[id]/steps/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/campaigns/[id]/submit/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/campaigns/[id]/wizard/[step]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/campaigns/debug/[id]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/campaigns/debug/list/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/campaigns/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uuid'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/checkout/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/create-checkout-session/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'stripe'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/creative-testing/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/debug/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/debug/run-script/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'child_process'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'util'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/docs/[filename]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'fs'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'path'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/health/db/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/icons/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'fs'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'path'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/influencers/marketplace/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/influencers/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/influencers/validate/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/phyllo/create-user/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/phyllo/influencer/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/phyllo/sdk-token/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/search/index-campaigns/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/branding/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uploadthing/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/notifications/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/password/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/profile/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/accept-invitation/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/invitation/[id]/resend/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/invitation/[id]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/member/[id]/role/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/member/[id]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/setup/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/settings/team/verify-invitation/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/stripe/create-checkout-session/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/team/invitations/[id]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/team/invitations/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/team/members/[id]/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/team/members/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/test/transaction/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'crypto'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/test-models/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/uploadthing/core.ts

- `import ... from 'uploadthing/next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uploadthing/next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/uploadthing/delete/route.ts

- `import ... from 'uploadthing/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/uploadthing/diagnostics/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uploadthing/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/uploadthing/route.ts

- `import ... from 'uploadthing/next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/uploadthing/test/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uploadthing/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/user/notifications/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/user/password/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/user/profile/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/user/profile-picture/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uploadthing/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/user/setOnboardingTrue/route.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/webhooks/stripe/route.ts

- `import ... from 'next/headers'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/api/wizard/campaign.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uuid'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/layout.tsx

- `import ... from 'next/font/google'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@uploadthing/react/next-ssr-plugin'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uploadthing/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/app/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/AssetPreview/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/CalendarUpcoming.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ErrorBoundary/ErrorBoundary.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ErrorBoundary.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ErrorFallback/index.ts

- `import ... from '@/components/ui/error-fallback'`
  - **Recommendation**: Update import to use the new location after unification or create the missing file

### src/components/ErrorFallback/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/InfluencerCard.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Influencers/AdvancedSearch/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Influencers/FilterPanel.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Influencers/InfluencerCard.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/features/campaigns/influencers/metrics/JustifyScoreDisplay'`
  - **Recommendation**: May need to create the JustifyScoreDisplay component or update import to use a similar existing component

### src/components/Influencers/MarketplaceList/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Influencers/TransparencyPanel.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Influencers/metrics/JustifyScoreDisplay.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/LayoutContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Navigation/Header.tsx

- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Navigation/MobileMenu.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Navigation/Sidebar.tsx

- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/OnboardingModal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Providers.tsx

- `import ... from 'next-auth/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ReviewSections/AudienceContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ReviewSections/ObjectivesContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/SaveIconTest.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Search/SearchBar.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Search/SearchResults.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/SearchParamsWrapper.tsx

- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AudienceTargeting/AdvancedTargeting.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'formik'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AudienceTargeting/AgeDistributionSlider.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'rc-slider'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AudienceTargeting/CompetitorTracking.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AudienceTargeting/GenderSelection.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AudienceTargeting/LanguagesSelector.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AudienceTargeting/LocationSelector.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AudienceTargeting/ScreeningQuestions.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/AutosaveIndicator.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/Header.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/ProgressBar.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/examples/FormExample.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/Wizard/shared/ErrorBoundary.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/common/OptimizedImage.tsx

- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/analytics/mmm/SankeyDiagram.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/dynamic'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/assets/gif/GifGallery.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/assets/gif/GifModal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/assets/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/assets/upload/AssetPreview.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/assets/upload/CampaignAssetUploader.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@uploadthing/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@uploadthing/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/assets/upload/EnhancedAssetPreview.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'sonner'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/influencers/FilterPanel.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/influencers/InfluencerCard.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/influencers/JustifyScoreDisplay.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/influencers/TransparencyPanel.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/influencers/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/review/AudienceContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/review/ObjectivesContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/AdvancedTargeting.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'formik'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/AgeDistributionSlider.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'rc-slider'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/AutosaveIndicator.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/CampaignWizardContext.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/CompetitorTracking.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/ErrorBoundary.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/FormExample.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/GenderSelection.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/Header.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/LanguagesSelector.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/LocationSelector.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/ProgressBar.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/ScreeningQuestions.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/WizardContext.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'lodash/debounce'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/WizardNavigation.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/shared/StepContentLoader.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/dynamic'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/steps/BasicInfo.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/steps/Step1Content.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'formik'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'yup'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/steps/Step2Content.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'formik'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'yup'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/steps/Step3Content.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'formik'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'yup'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'rc-slider'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/steps/Step4Content.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/campaigns/wizard/steps/Step5Content.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/ui/error-fallback'`
  - **Recommendation**: Update import to use the new location after unification or create the missing file
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/error-handling/ErrorBoundary.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/error-handling/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/loading/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/loading/skeleton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/search/SearchBar.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/search/SearchParamsWrapper.tsx

- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/search/SearchResults.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/core/tests/SaveIconTest.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/dashboard/notifications/NotificationPreferencesSection.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/dashboard/notifications/NotificationPreferencesSection.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/dashboard/reports/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/dashboard/widgets/CalendarUpcoming.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/navigation/Header.tsx

- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/navigation/MobileMenu.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/navigation/Sidebar.tsx

- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/account/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/BrandHealthCard.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/BrandLiftCharts.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-chartjs-2'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/BrandLiftProgressContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/BrandLiftReportContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/dynamic'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/BrandingPage.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/BrandingSkeleton.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/BrandingSkeleton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/ColorPickerField.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/CreativePreview.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/FileUpload.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/FontSelector.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/PlatformSwitcher.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/SelectedCampaignContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/SurveyApprovalContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/SurveyDesignContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/SurveyOptionCard.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/SurveyPreviewContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@headlessui/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/SurveyProgressBar.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/branding/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/AddMemberModal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/DeleteConfirmationModal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@headlessui/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/MembersList.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/MembersListDebug.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/TeamManagementDebug.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/TeamManagementPage.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/TeamManagementSkeleton.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/TeamManagementSkeleton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/TestModal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/settings/team/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/authentication/AuthCheck.tsx

- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/authentication/PasswordManagementSection.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/authentication/PasswordManagementSection.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '../shared/Card'`
  - **Recommendation**: May need to create the Card component or update import to use a similar existing component
- `import ... from '../shared/SectionHeader'`
  - **Recommendation**: May need to create the SectionHeader component or update import to use a similar existing component
- `import ... from '../shared/InputField'`
  - **Recommendation**: May need to create the InputField component or update import to use a similar existing component
- `import ... from '../shared/ActionButtons'`
  - **Recommendation**: May need to create the ActionButtons component or update import to use a similar existing component

### src/components/features/users/onboarding/OnboardingModal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/profile/PersonalInfoSection.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/profile/PersonalInfoSection.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '../shared/Card'`
  - **Recommendation**: May need to create the Card component or update import to use a similar existing component
- `import ... from '../shared/SectionHeader'`
  - **Recommendation**: May need to create the SectionHeader component or update import to use a similar existing component
- `import ... from '../shared/InputField'`
  - **Recommendation**: May need to create the InputField component or update import to use a similar existing component
- `import ... from '../shared/ActionButtons'`
  - **Recommendation**: May need to create the ActionButtons component or update import to use a similar existing component

### src/components/features/users/profile/ProfilePictureSection.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/profile/ProfilePictureSection.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/profile/ProfileSettingsPage.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/profile/ProfileSettingsSkeleton.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/profile/ProfileSettingsSkeleton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/features/users/profile/page.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/gif/GifGallery.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/gif/GifModal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/layout/LayoutContent.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/layout/client-layout.example.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/layout/Header'`
  - **Recommendation**: May need to create the Header component or update import to use a similar existing component
- `import ... from '@/components/layout/Sidebar'`
  - **Recommendation**: May need to create the Sidebar component or update import to use a similar existing component
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/layout/client-layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/layouts/client-layout.example.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@/components/layout/Header'`
  - **Recommendation**: May need to create the Header component or update import to use a similar existing component
- `import ... from '@/components/layout/Sidebar'`
  - **Recommendation**: May need to create the Sidebar component or update import to use a similar existing component
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/layouts/client-layout.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/mmm/CustomerJourney/SankeyDiagram.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/dynamic'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/providers/sidebar-provider.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/ActionButtons.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/Card.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/DebugCard.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/DebugWrapper.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/InputField.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/NavigationTabs.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/link'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/SectionHeader.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/SettingsPageSkeleton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/settings/shared/ToggleSwitch.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/ButtonWithIcon.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/NotificationBell.tsx

- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/alert/Alert.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/alert/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/alert.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/asset-card/asset-card.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/asset-card/asset-preview.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/avatar.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/badge.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/button/ActionButtons.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/button/Button.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/button/IconButton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/button/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/button.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/calendar/calendar-dashboard.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'date-fns'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '../icon'`
  - **Recommendation**: Check if the file structure has changed; may need to update relative path or create missing file

### src/components/ui/calendar.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/card/Card.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/card/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/card.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/cards/upcoming-campaigns-card.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '../icon'`
  - **Recommendation**: Check if the file structure has changed; may need to update relative path or create missing file

### src/components/ui/checkbox/Checkbox.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/checkbox/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/checkbox.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/container.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/core/Typography.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/custom-tabs.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/date-picker/DatePicker.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'date-fns'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/error-boundary.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/examples/ColorPaletteLogosExamples.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/examples.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/feedback/Alert.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/feedback/Badge.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/feedback/NotificationBell.tsx

- `import ... from 'next/image'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/feedback/Toast.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/forms/Checkbox.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/forms/Input.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/forms/Radio.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/forms/Select.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/forms/form-controls.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/grid.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/Icon.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/**tests**/Icon.test.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@testing-library/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/core/SvgIcon.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'classnames'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/core/safe-icon.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'classnames'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/examples/IconExamples.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/examples/IconGrid.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '../types'`
  - **Recommendation**: Check if the file structure has changed; may need to update relative path or create missing file

### src/components/ui/icons/test/IconTester.backup.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/test/IconTester.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '../validation'`
  - **Recommendation**: Check if the file structure has changed; may need to update relative path or create missing file

### src/components/ui/icons/utils/validation.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/icons/variants/IconVariants.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/input/Input.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/input/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/input.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/layout/Card.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/layout/Container.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/layout/Grid.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/layout/Table.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/list.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/loading-skeleton/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/loading-skeleton/skeleton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/loading-skeleton-examples.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/modal/Modal.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-dom'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/modal/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/navigation/CustomTabs.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/navigation/Tabs.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/pagination/Pagination.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/pagination/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/progress.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/radio/Radio.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/radio/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/radio.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/select/Select.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/select/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/select.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/skeleton.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/spinner/index.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/spinner-examples.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/table/Table.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/table/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/table.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/tabs/Tabs.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/tabs/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/tabs.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/toast/Toast.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'uuid'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/toast/types/index.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/toast.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'framer-motion'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/typography.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/ui/utilities/debug-tools.tsx

- `import ... from './toast'`
  - **Recommendation**: Check if the file structure has changed; may need to update relative path or create missing file
- `import ... from './examples'`
  - **Recommendation**: Check if the file structure has changed; may need to update relative path or create missing file

### src/components/ui/utilities/error-boundary.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/upload/AssetPreview.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/upload/CampaignAssetUploader.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@uploadthing/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@uploadthing/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/components/upload/EnhancedAssetPreview.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'sonner'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/context/SearchContext.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/context/SidebarContext.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/contexts/SearchContext.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/contexts/SidebarContext.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/handlers/auth.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/hooks/useCampaignDetails.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/hooks/useCampaignWizard.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/navigation'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/hooks/useErrorRecovery.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/hooks/useFormSubmission.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/hooks/usePermissions.ts

- `import ... from '@auth0/nextjs-auth0/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/algolia.ts

- `import ... from 'react-instantsearch'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/auth.ts

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/db.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/email.ts

- `import ... from '@sendgrid/mail'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/error-logging.ts

- `import ... from '@sentry/nextjs'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/icon-diagnostic.ts

- `import ... from '@fortawesome/fontawesome-svg-core'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/pro-solid-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/pro-light-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/pro-regular-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/pro-duotone-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@fortawesome/free-brands-svg-icons'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/icon-loader.ts

- `import ... from '@fortawesome/fontawesome-svg-core'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/prisma.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/session.ts

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/test-utils/route-testing.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/uploadthing-config.tsx

- `import ... from '@uploadthing/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/uploadthing.ts

- `import ... from 'uploadthing/next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/utils/caching.ts

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/lib/validations/campaign.ts

- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware/api/handleApiErrors.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware/api/index.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware/api/validateApi.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware/api-response-middleware.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware/checkPermissions.ts

- `import ... from '@auth0/nextjs-auth0'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware/handleDbErrors.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware/validateRequest.ts

- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'zod'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/middleware.ts

- `import ... from '@auth0/nextjs-auth0/edge'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next/server'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/providers/SettingsPositionProvider.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/providers/SidebarProvider.tsx

- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/providers/index.tsx

- `import ... from '@tanstack/react-query'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next-themes'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'next-auth/react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/services/brandLiftService.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/services/campaignService.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/types/brandLift.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/types/prisma-extensions.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/types/react-plotly.d.ts

- `import ... from 'plotly.js'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'react'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/date-service.ts

- `import ... from 'date-fns'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/db-monitoring.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/enum-transformers.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/fileUtils.ts

- `import ... from 'react-hot-toast'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/form-adapters.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/form-transformers.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/string/utils.ts

- `import ... from 'clsx'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure
- `import ... from 'tailwind-merge'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/surveyMappers.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

### src/utils/transaction-manager.ts

- `import ... from '@prisma/client'`
  - **Recommendation**: Review this import to determine the correct path in the unified structure

## Next Steps

1. Review each file and fix the imports according to the recommendations
2. Run the final verification script again to confirm all imports are resolved:
   ```bash
   node scripts/directory-structure/phase7/final-verification.js
   ```
3. Update the unification.md document to reflect progress
