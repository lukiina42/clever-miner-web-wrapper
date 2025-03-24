import '../../App.css';
import { DatasetFilters, useGetDatasets } from '@/api/dataset.ts';
import { LoadingSpinner } from '@/components/ui/loadingSpinner.tsx';
import AddDatasetDialog from '@/containers/Dataset/AddDatasetDialog.tsx';
import DeleteDatasetDialog from '@/containers/Dataset/DeleteDatasetDialog.tsx';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { formatServerDate } from '@/utils/date.ts';
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon, DownloadIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Input } from '@/components/ui/input.tsx';
import { useState } from 'react';
import { debounce, FilterState, handleOrderingChange } from '@/utils/filters.ts';

export default function Dataset() {
  const [filters, setFilters] = useState<DatasetFilters>({});
  const datasetsQueryResponse = useGetDatasets(filters);

  const { isLoading } = datasetsQueryResponse;
  const datasets = datasetsQueryResponse.data ?? [];

  // Handle name filter with debounce
  const debouncedSetNameFilter = debounce((value: string) => {
    setFilters((prev) => ({
      ...prev,
      name: value.trim() || undefined,
    }));
  }, 500);

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetNameFilter(e.target.value);
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
      <div
        className={
          'flex items-center p-3 h-16 w-full justify-between text-2xl font-bold border-b-2 border-gray-200'
        }
      >
        <span>Datasets</span>
        <AddDatasetDialog />
      </div>

      <div className={'flex flex-col gap-4 w-full p-4'}>
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-2 w-full max-w-[80rem] mx-auto mb-2">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by name..."
              defaultValue={filters.name || ''}
              onChange={handleNameFilterChange}
              className="pl-10"
            />
          </div>
        </div>

        <div className={'flex flex-col gap-2 w-full items-center'}>
          {isLoading ? (
            <LoadingSpinner className="h-8 w-8 mt-16 shrink-0 opacity-80" />
          ) : (
            <Table className="w-full px-4 max-w-[80rem]">
              <TableCaption className="caption-top font-bold text-left mb-2 text-lg text-black">
                A list of datasets
              </TableCaption>
              <TableHeader>
                <TableRow className="grid grid-cols-6 gap-4">
                  <TableHead className="col-span-1">Dataset name</TableHead>
                  <TableHead className="col-span-1">Amount of columns</TableHead>
                  <TableHead className="col-span-1">Amount of rows</TableHead>
                  <TableHead className="col-span-1">
                    <button
                      onClick={() => handleOrderingChange('created_at', setFilters)}
                      className="flex items-center hover:text-black"
                    >
                      Created at
                      {getSortIcon('created_at', filters)}
                    </button>
                  </TableHead>
                  <TableHead className="col-span-2 pl-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No datasets found.{' '}
                      {filters.name
                        ? 'Try a different search term.'
                        : 'Add a dataset to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  datasets.map((dataset) => (
                    <TableRow
                      key={dataset.id}
                      className="grid grid-cols-6 gap-4 hover:bg-muted/50 items-center"
                    >
                      <TableCell className="col-span-1 font-medium">{dataset.name}</TableCell>
                      <TableCell className="col-span-1">{dataset.columns_count}</TableCell>
                      <TableCell className="col-span-1">{dataset.rows_count}</TableCell>
                      <TableCell className="col-span-1">
                        {formatServerDate(dataset.created_at)}
                      </TableCell>
                      <TableCell className="col-span-2">
                        <div className="flex space-x-2">
                          <a target="_blank" href={dataset.url}>
                            <Button variant="ghost" size="icon">
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                          </a>
                          <DeleteDatasetDialog datasetId={dataset.id}>
                            <TrashIcon className="h-4 w-4" />
                          </DeleteDatasetDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
