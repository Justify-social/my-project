'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function FontDisplay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Font Styles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Primary Font Section - Inter for Body Text */}
        <section>
          <h3
            className="text-2xl font-semibold mb-4 border-b pb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Primary Font (Inter)
          </h3>
          <div className="space-y-4">
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }} className="text-4xl">
              H1 Bold Heading
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }} className="text-3xl">
              H2 Semibold Heading
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }} className="text-2xl">
              H3 Medium Heading
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }} className="text-xl">
              H4 Regular Heading
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }} className="text-lg">
              Large Body Text
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }} className="text-base">
              Default Body Text (Base)
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }} className="text-sm">
              Small Body Text
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }} className="text-xs">
              Extra Small Body Text
            </p>
          </div>
        </section>

        {/* Secondary Font Section - Sora for Headings and Buttons */}
        <section>
          <h3
            className="text-2xl font-semibold mb-4 border-b pb-2"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Secondary Font (Sora)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Used for headings (h1, h2, h3) and buttons
          </p>
          <div className="space-y-4">
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }} className="text-4xl">
              H1 Bold Heading
            </h1>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }} className="text-3xl">
              H2 Bold Heading
            </h2>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }} className="text-2xl">
              H3 Bold Heading
            </h3>
            <div className="space-y-3">
              <p className="text-base font-medium text-muted-foreground">Button Examples:</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  style={{ fontFamily: 'Sora, sans-serif' }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
                >
                  Primary Button
                </button>
                <button
                  style={{ fontFamily: 'Sora, sans-serif' }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium"
                >
                  Secondary Button
                </button>
                <button
                  style={{ fontFamily: 'Sora, sans-serif' }}
                  className="px-4 py-2 border border-border rounded-md font-medium"
                >
                  Outline Button
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Third Font Section - Work Sans for Branding/Marketing */}
        <section>
          <h3
            className="text-2xl font-semibold mb-4 border-b pb-2"
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            Third Font (Work Sans)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            For branding and marketing materials - not suitable for app UI
          </p>
          <div className="space-y-4">
            <p
              style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 700 }}
              className="text-4xl"
            >
              Marketing Headline Bold
            </p>
            <p
              style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 600 }}
              className="text-3xl"
            >
              Brand Communication Semibold
            </p>
            <p
              style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}
              className="text-2xl"
            >
              Marketing Content Medium
            </p>
            <p style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400 }} className="text-lg">
              External-facing content and promotional materials
            </p>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
              <p className="text-sm text-amber-700">
                <span className="font-semibold">⚠️ Important:</span> Work Sans should NOT be used in
                the app interface. It's reserved for external branding, marketing materials, and
                promotional content only.
              </p>
            </div>
          </div>
        </section>

        {/* Font Hierarchy Summary */}
        <section>
          <h3
            className="text-2xl font-semibold mb-4 border-b pb-2"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Font Hierarchy (SSOT)
          </h3>
          <div className="bg-muted p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Inter:</span> Body text, navigation, sidebar, all
                general content
              </p>
              <p>
                <span className="font-semibold">Sora:</span> Headings (h1, h2, h3) and buttons only
              </p>
              <p>
                <span className="font-semibold">Work Sans:</span> External branding/marketing only
                (NOT for app UI)
              </p>
              <p>
                <span className="font-semibold">Weights Available:</span>
              </p>
              <ul className="ml-4 space-y-1 text-xs text-muted-foreground">
                <li>• Inter: 300, 400, 500, 600, 700, 800, 900</li>
                <li>• Sora: 400, 700</li>
                <li>• Work Sans: 400, 500, 600, 700 (branding only)</li>
              </ul>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
