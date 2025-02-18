import { createFileRoute } from '@tanstack/react-router';
import Dataset from '@/containers/Dataset/Dataset.tsx';

export const Route = createFileRoute('/_dataset/datasets')({
  component: DatasetRoot,
});

function DatasetRoot() {
  return <Dataset />;
}
