'use client';

import { Copy, Check, HelpCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface OrderIdDisplayProps {
  orderId: string;
  className?: string;
  showCopyButton?: boolean;
  showHelpText?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
}

export function OrderIdDisplay({
  orderId,
  className,
  showCopyButton = true,
  showHelpText = true,
  showClearButton = false,
  onClear,
}: OrderIdDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = orderId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">Cod comandă:</span>
        <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono font-semibold">
          {orderId}
        </code>
      </div>

      {showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      )}

      {showClearButton && onClear && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-7 w-7 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-sm">Începe o comandă nouă</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {showHelpText && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-sm">
                Acest cod identifică unic comanda ta. Păstrează-l pentru a putea
                continua comanda mai târziu sau pentru a contacta suportul.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

/**
 * Compact version for mobile or smaller spaces
 */
export function OrderIdBadge({
  orderId,
  className,
}: {
  orderId: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md',
        'bg-muted hover:bg-muted/80 transition-colors',
        'text-xs font-mono font-medium',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Copiat!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{orderId}</span>
        </>
      )}
    </button>
  );
}
