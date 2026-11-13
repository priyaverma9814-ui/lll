import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface TimeTravelScrubberProps {
  currentStep: number;
  totalSteps: number;
  timestampNs: number;
  phaseLabel: string;
  isPlaying: boolean;
  onStepChange: (step: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const TimeTravelScrubber: React.FC<TimeTravelScrubberProps> = ({
  currentStep,
  totalSteps,
  timestampNs,
  phaseLabel,
  isPlaying,
  onStepChange,
  onTogglePlay,
  onReset,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(1, totalSteps - 1);
  const pct = totalSteps > 1 ? (currentStep / maxIndex) * 100 : 0;

  const updateFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || totalSteps <= 1) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const nextStep = Math.round(ratio * maxIndex);
    onStepChange(nextStep);
  };

  React.useEffect(() => {
    if (!isDragging) return;
    const handlePointerMove = (e: PointerEvent) => {
      updateFromClientX(e.clientX);
    };
    const handlePointerUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  });

  return (
    <div className="border-t border-[#232d3f] bg-[#101622] px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#00f2fe]">
            Frame {currentStep + 1}/{totalSteps}
          </span>
          <span className="text-[#3a494b]" aria-hidden="true">·</span>
          <span className="font-mono text-[11px] text-[#b9cacb] tabular-nums">
            T+{timestampNs}ns
          </span>
          <span className="hidden sm:inline text-[#3a494b]" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-xs font-medium text-[#dfe2ee] truncate max-w-[220px]">
            {phaseLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset simulation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] text-[#b9cacb] transition-colors hover:border-[#38bdf8] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            aria-label="Step backward"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] text-[#b9cacb] transition-colors hover:border-[#38bdf8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            className="inline-flex h-8 items-center gap-1.5 rounded-[0.25rem] bg-[#00f2fe] px-3 text-xs font-semibold text-[#0b0f17] transition-all ct-btn-cyan-hover hover:bg-[#6ff6ff] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => onStepChange(Math.min(maxIndex, currentStep + 1))}
            disabled={currentStep >= maxIndex}
            aria-label="Step forward"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] text-[#b9cacb] transition-colors hover:border-[#38bdf8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Scrubber Track */}
      <div className="relative py-2.5">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Time-travel execution frame"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep + 1}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              onStepChange(Math.min(maxIndex, currentStep + 1));
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onStepChange(Math.max(0, currentStep - 1));
            }
          }}
          onPointerDown={(e) => {
            setIsDragging(true);
            updateFromClientX(e.clientX);
          }}
          className="relative h-1 w-full rounded-full bg-[#1e293b] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]"
        >
          {/* Active Cyan Rail */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#00f2fe] transition-all duration-150"
            style={{ width: `${pct}%` }}
          />

          {/* Step Tick Marks */}
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-0.5 rounded-full ${
                  idx <= currentStep ? 'bg-[#00f2fe]' : 'bg-[#334155]'
                }`}
              />
            ))}
          </div>

          {/* 14x14 Diamond / Squared Thumb */}
          <div
            className="group absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150"
            style={{ left: `${pct}%` }}
          >
            <div
              className={`h-[14px] w-[14px] rotate-45 rounded-[2px] bg-[#00f2fe] border border-[#e0fdff] transition-transform ${
                isDragging
                  ? 'scale-110 shadow-[0_0_14px_rgba(0,242,254,0.95)]'
                  : 'shadow-[0_0_10px_rgba(0,242,254,0.7)]'
              }`}
            />
            {isDragging && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-[0.25rem] border border-[#00f2fe]/50 bg-[#0b0f17] px-2 py-0.5 font-mono text-[11px] text-[#e0fdff] whitespace-nowrap shadow-lg">
                F{currentStep + 1} · {timestampNs}ns
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
