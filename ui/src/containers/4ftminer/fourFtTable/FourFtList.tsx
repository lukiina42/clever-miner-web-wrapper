import '../../../App.css';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { FourFtFilters, FourFtResult } from '@/api/fourft.ts';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button.tsx';
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon, SearchIcon } from 'lucide-react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { formatServerDate } from '@/utils/date.ts';
import DeleteFourFtDialog from '@/containers/4ftminer/fourFtTable/DeleteFourFtDialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Dispatch, SetStateAction } from 'react';
import { debounce, FilterState, handleOrderingChange } from '@/utils/filters.ts';

interface FourFtListProps {
  fourFtResults: FourFtResult[];
  filters: FourFtFilters;
  setFilters: Dispatch<SetStateAction<FourFtFilters>>;
  isLoading: boolean;
}

export default function FourFtList({
  fourFtResults,
  filters,
  setFilters,
  isLoading,
}: FourFtListProps) {
  // Handle name filter with debounce
  const debouncedSetNameFilter = debounce((value: string) => {
    setFilters((prev) => ({
      ...prev,
      name: value.trim() || undefined,
    }));
  }, 500);

  // Handle dataset name filter with debounce
  const debouncedSetDatasetNameFilter = debounce((value: string) => {
    setFilters((prev) => ({
      ...prev,
      dataset_name: value.trim() || undefined,
    }));
  }, 500);

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetNameFilter(e.target.value);
  };

  const handleDatasetNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetDatasetNameFilter(e.target.value);
  };

  function getSortIcon(field: string, filters: FilterState): React.ReactNode {
    if (filters.ordering === field) {
      return <ArrowUpIcon className="h-4 w-4 ml-1" />;
    } else if (filters.ordering === `-${field}`) {
      return <ArrowDownIcon className="h-4 w-4 ml-1" />;
    } else {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
  }

  return (
    <div className={'flex flex-col w-full h-full'}>
      <div className={'flex flex-col gap-4 w-full p-4'}>
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 w-full max-w-[80rem] mx-auto mb-2">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by procedure name..."
              defaultValue={filters.name || ''}
              onChange={handleNameFilterChange}
              className="pl-10"
            />
          </div>
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by dataset name..."
              defaultValue={filters.dataset_name || ''}
              onChange={handleDatasetNameFilterChange}
              className="pl-10"
            />
          </div>
        </div>

        <div className={'flex flex-col gap-2 w-full items-center'}>
          {isLoading ? (
            <div className="flex justify-center items-center h-40 w-full">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            </div>
          ) : (
            <Table className="w-full px-4 max-w-[80rem]">
              <TableCaption className="caption-top font-bold text-left mb-2 text-lg text-black">
                A list of created procedures
              </TableCaption>
              <TableHeader>
                <TableRow className="grid grid-cols-9 gap-4">
                  <TableHead className="col-span-2">Procedure name</TableHead>
                  <TableHead className="col-span-1">Amount of rules</TableHead>
                  <TableHead className="col-span-1">Name of dataset</TableHead>
                  <TableHead className="col-span-2">
                    <button
                      onClick={() => handleOrderingChange('created_at', setFilters)}
                      className="flex items-center hover:text-black"
                    >
                      Created at
                      {getSortIcon('created_at', filters)}
                    </button>
                  </TableHead>
                  <TableHead className="col-span-2">
                    <button
                      onClick={() => handleOrderingChange('updated_at', setFilters)}
                      className="flex items-center hover:text-black"
                    >
                      Last updated at
                      {getSortIcon('updated_at', filters)}
                    </button>
                  </TableHead>
                  <TableHead className="col-span-1 pl-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fourFtResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      No results found.{' '}
                      {filters.name || filters.dataset_name
                        ? 'Try a different search term.'
                        : 'Create a new procedure to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  fourFtResults.map((fourftResult) => {
                    return (
                      <TableRow
                        key={fourftResult.id}
                        className="grid grid-cols-9 gap-4 hover:bg-muted/50"
                      >
                        <TableCell className="col-span-2 font-medium">
                          {fourftResult.name}
                        </TableCell>
                        <TableCell className="col-span-1">{fourftResult.rules_count}</TableCell>
                        <TableCell className="col-span-1">{fourftResult.dataset_name}</TableCell>
                        <TableCell className="col-span-2">
                          {formatServerDate(fourftResult.created_at)}
                        </TableCell>
                        <TableCell className="col-span-2">
                          {formatServerDate(fourftResult.updated_at)}
                        </TableCell>
                        <TableCell className="col-span-1">
                          <div className="flex space-x-2">
                            <Link to={`/fourft/${fourftResult.id}`}>
                              <Button variant="ghost" size="icon" title="View Result">
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <DeleteFourFtDialog resultId={fourftResult.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
