import React from 'react';
import { Terminal, BookOpen, Sliders, Activity, CheckCircle2 } from 'lucide-react';
import {
  EngineeringModule,
  ModuleId,
  SimulationFrame,
  WorkbenchParams,
} from '../types/workbench';
import {
  EngineeringCheckbox,
  EngineeringToggle,
  StatusBadge,
} from './TelemetryPrimitives';
import { TimeTravelScrubber } from './TimeTravelScrubber';
import { ModuleVisualizer } from './ModuleVisualizer';
import { PerformanceTelemetryChart } from './PerformanceTelemetryChart';

interface WorkbenchScreenProps {
  modules: EngineeringModule[];
  activeModule: EngineeringModule;
  onSelectModule: (id: ModuleId) => void;
  params: WorkbenchParams;
  onUpdateParams: (patch: Partial<WorkbenchParams>) => void;
  frames: SimulationFrame[];
  currentStep: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  completedModules: ModuleId[];
  onMarkComplete: (id: ModuleId) => void;
}

export const WorkbenchScreen: React.FC<WorkbenchScreenProps> = ({
  modules,
  activeModule,
  onSelectModule,
  params,
  onUpdateParams,
  frames,
  currentStep,
  onStepChange,
  isPlaying,
  onTogglePlay,
  onReset,
  completedModules,
  onMarkComplete,
}) => {
  const [centerTab, setCenterTab] = React.useState<'visual' | 'source'>('visual');
  const [terminalInput, setTerminalInput] = React.useState('');
  const [commandHistory, setCommandHistory] = React.useState<string[]>([]);
  const [topicImgFailed, setTopicImgFailed] = React.useState(false);

  React.useEffect(() => {
    setTopicImgFailed(false);
  }, [activeModule.id]);

  const frame = frames[Math.min(currentStep, frames.length - 1)] ?? frames[0];
  const hasFault = frame.assertions.some((a) => a.severity === 'fault');
  const hasTriage = frame.assertions.some((a) => a.severity === 'triage');
  const overallSeverity = hasFault ? 'fault' : hasTriage ? 'triage' : 'pass';
  const isCompleted = completedModules.includes(activeModule.id);

  // Build visible console log up to current step + user commands
  const traceLines = frames.slice(0, currentStep + 1).map((f) => f.consoleLine);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    let response = '';
    if (cmd === 'step' || cmd === 'next') {
      const next = Math.min(frames.length - 1, currentStep + 1);
      onStepChange(next);
      response = `> step -> Frame ${next + 1}/${frames.length}`;
    } else if (cmd === 'back' || cmd === 'prev') {
      const prev = Math.max(0, currentStep - 1);
      onStepChange(prev);
      response = `> back -> Frame ${prev + 1}/${frames.length}`;
    } else if (cmd === 'run' || cmd === 'play') {
      onTogglePlay();
      response = `> ${isPlaying ? 'paused' : 'running'} simulation`;
    } else if (cmd === 'reset') {
      onReset();
      response = '> reset -> Frame 1';
    } else if (cmd === 'help') {
      response = '> commands: step, back, run, reset, inspect';
    } else if (cmd === 'inspect') {
      response = `> ${frame.registers.map((r) => `${r.name}=${r.value}`).join(' ')}`;
    } else {
      response = `> unknown command '${cmd}' (try: help, step, back, run, reset, inspect)`;
    }

    setCommandHistory((prev) => [...prev.slice(-4), `$ ${cmd}`, response]);
    setTerminalInput('');
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
      {/* 12-column Modular Engineering Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT PANE (3 cols): Concept Navigation & Lab Parameters */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Concept Navigation Card */}
          <section className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-[#00f2fe]" aria-hidden="true" />
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                  Systems Modules
                </h2>
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] tabular-nums">
                {completedModules.length}/{modules.length}
              </span>
            </div>

            <div className="divide-y divide-[#232d3f]">
              {modules.map((mod) => {
                const selected = mod.id === activeModule.id;
                const done = completedModules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => onSelectModule(mod.id)}
                    className={`w-full text-left px-4 py-3 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00f2fe] ${
                      selected
                        ? 'bg-[#1c2433] border-t-2 border-t-[#00f2fe]'
                        : 'hover:bg-[#1c2433]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          selected ? 'text-[#00f2fe]' : 'text-[#94a3b8]'
                        }`}
                      >
                        {mod.index}.
                      </span>
                      {done && (
                        <CheckCircle2
                          className="h-3.5 w-3.5 text-[#10b981] shrink-0"
                          aria-label="Module verified"
                        />
                      )}
                    </div>
                    <div className="mt-0.5 font-display text-sm font-semibold text-[#dfe2ee]">
                      {mod.title}
                    </div>
                    <p className="mt-1 text-xs leading-4 text-[#94a3b8] line-clamp-2">
                      {mod.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mental Model Callout Card */}
          <section className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                Mental Model
              </h2>
              <StatusBadge severity="theory" label="Concept" />
            </div>
            <div className="relative aspect-video w-full overflow-hidden border-b border-[#232d3f] bg-[#0e141f]">
              {!topicImgFailed ? (
                <img
                  src={activeModule.imageUrl}
                  alt={activeModule.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setTopicImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0e141f] to-[#1c2433] font-mono text-xs text-[#94a3b8]">
                  {activeModule.title}
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141a24]/80 via-transparent to-transparent"
              />
            </div>
            <div className="p-4 space-y-2.5">
              <p className="text-[13px] leading-5 text-[#dfe2ee]">
                {activeModule.conceptSummary}
              </p>
              <p className="text-xs leading-5 text-[#b9cacb]">
                {activeModule.mentalModel}
              </p>
            </div>
          </section>

          {/* Parameter Controls Card */}
          <section className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-[#00f2fe]" aria-hidden="true" />
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                  Lab Parameters
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#94a3b8]">LIVE</span>
            </div>

            <div className="p-4 space-y-3">
              {activeModule.id === 'memory-stack' && (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label htmlFor="param-write-size" className="text-[#dfe2ee] font-medium">
                        Payload Write Size
                      </label>
                      <span className="font-mono text-xs text-[#00f2fe] tabular-nums">
                        {params.writeSize} bytes
                      </span>
                    </div>
                    <input
                      id="param-write-size"
                      type="range"
                      min={4}
                      max={24}
                      step={2}
                      value={params.writeSize}
                      onChange={(e) => onUpdateParams({ writeSize: Number(e.target.value) })}
                      className="w-full accent-[#00f2fe] cursor-pointer"
                    />
                    <div className="flex justify-between font-mono text-[10px] text-[#64748b] mt-0.5">
                      <span>4B</span>
                      <span>12B (Cap)</span>
                      <span>24B</span>
                    </div>
                  </div>
                  <div className="border-t border-[#232d3f] pt-2">
                    <EngineeringToggle
                      id="toggle-bounds"
                      label="Enforce Bounds Check"
                      description="Reject writes exceeding buf[12] before copy"
                      checked={params.boundsCheck}
                      onChange={(val) => onUpdateParams({ boundsCheck: val })}
                    />
                    <EngineeringCheckbox
                      id="check-canary"
                      label="Arm Stack Canary (0xCAFEBABE)"
                      description="Detect return pointer tampering on unwind"
                      checked={params.stackCanary}
                      onChange={(val) => onUpdateParams({ stackCanary: val })}
                    />
                  </div>
                </>
              )}

              {activeModule.id === 'cpu-pipeline' && (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label htmlFor="param-clock-rate" className="text-[#dfe2ee] font-medium">
                        Core Clock Frequency
                      </label>
                      <span className="font-mono text-xs text-[#00f2fe] tabular-nums">
                        {params.clockRateGhz.toFixed(1)} GHz
                      </span>
                    </div>
                    <input
                      id="param-clock-rate"
                      type="range"
                      min={1.6}
                      max={4.8}
                      step={0.4}
                      value={params.clockRateGhz}
                      onChange={(e) => onUpdateParams({ clockRateGhz: Number(e.target.value) })}
                      className="w-full accent-[#00f2fe] cursor-pointer"
                    />
                  </div>
                  <div className="border-t border-[#232d3f] pt-2">
                    <EngineeringToggle
                      id="toggle-forwarding"
                      label="EX-to-EX ALU Forwarding"
                      description="Bypass register writeback on RAW hazards"
                      checked={params.forwardingEnabled}
                      onChange={(val) => onUpdateParams({ forwardingEnabled: val })}
                    />
                    <EngineeringCheckbox
                      id="check-bp"
                      label="Dynamic Branch Predictor"
                      description="Speculative fetch across JMP boundaries"
                      checked={params.branchPredict}
                      onChange={(val) => onUpdateParams({ branchPredict: val })}
                    />
                  </div>
                </>
              )}

              {activeModule.id === 'concurrency-mutex' && (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label htmlFor="param-skew" className="text-[#dfe2ee] font-medium">
                        Scheduler Skew Window
                      </label>
                      <span className="font-mono text-xs text-[#00f2fe] tabular-nums">
                        {params.threadSkewMs} ms
                      </span>
                    </div>
                    <input
                      id="param-skew"
                      type="range"
                      min={0}
                      max={30}
                      step={5}
                      value={params.threadSkewMs}
                      onChange={(e) => onUpdateParams({ threadSkewMs: Number(e.target.value) })}
                      className="w-full accent-[#00f2fe] cursor-pointer"
                    />
                  </div>
                  <div className="border-t border-[#232d3f] pt-2">
                    <EngineeringToggle
                      id="toggle-mutex"
                      label="Mutex Critical Section Lock"
                      description="Serialize Thread A and Thread B execution"
                      checked={params.mutexEnabled}
                      onChange={(val) => onUpdateParams({ mutexEnabled: val })}
                    />
                    <EngineeringCheckbox
                      id="check-atomic"
                      label="Hardware Atomic Fetch-Add"
                      description="Execute read-modify-write as single bus cycle"
                      checked={params.atomicOps}
                      onChange={(val) => onUpdateParams({ atomicOps: val })}
                    />
                  </div>
                </>
              )}

              {activeModule.id === 'packet-routing' && (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label htmlFor="param-window" className="text-[#dfe2ee] font-medium">
                        Sliding Window Size
                      </label>
                      <span className="font-mono text-xs text-[#00f2fe] tabular-nums">
                        {params.windowSize} frames
                      </span>
                    </div>
                    <input
                      id="param-window"
                      type="range"
                      min={1}
                      max={6}
                      step={1}
                      value={params.windowSize}
                      onChange={(e) => onUpdateParams({ windowSize: Number(e.target.value) })}
                      className="w-full accent-[#00f2fe] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label htmlFor="param-loss" className="text-[#dfe2ee] font-medium">
                        Simulated Link Loss
                      </label>
                      <span className="font-mono text-xs text-[#00f2fe] tabular-nums">
                        {params.dropRatePct}%
                      </span>
                    </div>
                    <input
                      id="param-loss"
                      type="range"
                      min={0}
                      max={40}
                      step={10}
                      value={params.dropRatePct}
                      onChange={(e) => onUpdateParams({ dropRatePct: Number(e.target.value) })}
                      className="w-full accent-[#00f2fe] cursor-pointer"
                    />
                  </div>
                  <div className="border-t border-[#232d3f] pt-2">
                    <EngineeringToggle
                      id="toggle-fastrtx"
                      label="Fast Retransmit (3x DUP-ACK)"
                      description="Resend dropped segment before 200ms RTO"
                      checked={params.fastRetransmit}
                      onChange={(val) => onUpdateParams({ fastRetransmit: val })}
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </aside>

        {/* CENTER PANE (5 cols): Interactive Systems Workbench & D3 Telemetry */}
        <main className="lg:col-span-5 space-y-5">
          <section className="rounded-[0.25rem] border border-[#232d3f] border-t-2 border-t-[#00f2fe] bg-[#141a24] ct-card-shadow overflow-hidden">
            {/* Top Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-display text-sm font-semibold text-[#dfe2ee] truncate">
                  {activeModule.index}. {activeModule.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <div
                  role="tablist"
                  aria-label="Workbench View"
                  className="inline-flex rounded-[0.25rem] border border-[#232d3f] bg-[#0b0f17] p-0.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={centerTab === 'visual'}
                    onClick={() => setCenterTab('visual')}
                    className={`rounded-[0.125rem] px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      centerTab === 'visual'
                        ? 'bg-[#1c2433] text-[#00f2fe]'
                        : 'text-[#94a3b8] hover:text-[#dfe2ee]'
                    }`}
                  >
                    Visual Model
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={centerTab === 'source'}
                    onClick={() => setCenterTab('source')}
                    className={`rounded-[0.125rem] px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      centerTab === 'source'
                        ? 'bg-[#1c2433] text-[#00f2fe]'
                        : 'text-[#94a3b8] hover:text-[#dfe2ee]'
                    }`}
                  >
                    Source Trace
                  </button>
                </div>
                <StatusBadge severity={overallSeverity} />
              </div>
            </div>

            {/* Workbench Canvas Body */}
            <div className="p-5 space-y-5">
              {centerTab === 'visual' ? (
                <ModuleVisualizer
                  moduleId={activeModule.id}
                  frame={frame}
                  params={params}
                />
              ) : (
                <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-3 overflow-x-auto">
                  <div className="space-y-1 font-mono text-[13px] leading-6">
                    {activeModule.sourceCode.map((line, idx) => {
                      const isActive = idx === frame.activeLine;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 rounded-[0.125rem] px-2 py-0.5 ${
                            isActive
                              ? 'bg-[#00f2fe]/12 text-[#e0fdff] ring-1 ring-[#00f2fe]/40'
                              : 'text-[#b9cacb]'
                          }`}
                        >
                          <span className="w-5 shrink-0 select-none text-right text-[#64748b] tabular-nums">
                            {idx + 1}
                          </span>
                          <pre className="whitespace-pre overflow-x-auto">{line}</pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step Explanation Panel */}
              <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#00f2fe]">
                    Cycle Analysis · {frame.phaseLabel}
                  </span>
                  <span className="font-mono text-[11px] text-[#94a3b8] tabular-nums">
                    Line {frame.activeLine + 1}
                  </span>
                </div>
                <p className="text-[13px] leading-5 text-[#dfe2ee]">{frame.explanation}</p>
              </div>

              {/* Verify / Mark Module Complete CTA when passing final step */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-[#94a3b8]">
                  {overallSeverity === 'pass'
                    ? 'Invariants satisfied for current configuration.'
                    : 'Adjust parameters on the left to resolve invariants.'}
                </span>
                <button
                  type="button"
                  disabled={overallSeverity !== 'pass'}
                  onClick={() => onMarkComplete(activeModule.id)}
                  className={`rounded-[0.25rem] px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                    isCompleted
                      ? 'border-[#10b981]/50 bg-[#10b981]/12 text-[#67f4b7]'
                      : 'border-[#232d3f] bg-[#141a24] text-[#dfe2ee] hover:border-[#38bdf8] hover:text-white'
                  }`}
                >
                  {isCompleted ? 'Module Verified' : 'Verify & Complete'}
                </button>
              </div>
            </div>

            {/* Time-Travel Scrubber Dock */}
            <TimeTravelScrubber
              currentStep={currentStep}
              totalSteps={frames.length}
              timestampNs={frame.timestampNs}
              phaseLabel={frame.phaseLabel}
              isPlaying={isPlaying}
              onStepChange={onStepChange}
              onTogglePlay={onTogglePlay}
              onReset={onReset}
            />
          </section>

          {/* D3.js Resource Utilization & Performance Telemetry Chart */}
          <PerformanceTelemetryChart
            frames={frames}
            currentStep={currentStep}
            metricMeta={activeModule.metricMeta}
            onSelectStep={onStepChange}
          />
        </main>

        {/* RIGHT PANE (4 cols): Live Telemetry, Assertions & Terminal Console */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Registers & State Telemetry */}
          <section className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-[#00f2fe]" aria-hidden="true" />
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                  Register & State Inspector
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#94a3b8] tabular-nums">
                T+{frame.timestampNs}ns
              </span>
            </div>

            <div className="grid grid-cols-2 gap-px bg-[#232d3f]">
              {frame.registers.map((reg) => (
                <div
                  key={reg.name}
                  className={`p-3 transition-colors ${
                    reg.changed ? 'bg-[#1c2433]' : 'bg-[#141a24]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">
                      {reg.name}
                    </span>
                    {reg.changed && (
                      <span className="font-mono text-[9px] uppercase text-[#00f2fe]">
                        DELTA
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-sm font-semibold text-[#e0fdff] tabular-nums">
                    {reg.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Diagnostic Assertions */}
          <section className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                Diagnostic Assertions
              </h2>
              <StatusBadge severity={overallSeverity} />
            </div>

            <div className="divide-y divide-[#232d3f]">
              {frame.assertions.map((assertion) => (
                <div key={assertion.id} className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#dfe2ee]">
                      {assertion.label}
                    </span>
                    <StatusBadge severity={assertion.severity} />
                  </div>
                  <p className="font-mono text-[11px] leading-4 text-[#b9cacb]">
                    {assertion.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Execution Console */}
          <section className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-[#00f2fe]" aria-hidden="true" />
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                  Execution Console
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#94a3b8]">help · step · inspect</span>
            </div>

            <div className="bg-[#0e141f] p-3.5 space-y-2">
              <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px] leading-5">
                {traceLines.map((line, i) => (
                  <div key={`t-${i}`} className="text-[#b9cacb]">
                    {line}
                  </div>
                ))}
                {commandHistory.map((line, i) => (
                  <div
                    key={`c-${i}`}
                    className={line.startsWith('$') ? 'text-[#00f2fe]' : 'text-[#67f4b7]'}
                  >
                    {line}
                  </div>
                ))}
              </div>

              <form onSubmit={handleTerminalSubmit} className="pt-2 border-t border-[#232d3f]">
                <div className="flex items-center gap-2 rounded-[0.25rem] border border-[#232d3f] bg-[#0b0f17] px-2.5 py-1.5 focus-within:border-[#00f2fe] focus-within:shadow-[0_0_12px_-2px_rgba(0,242,254,0.25)]">
                  <span className="font-mono text-xs text-[#00f2fe]" aria-hidden="true">
                    &gt;
                  </span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type command (step, back, run, inspect)..."
                    aria-label="Execution console command"
                    className="w-full bg-transparent font-mono text-xs text-[#dfe2ee] placeholder-[#475569] focus:outline-none"
                  />
                </div>
              </form>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
