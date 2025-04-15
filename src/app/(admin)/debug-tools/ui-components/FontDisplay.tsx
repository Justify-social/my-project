'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// Define font families (assuming these are set in globals.css or layout)
const primaryFont = 'var(--font-inter)'; // Example variable name
const secondaryFont = 'var(--font-roboto-mono)'; // Example variable name

export default function FontDisplay() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Font Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Primary Font Section */}
                <section>
                    <h3 className="text-2xl font-semibold mb-4 border-b pb-2" style={{ fontFamily: primaryFont }}>Primary Font (Inter)</h3>
                    <div className="space-y-4">
                        <p style={{ fontFamily: primaryFont }} className="text-4xl font-bold">H1 Bold Heading</p>
                        <p style={{ fontFamily: primaryFont }} className="text-3xl font-semibold">H2 Semibold Heading</p>
                        <p style={{ fontFamily: primaryFont }} className="text-2xl font-medium">H3 Medium Heading</p>
                        <p style={{ fontFamily: primaryFont }} className="text-xl">H4 Regular Heading</p>
                        <p style={{ fontFamily: primaryFont }} className="text-lg">Large Body Text</p>
                        <p style={{ fontFamily: primaryFont }} className="text-base">Default Body Text (Base)</p>
                        <p style={{ fontFamily: primaryFont }} className="text-sm">Small Body Text</p>
                        <p style={{ fontFamily: primaryFont }} className="text-xs">Extra Small Body Text</p>
                    </div>
                </section>

                {/* Secondary Font Section */}
                <section>
                    <h3 className="text-2xl font-semibold mb-4 border-b pb-2" style={{ fontFamily: secondaryFont }}>Secondary Font (Roboto Mono)</h3>
                    <div className="space-y-4">
                        <p style={{ fontFamily: secondaryFont }} className="text-4xl font-bold">H1 Bold Heading</p>
                        <p style={{ fontFamily: secondaryFont }} className="text-3xl font-semibold">H2 Semibold Heading</p>
                        <p style={{ fontFamily: secondaryFont }} className="text-2xl font-medium">H3 Medium Heading</p>
                        <p style={{ fontFamily: secondaryFont }} className="text-xl">H4 Regular Heading</p>
                        <p style={{ fontFamily: secondaryFont }} className="text-lg">Large Body Text</p>
                        <p style={{ fontFamily: secondaryFont }} className="text-base">Default Body Text (Base)</p>
                        <p style={{ fontFamily: secondaryFont }} className="text-sm">Small Body Text</p>
                        <p style={{ fontFamily: secondaryFont }} className="text-xs">Extra Small Body Text</p>
                    </div>
                </section>

            </CardContent>
        </Card>
    );
} 