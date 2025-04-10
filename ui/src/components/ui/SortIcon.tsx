import React from 'react';
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon } from 'lucide-react';

export default function getSortIcon(field: string, ordering?: string): React.ReactNode {
  if (ordering === field) {
    return <ArrowUpIcon className="h-4 w-4 ml-1" />;
  } else if (ordering === `-${field}`) {
    return <ArrowDownIcon className="h-4 w-4 ml-1" />;
  } else {
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  }
}
