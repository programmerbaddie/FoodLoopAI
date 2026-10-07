import React from 'react';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { NavTabId } from '../../types';

interface StageLink {
  id?: NavTabId;
  tab?: NavTabId;
  label: string;
}

interface WorkflowContextBarProps {
  currentStage: string;
  stageNumber?: string;
  purpose: string;
  previousStage?: StageLink;
  prev?: StageLink;
  nextStage?: StageLink;
  next?: StageLink;
  onNavigateTab?: (tab: NavTabId) => void;
  onNavigate?: (tab: NavTabId) => void;
}

export const WorkflowContextBar: React.FC<WorkflowContextBarProps> = ({
  currentStage,
  stageNumber,
  purpose,
  previousStage,
  prev,
  nextStage,
  next,
  onNavigateTab,
  onNavigate,
}) => {
  const navigateFn = onNavigateTab || onNavigate || (() => {});
  const effectivePrev = previousStage || prev;
  const effectiveNext = nextStage || next;
  const prevTabId = effectivePrev?.id || effectivePrev?.tab;
  const nextTabId = effectiveNext?.id || effectiveNext?.tab;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 sm:p-4 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold shrink-0">
          <Compass className="w-4 h-4 text-foodloop-green" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            {stageNumber && (
              <>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foodloop-green dark:text-emerald-400">
                  {stageNumber}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
              </>
            )}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentStage}
            </span>
          </div>
          <p className="text-foodloop-textMuted dark:text-foodloop-textMutedDark mt-0.5 leading-relaxed">
            {purpose}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700 w-full md:w-auto justify-between md:justify-end">
        {effectivePrev && prevTabId ? (
          <button
            onClick={() => navigateFn(prevTabId)}
            className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-foodloop-navy dark:hover:text-white px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Previous: {effectivePrev.label}</span>
          </button>
        ) : (
          <div />
        )}

        {effectiveNext && nextTabId && (
          <button
            onClick={() => navigateFn(nextTabId)}
            className="flex items-center gap-1 text-[11px] font-semibold text-foodloop-green dark:text-emerald-400 hover:underline px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <span>Next: {effectiveNext.label}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
