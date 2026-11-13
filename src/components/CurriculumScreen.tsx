import React from 'react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { EngineeringModule, ModuleId } from '../types/workbench';
import { StatusBadge } from './TelemetryPrimitives';

interface CurriculumScreenProps {
  modules: EngineeringModule[];
  completedModules: ModuleId[];
  onLaunchModule: (id: ModuleId) => void;
}

export const CurriculumScreen: React.FC<CurriculumScreenProps> = ({
  modules,
  completedModules,
  onLaunchModule,
}) => {
  const pct = Math.round((completedModules.length / modules.length) * 100);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#232d3f] pb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#dfe2ee]">
            Step-by-Step Learning Path
          </h1>
          <p className="mt-1 text-sm text-[#b9cacb] max-w-2xl">
            Follow these four topics in order to learn how software really runs on a computer—starting from memory boxes up to network packets.
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#94a3b8]">Your Progress</span>
            <span className="text-[#00f2fe] tabular-nums">
              {completedModules.length}/{modules.length} ({pct}%)
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#1e293b] overflow-hidden">
            <div
              className="h-full bg-[#00f2fe] transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step-wise vertical/grid progression */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {modules.map((mod) => {
          const done = completedModules.includes(mod.id);
          return (
            <article
              key={mod.id}
              className={`rounded-[0.25rem] border bg-[#141a24] ct-card-shadow overflow-hidden transition-colors hover:border-[#334155] ${
                done ? 'border-[#10b981]/50' : 'border-[#232d3f]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-5 py-3">
                <span className="font-mono text-xs font-semibold text-[#00f2fe]">
                  {mod.index} of {modules.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#94a3b8] tabular-nums">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {mod.estimatedMinutes} min
                  </span>
                  {done ? (
                    <StatusBadge severity="pass" label="Completed" />
                  ) : (
                    <StatusBadge severity="theory" label="Hands-On Lab" />
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#dfe2ee]">
                    {mod.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#b9cacb]">
                    {mod.conceptSummary}
                  </p>
                </div>

                {/* Ordered step-wise topic breakdown */}
                <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-3.5 space-y-1.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8]">
                    What You Will Practice Step-by-Step
                  </div>
                  <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#dfe2ee]">
                    {mod.topics.map((topic) => (
                      <li key={topic} className="font-mono text-[11px] text-[#b9cacb]">
                        {topic}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#232d3f]">
                  <span className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                    {done ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" aria-hidden="true" />
                        <span className="text-[#67f4b7]">Completed in workbench</span>
                      </>
                    ) : (
                      <span>Try it step-by-step</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLaunchModule(mod.id)}
                    className="inline-flex items-center gap-1.5 rounded-[0.25rem] bg-[#00f2fe] px-3.5 py-2 text-xs font-semibold text-[#0b0f17] transition-all ct-btn-cyan-hover hover:bg-[#6ff6ff] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Start {mod.index}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
