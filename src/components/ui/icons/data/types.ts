/**
 * Icon Data Types
 * 
 * This file contains type definitions specific to icon data.
 */

import type { IconName } from '../types';

export type IconData = {
  width: number;
  height: number;
  path: string;
  url: string;
  complex?: boolean; // Optional property for complex SVGs that can't be represented with a single path
};

export type { IconName }; 