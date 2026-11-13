export type AppScreen = 'workbench' | 'architecture' | 'challenges' | 'curriculum';

export type ModuleId = 'memory-stack' | 'cpu-pipeline' | 'concurrency-mutex' | 'packet-routing';

export type DiagnosticSeverity = 'pass' | 'triage' | 'fault' | 'theory';

export interface AssertionResult {
  id: string;
  label: string;
  severity: DiagnosticSeverity;
  detail: string;
}

export interface RegisterEntry {
  name: string;
  value: string;
  changed?: boolean;
  note?: string;
}

export interface MemoryCell {
  address: string;
  label: string;
  region: 'stack' | 'canary' | 'control' | 'free';
  hex: string;
  state: 'clean' | 'active' | 'corrupted' | 'protected';
}

export interface PipelineStageState {
  stage: 'IF' | 'ID' | 'EX' | 'MEM' | 'WB';
  instruction: string;
  status: 'active' | 'stall' | 'forwarded' | 'idle';
}

export interface ThreadAction {
  thread: 'Thread A' | 'Thread B';
  operation: string;
  status: 'running' | 'waiting' | 'locked' | 'race' | 'done';
  localValue: string;
}

export interface PacketNode {
  seq: number;
  state: 'queued' | 'in-flight' | 'acked' | 'dropped' | 'retransmitted';
  payload: string;
}

export interface FramePerformanceMetrics {
  utilizationPct: number;
  efficiencyPct: number;
  overheadValue: number;
}

export interface ModuleMetricMeta {
  primaryLabel: string;
  secondaryLabel: string;
  overheadLabel: string;
  overheadUnit: string;
}

export interface SimulationFrame {
  cycle: number;
  timestampNs: number;
  phaseLabel: string;
  activeLine: number;
  explanation: string;
  registers: RegisterEntry[];
  assertions: AssertionResult[];
  consoleLine: string;
  metrics: FramePerformanceMetrics;
  memoryCells?: MemoryCell[];
  pipelineStages?: PipelineStageState[];
  forwardingActive?: boolean;
  threadActions?: ThreadAction[];
  sharedBalance?: number;
  packets?: PacketNode[];
  throughputMbps?: number;
}

export interface WorkbenchParams {
  // Memory Stack
  writeSize: number;
  boundsCheck: boolean;
  stackCanary: boolean;
  // CPU Pipeline
  forwardingEnabled: boolean;
  branchPredict: boolean;
  clockRateGhz: number;
  // Concurrency
  mutexEnabled: boolean;
  atomicOps: boolean;
  threadSkewMs: number;
  // Packet Routing
  windowSize: number;
  dropRatePct: number;
  fastRetransmit: boolean;
}

export interface EngineeringModule {
  id: ModuleId;
  index: string;
  title: string;
  subtitle: string;
  conceptSummary: string;
  mentalModel: string;
  sourceCode: string[];
  estimatedMinutes: number;
  topics: string[];
  imageUrl: string;
  imageAlt: string;
  metricMeta: ModuleMetricMeta;
}

export interface TriageChallenge {
  id: string;
  index: string;
  title: string;
  moduleId: ModuleId;
  severity: 'fault' | 'triage';
  symptom: string;
  rootCauseHint: string;
  targetParams: Partial<WorkbenchParams>;
  initialParams: Partial<WorkbenchParams>;
  verify: (params: WorkbenchParams) => { passed: boolean; checks: AssertionResult[] };
}
