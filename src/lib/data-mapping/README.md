# Campaign Data Persistence Solution

This directory contains the implementation of the data persistence solution for the Campaign Wizard. The solution addresses the data gaps identified in campaign data, particularly for Campaign ID 13, by providing a robust, schema-aware approach to data handling.

## Components

### 1. Schema Mapping (`schema-mapping.ts`)

Maps form data to database schema structures, ensuring data consistency across the application. This component:

- Defines TypeScript interfaces for form data structures
- Provides mapping functions to transform form data to database schema
- Handles relationships between campaign data and related entities (audience, assets, etc.)
- Supports transaction-based updates to maintain data integrity

### 2. Validation (`validation.ts`)

Validates campaign data against schema requirements before saving to the database. This component:

- Defines validation rules for each data type
- Provides specific error messages for validation failures
- Supports both individual field validation and full campaign validation
- Integrates with the logging system to track validation issues

### 3. Database Logger (`db-logger.ts`)

Provides structured logging for database operations with a focus on data persistence. This component:

- Logs all database operations (create, read, update, delete)
- Sanitizes sensitive data before logging
- Supports different log levels (debug, info, warn, error)
- Enables tracking of operations by campaign ID

### 4. Campaign Service (`campaign-service.ts`)

A unified service to handle all campaign-related operations with proper validation and data mapping. This component:

- Provides a consistent API for campaign operations
- Handles error cases and provides meaningful error messages
- Integrates validation before database operations
- Supports both full campaign updates and step-specific updates

## API Routes

### Wizard Step API (`/api/campaigns/[id]/wizard/[step]/route.ts`)

Handles step-specific data for the Campaign Wizard, including:

- Step-specific validation
- Autosave functionality
- Data retrieval for each step
- Proper error handling and response formatting

## React Integration

### Campaign Wizard Hook (`useCampaignWizard.ts`)

A React hook that provides a complete interface for the Campaign Wizard, including:

- Form state management for each step
- Autosave functionality
- Navigation between steps
- Loading and error states
- Data submission and validation

### Campaign Wizard Context (`CampaignWizardContext.tsx`)

A React context provider that makes the Campaign Wizard hook available throughout the application:

- Provides a consistent API for all wizard components
- Manages shared state across components
- Simplifies component implementation

## UI Components

### Autosave Indicator (`AutosaveIndicator.tsx`)

Displays the current autosave status to the user:

- Shows when data is being saved
- Indicates when there are unsaved changes
- Displays the time of the last successful save

### Wizard Navigation (`WizardNavigation.tsx`)

Provides navigation controls for the wizard:

- Step indicators and progress bar
- Next/Previous buttons
- Save as Draft functionality
- Submit Campaign button

## Usage

To use the data persistence solution in a component:

```tsx
import { useCampaignWizardContext } from '@/contexts/CampaignWizardContext';

function MyWizardComponent() {
  const {
    currentStep,
    overviewData,
    updateFormData,
    saveStepData,
    isLoading,
    isDirty
  } = useCampaignWizardContext();

  // Update form data
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  // Save data manually
  const handleSave = async () => {
    await saveStepData(currentStep);
  };

  return (
    <div>
      {/* Component implementation */}
    </div>
  );
}
```

## Benefits

This solution provides several key benefits:

1. **Data Integrity**: Ensures all required data is properly validated and saved
2. **User Experience**: Provides autosave functionality to prevent data loss
3. **Developer Experience**: Offers a clear, consistent API for working with campaign data
4. **Maintainability**: Separates concerns into modular components
5. **Scalability**: Designed to handle growing data requirements
6. **Debugging**: Comprehensive logging for troubleshooting data issues

## Future Enhancements

Planned enhancements to the data persistence solution:

1. **Offline Support**: Add offline data persistence with synchronization
2. **Conflict Resolution**: Implement strategies for handling concurrent edits
3. **Performance Optimization**: Add caching for frequently accessed data
4. **Analytics Integration**: Track user behavior and form completion rates
5. **Data Migration**: Support for migrating data between schema versions 