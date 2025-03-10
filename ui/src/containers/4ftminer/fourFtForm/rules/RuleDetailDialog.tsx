import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import AddDatasetForm from '@/containers/Dataset/AddDatasetForm.tsx';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fourFtResultsQueryOptions } from '@/api/fourft.ts';
import { ruleQueryOptions } from '@/api/rule.ts';
import { ClipLoader } from 'react-spinners';
import { numberToDecimalPlaces } from '@/utils/helperFunction.ts';

type Props = {
  currentRuleId: number | null;
  closeDialog: () => void;
  fourFtResultId: string;
};

export default function RuleDetailDialog({ currentRuleId, closeDialog, fourFtResultId }: Props) {
  const isOpen = currentRuleId !== null;

  const ruleData = useQuery({
    ...ruleQueryOptions(fourFtResultId, currentRuleId),
    enabled: currentRuleId !== null,
  });

  const isLoading = ruleData.isPending;

  const params = ruleData?.data?.rule?.params;

  return (
    <Dialog open={isOpen} onOpenChange={() => closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={'text-2xl'}>Rule detail</DialogTitle>
          <DialogDescription>
            Here you can see the details of rule {currentRuleId}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className={'w-full h-full flex justify-center items-center'}>
            <ClipLoader size={48} />
          </div>
        ) : (
          <div className={'flex flex-col gap-2'}>
            <div className={'flex flex-col gap-1'}>
              <div className={'flex gap-2'}>
                <div className={'font-bold w-28'}>Base:</div>
                <div>{params.base}</div>
              </div>
              <div className={'flex gap-2'}>
                <div className={'font-bold w-28'}>Relative base:</div>
                <div>{numberToDecimalPlaces(params.rel_base, 6)}</div>
              </div>
              <div className={'flex gap-2'}>
                <div className={'font-bold w-28'}>Confidence:</div>
                <div>{numberToDecimalPlaces(params.conf, 6)}</div>
              </div>
              <div className={'flex gap-2'}>
                <div className={'font-bold w-28'}>AAD:</div>
                <div>{numberToDecimalPlaces(params.aad, 6)}</div>
              </div>
              <div className={'flex gap-2'}>
                <div className={'font-bold w-28'}>BAD:</div>
                <div>{numberToDecimalPlaces(params.bad, 6)}</div>
              </div>
            </div>
            <img src={ruleData.data.plot} alt={'Rule plot'} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
