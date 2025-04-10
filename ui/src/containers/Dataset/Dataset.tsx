import '../../App.css';
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
import { DownloadIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Input } from '@/components/ui/input.tsx';
import { debounce } from '@/utils/filters.ts';
import { Route as DatasetRoute } from '@/routes/_protected._dataset.datasets';
import { useNavigate } from '@tanstack/react-router';
import getSortIcon from '@/components/ui/SortIcon.tsx';
import { type Dataset } from '@/api/dataset.ts';

type Props = {
  datasets: Dataset[];
};

export default function Dataset({ datasets }: Props) {
  const { ordering, name } = DatasetRoute.useSearch();
  const navigate = useNavigate({ from: DatasetRoute.fullPath });

  // Handle name filter with debounce
  const debouncedSetNameFilter = debounce((value: string) => {
    navigate({
      params: {},
      search: (prev) => ({
        ...prev,
        name: value.trim() || undefined,
      }),
    });
  }, 500);

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetNameFilter(e.target.value);
  };

  function handleOrderingChange(field: string) {
    if (ordering === field) {
      navigate({
        params: {},
        search: (prev) => ({ ...prev, ordering: `-${field}` }),
      });
    }
    // Otherwise start sorting by this field in ascending order
    else {
      navigate({
        params: {},
        search: (prev) => ({ ...prev, ordering: field }),
      });
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
              defaultValue={name || ''}
              onChange={handleNameFilterChange}
              className="pl-10"
            />
          </div>
        </div>

        <div className={'flex flex-col gap-2 w-full items-center'}>
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
                    onClick={() => handleOrderingChange('created_at')}
                    className="flex items-center hover:text-black"
                  >
                    Created at
                    {getSortIcon('created_at', ordering)}
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
                    {name ? 'Try a different search term.' : 'Add a dataset to get started.'}
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
        </div>
      </div>
    </div>
  );
}
