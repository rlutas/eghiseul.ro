'use client';

import { Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SaveStatusProps {
  isSaving: boolean;
  lastSavedAt: string | null;
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Format relative time in Romanian
 */
function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const saved = new Date(isoString);
  const diffMs = now.getTime() - saved.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 5) {
    return 'acum';
  } else if (diffSec < 60) {
    return `acum ${diffSec} sec`;
  } else if (diffMin < 60) {
    return `acum ${diffMin} min`;
  } else if (diffHour < 24) {
    return `acum ${diffHour} ore`;
  } else {
    return saved.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export function SaveStatus({
  isSaving,
  lastSavedAt,
  error,
  onRetry,
  className,
}: SaveStatusProps) {
  if (isSaving) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Se salvează...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
        <AlertCircle className="h-4 w-4" />
        <span>Eroare salvare</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reîncearcă
          </Button>
        )}
      </div>
    );
  }

  if (lastSavedAt) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-green-600', className)}>
        <Check className="h-4 w-4" />
        <span>Salvat {formatRelativeTime(lastSavedAt)}</span>
      </div>
    );
  }

  return null;
}
