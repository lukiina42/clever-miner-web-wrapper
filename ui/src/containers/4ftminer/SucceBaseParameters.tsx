import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FourFtSchemaT } from './FourFtMiner.tsx';
import TextInputField from '@/components/form/TextInputField.tsx';
import { Label } from '@/components/ui/label.tsx';
import { InfoIcon } from '@/components/ui/InfoIcon.tsx';
import Selectbox from '@/components/form/Selectbox.tsx';
import SelectOption from '@/components/form/SelectOption.tsx';
import { cedentConDisTypes } from '@/data/cedent.ts';

type Props = {
  register: UseFormRegister<FourFtSchemaT>;
  errors: FieldErrors<FourFtSchemaT>;
};

export default function SucceBaseParameters({ register, errors }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-[300px] flex justify-between">
        <div className={'w-[145px]'}>
          <Label htmlFor="succeMinLen">Min. amount</Label>
          <TextInputField
            {...register('succeMinLen')}
            errorMessage={errors?.succeMinLen?.message as string | undefined}
          />
        </div>
        <div className={'w-[145px]'}>
          <Label htmlFor="succeMaxLen">Max. amount</Label>
          <TextInputField
            {...register('succeMaxLen')}
            errorMessage={errors?.succeMaxLen?.message as string | undefined}
          />
        </div>
      </div>
      <div className={'w-[300px]'}>
        <div className="flex gap-1 items-center">
          <Label htmlFor={`conDisSuccedentType`}>Cedent type</Label>
          <InfoIcon
            textContent={
              <a
                target="_blank"
                className="underline"
                href="https://www.cleverminer.org/doc/index.html#literals-and-cedents"
              >
                Cedent type specification
              </a>
            }
          />
        </div>
        <Selectbox {...register(`conDisSuccedentType`)} error={errors?.conDisSuccedentType}>
          {cedentConDisTypes.map((option, i) => {
            return (
              <SelectOption key={i} value={option.value}>
                {option.label}
              </SelectOption>
            );
          })}
        </Selectbox>
      </div>
    </div>
  );
}
