import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Cpu } from 'lucide-react';
import { EngineeringModule, ModuleId } from '../types/workbench';
import { StatusBadge } from './TelemetryPrimitives';

interface CurriculumScreenProps {
  modules: EngineeringModule[];
  completedModules: ModuleId[];
  onLaunchModule: (id: ModuleId) => void;
}

const TopicMediaPreview: React.FC<{ mod: EngineeringModule }> = ({ mod }) => {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden border-b border-[#232d3f] bg-[#0e141f]">
      {!failed ? (
        <img
          src={mod.imageUrl}
          alt={mod.imageAlt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0e141f] via-[#141a24] to-[#1c2433] p-4 text-center">
          <Cpu className="h-6 w-6 text-[#00f2fe]" aria-hidden="true" />
          <span className="font-mono text-xs text-[#b9cacb]">{mod.title}</span>
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141a24]/85 via-transparent to-transparent"
      />
    </div>
  );
};

export const CurriculumScreen: React.FC<CurriculumScreenProps> = ({
  modules,
  completedModules,
  onLaunchModule,
}) => {
  const pct = Math.round((completedModules.length / modules.length) * 100);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 space-y-6">
      {/* Header & Progress Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#232d3f] pb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#dfe2ee]">
            Zero-to-One Systems Curriculum
          </h1>
          <p className="mt-1 text-sm text-[#b9cacb] max-w-2xl">
            Transition from high-level syntax memorization to first-principles mastery of memory layout, CPU pipelines, concurrency, and network flow.
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#94a3b8]">Track Progress</span>
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

      {/* Module Grid */}
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
              {/* Card Top Metadata Bar */}
              <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-5 py-3">
                <span className="font-mono text-xs font-semibold text-[#00f2fe]">
                  Module {mod.index}
                </span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#94a3b8] tabular-nums">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {mod.estimatedMinutes} min
                  </span>
                  {done ? (
                    <StatusBadge severity="pass" label="Verified" />
                  ) : (
                    <StatusBadge severity="theory" label="Interactive Lab" />
                  )}
                </div>
              </div>

              {/* Topic Example Picture */}
              <TopicMediaPreview mod={mod} />

              <div className="p-5 space-y-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#dfe2ee]">
                    {mod.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#b9cacb]">
                    {mod.conceptSummary}
                  </p>
                </div>

                {/* Unboxed clean metadata topics */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-[#94a3b8]">
                  {mod.topics.map((topic, idx) => (
                    <React.Fragment key={topic}>
                      <span>{topic}</span>
                      {idx < mod.topics.length - 1 && (
                        <span className="text-[#3a494b]" aria-hidden="true">
                          ·
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#232d3f]">
                  <span className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                    {done ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" aria-hidden="true" />
                        <span className="text-[#67f4b7]">Invariants verified in workbench</span>
                      </>
                    ) : (
                      <span>Inspect cycles &amp; run assertions</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLaunchModule(mod.id)}
                    className="inline-flex items-center gap-1.5 rounded-[0.25rem] bg-[#00f2fe] px-3.5 py-2 text-xs font-semibold text-[#0b0f17] transition-all ct-btn-cyan-hover hover:bg-[#6ff6ff] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Launch Lab</span>
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
