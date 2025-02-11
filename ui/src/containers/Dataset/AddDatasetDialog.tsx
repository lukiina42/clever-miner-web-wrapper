import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import AddDatasetForm from '@/containers/Dataset/AddDatasetForm.tsx';
import { useState } from 'react';

export default function AddDatasetDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="cursor-pointer bg-black hover:bg-gray-800 w-40">
          Add dataset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add dataset</DialogTitle>
          <DialogDescription>
            Choose a file with your data and the delimiter which separates the columns
          </DialogDescription>
        </DialogHeader>
        <AddDatasetForm setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
