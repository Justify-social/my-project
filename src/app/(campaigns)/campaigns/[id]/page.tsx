'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Button } from '@/components/ui';
import { Icon } from '@/components/ui/icon/icon';
import Skeleton from '@/components/ui/loading-skeleton';
import ErrorFallback from '@/components/features/core/error-handling/ErrorFallback';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import CardAsset from '@/components/ui/card-asset';

// Define necessary types
interface CampaignData {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    timeZone: string;
    budget: {
        total: number;
        social: number;
        currency: string;
    };
    primaryContact: {
        name: string;
        email: string;
        position: string;
    };
    secondaryContact?: {
        name: string;
        email: string;
        position: string;
    };
    influencers?: Array<{ handle: string; platform: string }>;
    primaryKPI: string;
    secondaryKPIs: string[];
    features: string[];
    mainMessage: string;
    hashtags: string[];
    keyBenefits: string;
    expectedOutcomes: {
        memorability: string;
        purchaseIntent: string;
        brandPerception: string;
    };
    audience: {
        genders: string[];
        ageRange?: string;
        languages: string[];
        interests: string[];
        keywords: string[];
        locations: string[];
        competitors: string[];
    };
    assets: {
        guidelinesSummary: string;
        requirements: Array<{ text: string; mandatory: boolean }>;
        uploaded: Array<{ name: string; url: string }>;
        notes: string;
    };
    contacts?: Array<{ name: string; email: string; position: string; phone?: string }>;
}

// DataItem component for consistent display formatting
const DataItem = ({ label, value, iconId }: { label: string; value: React.ReactNode; iconId?: string }) => (
    <div className="flex items-start py-2">
        {iconId && <Icon iconId={iconId} className="mr-2 mt-1 text-gray-500" />}
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <div className="text-base text-gray-900">{value || '-'}</div>
        </div>
    </div>
);

