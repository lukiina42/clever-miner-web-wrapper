import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FourFtSchemaT } from './FourFtMinerUpdate.tsx';
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
          <Label htmlFor="anteMinLen">Min. amount</Label>
          <TextInputField
            {...register('anteMinLen')}
            errorMessage={errors?.anteMinLen?.message as string | undefined}
          />
        </div>
        <div className={'w-[145px]'}>
          <Label htmlFor="anteMaxLen">Max. amount</Label>
          <TextInputField
            {...register('anteMaxLen')}
            errorMessage={errors?.anteMaxLen?.message as string | undefined}
          />
        </div>
      </div>
      <div className={'w-[300px]'}>
        <div className="flex gap-1 items-center">
          <Label htmlFor={`conDisAntecedentType`}>Cedent type</Label>
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
        <Selectbox {...register(`conDisAntecedentType`)} error={errors?.conDisAntecedentType}>
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
