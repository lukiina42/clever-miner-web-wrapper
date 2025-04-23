import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useQuery } from '@tanstack/react-query';
import { ruleQueryOptions } from '@/api/rule.ts';
import { ClipLoader } from 'react-spinners';
import RuleDetailDialogBase from '@/containers/4ftminer/fourFtForm/rules/RuleDetailDialogBase.tsx';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import useGetSession from '@/hook/useGetSession.ts';
import { RuleParams } from '@/api/fourft.ts';

type Props = {
  currentRuleId: number;
  closeDialog: () => void;
  fourFtResultId: string;
};

export default function RuleDetailDialog({ currentRuleId, closeDialog, fourFtResultId }: Props) {
  const isOpen = currentRuleId !== null;

  const session = useGetSession();

  const ruleData = useQuery({
    ...ruleQueryOptions(fourFtResultId, currentRuleId, session?.tokens?.accessToken ?? ''),
    enabled: currentRuleId !== null,
  });

  const isLoading = ruleData.isPending;

  const params = ruleData?.data?.rule?.params as RuleParams;

  return (
    <Dialog open={isOpen} onOpenChange={() => closeDialog()}>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader>
          <DialogTitle className={'text-2xl flex justify-between items-center pr-8'}>
            <div>Rule {currentRuleId} detail</div>
            <Link
              to={'/fourft/$fourftId/rules/$ruleId'}
              params={{ fourftId: fourFtResultId, ruleId: currentRuleId.toString() }}
            >
              <ArrowTopRightOnSquareIcon className={'w-5 h-5'} />
            </Link>
          </DialogTitle>
          <DialogDescription className={'text-lg'}>
            {ruleData?.data?.rule?.rule_text}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className={'w-full h-full flex justify-center items-center'}>
            <ClipLoader size={48} />
          </div>
        ) : (
          <RuleDetailDialogBase ruleParams={params} plot={ruleData?.data?.plot as string} />
        )}
      </DialogContent>
    </Dialog>
  );
}
