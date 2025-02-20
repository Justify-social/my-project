'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Campaign {
  id: number
  campaignName: string
  description: string
  startDate: string
  endDate: string
  timeZone: string
  currency: string
  totalBudget: number
  socialMediaBudget: number
  platform: string
  influencerHandle: string
  submissionStatus: string
  
  // Step 2 data
  mainMessage: string
  hashtags: string
  memorability: string
  keyBenefits: string
  expectedAchievements: string
  purchaseIntent: string
  brandPerception: string
  primaryKPI: string
  secondaryKPIs: string[]
  features: string[]

  // Relations
  primaryContact: {
    firstName: string
    surname: string
    email: string
    position: string
  }
  secondaryContact: {
    firstName: string
    surname: string
    email: string
    position: string
  }
  audience: {
    age1824: number
    age2534: number
    age3544: number
    age4554: number
    age5564: number
    age65plus: number
    otherGender: string
    educationLevel: string
    jobTitles: string
    incomeLevel: string
    locations: { location: string }[]
    genders: { gender: string }[]
    screeningQuestions: { question: string }[]
    languages: { language: string }[]
    competitors: { competitor: string }[]
  }
  creativeAssets: {
    id: number
    type: string
    url: string
    title: string
    description: string
    influencerAssigned: string
    influencerHandle: string
    influencerBudget: number
  }[]
  creativeRequirements: {
    id: number
    requirement: string
  }[]
}

export default function CampaignOverview() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`/api/campaigns/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch campaign')
        const data = await res.json()
        setCampaign(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchCampaign()
    }
  }, [params.id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!campaign) return <div>Campaign not found</div>

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{campaign.campaignName}</h1>
        <Link 
          href={`/campaigns/${campaign.id}/edit`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit Campaign
        </Link>
      </div>

      {/* Campaign Status */}
      <div className="mb-8">
        <span className={`px-3 py-1 rounded-full text-sm ${
          campaign.submissionStatus === 'submitted' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {campaign.submissionStatus.toUpperCase()}
        </span>
      </div>

      {/* Campaign Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Information */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Campaign Information</h2>
          <div className="space-y-3">
            <p><strong>Platform:</strong> {campaign.platform}</p>
            <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
            <p><strong>Time Zone:</strong> {campaign.timeZone}</p>
            <p><strong>Budget:</strong> {campaign.currency} {campaign.totalBudget.toLocaleString()}</p>
            <p><strong>Social Media Budget:</strong> {campaign.currency} {campaign.socialMediaBudget.toLocaleString()}</p>
            <p><strong>Influencer Handle:</strong> {campaign.influencerHandle}</p>
          </div>
        </section>

        {/* Contacts */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Primary Contact</h3>
              <p>{campaign.primaryContact.firstName} {campaign.primaryContact.surname}</p>
              <p>{campaign.primaryContact.email}</p>
              <p>{campaign.primaryContact.position}</p>
            </div>
            <div>
              <h3 className="font-medium">Secondary Contact</h3>
              <p>{campaign.secondaryContact.firstName} {campaign.secondaryContact.surname}</p>
              <p>{campaign.secondaryContact.email}</p>
              <p>{campaign.secondaryContact.position}</p>
            </div>
          </div>
        </section>

        {/* Objectives & KPIs */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Objectives & KPIs</h2>
          <div className="space-y-3">
            <p><strong>Primary KPI:</strong> {campaign.primaryKPI}</p>
            <p><strong>Secondary KPIs:</strong> {campaign.secondaryKPIs.join(', ')}</p>
            <p><strong>Main Message:</strong> {campaign.mainMessage}</p>
            <p><strong>Hashtags:</strong> {campaign.hashtags}</p>
            <p><strong>Key Benefits:</strong> {campaign.keyBenefits}</p>
            <p><strong>Brand Perception:</strong> {campaign.brandPerception}</p>
            <p><strong>Features:</strong> {campaign.features.join(', ')}</p>
          </div>
        </section>

        {/* Audience */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Audience Targeting</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Age Distribution</h3>
              <p>18-24: {campaign.audience.age1824}%</p>
              <p>25-34: {campaign.audience.age2534}%</p>
              <p>35-44: {campaign.audience.age3544}%</p>
              <p>45-54: {campaign.audience.age4554}%</p>
              <p>55-64: {campaign.audience.age5564}%</p>
              <p>65+: {campaign.audience.age65plus}%</p>
            </div>
            <p><strong>Locations:</strong> {campaign.audience.locations.map(l => l.location).join(', ')}</p>
            <p><strong>Genders:</strong> {campaign.audience.genders.map(g => g.gender).join(', ')}</p>
            <p><strong>Languages:</strong> {campaign.audience.languages.map(l => l.language).join(', ')}</p>
            <p><strong>Education Level:</strong> {campaign.audience.educationLevel}</p>
            <p><strong>Job Titles:</strong> {campaign.audience.jobTitles}</p>
            <p><strong>Income Level:</strong> {campaign.audience.incomeLevel}</p>
          </div>
        </section>

        {/* Creative Assets */}
        <section className="bg-gray-50 p-6 rounded-lg col-span-2">
          <h2 className="text-xl font-semibold mb-4">Creative Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.creativeAssets.map(asset => (
              <div key={asset.id} className="border p-4 rounded">
                <h3 className="font-medium">{asset.title}</h3>
                <p><strong>Type:</strong> {asset.type}</p>
                <p><strong>Description:</strong> {asset.description}</p>
                <p><strong>Influencer:</strong> {asset.influencerAssigned}</p>
                <p><strong>Handle:</strong> {asset.influencerHandle}</p>
                <p><strong>Budget:</strong> {campaign.currency} {asset.influencerBudget.toLocaleString()}</p>
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View Asset
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Creative Requirements */}
        <section className="bg-gray-50 p-6 rounded-lg col-span-2">
          <h2 className="text-xl font-semibold mb-4">Creative Requirements</h2>
          <ul className="list-disc pl-5">
            {campaign.creativeRequirements.map(req => (
              <li key={req.id}>{req.requirement}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
} 