import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';

import { useState } from 'react';
import { Rule } from '@/api/fourft.ts';
import RuleDetailDialog from '@/containers/4ftminer/fourFtForm/rules/RuleDetailDialog.tsx';
import { numberToDecimalPlaces } from '@/utils/helperFunction.ts';

interface Props {
  rules: Rule[] | undefined;
  fourFtResultId: string;
}

export default function FourFtRules({ rules, fourFtResultId }: Props) {
  const [currentRuleId, setCurrentRuleId] = useState<number | null>(null);

  const closeDialog = () => setCurrentRuleId(null);

  return (
    <div className={'grow flex flex-wrap p-8 pt-0'}>
      {rules?.length === 0 && <div className={'text-2xl'}>No rules found!</div>}
      {rules !== undefined && rules.length !== 0 && (
        <Table className="w-full">
          <TableCaption className="caption-top text-left mb-4 mt-0 text-lg text-black">
            Amount of rules: {rules.length}
          </TableCaption>
          <TableHeader>
            <TableRow className="grid grid-cols-7 gap-4">
              <TableHead className="col-span-1">Rule ID</TableHead>
              <TableHead className="col-span-1">Base</TableHead>
              <TableHead className="col-span-1">Relative base</TableHead>
              <TableHead className="col-span-1">Confidence</TableHead>
              <TableHead className="col-span-1">AAD</TableHead>
              <TableHead className="col-span-2">Rule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow
                key={rule.rule_id}
                className="grid grid-cols-7 gap-4 cursor-pointer hover:bg-muted/50"
                onClick={() => setCurrentRuleId(rule.rule_id)}
              >
                <TableCell className="col-span-1 font-medium">{rule.rule_id}</TableCell>
                <TableCell className="col-span-1">{rule.params.base}</TableCell>
                <TableCell className="col-span-1">
                  {numberToDecimalPlaces(rule.params.rel_base, 3)}
                </TableCell>
                <TableCell className="col-span-1">
                  {numberToDecimalPlaces(rule.params.conf, 3)}
                </TableCell>
                <TableCell className="col-span-1">
                  {numberToDecimalPlaces(rule.params.aad, 3)}
                </TableCell>
                <TableCell className="col-span-2">{rule.rule_text}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <RuleDetailDialog
        fourFtResultId={fourFtResultId}
        currentRuleId={currentRuleId}
        closeDialog={closeDialog}
      />
    </div>
  );
}
