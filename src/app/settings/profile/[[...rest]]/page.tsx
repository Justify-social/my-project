'use client';

import React from 'react';
import { UserProfile } from '@clerk/nextjs';

// Basic User Profile Page using Clerk component
const UserProfilePage = () => {
    return (
        // Remove default padding if card provides its own internal padding
        <div className="w-full">
            <UserProfile
                path="/settings/profile" // Ensure path matches the route
                routing="path" // Use path-based routing (default)
                appearance={{
                    elements: {
                        // --- Container & Layout --- 
                        rootBox: 'w-full', // Ensure root takes full width if needed
                        card: 'w-full max-w-none shadow-none border-none bg-transparent', // Remove card look, integrate into layout
                        pageScrollBox: 'py-0 px-1', // Adjust padding for content area
                        navbar: 'border-r border-divider pr-4', // Use divider color
                        navbarButton: 'text-secondary hover:text-primary hover:bg-muted rounded-md font-medium', // Use secondary/primary text, muted bg
                        navbarButtonIcon: 'text-secondary group-hover:text-primary', // Use group-hover if navbarButton is parent

                        // --- Headers --- 
                        headerTitle: "text-primary text-2xl font-bold mb-1", // Use primary text color
                        headerSubtitle: "text-secondary text-sm mb-6", // Use secondary text color

                        // --- Content Sections --- 
                        profileSectionTitleText: "text-lg font-semibold text-primary mb-4 border-b border-divider pb-2", // Primary text, divider border
                        accordionTrigger: 'text-md font-medium text-primary hover:no-underline', // Accordion styles
                        dividerLine: 'border-divider', // Use divider color

                        // --- Form Elements --- 
                        formFieldLabel: "text-sm font-medium text-secondary mb-1 block", // Secondary text
                        formInput: 'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', // Use standard input/ring colors
                        formFieldHintText: 'text-xs text-muted-foreground mt-1', // Hint text style
                        formFieldErrorText: 'text-xs text-destructive mt-1', // Use destructive color
                        formButtonPrimary: "bg-interactive text-primary-foreground hover:bg-interactive/90 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50", // Use interactive color for background, ensure foreground contrast (assuming primary-foreground)
                        formButtonReset: 'text-secondary hover:text-primary text-sm font-medium', // Secondary/primary text
                        select__control: 'border border-divider rounded-md', // Use divider color

                        // --- Specific Components --- 
                        userPreviewMainIdentifier: 'text-primary font-medium', // Primary text
                        userPreviewSecondaryIdentifier: 'text-secondary text-sm', // Secondary text
                        badge: 'bg-muted text-secondary text-xs font-medium px-2 py-0.5 rounded-full', // Muted background, secondary text
                        button__danger: 'text-destructive hover:bg-destructive/10', // Use destructive color

                        // --- Add more element styles as needed ---
                    }
                }}
            >
                {/* Custom sections can still be added here */}
            </UserProfile>
        </div>
    );
};

export default UserProfilePage; 