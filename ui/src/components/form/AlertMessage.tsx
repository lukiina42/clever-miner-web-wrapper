import { AlertCircle } from 'lucide-react';

type Props = {
  message: string;
};

export default function AlertMessage({ message }: Props) {
  return (
    <div className="flex items-center text-red-500">
      <AlertCircle className="mr-2 h-6 w-6" />
      <div>{message}</div>
    </div>
  );
}
