/**
 * @component Collapsible
 * @category layout
 * @subcategory container
 * @description An interactive component which expands/collapses its content.
 * @status 10th April
 */
'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
