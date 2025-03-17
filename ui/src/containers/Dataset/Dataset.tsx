import '../../App.css';
import { useGetDatasets } from '@/api/dataset.ts';
import { LoadingSpinner } from '@/components/ui/loadingSpinner.tsx';
import AddDatasetDialog from '@/containers/Dataset/AddDatasetDialog.tsx';
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
import { DownloadIcon } from 'lucide-react';

export default function Dataset() {
  const datasetsQueryResponse = useGetDatasets();

  const { isLoading } = datasetsQueryResponse;
  const datasets = datasetsQueryResponse.data ?? [];

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

      <div className={'flex flex-col gap-4 w-full'}>
        <div className={'flex flex-col gap-2 w-full items-center'}>
          {isLoading ? (
            <LoadingSpinner className="h-8 w-8 mt-16 shrink-0 opacity-80" />
          ) : (
            <Table className="w-full px-4 max-w-[80rem]">
              <TableCaption className="caption-top font-bold text-left mb-2 text-lg text-black">
                A list of datasets
              </TableCaption>
              <TableHeader>
                <TableRow className="grid grid-cols-5 gap-4">
                  <TableHead className="col-span-1">Dataset name</TableHead>
                  <TableHead className="col-span-1">Amount of columns</TableHead>
                  <TableHead className="col-span-1">Amount of rows</TableHead>
                  <TableHead className="col-span-1">Created at</TableHead>
                  <TableHead className="col-span-1 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map((dataset) => (
                  <TableRow key={dataset.id} className="grid grid-cols-5 gap-4 hover:bg-muted/50">
                    <TableCell className="col-span-1 font-medium">{dataset.name}</TableCell>
                    <TableCell className="col-span-1">{dataset.columns_count}</TableCell>
                    <TableCell className="col-span-1">{dataset.rows_count}</TableCell>
                    <TableCell className="col-span-1">
                      {formatServerDate(dataset.created_at)}
                    </TableCell>
                    <TableCell className="col-span-1 text-right">
                      <a target="_blank" href={dataset.url} className={'flex justify-end'}>
                        <DownloadIcon />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
