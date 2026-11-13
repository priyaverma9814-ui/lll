import React from 'react';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { TriageChallenge, WorkbenchParams } from '../types/workbench';
import { StatusBadge, EngineeringToggle, EngineeringCheckbox } from './TelemetryPrimitives';

interface ChallengesScreenProps {
  challenges: TriageChallenge[];
  solvedChallenges: string[];
  onSolveChallenge: (challengeId: string) => void;
  onLaunchInWorkbench: (challenge: TriageChallenge) => void;
  baseParams: WorkbenchParams;
}

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({
  challenges,
  solvedChallenges,
  onSolveChallenge,
  onLaunchInWorkbench,
  baseParams,
}) => {
  const [selectedId, setSelectedId] = React.useState<string>(challenges[0].id);
  const [localParamsByChallenge, setLocalParamsByChallenge] = React.useState<
    Record<string, WorkbenchParams>
  >(() => {
    const initial: Record<string, WorkbenchParams> = {};
    for (const c of challenges) {
      initial[c.id] = { ...baseParams, ...c.initialParams };
    }
    return initial;
  });

  const activeChallenge =
    challenges.find((c) => c.id === selectedId) ?? challenges[0];
  const currentParams = localParamsByChallenge[activeChallenge.id];
  const verification = activeChallenge.verify(currentParams);
  const isSolved = solvedChallenges.includes(activeChallenge.id);

  const patchLocal = (patch: Partial<WorkbenchParams>) => {
    setLocalParamsByChallenge((prev) => ({
      ...prev,
      [activeChallenge.id]: {
        ...prev[activeChallenge.id],
        ...patch,
      },
    }));
  };

  const resetChallenge = () => {
    setLocalParamsByChallenge((prev) => ({
      ...prev,
      [activeChallenge.id]: { ...baseParams, ...activeChallenge.initialParams },
    }));
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#232d3f] pb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#dfe2ee]">
            Step-by-Step Fix-It Challenges
          </h1>
          <p className="mt-1 text-sm text-[#b9cacb] max-w-2xl">
            Each lab has a broken setting. Read what went wrong, switch on the right safety fix, and verify all checks turn green.
          </p>
        </div>
        <div className="font-mono text-xs text-[#00f2fe] tabular-nums">
          Solved: {solvedChallenges.length} / {challenges.length} Labs
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <aside className="lg:col-span-4 rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
          <div className="border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
              Pick a Challenge
            </h2>
          </div>
          <div className="divide-y divide-[#232d3f]">
            {challenges.map((ch) => {
              const selected = ch.id === activeChallenge.id;
              const solved = solvedChallenges.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedId(ch.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00f2fe] ${
                    selected
                      ? 'bg-[#1c2433] border-t-2 border-t-[#00f2fe]'
                      : 'hover:bg-[#1c2433]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#94a3b8]">
                      {ch.index}
                    </span>
                    {solved ? (
                      <StatusBadge severity="pass" label="Solved" />
                    ) : (
                      <StatusBadge severity={ch.severity} />
                    )}
                  </div>
                  <div className="mt-1.5 font-display text-sm font-semibold text-[#dfe2ee]">
                    {ch.title}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="lg:col-span-8 rounded-[0.25rem] border border-[#232d3f] border-t-2 border-t-[#00f2fe] bg-[#141a24] ct-card-shadow overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232d3f] bg-[#101622] px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-[#00f2fe]">
                {activeChallenge.index}
              </span>
              <h2 className="font-display text-base font-semibold text-[#dfe2ee]">
                {activeChallenge.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetChallenge}
                className="inline-flex items-center gap-1.5 rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] px-3 py-1.5 text-xs font-medium text-[#b9cacb] hover:border-[#38bdf8] hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Problem</span>
              </button>
              <button
                type="button"
                onClick={() => onLaunchInWorkbench(activeChallenge)}
                className="inline-flex items-center gap-1.5 rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] px-3 py-1.5 text-xs font-medium text-[#dfe2ee] hover:border-[#38bdf8] hover:text-white cursor-pointer"
              >
                <span>See Step-by-Step in Workbench</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-4">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#fda4af]">
                  Step 1 · What Is Broken
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-[#dfe2ee]">
                  {activeChallenge.symptom}
                </p>
              </div>
              <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-4">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#d0bcff]">
                  Step 2 · Hint on How to Fix It
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-[#b9cacb]">
                  {activeChallenge.rootCauseHint}
                </p>
              </div>
            </div>

            <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-4 space-y-3">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#00f2fe]">
                Step 3 · Apply Your Fix
              </div>

              {activeChallenge.moduleId === 'memory-stack' && (
                <div className="space-y-2">
                  <EngineeringToggle
                    id="ch-bounds"
                    label="Check Size Before Copying"
                    description="Block inputs larger than 12 bytes before copying"
                    checked={currentParams.boundsCheck}
                    onChange={(v) => patchLocal({ boundsCheck: v })}
                  />
                  <EngineeringCheckbox
                    id="ch-canary"
                    label="Add Safety Marker"
                    description="Watch the return address for accidental overwrites"
                    checked={currentParams.stackCanary}
                    onChange={(v) => patchLocal({ stackCanary: v })}
                  />
                </div>
              )}

              {activeChallenge.moduleId === 'cpu-pipeline' && (
                <div className="space-y-2">
                  <EngineeringToggle
                    id="ch-fwd"
                    label="Turn On Fast Pass Shortcut"
                    description="Send R1 directly from ADD to SUB without pausing"
                    checked={currentParams.forwardingEnabled}
                    onChange={(v) => patchLocal({ forwardingEnabled: v })}
                  />
                  <EngineeringCheckbox
                    id="ch-bp"
                    label="Turn On Branch Prediction"
                    description="Keep instructions flowing smoothly across jumps"
                    checked={currentParams.branchPredict}
                    onChange={(v) => patchLocal({ branchPredict: v })}
                  />
                </div>
              )}

              {activeChallenge.moduleId === 'concurrency-mutex' && (
                <div className="space-y-2">
                  <EngineeringToggle
                    id="ch-mutex"
                    label="Turn On Turn-Taking Lock"
                    description="Let Thread A finish before Thread B reads the balance"
                    checked={currentParams.mutexEnabled}
                    onChange={(v) => patchLocal({ mutexEnabled: v })}
                  />
                  <EngineeringCheckbox
                    id="ch-atomic"
                    label="Use Single-Step Atomic Update"
                    description="Or perform each update in one unbreakable step"
                    checked={currentParams.atomicOps}
                    onChange={(v) => patchLocal({ atomicOps: v })}
                  />
                </div>
              )}

              {activeChallenge.moduleId === 'packet-routing' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor="ch-win" className="text-[#dfe2ee] font-medium">
                        Packets Sent Together (Batch Size)
                      </label>
                      <span className="font-mono text-[#00f2fe] tabular-nums">
                        {currentParams.windowSize} packets
                      </span>
                    </div>
                    <input
                      id="ch-win"
                      type="range"
                      min={1}
                      max={6}
                      step={1}
                      value={currentParams.windowSize}
                      onChange={(e) => patchLocal({ windowSize: Number(e.target.value) })}
                      className="w-full accent-[#00f2fe] cursor-pointer"
                    />
                  </div>
                  <EngineeringToggle
                    id="ch-rtx"
                    label="Turn On Quick Resend"
                    description="Resend missing packet right away instead of waiting 200ms"
                    checked={currentParams.fastRetransmit}
                    onChange={(v) => patchLocal({ fastRetransmit: v })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                  Step 4 · Live Checks
                </h3>
                <StatusBadge
                  severity={verification.passed ? 'pass' : 'fault'}
                  label={verification.passed ? 'Everything Fixed' : 'Still Broken'}
                />
              </div>

              <div className="divide-y divide-[#232d3f] rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f]">
                {verification.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[#dfe2ee]">
                        {chk.label}
                      </div>
                      <div className="text-xs text-[#94a3b8]">
                        {chk.detail}
                      </div>
                    </div>
                    <StatusBadge severity={chk.severity} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={!verification.passed}
                onClick={() => onSolveChallenge(activeChallenge.id)}
                className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[#00f2fe] px-4 py-2 text-xs font-semibold text-[#0b0f17] transition-all ct-btn-cyan-hover hover:bg-[#6ff6ff] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isSolved ? 'Challenge Solved' : 'Save Solved Lab'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
