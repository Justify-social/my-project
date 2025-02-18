// src/context/WizardContext.tsx
"use client"; // Make sure this file is a client component if you're using Next.js 13 with the App Router.

import React, { createContext, useContext, useState } from "react";

// Define the shape of your wizard data.
interface WizardData {
  overview: {
    name: string;
    businessGoal: string;
    startDate: string;
    endDate: string;
    timeZone: string;
    contacts: string;
    primaryContact: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    secondaryContact: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    currency: string;
    totalBudget: number;
    socialMediaBudget: number;
    platform: string;
    influencerHandle: string;
  };
  objectives: {
    objectives: string;
    kpis: string;
    keyMessaging: string;
    valueProps: string;
  };
  audience: {
    segments: string[];
    competitors: string[];
  };
  assets: {
    files: { url: string; tags: string[] }[];
  };
}

interface WizardContextValue {
  data: WizardData;
  updateData: (
    section: keyof WizardData,
    newData: Partial<WizardData[keyof WizardData]>
  ) => void;
}

// Default values for the wizard data.
const defaultWizardData: WizardData = {
  overview: {
    name: "",
    businessGoal: "",
    startDate: "",
    endDate: "",
    timeZone: "UTC",
    contacts: "",
    primaryContact: {
      firstName: "",
      surname: "",
      email: "",
      position: "",
    },
    secondaryContact: {
      firstName: "",
      surname: "",
      email: "",
      position: "",
    },
    currency: "£",
    totalBudget: 5000,
    socialMediaBudget: 1000,
    platform: "",
    influencerHandle: "",
  },
  objectives: { objectives: "", kpis: "", keyMessaging: "", valueProps: "" },
  audience: { segments: [], competitors: [] },
  assets: { files: [] },
};

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<WizardData>(defaultWizardData);

  const updateData = (
    section: keyof WizardData,
    newData: Partial<WizardData[keyof WizardData]>
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...newData,
      },
    }));
  };

  return (
    <WizardContext.Provider value={{ data, updateData }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = (): WizardContextValue => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
