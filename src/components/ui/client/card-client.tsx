'use client';

import { useState } from 'react';
import { 
  Card as ServerCard,
  CardHeader as ServerCardHeader,
  CardFooter as ServerCardFooter,
  CardTitle as ServerCardTitle,
  CardDescription as ServerCardDescription,
  CardContent as ServerCardContent
} from '@/components/ui';

/**
 * @component CardClient
 * @category molecule
 * @renderType client
 * @description Client-side interactive Card component with hover effects and state
 * @author Frontend Team
 * @status stable
 * @since 2023-04-06
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card Content</p>
 *   </CardContent>
 *   <CardFooter>
 *     <p>Card Footer</p>
 *   </CardFooter>
 * </Card>
 */

type CardProps = React.ComponentProps<typeof ServerCard>;
type CardHeaderProps = React.ComponentProps<typeof ServerCardHeader>;
type CardFooterProps = React.ComponentProps<typeof ServerCardFooter>;
type CardTitleProps = React.ComponentProps<typeof ServerCardTitle>;
type CardDescriptionProps = React.ComponentProps<typeof ServerCardDescription>;
type CardContentProps = React.ComponentProps<typeof ServerCardContent>;

export function Card({ 
  children,
  className,
  ...props 
}: CardProps & {
  onClick?: () => void;
  isInteractive?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isInteractive = props.onClick || props.isInteractive;
  
  return (
    <ServerCard 
      className={`${className || ''} ${isInteractive ? 'cursor-pointer' : ''} ${isHovered && isInteractive ? 'shadow-md scale-[1.01]' : ''} transition-all duration-200`}
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => isInteractive && setIsHovered(false)}
      {...props}
    >
      {children}
    </ServerCard>
  );
}

export function CardHeader(props: CardHeaderProps) {
  return <ServerCardHeader {...props} />;
}

export function CardFooter(props: CardFooterProps) {
  return <ServerCardFooter {...props} />;
}

export function CardTitle(props: CardTitleProps) {
  return <ServerCardTitle {...props} />;
}

export function CardDescription(props: CardDescriptionProps) {
  return <ServerCardDescription {...props} />;
}

export function CardContent(props: CardContentProps) {
  return <ServerCardContent {...props} />;
} 