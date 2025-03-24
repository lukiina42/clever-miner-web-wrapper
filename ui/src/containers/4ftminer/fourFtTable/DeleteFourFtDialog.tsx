import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { TrashIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteFourFt } from '@/api/fourft.ts';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/ui/loadingSpinner.tsx';

interface DeleteFourFtDialogProps {
  resultId: string;
}

export default function DeleteFourFtDialog({ resultId }: DeleteFourFtDialogProps) {
  const queryClient = useQueryClient();
  const deleteFourFtMutation = useDeleteFourFt(queryClient);
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      await deleteFourFtMutation.mutateAsync(resultId);
      toast.success('Analysis result deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete result');
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:text-red-700 hover:bg-red-100"
        title="Delete Result"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the analysis result and
            remove it from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={deleteFourFtMutation.isPending}
          >
            {deleteFourFtMutation.isPending ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
