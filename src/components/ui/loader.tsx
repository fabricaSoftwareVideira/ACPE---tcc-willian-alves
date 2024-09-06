import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className }: { className?: string }) => {
      return (
        <Loader2
          className={cn('my-28 text-primary/60 animate-spin', className)}
        />
      );
    
    
  }