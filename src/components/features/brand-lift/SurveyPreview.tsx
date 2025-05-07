'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from '@/components/ui/icon';
import { SurveyQuestionData, SurveyOptionData } from '@/types/brand-lift'; // Assuming type definitions
import logger from '@/lib/logger';

interface SurveyPreviewProps {
    studyId: string;
}

type PlatformView = 'TikTok' | 'Instagram' | 'Desktop' | 'Generic';

const SurveyPreview: React.FC<SurveyPreviewProps> = ({ studyId }) => {
    const [questions, setQuestions] = useState<SurveyQuestionData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPlatform, setCurrentPlatform] = useState<PlatformView>('Generic');
    const [studyName, setStudyName] = useState<string>('Brand Lift Study'); // Placeholder

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // First, fetch study details to get the name
            const studyRes = await fetch(`/api/brand-lift/surveys/${studyId}`);
            if (!studyRes.ok) {
                const errorData = await studyRes.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch study details for preview');
            }
            const studyData = await studyRes.json();
            setStudyName(studyData.name || 'Brand Lift Study');

            // Then, fetch questions
            const questionsRes = await fetch(`/api/brand-lift/surveys/${studyId}/questions`);
            if (!questionsRes.ok) {
                const errorData = await questionsRes.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch survey questions for preview');
            }
            const fetchedQuestions: SurveyQuestionData[] = await questionsRes.json();
            setQuestions(fetchedQuestions.sort((a, b) => a.order - b.order));
        } catch (err: any) {
            logger.error('Error fetching data for SurveyPreview:', { studyId, error: err.message });
            setError(err.message || 'Failed to load survey data.');
        }
        setIsLoading(false);
    }, [studyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderOptions = (options: SurveyOptionData[]) => {
        // Simple radio button style for single choice, checkboxes for multiple (conceptual)
        return (
            <div className="space-y-2 mt-2 pl-4">
                {options.sort((a, b) => a.order - b.order).map(opt => (
                    <div key={opt.id || opt.tempId} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                        <input type={questions.find(q => q.options.some(o => (o.id || o.tempId) === (opt.id || opt.tempId)))?.questionType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'} name={`q-${opt.questionId}`} id={`opt-${opt.id || opt.tempId}`} className="form-radio h-4 w-4 text-primary focus:ring-primary-focus" disabled />
                        <label htmlFor={`opt-${opt.id || opt.tempId}`} className="text-sm text-gray-700">
                            {opt.text}
                            {opt.imageUrl && <img src={opt.imageUrl} alt={opt.text} className="ml-2 h-10 w-10 object-contain inline-block" />}
                        </label>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
                <AlertTitle>Error Loading Survey Preview</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    // Platform specific styling would go here based on `currentPlatform`
    // For MVP, a generic clean preview is sufficient.
    // Example of TikTok-like preview from @Survey Approval Screen.png:
    // - Phone mockup frame
    // - Video/Image creative at the top
    // - Question text overlaid or below creative
    // - Options as interactive elements

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>{studyName} - Preview</CardTitle>
                <div className="flex space-x-2 mt-2 border-b pb-2">
                    {(['Generic', 'TikTok', 'Instagram', 'Desktop'] as PlatformView[]).map(platform => (
                        <Button
                            key={platform}
                            variant={currentPlatform === platform ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPlatform(platform)}
                        >
                            {platform}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className={`p-4 ${currentPlatform === 'TikTok' ? 'bg-black text-white rounded-lg max-w-sm mx-auto p-2 aspect-[9/19.5] flex flex-col' : ''}`}>
                {currentPlatform === 'TikTok' && (
                    <div className="flex-grow overflow-y-auto no-scrollbar p-2">
                        {/* Simulate TikTok creative area */}
                        <div className="bg-gray-700 h-64 w-full mb-3 rounded flex items-center justify-center text-gray-400">
                            [Creative Placeholder]
                        </div>
                        {questions.map((q, index) => (
                            <div key={q.id || `q-prev-${index}`} className="mb-4 p-2 bg-gray-800 rounded">
                                <p className="text-sm font-semibold mb-1">{q.text}</p>
                                {renderOptions(q.options)}
                            </div>
                        ))}
                    </div>
                )}
                {currentPlatform !== 'TikTok' && (
                    <div className="space-y-6">
                        {questions.length === 0 && <p className="text-muted-foreground">No questions found for this survey.</p>}
                        {questions.map((q, index) => (
                            <Card key={q.id || `q-prev-${index}`} className="bg-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-md">Question {index + 1}</CardTitle>
                                    <CardDescription>{q.text}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderOptions(q.options)}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SurveyPreview;
