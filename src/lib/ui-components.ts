/**
 * Centralized exports for UI components
 * This file handles case sensitivity issues with imports
 */

// Re-export components with consistent casing
export {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

export { Badge } from '@/components/ui/badge';

export { Button } from '@/components/ui/button';

export { Input } from '@/components/ui/input';

export { Label } from '@/components/ui/label';

export { ScrollArea } from '@/components/ui/scroll-area';

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export { Slider } from '@/components/ui/slider';

export { LoadingSpinner as Spinner } from '@/components/ui/loading-spinner';

export { Switch } from '@/components/ui/switch';

export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
