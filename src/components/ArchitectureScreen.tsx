import React from 'react';
import { Cpu, HardDrive, Network, Layers, Database, ArrowRight } from 'lucide-react';
import { StatusBadge } from './TelemetryPrimitives';

type NodeKey = 'core' | 'l1cache' | 'l2cache' | 'dram' | 'nvme' | 'nic';

interface TopologyNode {
  id: NodeKey;
  stepLabel: string;
  title: string;
  tier: string;
  baseLatencyNs: number;
  bandwidthGBs: number;
  role: string;
  failureMode: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TOPOLOGY_NODES: TopologyNode[] = [
  {
    id: 'core',
    stepLabel: 'Step 1',
    title: 'CPU Core',
    tier: 'Fastest · Inside Processor',
    baseLatencyNs: 0.3,
    bandwidthGBs: 420,
    role: 'Does the actual math and logic right away using tiny built-in storage called registers.',
    failureMode: 'Pauses and wastes time whenever it has to wait for slower memory.',
    Icon: Cpu,
  },
  {
    id: 'l1cache',
    stepLabel: 'Step 2',
    title: 'L1 Fast Cache',
    tier: '32 KB · Closest Helper',
    baseLatencyNs: 1.2,
    bandwidthGBs: 280,
    role: 'Keeps the most recent data right next to the CPU so it can be grabbed in ~1 nanosecond.',
    failureMode: 'When two CPU cores edit nearby data, they keep invalidating each other’s cache.',
    Icon: Layers,
  },
  {
    id: 'l2cache',
    stepLabel: 'Step 3',
    title: 'L2 Backup Cache',
    tier: '512 KB · Second Helper',
    baseLatencyNs: 4.5,
    bandwidthGBs: 140,
    role: 'Catches data that did not fit in L1 so the CPU avoids making a slow trip to main memory.',
    failureMode: 'Huge scans of one-time data can push useful items out of L2.',
    Icon: Layers,
  },
  {
    id: 'dram',
    stepLabel: 'Step 4',
    title: 'Main Memory (RAM)',
    tier: 'System RAM · Working Space',
    baseLatencyNs: 72,
    bandwidthGBs: 64,
    role: 'Holds your running programs, variables, and function stack frames.',
    failureMode: 'Heavy traffic on the memory bus slows down every program waiting for RAM.',
    Icon: Database,
  },
  {
    id: 'nvme',
    stepLabel: 'Step 5',
    title: 'SSD Drive (NVMe)',
    tier: 'Long-Term File Storage',
    baseLatencyNs: 18000,
    bandwidthGBs: 7.2,
    role: 'Saves files permanently even when power turns off.',
    failureMode: 'Saving too many files at once fills up the drive queue and stalls callers.',
    Icon: HardDrive,
  },
  {
    id: 'nic',
    stepLabel: 'Step 6',
    title: 'Network Card',
    tier: 'Internet & LAN Link',
    baseLatencyNs: 4200,
    bandwidthGBs: 3.1,
    role: 'Sends and receives data packets over Ethernet or Wi-Fi into memory buffers.',
    failureMode: 'If incoming packets arrive faster than memory drains them, packets get dropped.',
    Icon: Network,
  },
];

interface ArchitectureScreenProps {
  onOpenWorkbench: () => void;
}

export const ArchitectureScreen: React.FC<ArchitectureScreenProps> = ({
  onOpenWorkbench,
}) => {
  const [selectedNodeId, setSelectedNodeId] = React.useState<NodeKey>('l1cache');
  const [l1HitPct, setL1HitPct] = React.useState<number>(92);
  const [l2HitPct, setL2HitPct] = React.useState<number>(75);
  const [dmaLoadPct, setDmaLoadPct] = React.useState<number>(35);

  const selectedNode =
    TOPOLOGY_NODES.find((n) => n.id === selectedNodeId) ?? TOPOLOGY_NODES[0];

  const l1MissRate = (100 - l1HitPct) / 100;
  const l2MissRate = (100 - l2HitPct) / 100;
  const dramPenalty = 72 * (1 + dmaLoadPct / 100);
  const ematNs = Number(
    (1.2 + l1MissRate * (4.5 + l2MissRate * dramPenalty)).toFixed(2)
  );
  const busSaturationPct = Math.min(
    99,
    Math.round(dmaLoadPct * 0.75 + l1MissRate * l2MissRate * 160)
  );

  const busSeverity =
    busSaturationPct >= 80 ? 'fault' : busSaturationPct >= 55 ? 'triage' : 'pass';

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#232d3f] pb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#dfe2ee]">
            How Data Moves Inside a Computer
          </h1>
          <p className="mt-1 text-sm text-[#b9cacb] max-w-2xl">
            Follow data step-by-step from the CPU Core out to caches, main memory, and disk. Click any part below to see how it works.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            severity={busSeverity}
            label={
              busSeverity === 'fault'
                ? 'Traffic Jam'
                : busSeverity === 'triage'
                  ? 'Busy Bus'
                  : 'Smooth Flow'
            }
          />
          <button
            type="button"
            onClick={onOpenWorkbench}
            className="inline-flex items-center gap-1.5 rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] px-3.5 py-2 text-xs font-medium text-[#dfe2ee] transition-colors hover:border-[#38bdf8] hover:text-white cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Open Workbench</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <section className="lg:col-span-8 rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
              Step-by-Step Memory Path (Fastest → Slowest)
            </h2>
            <span className="font-mono text-[11px] text-[#00f2fe] tabular-nums">
              Avg Wait: {ematNs} ns · Traffic: {busSaturationPct}%
            </span>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-3.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8]">
                  Average Memory Wait Time
                </div>
                <div className="mt-1 font-mono text-xl font-bold text-[#e0fdff] tabular-nums">
                  {ematNs} ns
                </div>
              </div>
              <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-3.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8]">
                  Trips Needed to Slow RAM
                </div>
                <div className="mt-1 font-mono text-xl font-bold text-[#00f2fe] tabular-nums">
                  {(l1MissRate * l2MissRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-[0.25rem] border border-[#232d3f] bg-[#0e141f] p-3.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8]">
                  Data Bus Traffic
                </div>
                <div
                  className={`mt-1 font-mono text-xl font-bold tabular-nums ${
                    busSeverity === 'fault'
                      ? 'text-[#fda4af]'
                      : busSeverity === 'triage'
                        ? 'text-[#fbbf24]'
                        : 'text-[#67f4b7]'
                  }`}
                >
                  {busSaturationPct}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TOPOLOGY_NODES.map((node) => {
                const selected = node.id === selectedNodeId;
                const Icon = node.Icon;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`text-left rounded-[0.25rem] border p-4 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe] ${
                      selected
                        ? 'border-[#00f2fe] bg-[#1c2433] ct-cyan-glow'
                        : 'border-[#232d3f] bg-[#0e141f] hover:border-[#334155]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#00f2fe]">
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{node.stepLabel}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#94a3b8] tabular-nums">
                        {node.baseLatencyNs >= 1000
                          ? `${(node.baseLatencyNs / 1000).toFixed(1)} µs`
                          : `${node.baseLatencyNs} ns`}
                      </span>
                    </div>
                    <div className="mt-2 font-display text-sm font-semibold text-[#dfe2ee]">
                      {node.title}
                    </div>
                    <div className="mt-0.5 text-xs text-[#94a3b8]">
                      {node.tier}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-[#232d3f] flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#94a3b8]">Max Speed</span>
                      <span className="text-[#e0fdff] tabular-nums">
                        {node.bandwidthGBs} GB/s
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-5">
          <section className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                Test Cache &amp; Traffic
              </h2>
              <span className="font-mono text-[10px] text-[#94a3b8]">SLIDERS</span>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="arch-l1" className="text-[#dfe2ee] font-medium">
                    Found in L1 Cache
                  </label>
                  <span className="font-mono text-[#00f2fe] tabular-nums">{l1HitPct}%</span>
                </div>
                <input
                  id="arch-l1"
                  type="range"
                  min={50}
                  max={99}
                  value={l1HitPct}
                  onChange={(e) => setL1HitPct(Number(e.target.value))}
                  className="w-full accent-[#00f2fe] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="arch-l2" className="text-[#dfe2ee] font-medium">
                    Found in L2 Cache
                  </label>
                  <span className="font-mono text-[#00f2fe] tabular-nums">{l2HitPct}%</span>
                </div>
                <input
                  id="arch-l2"
                  type="range"
                  min={30}
                  max={98}
                  value={l2HitPct}
                  onChange={(e) => setL2HitPct(Number(e.target.value))}
                  className="w-full accent-[#00f2fe] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="arch-dma" className="text-[#dfe2ee] font-medium">
                    Disk &amp; Network Traffic
                  </label>
                  <span className="font-mono text-[#00f2fe] tabular-nums">{dmaLoadPct}%</span>
                </div>
                <input
                  id="arch-dma"
                  type="range"
                  min={0}
                  max={95}
                  value={dmaLoadPct}
                  onChange={(e) => setDmaLoadPct(Number(e.target.value))}
                  className="w-full accent-[#00f2fe] cursor-pointer"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[0.25rem] border border-[#232d3f] border-t-2 border-t-[#00f2fe] bg-[#141a24] ct-card-shadow overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee]">
                {selectedNode.stepLabel}: {selectedNode.title}
              </h2>
              <StatusBadge severity="theory" label="Guide" />
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8]">
                  What It Does
                </div>
                <p className="mt-1 text-[13px] leading-5 text-[#dfe2ee]">
                  {selectedNode.role}
                </p>
              </div>
              <div className="border-t border-[#232d3f] pt-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#fbbf24]">
                  What Can Go Wrong
                </div>
                <p className="mt-1 text-[13px] leading-5 text-[#b9cacb]">
                  {selectedNode.failureMode}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
