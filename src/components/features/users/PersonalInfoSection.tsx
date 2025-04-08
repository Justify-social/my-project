// Updated import paths via tree-shake script - 2025-04-01T17:13:32.213Z
import React, { useState } from 'react';
import HTMLInputElement from '../../ui/radio/types/index';
import { motion } from 'framer-motion';
import Card from './shared/Card';
import SectionHeader from './shared/SectionHeader';
import InputField from './shared/InputField';
import ActionButtons from './shared/ActionButtons';
import { Icon } from '@/components/ui/icon/icon';

// Define the ButtonIcon component
const ButtonIcon = ({ iconId, className }: { iconId: string, className?: string }) => (
  <Icon iconId={iconId} className={className} />
);

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
}

interface PersonalInfoSectionProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => Promise<void>;
}