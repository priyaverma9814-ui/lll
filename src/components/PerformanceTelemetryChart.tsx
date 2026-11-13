import * as d3 from 'd3';
import React from 'react';
import { Activity } from 'lucide-react';
import { ModuleMetricMeta, SimulationFrame } from '../types/workbench';

interface PerformanceTelemetryChartProps {
  frames: SimulationFrame[];
  currentStep: number;
  metricMeta: ModuleMetricMeta;
  onSelectStep: (step: number) => void;
}

type ChartMode = 'utilization' | 'overhead';

export const PerformanceTelemetryChart: React.FC<
  PerformanceTelemetryChartProps
> = ({ frames, currentStep, metricMeta, onSelectStep }) => {
  const [chartMode, setChartMode] = React.useState<ChartMode>('utilization');
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [width, setWidth] = React.useState<number>(520);

  const height = 196;

  // Responsive width observer
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const nextWidth = Math.max(300, Math.floor(el.clientWidth));
      setWidth(nextWidth);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const displayIndex =
    hoverIndex !== null
      ? Math.min(hoverIndex, frames.length - 1)
      : Math.min(currentStep, frames.length - 1);
  const activeFrame = frames[displayIndex] ?? frames[0];

  React.useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || frames.length === 0) return;

    const margin = { top: 14, right: 16, bottom: 26, left: 40 };
    const innerWidth = Math.max(100, width - margin.left - margin.right);
    const innerHeight = Math.max(80, height - margin.top - margin.bottom);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Cyan area gradient
    const cyanGrad = defs
      .append('linearGradient')
      .attr('id', 'ct-cyan-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    cyanGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00f2fe')
      .attr('stop-opacity', 0.28);
    cyanGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00f2fe')
      .attr('stop-opacity', 0.01);

    // Amber area gradient for overhead mode
    const amberGrad = defs
      .append('linearGradient')
      .attr('id', 'ct-amber-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    amberGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.28);
    amberGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.01);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, frames.length - 1)])
      .range([0, innerWidth]);

    const maxOverhead = Math.max(
      10,
      d3.max(frames, (d) => d.metrics.overheadValue) ?? 10
    );

    const yScale =
      chartMode === 'utilization'
        ? d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])
        : d3
            .scaleLinear()
            .domain([0, Math.ceil(maxOverhead * 1.15)])
            .nice()
            .range([innerHeight, 0]);

    // Subtle horizontal gridlines
    const yTicks = yScale.ticks(4);
    g.selectAll('.grid-line')
      .data(yTicks)
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(frames.length)
      .tickFormat((d) => {
        const idx = Math.round(Number(d));
        const f = frames[idx];
        return f ? `F${idx + 1}` : '';
      });

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) =>
        chartMode === 'utilization' ? `${d}%` : `${d}`
      );

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    xAxisGroup.selectAll('path, line').attr('stroke', '#232d3f');
    xAxisGroup
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px');

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('path, line').attr('stroke', '#232d3f');
    yAxisGroup
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px');

    if (chartMode === 'utilization') {
      // Primary: Utilization Area + Line (#00f2fe)
      const utilArea = d3
        .area<SimulationFrame>()
        .x((_, i) => xScale(i))
        .y0(innerHeight)
        .y1((d) => yScale(d.metrics.utilizationPct))
        .curve(d3.curveMonotoneX);

      const utilLine = d3
        .line<SimulationFrame>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.metrics.utilizationPct))
        .curve(d3.curveMonotoneX);

      // Secondary: Efficiency Line (#8b5cf6)
      const effLine = d3
        .line<SimulationFrame>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.metrics.efficiencyPct))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(frames)
        .attr('fill', 'url(#ct-cyan-area-grad)')
        .attr('d', utilArea);

      g.append('path')
        .datum(frames)
        .attr('fill', 'none')
        .attr('stroke', '#8b5cf6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,3')
        .attr('d', effLine);

      g.append('path')
        .datum(frames)
        .attr('fill', 'none')
        .attr('stroke', '#00f2fe')
        .attr('stroke-width', 2.25)
        .attr('d', utilLine);

      // Active cursor vertical guide
      const cursorX = xScale(Math.min(currentStep, frames.length - 1));
      g.append('line')
        .attr('x1', cursorX)
        .attr('x2', cursorX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#00f2fe')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.55)
        .attr('stroke-dasharray', '2,2');

      // Data nodes
      g.selectAll('.dot-eff')
        .data(frames)
        .join('circle')
        .attr('class', 'dot-eff')
        .attr('cx', (_, i) => xScale(i))
        .attr('cy', (d) => yScale(d.metrics.efficiencyPct))
        .attr('r', (_, i) => (i === displayIndex ? 4.5 : 2.8))
        .attr('fill', '#8b5cf6')
        .attr('stroke', '#0b0f17')
        .attr('stroke-width', 1.5);

      g.selectAll('.dot-util')
        .data(frames)
        .join('circle')
        .attr('class', 'dot-util')
        .attr('cx', (_, i) => xScale(i))
        .attr('cy', (d) => yScale(d.metrics.utilizationPct))
        .attr('r', (_, i) => (i === displayIndex ? 5 : 3))
        .attr('fill', '#00f2fe')
        .attr('stroke', '#0b0f17')
        .attr('stroke-width', 1.5);
    } else {
      // Overhead / Penalty series (#f59e0b)
      const ovArea = d3
        .area<SimulationFrame>()
        .x((_, i) => xScale(i))
        .y0(innerHeight)
        .y1((d) => yScale(d.metrics.overheadValue))
        .curve(d3.curveMonotoneX);

      const ovLine = d3
        .line<SimulationFrame>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.metrics.overheadValue))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(frames)
        .attr('fill', 'url(#ct-amber-area-grad)')
        .attr('d', ovArea);

      g.append('path')
        .datum(frames)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.25)
        .attr('d', ovLine);

      const cursorX = xScale(Math.min(currentStep, frames.length - 1));
      g.append('line')
        .attr('x1', cursorX)
        .attr('x2', cursorX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.55)
        .attr('stroke-dasharray', '2,2');

      g.selectAll('.dot-ov')
        .data(frames)
        .join('circle')
        .attr('class', 'dot-ov')
        .attr('cx', (_, i) => xScale(i))
        .attr('cy', (d) => yScale(d.metrics.overheadValue))
        .attr('r', (_, i) => (i === displayIndex ? 5 : 3))
        .attr('fill', '#f59e0b')
        .attr('stroke', '#0b0f17')
        .attr('stroke-width', 1.5);
    }

    // Hover + Click interaction overlay
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const rawIndex = xScale.invert(mx);
        const nearest = Math.min(
          frames.length - 1,
          Math.max(0, Math.round(rawIndex))
        );
        setHoverIndex(nearest);
      })
      .on('mouseleave', () => {
        setHoverIndex(null);
      })
      .on('click', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const rawIndex = xScale.invert(mx);
        const nearest = Math.min(
          frames.length - 1,
          Math.max(0, Math.round(rawIndex))
        );
        onSelectStep(nearest);
      });
  }, [frames, width, height, chartMode, currentStep, displayIndex, onSelectStep]);

  return (
    <section
      aria-label="Resource Utilization Telemetry"
      className="rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] ct-card-shadow overflow-hidden"
    >
      {/* Top Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232d3f] bg-[#101622] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="h-3.5 w-3.5 text-[#00f2fe] shrink-0" aria-hidden="true" />
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#dfe2ee] truncate">
            Performance &amp; Resource Telemetry
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Telemetry Metric Series"
          className="inline-flex rounded-[0.25rem] border border-[#232d3f] bg-[#0b0f17] p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={chartMode === 'utilization'}
            onClick={() => setChartMode('utilization')}
            className={`rounded-[0.125rem] px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              chartMode === 'utilization'
                ? 'bg-[#1c2433] text-[#00f2fe]'
                : 'text-[#94a3b8] hover:text-[#dfe2ee]'
            }`}
          >
            Utilization %
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={chartMode === 'overhead'}
            onClick={() => setChartMode('overhead')}
            className={`rounded-[0.125rem] px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              chartMode === 'overhead'
                ? 'bg-[#1c2433] text-[#fbbf24]'
                : 'text-[#94a3b8] hover:text-[#dfe2ee]'
            }`}
          >
            {metricMeta.overheadLabel}
          </button>
        </div>
      </div>

      {/* Live Frame Readout Strip */}
      <div className="grid grid-cols-3 gap-px bg-[#232d3f] border-b border-[#232d3f]">
        <div className="bg-[#0e141f] px-3.5 py-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8] truncate">
            {metricMeta.primaryLabel}
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-[#00f2fe] tabular-nums">
            {activeFrame.metrics.utilizationPct}%
          </div>
        </div>
        <div className="bg-[#0e141f] px-3.5 py-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8] truncate">
            {metricMeta.secondaryLabel}
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-[#d0bcff] tabular-nums">
            {activeFrame.metrics.efficiencyPct}%
          </div>
        </div>
        <div className="bg-[#0e141f] px-3.5 py-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#94a3b8] truncate">
            {metricMeta.overheadLabel}
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-[#fbbf24] tabular-nums">
            {activeFrame.metrics.overheadValue} {metricMeta.overheadUnit}
          </div>
        </div>
      </div>

      {/* D3 SVG Canvas */}
      <div className="p-4">
        <div ref={containerRef} className="w-full">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            role="img"
            aria-label={`D3 performance timeline chart for ${metricMeta.primaryLabel} and ${metricMeta.secondaryLabel}`}
            className="block w-full overflow-visible"
          />
        </div>

        {/* Legend & Scrub Hint */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#94a3b8]">
          {chartMode === 'utilization' ? (
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-3.5 bg-[#00f2fe]" aria-hidden="true" />
                <span className="text-[#dfe2ee]">{metricMeta.primaryLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-0.5 w-3.5 border-t-2 border-dashed border-[#8b5cf6]"
                  aria-hidden="true"
                />
                <span className="text-[#b9cacb]">{metricMeta.secondaryLabel}</span>
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 bg-[#f59e0b]" aria-hidden="true" />
              <span className="text-[#dfe2ee]">
                {metricMeta.overheadLabel} ({metricMeta.overheadUnit})
              </span>
            </span>
          )}
          <span className="tabular-nums">
            Inspecting F{displayIndex + 1} · Click chart to seek
          </span>
        </div>
      </div>
    </section>
  );
};
