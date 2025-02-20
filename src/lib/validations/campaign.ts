import { z } from 'zod'

export const campaignSchema = z.object({
  campaignName: z.string().min(1, 'Campaign name is required'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  currency: z.string().min(1, 'Currency is required'),
  totalBudget: z.number().min(0, 'Total budget must be positive'),
  socialMediaBudget: z.number().min(0, 'Social media budget must be positive'),
  platform: z.enum(['Instagram', 'YouTube', 'TikTok']),
  influencerHandle: z.string().optional(),
  
  primaryContact: z.object({
    firstName: z.string().min(1, 'First name is required'),
    surname: z.string().min(1, 'Surname is required'),
    email: z.string().email('Invalid email address'),
    position: z.string().min(1, 'Position is required')
  }),
  
  secondaryContact: z.object({
    firstName: z.string().min(1, 'First name is required'),
    surname: z.string().min(1, 'Surname is required'),
    email: z.string().email('Invalid email address'),
    position: z.string().min(1, 'Position is required')
  }),

  creativeAssets: z.array(z.object({
    id: z.number(),
    type: z.string().min(1, 'Asset type is required'),
    url: z.string().url('Invalid URL'),
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    influencerAssigned: z.string(),
    influencerHandle: z.string(),
    influencerBudget: z.number().min(0)
  })),

  creativeRequirements: z.array(z.object({
    id: z.number(),
    requirement: z.string().min(1, 'Requirement is required')
  }))
})

export type CampaignFormData = z.infer<typeof campaignSchema> 