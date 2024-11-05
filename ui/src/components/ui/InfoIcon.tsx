import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { ReactNode } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

interface Props {
  textContent: string | ReactNode;
}

export function InfoIcon({ textContent }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <InformationCircleIcon className="h-5 w-5 text-gray-300 cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-fit" side={'top'} align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">{textContent}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
