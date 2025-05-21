import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';

interface AssetPreviewProps {
    mediaTypeIconId?: string;
    mediaTypeLabel?: string;
    fileName?: string;
    className?: string;
    [key: string]: any;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({
    mediaTypeIconId,
    mediaTypeLabel,
    fileName,
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden bg-muted/50 w-full aspect-square p-3 flex flex-col items-center justify-center',
                className
            )}
            {...props}
        >
            <Icon
                iconId={mediaTypeIconId || 'faFileCircleQuestionLight'}
                className="h-6 w-6 text-muted-foreground/50 mb-1"
            />
            {mediaTypeLabel && <p className="text-xs text-muted-foreground">{mediaTypeLabel}</p>}
            {fileName && (
                <p className="text-xs text-muted-foreground truncate max-w-full px-1">{fileName}</p>
            )}
        </div>
    );
};

export default AssetPreview; 