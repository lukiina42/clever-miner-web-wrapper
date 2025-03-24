import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteDataset } from '@/api/dataset.ts';
import { LoadingSpinner } from '@/components/ui/loadingSpinner.tsx';
import { displayNotification } from '@/utils/displayNotification.ts';

interface DeleteDatasetDialogProps {
  datasetId: string;
  children: React.ReactNode;
}

export default function DeleteDatasetDialog({ datasetId, children }: DeleteDatasetDialogProps) {
  const queryClient = useQueryClient();
  const deleteDatasetMutation = useDeleteDataset(queryClient);
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      await deleteDatasetMutation.mutateAsync(datasetId);
      displayNotification('Dataset deleted successfully', 'success');
    } catch (error) {
      displayNotification(
        error instanceof Error ? error.message : 'Failed to delete dataset',
        'error'
      );
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
        title="Delete Dataset"
      >
        {children}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the dataset and remove it
            from our servers.
            <br />
            <br />
            Note: If the dataset is used by any analysis results, you will need to delete those
            results first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={deleteDatasetMutation.isPending}
          >
            {deleteDatasetMutation.isPending ? (
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
