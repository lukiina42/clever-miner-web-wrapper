import '../../../App.css';
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
import {FourFtResult} from "@/api/fourft.ts";
import {Link} from "@tanstack/react-router";
import {Button} from "@/components/ui/button.tsx";

export default function FourFtList({ fourFtResults }: { fourFtResults: FourFtResult[] }) {
  return (
    <div className={'flex flex-col w-full h-full'}>

        <div className={'flex justify-end pr-4 pt-4'}>
            <Link to={'/fourft/create'}>
                <Button type="button" className="cursor-pointer bg-black hover:bg-gray-800 w-44">
                    Create new procedure
                </Button>
            </Link>
        </div>

      <div className={'flex flex-col gap-4 w-full'}>
        <div className={'flex flex-col gap-2 w-full items-center'}>
            <Table className="w-full px-4 max-w-[80rem]">
              <TableCaption className="caption-top font-bold text-left mb-2 text-lg text-black">
                A list of created procedures
              </TableCaption>
              <TableHeader>
                <TableRow className="grid grid-cols-5 gap-4">
                  <TableHead className="col-span-1">Procedure name</TableHead>
                  <TableHead className="col-span-1">Last update</TableHead>
                  <TableHead className="col-span-1">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fourFtResults.map((fourftResult) => (
                  <TableRow key={fourftResult.id} className="grid grid-cols-5 gap-4 hover:bg-muted/50">
                    <TableCell className="col-span-1 font-medium">{fourftResult.name}</TableCell>
                    <TableCell className="col-span-1">{fourftResult.updated_at}</TableCell>
                    <TableCell className="col-span-1">
                        <Link to={`/fourft/${fourftResult.id}`}>
                            Go to
                        </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
