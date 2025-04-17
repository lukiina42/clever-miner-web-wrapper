import { FieldErrors, UseFormRegister } from 'react-hook-form';
import TextInputField from '@/components/form/TextInputField.tsx';
import { Label } from '@/components/ui/label.tsx';
import { InfoIcon } from '@/components/ui/InfoIcon.tsx';
import Selectbox from '@/components/form/Selectbox.tsx';
import SelectOption from '@/components/form/SelectOption.tsx';
import { cedentConDisTypes } from '@/data/cedent.ts';
import { FourFtSchemaT } from '@/schema/fourFtForm';

type Props = {
  register: UseFormRegister<FourFtSchemaT>;
  errors: FieldErrors<FourFtSchemaT>;
};

export default function CedentBaseConditionParameters({ register, errors }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className={'flex gap-1 items-center'}>
        <span className={'text-sm font-bold'}>Condition parameters</span>
        <InfoIcon
          textContent={
            <a
              target="_blank"
              className="underline"
              href="https://www.cleverminer.org/doc/index.html#literals-and-cedents"
            >
              Condition attribute specification
            </a>
          }
        />
      </div>
      <div className="w-[300px] flex justify-between">
        <div className={'w-[145px]'}>
          <div className="flex gap-1 items-center">
            <Label htmlFor={`condMinLen`}>Min. amount</Label>
            <InfoIcon textContent={'Minimal number of literals in the condition in the rule'} />
          </div>
          <TextInputField
            {...register('condMinLen')}
            errorMessage={errors?.condMinLen?.message as string | undefined}
          />
        </div>
        <div className={'w-[145px]'}>
          <div className="flex gap-1 items-center">
            <Label htmlFor={`condMaxLen`}>Max. amount</Label>
            <InfoIcon textContent={'Maximal number of literals in the condition in the rule'} />
          </div>
          <TextInputField
            {...register('condMaxLen')}
            errorMessage={errors?.condMaxLen?.message as string | undefined}
          />
        </div>
      </div>
      <div className={'w-[300px]'}>
        <div className="flex gap-1 items-center">
          <Label htmlFor={`conDisConditionType`}>Condition type</Label>
          <InfoIcon textContent={'How condition literals (attributes and values) are combined'} />
        </div>
        <Selectbox {...register(`conDisConditionType`)} error={errors?.conDisConditionType}>
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
