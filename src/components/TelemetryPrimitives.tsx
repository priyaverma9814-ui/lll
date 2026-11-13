import React from 'react';
import { Check, AlertTriangle, XOctagon, Sparkles, CheckCircle2 } from 'lucide-react';
import { DiagnosticSeverity } from '../types/workbench';

interface StatusBadgeProps {
  severity: DiagnosticSeverity;
  label?: string;
}

const SEVERITY_CONFIG: Record<
  DiagnosticSeverity,
  {
    text: string;
    bg: string;
    border: string;
    color: string;
    dot: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pass: {
    text: 'Pass',
    bg: 'bg-[#10b981]/10',
    border: 'border-[#10b981]/35',
    color: 'text-[#67f4b7]',
    dot: 'bg-[#10b981]',
    Icon: CheckCircle2,
  },
  triage: {
    text: 'Triage',
    bg: 'bg-[#f59e0b]/12',
    border: 'border-[#f59e0b]/40',
    color: 'text-[#fbbf24]',
    dot: 'bg-[#f59e0b]',
    Icon: AlertTriangle,
  },
  fault: {
    text: 'Fault',
    bg: 'bg-[#f43f5e]/12',
    border: 'border-[#f43f5e]/45',
    color: 'text-[#fda4af]',
    dot: 'bg-[#f43f5e]',
    Icon: XOctagon,
  },
  theory: {
    text: 'Concept',
    bg: 'bg-[#8b5cf6]/14',
    border: 'border-[#8b5cf6]/40',
    color: 'text-[#d0bcff]',
    dot: 'bg-[#8b5cf6]',
    Icon: Sparkles,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ severity, label }) => {
  const cfg = SEVERITY_CONFIG[severity];
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[0.5rem] border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] whitespace-nowrap shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{label ?? cfg.text}</span>
    </span>
  );
};

interface EngineeringToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const EngineeringToggle: React.FC<EngineeringToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-[#dfe2ee] cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-[11px] leading-4 text-[#94a3b8]">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-[18px] w-[36px] shrink-0 items-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe] cursor-pointer ${
          checked
            ? 'border-[#00f2fe]/60 bg-[#00f2fe]/20'
            : 'border-[#232d3f] bg-[#1e293b]'
        }`}
      >
        <span
          className={`inline-block h-[14px] w-[14px] rounded-full transition-transform duration-150 ${
            checked
              ? 'translate-x-[19px] bg-[#00f2fe] shadow-[0_0_8px_rgba(0,242,254,0.8)]'
              : 'translate-x-[1px] bg-[#64748b]'
          }`}
        />
      </button>
    </div>
  );
};

interface EngineeringCheckboxProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const EngineeringCheckbox: React.FC<EngineeringCheckboxProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe] cursor-pointer ${
          checked
            ? 'border-[#00f2fe] bg-[#00f2fe] text-[#0b0f17] shadow-[0_0_8px_rgba(0,242,254,0.4)]'
            : 'border-[#232d3f] bg-[#141a24] text-transparent hover:border-[#38bdf8]'
        }`}
      >
        <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
      </button>
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-[#dfe2ee] cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-[11px] leading-4 text-[#94a3b8]">{description}</p>
        )}
      </div>
    </div>
  );
};
