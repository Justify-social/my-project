'use client';

import React from 'react';
import { Suspense } from 'react';
import { Icon } from '@/components/ui/icon';
// Import LoadingSkeleton
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

// Updated benefits with more concise descriptions
const benefits = [
  {
    title: 'Audience Insights',
    description: 'Connect with influencers aligned with your brand audience.',
    icon: 'faBullseyeLight'
  },
  {
    title: 'Brand Measurement',
    description: 'Track campaigns with real-time ROI dashboards.',
    icon: 'faChartLineLight'
  },
  {
    title: 'Safety Tools',
    description: 'Ensure partnerships meet brand safety standards.',
    icon: 'faShieldLight'
  },
];

// Testimonial with shorter quote
const testimonial = {
  quote: "Justify increased our engagement by 230% while cutting campaign time in half.",
  author: "Sarah Chen",
  role: "Marketing Director, GlowBrand",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Left Column - Streamlined Benefits & Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-6 relative bg-[#FAFBFC]">
        {/* Accent color strip */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00BFFF] via-[#00BFFF]/80 to-[#00BFFF]/50"></div>

        {/* Very subtle pattern overlay */}
        <div className="absolute inset-0 w-full h-full opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300BFFF' fill-opacity='0.7' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative z-10 flex flex-col h-full w-full justify-center max-w-lg mx-auto">
          {/* Brand logo with refined accent */}
          <div className="text-4xl font-bold tracking-tighter">
            <span className="text-[#333333]">Justify</span>
            <div className="h-[2px] w-16 bg-gradient-to-r from-[#00BFFF] to-transparent rounded-full mt-1.5"></div>
          </div>

          {/* Hero section with improved typography */}
          <h2 className="text-2xl font-bold mt-4 leading-tight text-[#333333]">
            Simplify Your
            <span className="text-[#4A5568]"> Market Research &</span>
            <span className="text-[#4A5568]"> Influencer Strategy</span>
          </h2>

          <p className="text-[#4A5568] text-base mt-2 font-medium leading-snug">
            Connect with creators who genuinely represent your brand and deliver measurable results.
          </p>

          {/* Benefits section - horizontal cards with refined design */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-start p-3 bg-white rounded-lg shadow-sm border border-[#D1D5DB]/60 transition-all duration-300 hover:shadow-md hover:border-[#00BFFF]/40 group">
                <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-[#00BFFF]/5 to-[#00BFFF]/10 rounded-full flex items-center justify-center mb-2">
                  <Icon iconId={benefit.icon} className="h-4 w-4 text-[#00BFFF]" />
                </div>
                <h3 className="font-bold text-[#333333] text-sm">{benefit.title}</h3>
                <p className="text-[#4A5568] text-xs mt-1 leading-tight">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Combined testimonial and stats section */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {/* Testimonial section */}
            <div className="col-span-2 p-3 bg-[#F3F4F6] rounded-lg border border-[#D1D5DB]/80 relative shadow-sm">
              <p className="italic text-[#4A5568] text-xs mb-2 leading-tight">{testimonial.quote}</p>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-7 w-7 bg-gradient-to-br from-[#00BFFF] to-[#00BFFF]/70 text-white rounded-full flex items-center justify-center mr-2 shadow-sm">
                  <span className="font-bold text-xs">{testimonial.author.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-[#333333] text-xs">{testimonial.author}</p>
                  <p className="text-[#4A5568] text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>

            {/* Stats section */}
            <div className="col-span-1 p-3 bg-white rounded-lg border border-[#D1D5DB]/60 flex flex-col justify-between items-center">
              <div className="text-center">
                <div className="text-[#00BFFF] text-xl font-bold">230%</div>
                <div className="text-[#4A5568] text-[10px] font-medium tracking-wide">HIGHER ENGAGEMENT</div>
              </div>
              <div className="w-full h-px bg-[#D1D5DB]/40 my-1"></div>
              <div className="text-center">
                <div className="text-[#00BFFF] text-xl font-bold">50%</div>
                <div className="text-[#4A5568] text-[10px] font-medium tracking-wide">FASTER MANAGEMENT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6">
        <Suspense fallback={<LoadingSkeleton />}>
          {/* The Clerk component (SignIn/SignUp) will be rendered here */}
          {children}
        </Suspense>
      </div>
    </div>
  );
}
