import { createFileRoute, Link } from '@tanstack/react-router';
import Dataset from '@/containers/Dataset/Dataset.tsx';

export const Route = createFileRoute('/datasets')({
  component: DatasetRoot,
});

function DatasetRoot() {
  return <Dataset />;
}
