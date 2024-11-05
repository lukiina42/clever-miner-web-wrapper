import type { ClassValue } from 'clsx';

import clsxm from '../../utils/clsxm.ts';

type Props = {
  errorMessage: string;
  className?: ClassValue;
};

export default function FormErrorMessage({ errorMessage, className }: Props) {
  return (
    <span
      className={clsxm('absolute left-0 top-11 px-1 text-xs font-medium text-red-500', className)}
    >
      {errorMessage}
    </span>
  );
}
