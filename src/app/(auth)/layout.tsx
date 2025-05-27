'use client';

import React from 'react';
import { Suspense } from 'react';
import { Icon } from '@/components/ui/icon/icon';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-first responsive layout */}
      <div className="lg:hidden">
        {/* Mobile layout - single column with proper spacing */}
        <div className="min-h-screen p-6 flex flex-col">
          {/* Mobile Logo - properly spaced */}
          <div className="flex-shrink-0 pb-8 pt-4">
            <div className="text-center">
              <h1 className="font-sora font-bold text-slate-900 mb-2 text-2xl">Justify</h1>
              <div className="h-0.5 bg-[#00BFFF] rounded-full mx-auto mb-2 w-12"></div>
              <p className="font-inter text-slate-600 text-sm">Justify your social spend</p>
            </div>
          </div>

          {/* Mobile Auth Content - centered but with proper spacing */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm mx-auto">
              <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>
            </div>
          </div>

          {/* Mobile Security Footer - compact */}
          <div className="flex-shrink-0 pt-8">
            <div className="text-center">
              <p className="font-inter font-medium mb-4 text-slate-500 text-sm">
                Enterprise-grade security by{' '}
                <span className="font-semibold text-slate-700">Clerk</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center space-x-1.5 bg-[#00BFFF]/5 border border-[#00BFFF]/20 rounded-md px-3 py-1.5">
                  <Icon iconId="faShieldLight" className="w-3 h-3 text-[#00BFFF]" />
                  <span className="font-inter font-medium text-[#00BFFF] text-xs">SSL</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-100/60 border border-slate-200/60 rounded-md px-3 py-1.5">
                  <Icon iconId="faLockLight" className="w-3 h-3 text-slate-500" />
                  <span className="font-inter font-medium text-slate-600 text-xs">SOC 2</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-100/60 border border-slate-200/60 rounded-md px-3 py-1.5">
                  <Icon iconId="faCircleCheckLight" className="w-3 h-3 text-slate-500" />
                  <span className="font-inter font-medium text-slate-600 text-xs">GDPR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout - original two-column design */}
      <div className="hidden lg:block">
        <div className="h-screen grid lg:grid-cols-[3fr_2fr] bg-white overflow-hidden">
          {/* Left Panel - 10/10 Professional Brand Showcase */}
          <div className="relative bg-gradient-to-br from-slate-50/80 to-slate-100/50">
            {/* Subtle, elegant background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-slate-50/70"></div>

            {/* Content with perfect vertical centering and coordinated layout */}
            <div className="relative z-10 h-full grid grid-rows-[1fr_auto_1fr] max-w-lg mx-auto px-8 xl:px-12">
              {/* Top Spacer - Brand positioning to align with right panel */}
              <div className="flex items-end pb-8">
                <div className="w-full">
                  {/* Brand name positioned to align with "Welcome back" on right */}
                  <div className="text-left">
                    <h1 className="font-sora font-bold text-slate-900 mb-3 text-3xl xl:text-4xl tracking-tight">
                      Justify
                    </h1>
                    <div className="h-0.5 bg-[#00BFFF] rounded-full mb-3 w-16"></div>
                    <p className="font-inter font-medium text-slate-500 text-sm">
                      Justify your social spend
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content - Authentic Value Props */}
              <div className="flex flex-col justify-center">
                <div>
                  <h2 className="font-sora font-semibold text-slate-900 mb-4 text-xl xl:text-2xl leading-tight">
                    Measure campaign impact.
                    <br />
                    Find authentic influencers.
                  </h2>
                  <p className="font-inter text-slate-600 mb-8 text-sm leading-relaxed max-w-md">
                    Track real brand lift and influencer performance across social platforms. No
                    vanity metrics, just actionable insights.
                  </p>

                  {/* Core Features - Clean and Simple */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-[#00BFFF]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon iconId="faChartLineLight" className="w-4 h-4 text-[#00BFFF]" />
                      </div>
                      <div>
                        <h3 className="font-inter font-medium text-slate-800 text-sm mb-1">
                          Campaign Attribution
                        </h3>
                        <p className="font-inter text-slate-600 text-xs leading-relaxed">
                          Scientific measurement of true campaign impact across channels
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-[#00BFFF]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon iconId="faUsersLight" className="w-4 h-4 text-[#00BFFF]" />
                      </div>
                      <div>
                        <h3 className="font-inter font-medium text-slate-800 text-sm mb-1">
                          Authentic Influencers
                        </h3>
                        <p className="font-inter text-slate-600 text-xs leading-relaxed">
                          Verified creators with genuine engagement and brand alignment
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Real Testimonial - No BS */}
                  <div className="bg-slate-50/60 rounded-lg p-4 border border-slate-200/60">
                    <p className="font-inter text-slate-700 text-sm italic mb-3 leading-relaxed">
                      "Finally, a platform that shows real campaign impact, not just vanity
                      metrics."
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-inter font-medium text-slate-600 text-xs">
                          Marketing Director
                        </p>
                        <p className="font-inter text-slate-500 text-xs">Fortune 500 Brand</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Spacer with Platform Integration */}
              <div className="flex items-start pt-8">
                <div className="w-full">
                  <div className="bg-slate-50/40 rounded-lg p-3 border border-slate-200/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-inter font-medium text-slate-500">
                        Supported Platforms
                      </span>
                      <div className="flex items-center space-x-3 text-slate-400 font-inter">
                        <span>Instagram</span>
                        <span>TikTok</span>
                        <span>YouTube</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Clean Authentication with unified centering */}
          <div className="bg-gradient-to-br from-white to-slate-50/20 border-l border-slate-200/60 overflow-hidden relative">
            <div className="h-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-4 xl:p-6">
              {/* Unified Authentication Container - Fixed Maximum Width */}
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-sm xl:max-w-sm 2xl:max-w-sm space-y-3 sm:space-y-4 lg:space-y-3 xl:space-y-4">
                <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>

                {/* Security Footer - Directly underneath Clerk login */}
                <div className="text-center pt-1.5 sm:pt-2 lg:pt-2 xl:pt-3">
                  <p className="font-inter font-medium mb-2 sm:mb-2.5 lg:mb-2.5 xl:mb-3 text-slate-500 text-xs sm:text-sm">
                    Enterprise-grade security by{' '}
                    <span className="font-semibold text-slate-700">Clerk</span>
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    <div className="flex items-center space-x-1.5 bg-[#00BFFF]/5 border border-[#00BFFF]/20 rounded-md px-3 py-1.5">
                      <Icon iconId="faShieldLight" className="w-3 h-3 text-[#00BFFF]" />
                      <span className="font-inter font-medium text-[#00BFFF] text-xs">SSL</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-100/60 border border-slate-200/60 rounded-md px-3 py-1.5">
                      <Icon iconId="faLockLight" className="w-3 h-3 text-slate-500" />
                      <span className="font-inter font-medium text-slate-600 text-xs">SOC 2</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-100/60 border border-slate-200/60 rounded-md px-3 py-1.5">
                      <Icon iconId="faCircleCheckLight" className="w-3 h-3 text-slate-500" />
                      <span className="font-inter font-medium text-slate-600 text-xs">GDPR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
