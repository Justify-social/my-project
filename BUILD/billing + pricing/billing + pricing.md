# Billing & Pricing Module Build Plan

## Overview

This document outlines the implementation plan for the billing and pricing features of our platform, including subscription management, credit system, and payment processing.

## Pricing Tables (Source of Truth)

### Subscription Plans

| Feature               | Pay-As-You-Go             | Essential   | Professional   | Advanced     |
| --------------------- | ------------------------- | ----------- | -------------- | ------------ |
| **Monthly Price**     | £2,499                    | £1,999      | £5,999         | £10,999      |
| **Target Audience**   | Occasional campaign needs | Small teams | Growing brands | Enterprises  |
| **Studies/Month**     | N/A                       | 1           | 3              | 6            |
| **Creative Testing**  | ✅                        | ✅          | ✅             | ✅           |
| **Brand Lift**        | ✅                        | ✅          | ✅             | ✅           |
| **Influencer Safety** | ❌                        | ✅          | ✅             | ✅           |
| **Brand Health**      | ❌                        | ❌          | ✅             | ✅           |
| **MMM Analysis**      | ❌                        | ❌          | ❌             | ✅           |
| **Support Level**     | Email                     | Email       | Email, Phone   | Full Support |

### Credit Packages

| Package      | Credits | Price | Value      |
| ------------ | ------- | ----- | ---------- |
| Basic        | 50      | $10   | Best value |
| Standard     | 100     | $18   | Best value |
| Professional | 250     | $40   | Best value |
| Enterprise   | 500     | $75   | Best value |

### Feature Access by Plan

| Feature                       | Description                           | Pay-As-You-Go | Essential | Professional       | Advanced                |
| ----------------------------- | ------------------------------------- | ------------- | --------- | ------------------ | ----------------------- |
| **Campaign Management**       | Create and manage marketing campaigns | Limited to 1  | Up to 5   | Up to 15           | Unlimited               |
| **Audience Targeting**        | Target specific demographics          | Basic         | Standard  | Advanced           | Premium                 |
| **Analytics Dashboard**       | View campaign performance             | Basic         | Standard  | Advanced           | Premium                 |
| **Export Options**            | Export reports and data               | CSV only      | CSV, PDF  | CSV, PDF, API      | CSV, PDF, API, Raw Data |
| **Custom Branding**           | Remove platform branding              | ❌            | ❌        | ✅                 | ✅                      |
| **API Access**                | Programmatic access to platform       | ❌            | Limited   | Standard           | Full                    |
| **Dedicated Account Manager** | Personal support contact              | ❌            | ❌        | ✅                 | ✅                      |
| **SLA**                       | Service level agreement               | None          | 24 hours  | 12 hours           | 4 hours                 |
| **Onboarding**                | Setup and training                    | Self-serve    | Remote    | Remote + 1 session | On-site                 |

## User Journey & Interface Components

### 1. Subscription Management

- **Subscription Overview Page**
  - Header with "Subscription & Billing" title
  - "View Pricing" and "Update Payment" CTAs
  - Tab navigation between "Subscription Overview" and "Credits & Purchase"
- **Current Plan Section**

  - Display current subscription plan (Premium, Essential, etc.)
  - Next payment information with amount and date
  - List of included features with checkmarks
  - "Change Plan" CTA

- **Payment Methods Section**

  - List of saved payment methods with card details (masked)
  - Expiration dates for each payment method
  - Action buttons for managing payment methods
  - "Add Payment Method" button

- **Billing History Section**
  - Table with columns: Invoice #, Date, Amount, Status, Actions
  - Download invoice functionality
  - Payment status indicators (Pending, Completed)
  - Paginated list of past transactions

### 2. Credits System

- **Credits Balance Display**
  - Available credits counter (e.g., 135)
  - "Buy Credits" CTA
  - Credits usage information

### 3. Pricing Page

- **Plan Selection Interface**

  - Header with "Choose your plan" title
  - Subtitle explaining value proposition
  - Legend for included/not included features

- **Feature Comparison Grid**
  - Creative Testing (included in all plans)
  - Brand Lift (included in all plans)
  - Influencer Safety (not in Pay-As-You-Go)
  - Brand Health (Professional and Advanced only)
  - MMM Analysis (Advanced only)
  - Support tiers (Email → Full Support)
  - "Get started" CTAs for each plan

### 4. Why Choose Us & FAQ Section

