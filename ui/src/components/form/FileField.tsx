'use client';

import type { ClassValue } from 'clsx';
import type { ReactNode } from 'react';
import type { FieldValues, UseFormRegister } from 'react-hook-form';

import clsxm from '../../utils/clsxm.ts';
import { displayNotification } from '../../utils/displayNotification.ts';

import FormErrorMessage from './FormErrorMessage.tsx';

type Props = Omit<JSX.IntrinsicElements['input'], 'className'> & {
  name: string;
  register: UseFormRegister<FieldValues>;
  errorMessage?: string;
  setValue: (file: File) => void;
  accept: string;
  children: ReactNode;
  className?: ClassValue;
};

export default function FileField({
  name,
  register,
  setValue,
  errorMessage,
  accept,
  children,
  className,
  ...rest
}: Props) {
  return (
    <div className="flex flex-col gap-2 hover:cursor-pointer relative">
      <div className="flex flex-col gap-4">
        <label htmlFor={name}>{children}</label>
        <input
          type="file"
          className={clsxm(
            'hidden w-full text-sm file:cursor-pointer file:rounded-lg file:bg-transparent file:px-16 file:py-1 file:outline-none',
            className
          )}
          id={name}
          accept={accept}
          {...register(name)}
          {...rest}
          onChange={(event) => {
            if (event.target.files) {
              const file = event.target.files[0];
              if (file.size > 50 * 1000000) {
                displayNotification('Maximum file size is 50MB', 'error');
                return;
              }
              setValue(file);
            }
          }}
        />
      </div>

      {errorMessage && (
        <FormErrorMessage errorMessage={errorMessage} className="flex justify-center" />
      )}
    </div>
  );
}
