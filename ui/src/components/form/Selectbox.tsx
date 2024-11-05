import type { ReactNode } from 'react';

import { type ClassValue } from 'clsx';
import { forwardRef } from 'react';

import clsxm from '@/utils/clsxm';

import FormErrorMessage from './FormErrorMessage';
import { FieldError } from 'react-hook-form';

type Props = Omit<JSX.IntrinsicElements['select'], 'className'> & {
  name: string;
  children: ReactNode;
  error?: FieldError | undefined;
  className?: ClassValue;
};

const Selectbox = forwardRef<HTMLSelectElement, Props>(
  ({ name, children, error, className, ...rest }: Props, ref) => {
    return (
      <div className="relative grid">
        <select
          id={name}
          name={name}
          ref={ref}
          {...rest}
          className={clsxm(
            `relative z-10 h-10 w-full cursor-pointer rounded-lg border py-2 px-2 text-left focus:outline-none focus:ring-1 focus:ring-black sm:text-sm`,
            className
          )}
        >
          {children}
        </select>
        {error !== undefined && (
          <FormErrorMessage errorMessage={error?.message ?? 'Unknown error'} />
        )}
      </div>
    );
  }
);

export default Selectbox;