- **Value Proposition Cards**

  - Data-Driven Approach
  - Seamless Integration
  - Expert Support

- **FAQ Accordion**
  - Common questions about upgrading, enterprise plans, payment methods
  - Specifically addresses:
    - Plan upgrades and prorating
    - Custom enterprise solutions
    - Accepted payment methods
    - How studies work

## Credit Usage Matrix

| Feature               | Credit Cost |
| --------------------- | ----------- |
| Campaign Creation     | 10 credits  |
| Creative Asset Test   | 25 credits  |
| Brand Lift Study      | 50 credits  |
| Influencer Analysis   | 15 credits  |
| Brand Health Report   | 35 credits  |
| Full Analytics Export | 5 credits   |
| Custom Report         | 20 credits  |

## Technical Implementation

### 1. Backend Requirements

- **Subscription Management Service**

  - Plan creation and management
  - Subscription lifecycle (creation, modification, cancellation)
  - Recurring billing automation
  - Prorated billing calculations

- **Payment Processing**

  - Integration with payment gateway (Stripe recommended)
  - Credit card validation and storage
  - Failed payment handling and retry logic
  - Invoice generation and storage

- **Credits System**
  - Credit balance tracking per account
  - Credit transaction logging
  - Credit usage across features
  - Credit package purchase processing

### 2. Database Schema Updates

- **Subscription Tables**

  - `subscriptions` (id, user_id, plan_id, status, current_period_start, current_period_end)
  - `plans` (id, name, price, billing_interval, features_json)
  - `subscription_items` (id, subscription_id, plan_id, quantity)

- **Payment Tables**

  - `payment_methods` (id, user_id, provider, token, last4, expiry, is_default)
  - `invoices` (id, subscription_id, amount, status, due_date, paid_date)
  - `transactions` (id, user_id, amount, type, status, created_at)

- **Credits Tables**
  - `credit_balances` (user_id, amount, updated_at)
  - `credit_transactions` (id, user_id, amount, type, description, created_at)
  - `credit_packages` (id, name, amount, price, is_active)

### 3. API Endpoints

- **Subscription Endpoints**

  - `GET /api/subscription` - Get current subscription
  - `POST /api/subscription` - Create subscription
  - `PUT /api/subscription` - Update subscription
  - `DELETE /api/subscription` - Cancel subscription

- **Payment Endpoints**

  - `GET /api/payment-methods` - List payment methods
  - `POST /api/payment-methods` - Add payment method
  - `DELETE /api/payment-methods/:id` - Remove payment method
  - `GET /api/invoices` - List invoices

- **Credits Endpoints**
  - `GET /api/credits/balance` - Get credit balance
  - `GET /api/credits/transactions` - List credit transactions
  - `POST /api/credits/purchase` - Purchase credit package

### 4. Frontend Components

- **React Components**

  - SubscriptionOverview.tsx
  - CurrentPlan.tsx
  - PaymentMethodsList.tsx
  - BillingHistory.tsx
  - CreditsBalance.tsx
  - CreditPackages.tsx
  - PricingPlans.tsx
  - PlanFeatureComparison.tsx
  - FAQ.tsx

- **State Management**
  - Subscription context provider
  - Credits context provider
  - Payment methods reducer
  - Invoice list reducer

## Integration Points

- Stripe for payment processing
- Usage tracking system for credit deduction
- Authentication system for user-specific subscription data
- Email service for billing notifications and receipts

## Rollout Plan

1. **Phase 1: Basic Subscription Management**

   - Implement subscription database models
   - Create core subscription management API
   - Build subscription overview UI

2. **Phase 2: Payment Processing**

   - Integrate payment gateway
   - Implement payment method management
   - Create invoice generation and display

3. **Phase 3: Credits System**

   - Implement credits database models
   - Create credits purchase flow
   - Build credit balance and history UI

4. **Phase 4: Pricing Page**

   - Implement pricing plan comparison
   - Build plan selection and checkout flow
   - Create FAQ section with expandable items

5. **Phase 5: Testing & Optimization**
   - End-to-end testing of subscription flows
   - Payment processing error handling
   - Performance optimization
   - Security review

## Key Milestones

- Database schema finalized: [DATE]
- Backend API endpoints complete: [DATE]
- Frontend components built: [DATE]
- Payment gateway integration: [DATE]
- User acceptance testing: [DATE]
- Production deployment: [DATE]
