import { UseFieldArrayRemove, useWatch } from 'react-hook-form';
import { AnteSucceInputProps } from '@/type/anteSucceInput.ts';
import AddAnteSucceDialog from '@/containers/4ftminer/fourFtForm/AddAnteSucceDialog.tsx';
import { FourFtSchemaT } from '@/schema/fourFtForm.ts';

// Updated type to include 'condition' as a valid title
type CedentTitle = 'antecedent' | 'succedent' | 'condition';

type Props = {
  remove: UseFieldArrayRemove;
  title: CedentTitle;
} & Omit<AnteSucceInputProps<FourFtSchemaT>, 'children' | 'isUpdate' | 'title'>;

export default function CedentLiteralList({
  remove,
  append,
  register,
  errors,
  currentDataset,
  datasetsLoading,
  control,
  setValue,
  clearErrors,
  trigger,
  datasetHeaderNames,
  title,
}: Props) {
  const schemaWatch = useWatch({ control }) as FourFtSchemaT;

  const cedentsAll = schemaWatch?.[title] || [];

  const cedents = cedentsAll.filter((cedent) => cedent.isValid);

  return (
    <div className="w-full flex flex-col gap-1">
      {cedents.length > 0 && <span className={'text-sm font-bold'}>Literals</span>}
      {cedents.map(({ name, type, minLen, maxLen }, index) => (
        // @ts-ignore - Ignoring type issues as we're handling this with our custom CedentTitle type
        <AddAnteSucceDialog
          title={title}
          append={append}
          errors={errors}
          isUpdate={true}
          register={register}
          clearErrors={clearErrors}
          setValue={setValue}
          trigger={trigger}
          control={control}
          datasetsLoading={datasetsLoading}
          datasetHeaderNames={datasetHeaderNames}
          currentDataset={currentDataset}
          fieldLength={cedents.length}
          // just for now, the id can be the same in some cases..
          key={index}
        >
          <div
            className={
              'w-full flex justify-between items-center hover:bg-gray-200 cursor-pointer p-1 rounded'
            }
          >
            <div>
              <b>#{index + 1}</b>
              {`: ${name}(${type}), ${minLen} - ${maxLen}`}
            </div>{' '}
            <div
              onClick={(event) => {
                event.stopPropagation();
                remove(index);
              }}
              className="w-4 h-4 mb-0.5 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
            >
              <span className={'mb-0.5'}>-</span>
            </div>
          </div>
        </AddAnteSucceDialog>
      ))}
    </div>
  );
}
