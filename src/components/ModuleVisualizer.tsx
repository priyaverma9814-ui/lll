import React from 'react';
import { ArrowRight, Lock, Unlock, ShieldCheck, AlertOctagon, Cpu, Network } from 'lucide-react';
import { ModuleId, SimulationFrame, WorkbenchParams } from '../types/workbench';

interface ModuleVisualizerProps {
  moduleId: ModuleId;
  frame: SimulationFrame;
  params: WorkbenchParams;
}

export const ModuleVisualizer: React.FC<ModuleVisualizerProps> = ({
  moduleId,
  frame,
  params,
}) => {
  if (moduleId === 'memory-stack' && frame.memoryCells) {
    const overflow = !params.boundsCheck && params.writeSize > 12;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#94a3b8]">
          <span>Function Memory Layout (Top to Bottom)</span>
          <span className="font-mono text-[11px] text-[#00f2fe]">
            Input: {params.writeSize} B / Box Limit: 12 B
          </span>
        </div>

        <div className="space-y-1.5">
          {frame.memoryCells.map((cell) => {
            const stateStyles =
              cell.state === 'corrupted'
                ? 'border-[#f43f5e] bg-[#f43f5e]/12 text-[#fda4af]'
                : cell.state === 'active'
                  ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-[#e0fdff] ct-cyan-glow'
                  : cell.state === 'protected'
                    ? 'border-[#10b981]/60 bg-[#10b981]/10 text-[#67f4b7]'
                    : 'border-[#232d3f] bg-[#0e141f] text-[#dfe2ee]';

            return (
              <div
                key={cell.address}
                className={`flex items-center justify-between rounded-[0.25rem] border px-3 py-2 transition-colors duration-150 ${stateStyles}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[11px] text-[#94a3b8] w-14 shrink-0">
                    {cell.address}
                  </span>
                  <span className="font-mono text-xs font-semibold truncate">
                    {cell.label}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono text-xs tracking-tight">{cell.hex}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] opacity-80 w-20 text-right">
                    {cell.state === 'corrupted'
                      ? 'BROKEN'
                      : cell.state === 'protected'
                        ? 'PROTECTED'
                        : cell.state === 'active'
                          ? 'WRITING'
                          : cell.region === 'control'
                            ? 'CONTROL'
                            : cell.region === 'canary'
                              ? 'GUARD'
                              : 'LOCAL'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-[0.25rem] border border-[#232d3f] bg-[#101622] px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            {overflow ? (
              <AlertOctagon className="h-4 w-4 text-[#f43f5e]" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-[#10b981]" aria-hidden="true" />
            )}
            <span className="text-[#b9cacb]">
              {overflow
                ? `Copying ${params.writeSize}B spills +${params.writeSize - 12}B upward into nearby memory.`
                : 'Copied bytes stay neatly inside the 12-byte local box.'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#94a3b8]">↑ Fills Upward</span>
        </div>
      </div>
    );
  }

  if (moduleId === 'cpu-pipeline' && frame.pipelineStages) {
    const STAGE_NAMES: Record<string, string> = {
      IF: '1. Fetch',
      ID: '2. Decode',
      EX: '3. Execute',
      MEM: '4. Memory',
      WB: '5. Save',
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#94a3b8]">
          <span>5-Step CPU Assembly Line</span>
          <span className="font-mono text-[11px] text-[#00f2fe]">
            Speed: {params.clockRateGhz.toFixed(1)} GHz · Fast Pass:{' '}
            {params.forwardingEnabled ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {frame.pipelineStages.map((s) => {
            const boxStyle =
              s.status === 'forwarded'
                ? 'border-[#00f2fe] bg-[#00f2fe]/12 text-[#e0fdff] ct-cyan-glow'
                : s.status === 'stall'
                  ? 'border-[#f59e0b] bg-[#f59e0b]/12 text-[#fbbf24] ct-triage-glow'
                  : s.status === 'active'
                    ? 'border-[#38bdf8]/60 bg-[#1c2433] text-[#dfe2ee]'
                    : 'border-[#232d3f] bg-[#0e141f] text-[#64748b]';

            return (
              <div
                key={s.stage}
                className={`flex flex-col justify-between rounded-[0.25rem] border p-2.5 min-h-[96px] transition-colors ${boxStyle}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] font-bold tracking-[0.04em]">
                    {STAGE_NAMES[s.stage] ?? s.stage}
                  </span>
                  <Cpu className="h-3 w-3 opacity-70 shrink-0" aria-hidden="true" />
                </div>
                <div className="mt-2 font-mono text-[11px] leading-4 break-words">
                  {s.instruction}
                </div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.06em] opacity-80">
                  {s.status === 'forwarded'
                    ? 'fast pass'
                    : s.status === 'stall'
                      ? 'waiting'
                      : s.status}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fast Pass Shortcut Diagram */}
        <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-3">
          <svg
            viewBox="0 0 460 54"
            className="w-full h-12"
            role="img"
            aria-label="Fast Pass Shortcut Wire"
          >
            <line
              x1="40"
              y1="26"
              x2="420"
              y2="26"
              stroke="#232d3f"
              strokeWidth="2"
            />
            <path
              d="M 275 26 C 275 6, 185 6, 185 26"
              fill="none"
              stroke={frame.forwardingActive ? '#00f2fe' : '#334155'}
              strokeWidth={frame.forwardingActive ? '2.5' : '1.5'}
              strokeDasharray={frame.forwardingActive ? undefined : '4 4'}
            />
            {frame.forwardingActive && (
              <circle cx="230" cy="11" r="4" fill="#00f2fe" />
            )}
            <text
              x="230"
              y="46"
              textAnchor="middle"
              fill={frame.forwardingActive ? '#00f2fe' : '#94a3b8'}
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
            >
              {frame.forwardingActive
                ? 'FAST PASS ACTIVE: R1 SENT EARLY TO SUB (0 WAIT CYCLES)'
                : params.forwardingEnabled
                  ? 'FAST PASS READY (WATCHING FOR DEPENDENCIES)'
                  : 'FAST PASS OFF — SUB MUST WAIT FOR ADD TO SAVE R1'}
            </text>
          </svg>
        </div>
      </div>
    );
  }

  if (moduleId === 'concurrency-mutex' && frame.threadActions) {
    const guarded = params.mutexEnabled || params.atomicOps;
    const expectedMismatch = frame.sharedBalance === 70;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#94a3b8]">
          <span>Two Threads Updating One Number</span>
          <span className="font-mono text-[11px] text-[#00f2fe]">
            Protection:{' '}
            {params.atomicOps ? 'Atomic Step' : params.mutexEnabled ? 'Turn-Taking Lock' : 'None'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {frame.threadActions.map((t) => {
            const style =
              t.status === 'race'
                ? 'border-[#f43f5e] bg-[#f43f5e]/10 text-[#fda4af]'
                : t.status === 'locked'
                  ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-[#e0fdff] ct-cyan-glow'
                  : t.status === 'waiting'
                    ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#fbbf24]'
                    : t.status === 'done'
                      ? 'border-[#10b981]/60 bg-[#10b981]/10 text-[#67f4b7]'
                      : 'border-[#232d3f] bg-[#0e141f] text-[#dfe2ee]';

            return (
              <div
                key={t.thread}
                className={`rounded-[0.25rem] border p-3 transition-colors ${style}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold">{t.thread}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em]">
                    {t.status === 'race' ? 'CLASHING' : t.status}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs">{t.operation}</p>
                <p className="mt-1 font-mono text-[11px] opacity-80">
                  Own Note: {t.localValue}
                </p>
              </div>
            );
          })}
        </div>

        {/* Shared Balance */}
        <div
          className={`flex items-center justify-between rounded-[0.25rem] border p-3.5 ${
            expectedMismatch
              ? 'border-[#f43f5e] bg-[#f43f5e]/10'
              : guarded
                ? 'border-[#10b981]/60 bg-[#10b981]/10'
                : 'border-[#232d3f] bg-[#0e141f]'
          }`}
        >
          <div className="flex items-center gap-3">
            {guarded ? (
              <Lock className="h-4 w-4 text-[#00f2fe]" aria-hidden="true" />
            ) : (
              <Unlock className="h-4 w-4 text-[#f43f5e]" aria-hidden="true" />
            )}
            <div>
              <div className="font-mono text-xs font-semibold text-[#dfe2ee]">
                Shared Balance
              </div>
              <div className="text-[11px] text-[#94a3b8]">
                Expected math: 100 + 50 - 30 = 120
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`font-mono text-xl font-bold tabular-nums ${
                expectedMismatch
                  ? 'text-[#fda4af]'
                  : frame.sharedBalance === 120
                    ? 'text-[#67f4b7]'
                    : 'text-[#e0fdff]'
              }`}
            >
              {frame.sharedBalance}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8]">
              {expectedMismatch
                ? 'UPDATE LOST'
                : frame.sharedBalance === 120
                  ? 'CORRECT'
                  : 'IN PROGRESS'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (moduleId === 'packet-routing' && frame.packets) {
    const STATE_LABELS: Record<string, string> = {
      queued: 'waiting',
      'in-flight': 'sending',
      acked: 'confirmed',
      dropped: 'lost',
      retransmitted: 'resent',
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#94a3b8]">
          <span>Packet Batch (Send {params.windowSize} at once)</span>
          <span className="font-mono text-[11px] text-[#00f2fe] tabular-nums">
            Speed: {frame.throughputMbps ?? 0} Mbps
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {frame.packets.map((pkt) => {
            const pktStyle =
              pkt.state === 'acked'
                ? 'border-[#10b981]/60 bg-[#10b981]/12 text-[#67f4b7]'
                : pkt.state === 'dropped'
                  ? 'border-[#f43f5e] bg-[#f43f5e]/12 text-[#fda4af]'
                  : pkt.state === 'retransmitted'
                    ? 'border-[#f59e0b] bg-[#f59e0b]/12 text-[#fbbf24]'
                    : pkt.state === 'in-flight'
                      ? 'border-[#00f2fe] bg-[#00f2fe]/12 text-[#e0fdff] ct-cyan-glow'
                      : 'border-[#232d3f] bg-[#0e141f] text-[#94a3b8]';

            return (
              <div
                key={pkt.seq}
                className={`rounded-[0.25rem] border p-2.5 text-center transition-colors ${pktStyle}`}
              >
                <div className="font-mono text-xs font-bold">#{pkt.seq}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.06em]">
                  {STATE_LABELS[pkt.state] ?? pkt.state}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-[#b9cacb]">
            <Network className="h-4 w-4 text-[#00f2fe]" aria-hidden="true" />
            <span>Sender</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#64748b]" aria-hidden="true" />
            <span>Network ({params.dropRatePct}% loss)</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#64748b]" aria-hidden="true" />
            <span>Receiver</span>
          </div>
          <span className="font-mono text-[11px] text-[#94a3b8]">
            {params.fastRetransmit ? 'Quick Resend On' : '200ms Wait'}
          </span>
        </div>
      </div>
    );
  }

  return null;
};