export default function CampaignDetail() {
    const params = useParams();
    const id = params?.id as string || '';
    const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/campaigns/${id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch campaign data: ${response.status}`);
                }
                const apiResponse = await response.json();
                console.log('Raw API Response:', apiResponse); // Debug log to inspect raw data
                // Extract the nested data object from the API response
                const data = apiResponse.data || apiResponse; // Fallback to apiResponse if data is not nested
                // Transform API data to match our CampaignData interface
                // Temporarily simplify transformation to isolate issues
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid campaign data received from API');
                }

                // Minimal transformation for debugging
                const transformedData: CampaignData = {
                    id: data.id ? data.id.toString() : 'N/A',
                    name: data.name || 'Unnamed Campaign',
                    status: data.status ? data.status.toLowerCase() : 'Unknown',
                    startDate: data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A',
                    endDate: data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A',
                    timeZone: data.timeZone || 'N/A',
                    budget: {
                        total: data.budget?.total || 0,
                        social: data.budget?.socialMedia || 0,
                        currency: data.budget?.currency || 'USD',
                    },
                    primaryContact: {
                        name: data.primaryContact ? `${data.primaryContact.firstName || ''} ${data.primaryContact.surname || ''}`.trim() : 'N/A',
                        email: data.primaryContact?.email || 'N/A',
                        position: data.primaryContact?.position || 'N/A',
                    },
                    secondaryContact: data.secondaryContact ? {
                        name: `${data.secondaryContact.firstName || ''} ${data.secondaryContact.surname || ''}`.trim(),
                        email: data.secondaryContact?.email || 'N/A',
                        position: data.secondaryContact?.position || 'N/A',
                    } : undefined,
                    influencers: data.Influencer && Array.isArray(data.Influencer) ? data.Influencer.map((inf: any) => ({
                        handle: inf.handle || 'N/A',
                        platform: inf.platform || 'N/A'
                    })) : [],
                    primaryKPI: data.primaryKPI || 'Not Set',
                    secondaryKPIs: data.secondaryKPIs && Array.isArray(data.secondaryKPIs) ? data.secondaryKPIs : [],
                    features: data.features && Array.isArray(data.features) ? data.features : [],
                    mainMessage: data.mainMessage || data.messaging?.mainMessage || 'Not Set',
                    hashtags: data.messaging?.hashtags ? data.messaging.hashtags.split(',').filter(Boolean) : [],
                    keyBenefits: data.messaging?.keyBenefits || 'Not Set',
                    expectedOutcomes: {
                        memorability: data.expectedOutcomes?.memorability || 'Not Set',
                        purchaseIntent: data.expectedOutcomes?.purchaseIntent || 'Not Set',
                        brandPerception: data.expectedOutcomes?.brandPerception || 'Not Set',
                    },
                    audience: {
                        genders: data.demographics?.gender && Array.isArray(data.demographics.gender) ? data.demographics.gender : [],
                        ageRange: data.demographics?.ageRange ? (Array.isArray(data.demographics.ageRange) ? data.demographics.ageRange.join('-') : data.demographics.ageRange) : 'Not Set',
                        languages: data.targeting?.languages && Array.isArray(data.targeting.languages) ? data.targeting.languages.map((l: any) => l?.language || 'N/A') : [],
                        interests: data.demographics?.interests && Array.isArray(data.demographics.interests) ? data.demographics.interests : [],
                        keywords: [],
                        locations: data.locations && Array.isArray(data.locations) ? data.locations.map((loc: any) => loc?.location || 'N/A') : [],
                        competitors: data.competitors && Array.isArray(data.competitors) ? data.competitors : [],
                    },
                    assets: {
                        guidelinesSummary: data.guidelines || 'Not Set',
                        requirements: data.requirements && Array.isArray(data.requirements) ? data.requirements.map((req: any) => ({ text: req?.requirement || 'N/A', mandatory: false })) : [],
                        uploaded: data.assets && Array.isArray(data.assets) ? data.assets.map((asset: any) => ({ name: asset?.name || 'Unnamed Asset', url: asset?.url || '#' })) : [],
                        notes: data.notes || 'Not Set',
                    },
                    contacts: [
                        ...(data.primaryContact ? [{
                            name: `${data.primaryContact.firstName || ''} ${data.primaryContact.surname || ''}`.trim() || 'N/A',
                            email: data.primaryContact.email || 'N/A',
                            position: data.primaryContact.position || 'N/A',
                            phone: undefined
                        }] : []),
                        ...(data.secondaryContact ? [{
                            name: `${data.secondaryContact.firstName || ''} ${data.secondaryContact.surname || ''}`.trim() || 'N/A',
                            email: data.secondaryContact.email || 'N/A',
                            position: data.secondaryContact.position || 'N/A',
                            phone: undefined
                        }] : []),
                        ...(data.additionalContacts && Array.isArray(data.additionalContacts) ? data.additionalContacts.map((contact: any) => ({
                            name: `${contact.firstName || ''} ${contact.surname || ''}`.trim() || 'N/A',
                            email: contact.email || 'N/A',
                            position: contact.position || 'N/A',
                            phone: undefined
                        })) : [])
                    ],
                };
                console.log('Transformed Campaign Data:', transformedData); // Debug log to inspect transformed data
                setCampaignData(transformedData);
            } catch (err) {
                console.error('Error fetching campaign data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load campaign details. Please try again later.');
                toast.error('Failed to load campaign details');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCampaignData();
        } else {
            setError('Invalid campaign ID');
            setIsLoading(false);
        }
    }, [id]);

    const getStatusInfo = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'draft':
                return { variant: 'default', text: 'Draft', className: 'badge-draft' };
            case 'pending':
                return { variant: 'secondary', text: 'Pending', className: '' };
            case 'approved':
                return { variant: 'success', text: 'Approved', className: '' };
            case 'active':
                return { variant: 'success', text: 'Active', className: 'badge-active' };
            case 'completed':
                return { variant: 'default', text: 'Completed', className: '' };
            case 'rejected':
                return { variant: 'destructive', text: 'Rejected', className: '' };
            case 'ended':
                return { variant: 'default', text: 'Ended', className: 'badge-ended' };
            default:
                return { variant: 'default', text: status || 'Unknown', className: '' };
        }
    };

    if (isLoading) {
        console.log('Rendering loading state'); // Debug rendering path
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !campaignData) {
        console.log('Rendering error state', { error, campaignDataExists: !!campaignData }); // Debug rendering path
        return (
            <div className="p-6 space-y-6">
                <ErrorFallback error={new Error(error || 'Campaign data not available')} resetErrorBoundary={() => setError(null)} />
            </div>
        );
    }

    console.log('Rendering campaign data', campaignData); // Debug rendering path
    const statusInfo = getStatusInfo(campaignData.status);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto bg-background">
            <div className="flex animate-in">
                <div className="flex flex-row items-center gap-4 flex-1">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{campaignData.name}</h1>
                    <Badge variant={statusInfo.variant as any} className={`px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 ${statusInfo.className || ''}`}>{statusInfo.text}</Badge>
                </div>
                <div className="flex gap-2 items-center">
                    <Link href={`/campaigns/wizard/step-1?id=${id}`}>
                        <Button variant="outline" className="group rounded-lg px-4 py-2 transition-all duration-200 hover:shadow-md">
                            <Icon iconId="faPenToSquareLight" className="mr-2 group-hover:fa-solid" />
                            Edit
                        </Button>
                    </Link>
                    <Button variant="outline" className="group rounded-lg px-4 py-2 transition-all duration-200 hover:shadow-md" onClick={() => toast.success('Duplicate functionality to be implemented')}>
                        <Icon iconId="faCopyLight" className="mr-2 group-hover:fa-solid" />
                        Duplicate
                    </Button>
                    <Button variant="destructive" className="group rounded-lg px-4 py-2 transition-all duration-200 hover:shadow-md" onClick={() => toast.error('Delete functionality to be implemented')}>
                        <Icon iconId="faTrashCanLight" className="mr-2 group-hover:fa-solid" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Basic Information & Contacts Section */}
            <div className="space-y-6 animate-in">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight text-accent">Basic Information & Contacts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Campaign Details</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Core information about the campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <DataItem label="Campaign Name" value={campaignData.name} />
                            <DataItem label="Start/End Date" value={`${campaignData.startDate} - ${campaignData.endDate}`} iconId="faCalendarDaysLight" />
                            <DataItem label="Timezone" value={campaignData.timeZone} iconId="faClockLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Budget</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Financial details of the campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Budget" value={`${campaignData.budget.currency} ${campaignData.budget.total.toLocaleString()} (Social: ${campaignData.budget.social.toLocaleString()})`} iconId="faDollarSignLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Contacts</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Key contacts associated with this campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            {campaignData.contacts && campaignData.contacts.length > 0 ? (
                                campaignData.contacts.map((contact, index) => (
                                    <div key={index} className="border-b border-divider pb-2 last:border-b-0 last:pb-0">
                                        <p className="text-sm font-medium text-primary">{contact.name || 'N/A'}</p>
                                        <p className="text-sm text-secondary">{contact.position || 'N/A'}</p>
                                        {contact.email && <p className="text-sm text-secondary break-words">Email: {contact.email}</p>}
                                        {contact.phone && <p className="text-sm text-secondary">Phone: {contact.phone}</p>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-secondary italic">No contacts available.</p>
                            )}
                        </CardContent>
                    </Card>
                    {campaignData.influencers && campaignData.influencers.length > 0 && (
                        <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                                <CardTitle className="text-lg text-foreground tracking-tight">Influencers</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Influencers associated with the campaign</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">
                                <DataItem label="Influencers" value={
                                    <div className="flex flex-wrap gap-2">
                                        {campaignData.influencers.map((influencer, index) => (
                                            <div key={index} className="p-2 bg-background/80 border border-divider rounded-md transition-all duration-200 hover:bg-background/60">
                                                <p className="font-medium">{influencer.handle}</p>
                                                <p className="text-xs text-muted-foreground">{influencer.platform}</p>
                                            </div>
                                        ))}
                                    </div>
                                } iconId="faUsersLight" />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Objectives & Messaging Section */}
            <div className="space-y-6 animate-in">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight text-accent">Objectives & Messaging</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Key Performance Indicators</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Primary and secondary goals</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <DataItem label="Primary KPI" value={campaignData.primaryKPI} iconId="faChartLineLight" />
                            <DataItem label="Secondary KPIs" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.secondaryKPIs.map((kpi, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{kpi}</Badge>
                                    ))}
                                </div>
                            } />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Messaging</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Core communication elements</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <DataItem label="Main Message" value={campaignData.mainMessage} iconId="faCommentDotsLight" />
                            <DataItem label="Hashtags" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.hashtags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">#{tag}</Badge>
                                    ))}
                                </div>
                            } iconId="faTagLight" />
                            <DataItem label="Key Benefits" value={campaignData.keyBenefits} iconId="faKeyLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Features</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Highlighted campaign features</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Features" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.features.map((feature, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{feature}</Badge>
                                    ))}
                                </div>
                            } iconId="faListLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Expected Outcomes</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Anticipated results of the campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <DataItem label="Memorability" value={campaignData.expectedOutcomes.memorability} iconId="faLightbulbLight" />
                            <DataItem label="Purchase Intent" value={campaignData.expectedOutcomes.purchaseIntent} iconId="faDollarSignLight" />
                            <DataItem label="Brand Perception" value={campaignData.expectedOutcomes.brandPerception} iconId="faBuildingLight" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Audience Targeting Section */}
            <div className="space-y-6 animate-in">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight text-accent">Audience Targeting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Demographics</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Target audience characteristics</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <DataItem label="Genders" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.audience.genders.map((gender, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{gender}</Badge>
                                    ))}
                                </div>
                            } iconId="faUserSolid" />
                            {campaignData.audience.ageRange && (
                                <DataItem label="Age Range" value={campaignData.audience.ageRange} iconId="faUserSolid" />
                            )}
                            <DataItem label="Languages" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.audience.languages.map((lang, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{lang}</Badge>
                                    ))}
                                </div>
                            } iconId="faGlobeLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Interests & Keywords</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Audience interests and search terms</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <DataItem label="Interests" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.audience.interests.map((interest, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{interest}</Badge>
                                    ))}
                                </div>
                            } iconId="faHeartLight" />
                            <DataItem label="Keywords" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.audience.keywords.map((keyword, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{keyword}</Badge>
                                    ))}
                                </div>
                            } iconId="faSearchLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Locations</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Geographic targeting</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Locations" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.audience.locations.map((location, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{location}</Badge>
                                    ))}
                                </div>
                            } iconId="faMapLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Competitors</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Competitive landscape</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Competitors" value={
                                <div className="flex flex-wrap gap-2">
                                    {campaignData.audience.competitors.map((competitor, index) => (
                                        <Badge key={index} variant="outline" className="rounded-md border-divider">{competitor}</Badge>
                                    ))}
                                </div>
                            } iconId="faBuildingLight" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Assets & Guidelines Section */}
            <div className="space-y-6 animate-in">
                <h2 className="text-2xl font-semibold text-foreground tracking-tight text-accent">Assets & Guidelines</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Brand Guidelines</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Summary of brand standards</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Brand Guidelines Summary" value={campaignData.assets.guidelinesSummary} iconId="faFileLinesLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Requirements</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Campaign content requirements</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Requirements" value={
                                <ul className="list-disc pl-5 space-y-1">
                                    {campaignData.assets.requirements.map((req, index) => (
                                        <li key={index} className={req.mandatory ? 'text-destructive' : ''}>
                                            {req.text} {req.mandatory && <span className="text-xs">(Mandatory)</span>}
                                        </li>
                                    ))}
                                </ul>
                            } iconId="faListLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg md:col-span-2">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Uploaded Assets</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Creative materials for the campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Uploaded Assets" value={
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                    {campaignData.assets.uploaded.length > 0 ? (
                                        campaignData.assets.uploaded.map((asset, index) => (
                                            <CardAsset
                                                key={index}
                                                title={asset.name}
                                                href={asset.url}
                                                thumbnailUrl={asset.url.includes('.jpg') || asset.url.includes('.png') || asset.url.includes('.jpeg') ? asset.url : undefined}
                                                fileType={asset.url.split('.').pop()?.toUpperCase() || 'FILE'}
                                                className="transition-all duration-300 hover:shadow-md hover:scale-102 rounded-xl overflow-hidden"
                                            />
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground italic">No assets uploaded</p>
                                    )}
                                </div>
                            } iconId="faImageLight" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border border-divider rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg md:col-span-2">
                        <CardHeader className="border-b border-divider pb-3 bg-background/50 backdrop-blur-sm">
                            <CardTitle className="text-lg text-foreground tracking-tight">Additional Notes</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Extra information or instructions</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <DataItem label="Additional Notes" value={campaignData.assets.notes} iconId="faPaperclipLight" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 