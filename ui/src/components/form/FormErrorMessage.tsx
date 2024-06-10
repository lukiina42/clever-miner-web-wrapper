import type { ClassValue } from 'clsx';

import clsxm from '../../utils/clsxm.ts';

type Props = {
  errorMessage: string;
  className?: ClassValue;
};

export default function FormErrorMessage({ errorMessage, className }: Props) {
  return (
    <span
      className={clsxm(
        'absolute left-1 top-11 rounded-md bg-red-50 px-1 text-xs font-medium text-red-500 ring-1 ring-red-300',
        className
      )}
    >
      {errorMessage}
    </span>
  );
}
