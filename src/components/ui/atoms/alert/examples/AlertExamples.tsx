import React from 'react';
import { Alert } from '../Alert';

/**
 * Examples of the Alert component
 * This file demonstrates the various ways to use the Alert component
 */
export const AlertExamples = () => {
  return (
    <div className="space-y-4">
      {/* Default alert */}
      <div>
        <h3 className="text-sm font-medium mb-2">Default Alert</h3>
        <Alert>This is a default alert message.</Alert>
      </div>

      {/* Alert variants */}
      <div>
        <h3 className="text-sm font-medium mb-2">Alert Variants</h3>
        <div className="space-y-2">
          <Alert variant="default">This is a default alert message.</Alert>
          <Alert variant="info">This is an informational alert.</Alert>
          <Alert variant="success">This is a success alert.</Alert>
          <Alert variant="warning">This is a warning alert.</Alert>
          <Alert variant="destructive">This is a destructive/error alert.</Alert>
        </div>
      </div>

      {/* Alert with title */}
      <div>
        <h3 className="text-sm font-medium mb-2">Alert with Title</h3>
        <div className="space-y-2">
          <Alert title="Default Alert">This is a default alert with a title.</Alert>
          <Alert variant="info" title="Information">This is an info alert with a title.</Alert>
          <Alert variant="success" title="Success">Your changes have been saved successfully.</Alert>
          <Alert variant="warning" title="Warning">Please review your information before proceeding.</Alert>
          <Alert variant="destructive" title="Error">There was a problem processing your request.</Alert>
        </div>
      </div>

      {/* Alert without icon */}
      <div>
        <h3 className="text-sm font-medium mb-2">Alert without Icon</h3>
        <Alert showIcon={false}>This alert is displayed without an icon.</Alert>
      </div>

      {/* Dismissible Alert */}
      <div>
        <h3 className="text-sm font-medium mb-2">Dismissible Alert</h3>
        <Alert 
          dismissible 
          onDismiss={() => alert('Alert dismissed!')}
        >
          This alert can be dismissed. Click the X to dismiss.
        </Alert>
      </div>

      {/* Dismissible Alert with title */}
      <div>
        <h3 className="text-sm font-medium mb-2">Dismissible Alert with Title</h3>
        <Alert 
          variant="warning"
          title="Warning"
          dismissible 
          onDismiss={() => alert('Warning alert dismissed!')}
        >
          This warning alert can be dismissed and has a title.
        </Alert>
      </div>

      {/* Alert with long content */}
      <div>
        <h3 className="text-sm font-medium mb-2">Alert with Long Content</h3>
        <Alert variant="info" title="Information">
          <p>This alert contains a longer message to demonstrate how the alert component handles longer content.</p>
          <p className="mt-2">It can include multiple paragraphs and demonstrates text wrapping behavior.</p>
          <p className="mt-2">The alert maintains proper spacing and alignment even with longer content.</p>
        </Alert>
      </div>
    </div>
  );
};

export default AlertExamples; 