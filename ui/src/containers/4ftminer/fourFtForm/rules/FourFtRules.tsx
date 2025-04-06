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
import { Button } from '@/components/ui/button.tsx';
import { ArrowDown, ArrowUp, ArrowUpDownIcon } from 'lucide-react';
import { Route as FourFtDetailRoute } from '@/routes/_protected._fourft.fourft.$fourftId.index';
import { useNavigate } from "@tanstack/react-router";

interface Props {
  rules: Rule[] | undefined;
  fourFtResultId: string;
}

export default function FourFtRules({ rules, fourFtResultId }: Props) {
  const [currentRuleId, setCurrentRuleId] = useState<number | null>(null);
  const params = FourFtDetailRoute.useSearch();
  const navigate = useNavigate({ from: FourFtDetailRoute.fullPath })
  const ordering = params?.ordering;

  const closeDialog = () => setCurrentRuleId(null);

  const handleSort = (field: string) => {
    console.log(ordering, field)
    // If already sorting by this field in ascending order, switch to descending
    if (ordering === field) {
      navigate({
        params: { fourftId: fourFtResultId },
        search: (prev) => ({ ...prev, ordering: `-${field}` }),
      });
    }
    // Otherwise start sorting by this field in ascending order
    else {
      navigate({
        params: { fourftId: fourFtResultId },
        search: (prev) => ({ ...prev, ordering: field }),
      });
    }
  };

  const getSortIcon = (field: string) => {
    if (ordering === field) {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    } else if (ordering === `-${field}`) {
      return <ArrowDown className="h-4 w-4 ml-1" />;
    }
    return <ArrowUpDownIcon className="h-4 w-4 ml-1" />;
  };

  return (
    <div className={'grow flex flex-wrap p-8 pt-0'}>
      {rules?.length === 0 && <div className={'text-2xl'}>No rules found!</div>}
      {rules !== undefined && rules.length !== 0 && (
        <Table className="w-full">
          <TableCaption className="caption-top text-left mb-4 mt-0 text-lg text-black">
            Amount of rules: {rules.length}
          </TableCaption>
          <TableHeader>
            <TableRow className="grid grid-cols-9 gap-4">
              <TableHead className="col-span-1">Rule ID</TableHead>
              <TableHead className="col-span-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('base')}
                  className="p-0 h-auto font-semibold flex items-center"
                >
                  Base
                  {getSortIcon('base')}
                </Button>
              </TableHead>
              <TableHead className="col-span-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('rel_base')}
                  className="p-0 h-auto font-semibold flex items-center"
                >
                  Relative base
                  {getSortIcon('rel_base')}
                </Button>
              </TableHead>
              <TableHead className="col-span-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('conf')}
                  className="p-0 h-auto font-semibold flex items-center"
                >
                  Confidence
                  {getSortIcon('conf')}
                </Button>
              </TableHead>
              <TableHead className="col-span-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('aad')}
                  className="p-0 h-auto font-semibold flex items-center"
                >
                  AAD
                  {getSortIcon('aad')}
                </Button>
              </TableHead>
              <TableHead className="col-span-4">Rule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow
                key={rule.rule_id}
                className="grid grid-cols-9 gap-4 cursor-pointer hover:bg-muted/50"
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
                <TableCell className="col-span-4">{rule.rule_text}</TableCell>
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
