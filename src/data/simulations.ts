import {
  EngineeringModule,
  MemoryCell,
  ModuleId,
  SimulationFrame,
  WorkbenchParams,
} from '../types/workbench';
import memoryStackImg from '../assets/images/topic_memory_stack_1794553910429.jpg';
import cpuPipelineImg from '../assets/images/topic_cpu_pipeline_1794553911463.jpg';
import concurrencyMutexImg from '../assets/images/topic_concurrency_mutex_1794553911498.jpg';
import packetRoutingImg from '../assets/images/topic_packet_routing_1794553913436.jpg';

export const DEFAULT_PARAMS: WorkbenchParams = {
  writeSize: 16,
  boundsCheck: false,
  stackCanary: true,
  forwardingEnabled: false,
  branchPredict: true,
  clockRateGhz: 3.2,
  mutexEnabled: false,
  atomicOps: false,
  threadSkewMs: 12,
  windowSize: 4,
  dropRatePct: 20,
  fastRetransmit: true,
};

export const ENGINEERING_MODULES: EngineeringModule[] = [
  {
    id: 'memory-stack',
    index: '01',
    title: 'Memory & Stack Frames',
    subtitle: 'Stack allocation, buffer boundaries, and frame integrity',
    conceptSummary:
      'Local variables sit directly below saved return pointers on a contiguous downward-growing stack. Unchecked writes spill upward into control metadata.',
    mentalModel:
      'Think of a stack frame as a sealed ledger page: local bytes grow toward higher addresses when written sequentially, colliding with the saved instruction pointer unless guarded.',
    estimatedMinutes: 15,
    topics: ['Downward Stack Growth', 'Frame Pointers', 'Canary Guards', 'Bounds Clamping'],
    imageUrl: memoryStackImg,
    imageAlt: 'Isometric rendering of layered silicon stack frames and address bus pathways',
    metricMeta: {
      primaryLabel: 'Buffer Saturation',
      secondaryLabel: 'Frame Integrity',
      overheadLabel: 'Copy Penalty',
      overheadUnit: 'ns',
    },
    sourceCode: [
      'fn process_packet(src: &[u8], len: usize) {',
      '  let mut buf: [u8; 12] = [0; 12];',
      '  let canary: u32 = 0xCAFE_BABE;',
      '  if bounds_check && len > 12 { return Err(Overflow); }',
      '  memcpy(&mut buf, src, len);',
      '  verify_canary(canary);',
      '} // pop frame -> JMP RET_ADDR',
    ],
  },
  {
    id: 'cpu-pipeline',
    index: '02',
    title: 'CPU Execution & Pipelining',
    subtitle: '5-stage instruction overlap and RAW data hazard bypass',
    conceptSummary:
      'Modern cores overlap Fetch, Decode, Execute, Memory, and Writeback. When instruction N+1 reads a register before instruction N writes it back, a data hazard occurs.',
    mentalModel:
      'A pipeline acts like an assembly belt: forwarding routes the ALU output straight back to the next ALU input instead of stalling the entire belt to wait for register writeback.',
    estimatedMinutes: 18,
    topics: ['5-Stage Pipeline', 'RAW Data Hazards', 'ALU Bypass Bus', 'IPC Utilization'],
    imageUrl: cpuPipelineImg,
    imageAlt: 'Isometric rendering of a five-stage CPU execution pipeline and ALU bypass bus',
    metricMeta: {
      primaryLabel: 'Stage Utilization',
      secondaryLabel: 'IPC Efficiency',
      overheadLabel: 'Stall Latency',
      overheadUnit: 'cycles',
    },
    sourceCode: [
      '0x100: LOAD  R2, [0x4000]    ; Fetch base operand',
      '0x104: LOAD  R3, [0x4004]    ; Fetch delta operand',
      '0x108: ADD   R1, R2, R3      ; Produces R1 in EX stage',
      '0x10C: SUB   R4, R1, #8      ; Consumes R1 (RAW hazard)',
      '0x110: STORE [0x4008], R4    ; Commit result to memory',
      '0x114: JMP   0x120           ; Next control block',
    ],
  },
  {
    id: 'concurrency-mutex',
    index: '03',
    title: 'Concurrency & Mutex Locks',
    subtitle: 'Shared state interleaving, race conditions, and mutual exclusion',
    conceptSummary:
      'A read-modify-write operation is not indivisible at the machine level. Without a lock or atomic instruction, two threads interleave reads and clobber updates.',
    mentalModel:
      'Picture two engineers editing the same spreadsheet cell simultaneously without locking: whoever saves last silently erases the first person’s arithmetic.',
    estimatedMinutes: 20,
    topics: ['Critical Sections', 'Thread Interleaving', 'Lost Updates', 'Mutex Queueing'],
    imageUrl: concurrencyMutexImg,
    imageAlt: 'Isometric rendering of dual parallel processing lanes converging through a synchronized lock gate',
    metricMeta: {
      primaryLabel: 'Core Concurrency',
      secondaryLabel: 'State Consistency',
      overheadLabel: 'Lock Wait',
      overheadUnit: 'ms',
    },
    sourceCode: [
      '// Initial shared_balance = 100',
      'fn apply_delta(delta: i32) {',
      '  if mutex_enabled { lock.acquire(); }',
      '  let tmp = load_shared(BALANCE);',
      '  let next = tmp + delta;',
      '  store_shared(BALANCE, next);',
      '  if mutex_enabled { lock.release(); }',
      '}',
    ],
  },
  {
    id: 'packet-routing',
    index: '04',
    title: 'Packet & Bus Routing',
    subtitle: 'Sliding window flow control, drops, and fast retransmit',
    conceptSummary:
      'Links drop frames under congestion. Sliding windows keep multiple packets in flight while selective ACKs and fast retransmission recover gaps without stalling throughput.',
    mentalModel:
      'A sliding window acts like a conveyor belt with numbered slots: you do not wait for slot 1 to return before loading slot 2, up to the window limit.',
    estimatedMinutes: 16,
    topics: ['Sliding Window', 'ACK Sequencing', 'Packet Loss Recovery', 'Bus Saturation'],
    imageUrl: packetRoutingImg,
    imageAlt: 'Isometric rendering of a high-speed network switch matrix and sliding-window packet buffers',
    metricMeta: {
      primaryLabel: 'Link Utilization',
      secondaryLabel: 'Goodput Efficiency',
      overheadLabel: 'Recovery Delay',
      overheadUnit: 'ms',
    },
    sourceCode: [
      'struct Window { base: u32, next_seq: u32, size: u32 }',
      'while win.in_flight() < win.size {',
      '  transmit_frame(win.next_seq);',
      '  win.next_seq += 1;',
      '}',
      'on_dup_ack(seq) => if fast_retransmit { resend(seq); }',
      'on_ack(seq) => win.advance_to(seq + 1);',
    ],
  },
];

function buildMemoryFrames(params: WorkbenchParams): SimulationFrame[] {
  const { writeSize, boundsCheck, stackCanary } = params;
  const overflowBytes = Math.max(0, writeSize - 12);
  const clampedWrite = boundsCheck ? Math.min(writeSize, 12) : writeSize;
  const isFault = !boundsCheck && overflowBytes > 0;
  const canaryCorrupted = isFault && overflowBytes >= 1;
  const retCorrupted = isFault && overflowBytes >= 5;

  const baseCells = (phase: 'init' | 'alloc' | 'write' | 'verify'): MemoryCell[] => {
    const cells: MemoryCell[] = [
      {
        address: '0x7FFC',
        label: 'RET_ADDR',
        region: 'control',
        hex: phase === 'write' || phase === 'verify' ? (retCorrupted ? '0x41414141' : '0x004011A8') : '0x004011A8',
        state: retCorrupted && (phase === 'write' || phase === 'verify') ? 'corrupted' : 'clean',
      },
      {
        address: '0x7FF8',
        label: 'SAVED_RBP',
        region: 'control',
        hex: phase === 'write' || phase === 'verify' ? (isFault && overflowBytes >= 3 ? '0x41417FF0' : '0x7FFF0020') : '0x7FFF0020',
        state: isFault && overflowBytes >= 3 && (phase === 'write' || phase === 'verify') ? 'corrupted' : 'clean',
      },
      {
        address: '0x7FF4',
        label: stackCanary ? 'CANARY' : 'PADDING',
        region: 'canary',
        hex:
          phase === 'init'
            ? '0x00000000'
            : canaryCorrupted && (phase === 'write' || phase === 'verify')
              ? '0x41414141'
              : stackCanary
                ? '0xCAFEBABE'
                : '0x00000000',
        state:
          canaryCorrupted && (phase === 'write' || phase === 'verify')
            ? 'corrupted'
            : stackCanary && phase !== 'init'
              ? 'protected'
              : 'clean',
      },
      {
        address: '0x7FF0',
        label: 'buf[8..11]',
        region: 'stack',
        hex: phase === 'write' || phase === 'verify' ? (clampedWrite >= 9 ? '0x41414141' : '0x00000000') : '0x00000000',
        state: phase === 'write' && clampedWrite >= 9 ? 'active' : 'clean',
      },
      {
        address: '0x7FEC',
        label: 'buf[4..7]',
        region: 'stack',
        hex: phase === 'write' || phase === 'verify' ? (clampedWrite >= 5 ? '0x41414141' : '0x00000000') : '0x00000000',
        state: phase === 'write' && clampedWrite >= 5 ? 'active' : 'clean',
      },
      {
        address: '0x7FE8',
        label: 'buf[0..3]',
        region: 'stack',
        hex: phase === 'write' || phase === 'verify' ? '0x41414141' : '0x00000000',
        state: phase === 'write' ? 'active' : 'clean',
      },
    ];
    return cells;
  };

  return [
    {
      cycle: 0,
      timestampNs: 0,
      phaseLabel: 'Frame Entry',
      activeLine: 0,
      explanation: 'Caller pushes return pointer 0x004011A8 and enters process_packet.',
      registers: [
        { name: 'RSP', value: '0x7FF8' },
        { name: 'RBP', value: '0x7FFC' },
        { name: 'LEN', value: `${writeSize} B` },
        { name: 'CANARY', value: stackCanary ? 'ARMED' : 'OFF' },
      ],
      assertions: [
        { id: 'a1', label: 'Stack Alignment', severity: 'pass', detail: 'RSP aligned to 8-byte boundary' },
        {
          id: 'a2',
          label: 'Bounds Guard',
          severity: boundsCheck ? 'pass' : 'triage',
          detail: boundsCheck ? 'Length pre-check active' : 'Unchecked memcpy path enabled',
        },
      ],
      consoleLine: '[0.0ns] enter process_packet(len=' + writeSize + ')',
      metrics: {
        utilizationPct: 12,
        efficiencyPct: 100,
        overheadValue: 2,
      },
      memoryCells: baseCells('init'),
    },
    {
      cycle: 1,
      timestampNs: 12,
      phaseLabel: 'Allocate Local Buffer',
      activeLine: 1,
      explanation: 'Stack pointer decrements by 16 bytes, zero-initializing buf[12] below control metadata.',
      registers: [
        { name: 'RSP', value: '0x7FE8', changed: true },
        { name: 'RBP', value: '0x7FF8', changed: true },
        { name: 'LEN', value: `${writeSize} B` },
        { name: 'CANARY', value: stackCanary ? '0xCAFEBABE' : 'NONE' },
      ],
      assertions: [
        { id: 'a1', label: 'Frame Allocation', severity: 'pass', detail: '12-byte buffer isolated at 0x7FE8..0x7FF3' },
        {
          id: 'a2',
          label: 'Canary Sentinel',
          severity: stackCanary ? 'pass' : 'triage',
          detail: stackCanary ? '0xCAFEBABE placed at 0x7FF4' : 'Canary protection disabled',
        },
      ],
      consoleLine: '[12.0ns] sub rsp, 16 -> buf[0..11] zeroed',
      metrics: {
        utilizationPct: 34,
        efficiencyPct: stackCanary ? 100 : 78,
        overheadValue: stackCanary ? 6 : 3,
      },
      memoryCells: baseCells('alloc'),
    },
    {
      cycle: 2,
      timestampNs: 24,
      phaseLabel: 'Bounds Evaluation',
      activeLine: 3,
      explanation: boundsCheck && writeSize > 12
        ? `Bounds guard intercepts writeSize=${writeSize}B > 12B capacity and aborts copy safely.`
        : writeSize > 12
          ? `Bounds check bypassed or absent: ${writeSize}B write exceeds 12B buffer by ${overflowBytes}B.`
          : `Input length (${writeSize}B) fits within 12B buffer allocation.`,
      registers: [
        { name: 'RSP', value: '0x7FE8' },
        { name: 'RBP', value: '0x7FF8' },
        { name: 'LEN', value: `${writeSize} B`, changed: true },
        { name: 'GUARD', value: boundsCheck ? 'PASS' : writeSize > 12 ? 'BYPASSED' : 'OK', changed: true },
      ],
      assertions: [
        {
          id: 'a1',
          label: 'Capacity Check',
          severity: boundsCheck && writeSize > 12 ? 'pass' : writeSize > 12 ? 'fault' : 'pass',
          detail:
            boundsCheck && writeSize > 12
              ? 'Write rejected before memory mutation'
              : writeSize > 12
                ? `Overflow delta: +${overflowBytes} bytes past buf[11]`
                : 'Within 12-byte bounds',
        },
      ],
      consoleLine:
        boundsCheck && writeSize > 12
          ? `[24.0ns] GUARD: len=${writeSize} > 12 -> return Err(Overflow)`
          : `[24.0ns] proceeding to memcpy(buf, src, ${writeSize})`,
      metrics: {
        utilizationPct: Math.min(100, Math.round((writeSize / 12) * 65)),
        efficiencyPct: boundsCheck && writeSize > 12 ? 100 : writeSize > 12 ? 45 : 96,
        overheadValue: boundsCheck ? 4 : 1,
      },
      memoryCells: baseCells('alloc'),
    },
    {
      cycle: 3,
      timestampNs: 42,
      phaseLabel: boundsCheck && writeSize > 12 ? 'Safe Early Return' : 'Memory Copy Execution',
      activeLine: boundsCheck && writeSize > 12 ? 3 : 4,
      explanation:
        boundsCheck && writeSize > 12
          ? 'No bytes copied into buf; stack canary and return pointer remain untouched.'
          : isFault
            ? `memcpy writes ${writeSize} bytes upward from 0x7FE8, overwriting ${canaryCorrupted ? 'CANARY' : ''}${retCorrupted ? ' and RET_ADDR' : ''}.`
            : `memcpy writes ${writeSize} bytes cleanly within 0x7FE8..0x7FF3.`,
      registers: [
        { name: 'RSP', value: '0x7FE8' },
        { name: 'RCX', value: `${boundsCheck && writeSize > 12 ? 0 : writeSize}`, changed: true },
        { name: 'CANARY', value: canaryCorrupted ? '0x41414141' : stackCanary ? '0xCAFEBABE' : 'NONE', changed: canaryCorrupted },
        { name: 'RET', value: retCorrupted ? '0x41414141' : '0x004011A8', changed: retCorrupted },
      ],
      assertions: [
        {
          id: 'a1',
          label: 'Buffer Boundary',
          severity: isFault ? 'fault' : 'pass',
          detail: isFault ? `Overwrote ${overflowBytes} bytes past boundary` : 'Zero out-of-bounds writes',
        },
        {
          id: 'a2',
          label: 'Return Pointer Integrity',
          severity: retCorrupted ? 'fault' : 'pass',
          detail: retCorrupted ? 'RET_ADDR clobbered with 0x41414141' : 'RET_ADDR intact at 0x004011A8',
        },
      ],
      consoleLine:
        boundsCheck && writeSize > 12
          ? '[42.0ns] early exit: 0 bytes written'
          : isFault
            ? `[42.0ns] FAULT: memcpy wrote ${writeSize}B into 12B slot -> stack corrupted`
            : `[42.0ns] memcpy completed (${writeSize}B written)`,
      metrics: {
        utilizationPct: boundsCheck && writeSize > 12 ? 20 : Math.min(100, Math.round((clampedWrite / 12) * 100)),
        efficiencyPct: isFault ? Math.max(12, 100 - overflowBytes * 10) : 98,
        overheadValue: boundsCheck && writeSize > 12 ? 5 : isFault ? 48 : Math.round(clampedWrite * 1.4),
      },
      memoryCells: boundsCheck && writeSize > 12 ? baseCells('alloc') : baseCells('write'),
    },
    {
      cycle: 4,
      timestampNs: 58,
      phaseLabel: 'Canary & Return Check',
      activeLine: 5,
      explanation: isFault
        ? stackCanary
          ? 'Canary verification detects mismatch (0x41414141 != 0xCAFEBABE) and halts process before jump.'
          : 'No canary enabled! CPU pops corrupted return pointer 0x41414141 -> arbitrary control-flow hijack.'
        : 'Canary matches 0xCAFEBABE and frame unwinds cleanly to caller 0x004011A8.',
      registers: [
        { name: 'RSP', value: '0x7FFC', changed: true },
        { name: 'RIP', value: isFault ? (stackCanary ? 'SIGABRT' : '0x41414141') : '0x004011A8', changed: true },
        { name: 'STATUS', value: isFault ? 'FAULT' : 'PASS', changed: true },
        { name: 'ERRNO', value: isFault ? (stackCanary ? 'E_CANARY' : 'SIGSEGV') : '0' },
      ],
      assertions: [
        {
          id: 'a1',
          label: 'Frame Unwind',
          severity: isFault ? 'fault' : 'pass',
          detail: isFault
            ? stackCanary
              ? 'Aborted by canary guard (mitigated hijack, operation failed)'
              : 'Control flow hijacked to invalid address 0x41414141'
            : 'Returned cleanly to caller instruction 0x004011A8',
        },
        {
          id: 'a2',
          label: 'Invariant: Memory Safety',
          severity: isFault ? 'fault' : 'pass',
          detail: isFault ? 'Enable Bounds Check or lower writeSize <= 12B' : 'All frame invariants verified',
        },
      ],
      consoleLine: isFault
        ? stackCanary
          ? '[58.0ns] ABORT: __stack_chk_fail() triggered'
          : '[58.0ns] SIGSEGV: segmentation fault at RIP=0x41414141'
        : '[58.0ns] RET 0x004011A8 -> PASS (0 faults)',
      metrics: {
        utilizationPct: boundsCheck && writeSize > 12 ? 15 : Math.min(100, Math.round((clampedWrite / 12) * 95)),
        efficiencyPct: isFault ? (stackCanary ? 24 : 5) : 100,
        overheadValue: isFault ? 64 : 8,
      },
      memoryCells: boundsCheck && writeSize > 12 ? baseCells('alloc') : baseCells('verify'),
    },
  ];
}

function buildPipelineFrames(params: WorkbenchParams): SimulationFrame[] {
  const { forwardingEnabled, clockRateGhz } = params;
  const cyclePeriodNs = Number((1 / clockRateGhz).toFixed(2));

  if (forwardingEnabled) {
    return [
      {
        cycle: 0,
        timestampNs: 0,
        phaseLabel: 'Cycle 1: Fetch ADD',
        activeLine: 2,
        explanation: 'IF fetches ADD R1, R2, R3 while earlier LOADs finish memory writeback.',
        registers: [
          { name: 'PC', value: '0x108' },
          { name: 'R1', value: '0x0000' },
          { name: 'R2', value: '0x0024' },
          { name: 'IPC', value: '1.00' },
        ],
        assertions: [
          { id: 'p1', label: 'Bypass Bus', severity: 'pass', detail: 'EX->EX forwarding path armed' },
          { id: 'p2', label: 'Stall Cycles', severity: 'pass', detail: '0 pipeline bubbles' },
        ],
        consoleLine: '[C1] IF: ADD R1, R2, R3',
        metrics: {
          utilizationPct: 60,
          efficiencyPct: 92,
          overheadValue: 0,
        },
        forwardingActive: false,
        pipelineStages: [
          { stage: 'IF', instruction: 'ADD R1, R2, R3', status: 'active' },
          { stage: 'ID', instruction: 'LOAD R3', status: 'active' },
          { stage: 'EX', instruction: 'LOAD R2', status: 'active' },
          { stage: 'MEM', instruction: 'NOP', status: 'idle' },
          { stage: 'WB', instruction: 'NOP', status: 'idle' },
        ],
      },
      {
        cycle: 1,
        timestampNs: Math.round(cyclePeriodNs * 10) / 10,
        phaseLabel: 'Cycle 2: Fetch SUB (Hazard Detected)',
        activeLine: 3,
        explanation: 'SUB R4, R1, #8 enters Fetch while ADD R1 decodes. Hazard detector notes R1 dependency.',
        registers: [
          { name: 'PC', value: '0x10C', changed: true },
          { name: 'R1', value: 'PENDING' },
          { name: 'R2', value: '0x0024' },
          { name: 'IPC', value: '1.00' },
        ],
        assertions: [
          { id: 'p1', label: 'RAW Dependency', severity: 'theory', detail: 'SUB reads R1 produced by ADD' },
          { id: 'p2', label: 'Bypass Bus', severity: 'pass', detail: 'No stall required with forwarding' },
        ],
        consoleLine: '[C2] IF: SUB R4, R1, #8 | ID: ADD R1, R2, R3',
        metrics: {
          utilizationPct: 80,
          efficiencyPct: params.branchPredict ? 96 : 78,
          overheadValue: 0,
        },
        forwardingActive: false,
        pipelineStages: [
          { stage: 'IF', instruction: 'SUB R4, R1, #8', status: 'active' },
          { stage: 'ID', instruction: 'ADD R1, R2, R3', status: 'active' },
          { stage: 'EX', instruction: 'LOAD R3', status: 'active' },
          { stage: 'MEM', instruction: 'LOAD R2', status: 'active' },
          { stage: 'WB', instruction: 'NOP', status: 'idle' },
        ],
      },
      {
        cycle: 2,
        timestampNs: Math.round(cyclePeriodNs * 20) / 10,
        phaseLabel: 'Cycle 3: ADD Computes R1 in EX',
        activeLine: 2,
        explanation: 'ADD computes R1 = 0x003C in ALU Execute stage. Forwarding bus prepares result for Cycle 4.',
        registers: [
          { name: 'PC', value: '0x110', changed: true },
          { name: 'ALU_OUT', value: '0x003C', changed: true },
          { name: 'R1', value: 'BYPASS' },
          { name: 'IPC', value: '1.00' },
        ],
        assertions: [
          { id: 'p1', label: 'ALU Result Ready', severity: 'pass', detail: 'R1=0x003C latched in EX/MEM register' },
        ],
        consoleLine: '[C3] EX: ADD computes R1=0x003C -> forwarding latch armed',
        metrics: {
          utilizationPct: 100,
          efficiencyPct: params.branchPredict ? 98 : 82,
          overheadValue: 0,
        },
        forwardingActive: true,
        pipelineStages: [
          { stage: 'IF', instruction: 'STORE [0x4008], R4', status: 'active' },
          { stage: 'ID', instruction: 'SUB R4, R1, #8', status: 'forwarded' },
          { stage: 'EX', instruction: 'ADD R1 (0x3C)', status: 'forwarded' },
          { stage: 'MEM', instruction: 'LOAD R3', status: 'active' },
          { stage: 'WB', instruction: 'LOAD R2', status: 'active' },
        ],
      },
      {
        cycle: 3,
        timestampNs: Math.round(cyclePeriodNs * 30) / 10,
        phaseLabel: 'Cycle 4: EX-to-EX Bypass Executes SUB',
        activeLine: 3,
        explanation: 'SUB receives R1=0x003C directly over the EX/MEM forwarding bus without waiting for WB!',
        registers: [
          { name: 'PC', value: '0x114', changed: true },
          { name: 'R1', value: '0x003C', changed: true },
          { name: 'R4', value: '0x0034', changed: true },
          { name: 'IPC', value: '1.00' },
        ],
        assertions: [
          { id: 'p1', label: 'Forwarding Hit', severity: 'pass', detail: 'EX/MEM -> ALU Input A bypassed WB wait' },
          { id: 'p2', label: 'Throughput', severity: 'pass', detail: '1.00 IPC maintained (0 stalls)' },
        ],
        consoleLine: '[C4] FORWARD EX->EX: SUB reads R1=0x003C -> R4=0x0034',
        metrics: {
          utilizationPct: 100,
          efficiencyPct: 100,
          overheadValue: 0,
        },
        forwardingActive: true,
        pipelineStages: [
          { stage: 'IF', instruction: 'JMP 0x120', status: 'active' },
          { stage: 'ID', instruction: 'STORE [0x4008], R4', status: 'active' },
          { stage: 'EX', instruction: 'SUB R4 (0x34)', status: 'forwarded' },
          { stage: 'MEM', instruction: 'ADD R1, R2, R3', status: 'active' },
          { stage: 'WB', instruction: 'LOAD R3', status: 'active' },
        ],
      },
      {
        cycle: 4,
        timestampNs: Math.round(cyclePeriodNs * 40) / 10,
        phaseLabel: 'Cycle 5: Writeback & Commit',
        activeLine: 4,
        explanation: 'ADD commits R1 to register file while STORE moves cleanly into MEM with zero wasted cycles.',
        registers: [
          { name: 'PC', value: '0x120', changed: true },
          { name: 'R1', value: '0x003C' },
          { name: 'R4', value: '0x0034' },
          { name: 'IPC', value: '1.00' },
        ],
        assertions: [
          { id: 'p1', label: 'Pipeline Efficiency', severity: 'pass', detail: '100% stage utilization across hazard' },
        ],
        consoleLine: '[C5] WB: ADD committed | MEM: STORE R4=0x0034 -> PASS',
        metrics: {
          utilizationPct: 100,
          efficiencyPct: params.branchPredict ? 100 : 84,
          overheadValue: params.branchPredict ? 0 : 1,
        },
        forwardingActive: false,
        pipelineStages: [
          { stage: 'IF', instruction: 'NEXT_BLK', status: 'active' },
          { stage: 'ID', instruction: 'JMP 0x120', status: 'active' },
          { stage: 'EX', instruction: 'STORE [0x4008]', status: 'active' },
          { stage: 'MEM', instruction: 'SUB R4=0x34', status: 'active' },
          { stage: 'WB', instruction: 'ADD R1=0x3C', status: 'active' },
        ],
      },
    ];
  }

  // Without forwarding: pipeline must stall 2 cycles!
  return [
    {
      cycle: 0,
      timestampNs: 0,
      phaseLabel: 'Cycle 1: Fetch ADD',
      activeLine: 2,
      explanation: 'ADD R1, R2, R3 enters Fetch. Forwarding bus is disabled.',
      registers: [
        { name: 'PC', value: '0x108' },
        { name: 'R1', value: '0x0000' },
        { name: 'STALLS', value: '0' },
        { name: 'IPC', value: '1.00' },
      ],
      assertions: [
        { id: 'p1', label: 'Bypass Bus', severity: 'triage', detail: 'Forwarding disabled — hazards will stall' },
      ],
      consoleLine: '[C1] IF: ADD R1, R2, R3',
      metrics: {
        utilizationPct: 60,
        efficiencyPct: 88,
        overheadValue: 0,
      },
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'ADD R1, R2, R3', status: 'active' },
        { stage: 'ID', instruction: 'LOAD R3', status: 'active' },
        { stage: 'EX', instruction: 'LOAD R2', status: 'active' },
        { stage: 'MEM', instruction: 'NOP', status: 'idle' },
        { stage: 'WB', instruction: 'NOP', status: 'idle' },
      ],
    },
    {
      cycle: 1,
      timestampNs: Math.round(cyclePeriodNs * 10) / 10,
      phaseLabel: 'Cycle 2: RAW Hazard Stalls SUB',
      activeLine: 3,
      explanation: 'SUB needs R1, which ADD has not written back yet. Control unit injects a NOP bubble.',
      registers: [
        { name: 'PC', value: '0x10C', changed: true },
        { name: 'R1', value: 'STALE' },
        { name: 'STALLS', value: '1', changed: true },
        { name: 'IPC', value: '0.67', changed: true },
      ],
      assertions: [
        { id: 'p1', label: 'Pipeline Stall', severity: 'triage', detail: 'Bubble injected into EX stage (Cycle 1/2)' },
      ],
      consoleLine: '[C2] HAZARD: SUB stalled in ID waiting for R1 writeback',
      metrics: {
        utilizationPct: 60,
        efficiencyPct: 67,
        overheadValue: 1,
      },
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'SUB R4, R1, #8', status: 'stall' },
        { stage: 'ID', instruction: 'BUBBLE (NOP)', status: 'stall' },
        { stage: 'EX', instruction: 'ADD R1, R2, R3', status: 'active' },
        { stage: 'MEM', instruction: 'LOAD R3', status: 'active' },
        { stage: 'WB', instruction: 'LOAD R2', status: 'active' },
      ],
    },
    {
      cycle: 2,
      timestampNs: Math.round(cyclePeriodNs * 20) / 10,
      phaseLabel: 'Cycle 3: Second Stall Cycle',
      activeLine: 3,
      explanation: 'ADD is in MEM; R1 still not written to register file. Second NOP bubble propagates.',
      registers: [
        { name: 'PC', value: '0x10C' },
        { name: 'R1', value: 'STALE' },
        { name: 'STALLS', value: '2', changed: true },
        { name: 'IPC', value: '0.50', changed: true },
      ],
      assertions: [
        { id: 'p1', label: 'Throughput Drop', severity: 'triage', detail: '2 consecutive stall cycles degrade IPC to 0.50' },
      ],
      consoleLine: '[C3] HAZARD: 2nd NOP bubble injected while ADD is in MEM',
      metrics: {
        utilizationPct: 40,
        efficiencyPct: 50,
        overheadValue: 2,
      },
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'SUB R4, R1, #8', status: 'stall' },
        { stage: 'ID', instruction: 'BUBBLE (NOP)', status: 'stall' },
        { stage: 'EX', instruction: 'BUBBLE (NOP)', status: 'stall' },
        { stage: 'MEM', instruction: 'ADD R1, R2, R3', status: 'active' },
        { stage: 'WB', instruction: 'LOAD R3', status: 'active' },
      ],
    },
    {
      cycle: 3,
      timestampNs: Math.round(cyclePeriodNs * 30) / 10,
      phaseLabel: 'Cycle 4: ADD Writes R1 in WB',
      activeLine: 2,
      explanation: 'ADD finally writes R1=0x003C to register file in WB. SUB can now decode.',
      registers: [
        { name: 'PC', value: '0x110', changed: true },
        { name: 'R1', value: '0x003C', changed: true },
        { name: 'STALLS', value: '2' },
        { name: 'IPC', value: '0.60', changed: true },
      ],
      assertions: [
        { id: 'p1', label: 'Writeback Complete', severity: 'pass', detail: 'R1=0x003C available in register file' },
        { id: 'p2', label: 'Latency Penalty', severity: 'triage', detail: 'Lost 2 cycles; enable Forwarding to eliminate' },
      ],
      consoleLine: '[C4] WB: ADD writes R1=0x003C | SUB resumes decode',
      metrics: {
        utilizationPct: 60,
        efficiencyPct: 60,
        overheadValue: 2,
      },
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'STORE [0x4008], R4', status: 'active' },
        { stage: 'ID', instruction: 'SUB R4, R1, #8', status: 'active' },
        { stage: 'EX', instruction: 'BUBBLE (NOP)', status: 'stall' },
        { stage: 'MEM', instruction: 'BUBBLE (NOP)', status: 'stall' },
        { stage: 'WB', instruction: 'ADD R1=0x3C', status: 'active' },
      ],
    },
    {
      cycle: 4,
      timestampNs: Math.round(cyclePeriodNs * 40) / 10,
      phaseLabel: 'Cycle 5: SUB Executes (Delayed)',
      activeLine: 3,
      explanation: 'SUB executes 2 cycles late. Functional correctness preserved, but throughput is degraded.',
      registers: [
        { name: 'PC', value: '0x114', changed: true },
        { name: 'R1', value: '0x003C' },
        { name: 'R4', value: '0x0034', changed: true },
        { name: 'IPC', value: '0.60' },
      ],
      assertions: [
        { id: 'p1', label: 'Correctness', severity: 'pass', detail: 'R4=0x0034 computed accurately' },
        { id: 'p2', label: 'Triage: Pipeline Bubbles', severity: 'triage', detail: '2 cycles wasted (enable ALU Forwarding)' },
      ],
      consoleLine: '[C5] EX: SUB computes R4=0x0034 (2-cycle stall penalty)',
      metrics: {
        utilizationPct: 60,
        efficiencyPct: 60,
        overheadValue: 2,
      },
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'JMP 0x120', status: 'active' },
        { stage: 'ID', instruction: 'STORE [0x4008], R4', status: 'active' },
        { stage: 'EX', instruction: 'SUB R4 (0x34)', status: 'active' },
        { stage: 'MEM', instruction: 'BUBBLE (NOP)', status: 'stall' },
        { stage: 'WB', instruction: 'BUBBLE (NOP)', status: 'stall' },
      ],
    },
  ];
}

function buildConcurrencyFrames(params: WorkbenchParams): SimulationFrame[] {
  const { mutexEnabled, atomicOps } = params;
  const protectedMode = mutexEnabled || atomicOps;

  if (protectedMode) {
    const modeLabel = atomicOps ? 'Atomic Fetch-Add' : 'Mutex Lock Guard';
    return [
      {
        cycle: 0,
        timestampNs: 0,
        phaseLabel: 'Initial Shared State',
        activeLine: 0,
        explanation: `Both threads target shared_balance=100. ${modeLabel} enforces serialized access.`,
        registers: [
          { name: 'BALANCE', value: '100' },
          { name: 'LOCK', value: 'FREE' },
          { name: 'THR_A', value: '+50' },
          { name: 'THR_B', value: '-30' },
        ],
        assertions: [
          { id: 'c1', label: 'Mutual Exclusion', severity: 'pass', detail: `${modeLabel} armed` },
        ],
        consoleLine: `[0ms] init shared_balance=100 (${modeLabel})`,
        metrics: {
          utilizationPct: 50,
          efficiencyPct: 100,
          overheadValue: 0,
        },
        sharedBalance: 100,
        threadActions: [
          { thread: 'Thread A', operation: 'READY (+50)', status: 'running', localValue: '—' },
          { thread: 'Thread B', operation: 'READY (-30)', status: 'running', localValue: '—' },
        ],
      },
      {
        cycle: 1,
        timestampNs: 10,
        phaseLabel: 'Thread A Acquires Critical Section',
        activeLine: 2,
        explanation: 'Thread A acquires the lock and reads shared_balance=100. Thread B attempts acquisition and blocks cleanly.',
        registers: [
          { name: 'BALANCE', value: '100' },
          { name: 'LOCK', value: 'HELD_A', changed: true },
          { name: 'A_TMP', value: '100', changed: true },
          { name: 'B_STATE', value: 'BLOCKED', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'Lock Contention', severity: 'triage', detail: 'Thread B parked in wait queue' },
          { id: 'c2', label: 'Data Isolation', severity: 'pass', detail: 'Single writer invariant holds' },
        ],
        consoleLine: '[10ms] Thread A: lock.acquire() -> read balance=100 | Thread B: wait()',
        metrics: {
          utilizationPct: atomicOps ? 90 : 50,
          efficiencyPct: 100,
          overheadValue: atomicOps ? 2 : 12,
        },
        sharedBalance: 100,
        threadActions: [
          { thread: 'Thread A', operation: 'LOCKED · read 100', status: 'locked', localValue: 'tmp=100' },
          { thread: 'Thread B', operation: 'WAIT_QUEUE', status: 'waiting', localValue: 'blocked' },
        ],
      },
      {
        cycle: 2,
        timestampNs: 22,
        phaseLabel: 'Thread A Commits & Releases',
        activeLine: 6,
        explanation: 'Thread A stores 150 and releases the lock, waking Thread B.',
        registers: [
          { name: 'BALANCE', value: '150', changed: true },
          { name: 'LOCK', value: 'FREE', changed: true },
          { name: 'A_TMP', value: '150', changed: true },
          { name: 'B_STATE', value: 'WOKEN', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'Commit A', severity: 'pass', detail: 'balance updated 100 -> 150' },
        ],
        consoleLine: '[22ms] Thread A: store 150 -> lock.release()',
        metrics: {
          utilizationPct: atomicOps ? 95 : 75,
          efficiencyPct: 100,
          overheadValue: atomicOps ? 2 : 8,
        },
        sharedBalance: 150,
        threadActions: [
          { thread: 'Thread A', operation: 'DONE · stored 150', status: 'done', localValue: '150' },
          { thread: 'Thread B', operation: 'ACQUIRING', status: 'running', localValue: '—' },
        ],
      },
      {
        cycle: 3,
        timestampNs: 34,
        phaseLabel: 'Thread B Reads Updated Balance',
        activeLine: 3,
        explanation: 'Thread B acquires lock and observes the fresh value 150, computing 150 - 30 = 120.',
        registers: [
          { name: 'BALANCE', value: '150' },
          { name: 'LOCK', value: 'HELD_B', changed: true },
          { name: 'B_TMP', value: '150', changed: true },
          { name: 'B_NEXT', value: '120', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'Linearizability', severity: 'pass', detail: 'Thread B sees Thread A commit (150)' },
        ],
        consoleLine: '[34ms] Thread B: lock.acquire() -> read 150, compute 120',
        metrics: {
          utilizationPct: 80,
          efficiencyPct: 100,
          overheadValue: atomicOps ? 1 : 6,
        },
        sharedBalance: 150,
        threadActions: [
          { thread: 'Thread A', operation: 'DONE', status: 'done', localValue: '150' },
          { thread: 'Thread B', operation: 'LOCKED · 150-30', status: 'locked', localValue: 'next=120' },
        ],
      },
      {
        cycle: 4,
        timestampNs: 46,
        phaseLabel: 'Final Consistent State',
        activeLine: 6,
        explanation: 'Thread B stores 120 and releases lock. Expected arithmetic (100 + 50 - 30 = 120) matches.',
        registers: [
          { name: 'BALANCE', value: '120', changed: true },
          { name: 'EXPECTED', value: '120' },
          { name: 'LOCK', value: 'FREE', changed: true },
          { name: 'STATUS', value: 'PASS', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'Zero Lost Updates', severity: 'pass', detail: 'Final balance 120 == expected 120' },
        ],
        consoleLine: '[46ms] Thread B: store 120 -> PASS (invariant balance == 120)',
        metrics: {
          utilizationPct: 100,
          efficiencyPct: 100,
          overheadValue: atomicOps ? 1 : 4,
        },
        sharedBalance: 120,
        threadActions: [
          { thread: 'Thread A', operation: 'COMMITTED (+50)', status: 'done', localValue: '150' },
          { thread: 'Thread B', operation: 'COMMITTED (-30)', status: 'done', localValue: '120' },
        ],
      },
    ];
  }

  // Unprotected race condition!
  return [
    {
      cycle: 0,
      timestampNs: 0,
      phaseLabel: 'Initial Shared State',
      activeLine: 0,
      explanation: 'No mutex or atomic instruction enabled. Both threads enter apply_delta concurrently.',
      registers: [
        { name: 'BALANCE', value: '100' },
        { name: 'LOCK', value: 'DISABLED' },
        { name: 'THR_A', value: '+50' },
        { name: 'THR_B', value: '-30' },
      ],
      assertions: [
        { id: 'c1', label: 'Mutual Exclusion', severity: 'fault', detail: 'Critical section unguarded' },
      ],
      consoleLine: '[0ms] init shared_balance=100 (NO GUARD)',
      metrics: {
        utilizationPct: 100,
        efficiencyPct: 75,
        overheadValue: 0,
      },
      sharedBalance: 100,
      threadActions: [
        { thread: 'Thread A', operation: 'READY (+50)', status: 'running', localValue: '—' },
        { thread: 'Thread B', operation: 'READY (-30)', status: 'running', localValue: '—' },
      ],
    },
    {
      cycle: 1,
      timestampNs: 10,
      phaseLabel: 'Concurrent Stale Reads',
      activeLine: 3,
      explanation: 'Thread A and Thread B both load shared_balance=100 into thread-local registers simultaneously.',
      registers: [
        { name: 'BALANCE', value: '100' },
        { name: 'A_TMP', value: '100', changed: true },
        { name: 'B_TMP', value: '100', changed: true },
        { name: 'RACE', value: 'DETECTED', changed: true },
      ],
      assertions: [
        { id: 'c1', label: 'Torn Read Window', severity: 'triage', detail: 'Both threads cached balance=100' },
      ],
      consoleLine: '[10ms] Thread A read 100 | Thread B read 100 (overlapping critical section)',
      metrics: {
        utilizationPct: 100,
        efficiencyPct: 48,
        overheadValue: params.threadSkewMs,
      },
      sharedBalance: 100,
      threadActions: [
        { thread: 'Thread A', operation: 'LOAD balance=100', status: 'race', localValue: 'tmp=100' },
        { thread: 'Thread B', operation: 'LOAD balance=100', status: 'race', localValue: 'tmp=100' },
      ],
    },
    {
      cycle: 2,
      timestampNs: 20,
      phaseLabel: 'Divergent Local Arithmetic',
      activeLine: 4,
      explanation: 'Thread A computes 100+50=150; Thread B computes 100-30=70 from its stale copy.',
      registers: [
        { name: 'BALANCE', value: '100' },
        { name: 'A_NEXT', value: '150', changed: true },
        { name: 'B_NEXT', value: '70', changed: true },
        { name: 'SKEW', value: `${params.threadSkewMs}ms` },
      ],
      assertions: [
        { id: 'c1', label: 'Divergent State', severity: 'fault', detail: 'Thread B computing against stale baseline' },
      ],
      consoleLine: '[20ms] A_next=150 | B_next=70 (divergent local registers)',
      metrics: {
        utilizationPct: 100,
        efficiencyPct: 35,
        overheadValue: params.threadSkewMs + 8,
      },
      sharedBalance: 100,
      threadActions: [
        { thread: 'Thread A', operation: 'ADD 100+50', status: 'race', localValue: 'next=150' },
        { thread: 'Thread B', operation: 'SUB 100-30', status: 'race', localValue: 'next=70' },
      ],
    },
    {
      cycle: 3,
      timestampNs: 30,
      phaseLabel: 'Thread A Stores 150',
      activeLine: 5,
      explanation: 'Thread A writes 150 to shared_balance, unaware Thread B still holds stale tmp=100.',
      registers: [
        { name: 'BALANCE', value: '150', changed: true },
        { name: 'A_STATE', value: 'COMMITTED' },
        { name: 'B_NEXT', value: '70' },
        { name: 'STATUS', value: 'UNSAFE' },
      ],
      assertions: [
        { id: 'c1', label: 'Overwrite Pending', severity: 'fault', detail: 'Thread B about to clobber +50 deposit' },
      ],
      consoleLine: '[30ms] Thread A: store_shared(150)',
      metrics: {
        utilizationPct: 90,
        efficiencyPct: 28,
        overheadValue: params.threadSkewMs + 16,
      },
      sharedBalance: 150,
      threadActions: [
        { thread: 'Thread A', operation: 'STORED 150', status: 'done', localValue: '150' },
        { thread: 'Thread B', operation: 'STORING 70...', status: 'race', localValue: 'next=70' },
      ],
    },
    {
      cycle: 4,
      timestampNs: 42,
      phaseLabel: 'Lost Update Fault',
      activeLine: 5,
      explanation: 'Thread B writes 70, silently erasing Thread A’s +50 update! Expected 120, observed 70.',
      registers: [
        { name: 'BALANCE', value: '70', changed: true },
        { name: 'EXPECTED', value: '120' },
        { name: 'DELTA_ERR', value: '-50', changed: true },
        { name: 'STATUS', value: 'FAULT', changed: true },
      ],
      assertions: [
        { id: 'c1', label: 'Invariant: Balance == 120', severity: 'fault', detail: 'Observed 70 — Thread A update lost!' },
        { id: 'c2', label: 'Remediation', severity: 'triage', detail: 'Enable Mutex Guard or Atomic Ops' },
      ],
      consoleLine: '[42ms] FAULT: Thread B overwrote 150 -> 70 (Lost Update -50)',
      metrics: {
        utilizationPct: 85,
        efficiencyPct: 15,
        overheadValue: params.threadSkewMs + 28,
      },
      sharedBalance: 70,
      threadActions: [
        { thread: 'Thread A', operation: 'LOST UPDATE (+50)', status: 'race', localValue: '150' },
        { thread: 'Thread B', operation: 'CLOBBERED (70)', status: 'race', localValue: '70' },
      ],
    },
  ];
}

function buildPacketFrames(params: WorkbenchParams): SimulationFrame[] {
  const { windowSize, dropRatePct, fastRetransmit } = params;
  const hasDrop = dropRatePct > 0;
  const baseThroughput = Math.round(windowSize * 120 * (1 - dropRatePct / 150));

  return [
    {
      cycle: 0,
      timestampNs: 0,
      phaseLabel: 'Window Initialization',
      activeLine: 0,
      explanation: `Sliding window opens with capacity W=${windowSize}. Frames SEQ 101..106 queued in sender ring.`,
      registers: [
        { name: 'WIN_SIZE', value: `${windowSize}` },
        { name: 'BASE_SEQ', value: '101' },
        { name: 'DROP_PCT', value: `${dropRatePct}%` },
        { name: 'FAST_RTX', value: fastRetransmit ? 'ON' : 'OFF' },
      ],
      assertions: [
        { id: 'n1', label: 'Ring Buffer Ready', severity: 'pass', detail: `6 frames staged, window=${windowSize}` },
      ],
      consoleLine: `[0ms] window initialized (W=${windowSize}, drop=${dropRatePct}%)`,
      metrics: {
        utilizationPct: Math.round((windowSize / 6) * 40),
        efficiencyPct: 100,
        overheadValue: 0,
      },
      throughputMbps: baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq) => ({
        seq,
        state: 'queued',
        payload: `SEG_${seq}`,
      })),
    },
    {
      cycle: 1,
      timestampNs: 14,
      phaseLabel: 'Burst Transmission',
      activeLine: 2,
      explanation: `Sender pushes up to ${windowSize} frames onto the wire without waiting for round-trip ACKs.`,
      registers: [
        { name: 'IN_FLIGHT', value: `${Math.min(windowSize, 6)}`, changed: true },
        { name: 'NEXT_SEQ', value: `${101 + Math.min(windowSize, 6)}`, changed: true },
        { name: 'RTT_EST', value: '14ms' },
        { name: 'LINK_BW', value: `${baseThroughput}Mb/s` },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Pipeline Saturation',
          severity: windowSize >= 3 ? 'pass' : 'triage',
          detail: windowSize >= 3 ? 'Link bus well-utilized' : 'Small window under-utilizes bandwidth',
        },
      ],
      consoleLine: `[14ms] TX burst: SEQ 101..${100 + Math.min(windowSize, 6)}`,
      metrics: {
        utilizationPct: Math.round((windowSize / 6) * 100),
        efficiencyPct: Math.max(55, 100 - Math.round(dropRatePct * 0.4)),
        overheadValue: 14,
      },
      throughputMbps: baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq, idx) => ({
        seq,
        state: idx < windowSize ? 'in-flight' : 'queued',
        payload: `SEG_${seq}`,
      })),
    },
    {
      cycle: 2,
      timestampNs: 28,
      phaseLabel: hasDrop ? 'Packet Loss on Link' : 'Clean Link Transit',
      activeLine: 5,
      explanation: hasDrop
        ? 'Congestion drops SEQ 102 in transit! SEQ 101 arrives and ACKs; SEQ 103+ trigger duplicate ACKs.'
        : 'All in-flight frames traverse the link cleanly without packet loss.',
      registers: [
        { name: 'ACKED', value: '101', changed: true },
        { name: 'DROPPED', value: hasDrop ? '102' : 'NONE', changed: hasDrop },
        { name: 'DUP_ACKS', value: hasDrop ? '2' : '0', changed: hasDrop },
        { name: 'LINK_BW', value: `${hasDrop ? Math.round(baseThroughput * 0.72) : baseThroughput}Mb/s` },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Link Integrity',
          severity: hasDrop ? 'triage' : 'pass',
          detail: hasDrop ? 'SEQ 102 dropped on wire — gap detected at receiver' : 'Zero packet drops',
        },
      ],
      consoleLine: hasDrop ? '[28ms] WARN: SEQ 102 dropped; DUP-ACK(101) received' : '[28ms] ACK 101..103 received cleanly',
      metrics: {
        utilizationPct: Math.round((windowSize / 6) * (hasDrop ? 72 : 100)),
        efficiencyPct: hasDrop ? Math.max(38, 86 - dropRatePct) : 100,
        overheadValue: hasDrop ? 28 : 14,
      },
      throughputMbps: hasDrop ? Math.round(baseThroughput * 0.72) : baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq, idx) => {
        if (seq === 101) return { seq, state: 'acked', payload: `SEG_${seq}` };
        if (hasDrop && seq === 102) return { seq, state: 'dropped', payload: `SEG_${seq}` };
        return { seq, state: idx < windowSize ? 'in-flight' : 'queued', payload: `SEG_${seq}` };
      }),
    },
    {
      cycle: 3,
      timestampNs: 42,
      phaseLabel: hasDrop ? (fastRetransmit ? 'Fast Retransmit Recovery' : 'Timeout Stall') : 'Window Slide',
      activeLine: fastRetransmit ? 5 : 6,
      explanation: hasDrop
        ? fastRetransmit
          ? '3x Duplicate ACK triggers immediate Fast Retransmit of SEQ 102 without waiting for RTO timeout.'
          : 'Fast Retransmit is OFF! Sender stalls waiting for coarse 200ms RTO timer.'
        : 'Base pointer advances cleanly; remaining frames enter wire.',
      registers: [
        { name: 'RTX_COUNT', value: hasDrop ? '1' : '0', changed: hasDrop },
        { name: 'STALL_MS', value: hasDrop && !fastRetransmit ? '200ms' : '0ms', changed: hasDrop && !fastRetransmit },
        { name: 'BASE_SEQ', value: hasDrop ? '102' : '104', changed: true },
        { name: 'LINK_BW', value: `${hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.35) : baseThroughput}Mb/s` },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Recovery Strategy',
          severity: !hasDrop || fastRetransmit ? 'pass' : 'fault',
          detail: !hasDrop
            ? 'No recovery needed'
            : fastRetransmit
              ? 'Fast Retransmit recovered SEQ 102 in 1 RTT'
              : 'Coarse timeout stalled pipeline for 200ms',
        },
      ],
      consoleLine: hasDrop
        ? fastRetransmit
          ? '[42ms] FAST_RTX: resending SEQ 102 immediately'
          : '[42ms] TIMEOUT: waiting 200ms RTO for SEQ 102'
        : '[42ms] window slid to BASE=104',
      metrics: {
        utilizationPct: hasDrop && !fastRetransmit ? 22 : Math.round((windowSize / 6) * 95),
        efficiencyPct: hasDrop ? (fastRetransmit ? Math.max(68, 92 - dropRatePct / 2) : 28) : 100,
        overheadValue: hasDrop ? (fastRetransmit ? 28 : 200) : 14,
      },
      throughputMbps: hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.35) : baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq, idx) => {
        if (seq === 101) return { seq, state: 'acked', payload: `SEG_${seq}` };
        if (hasDrop && seq === 102) {
          return { seq, state: fastRetransmit ? 'retransmitted' : 'dropped', payload: `SEG_${seq}` };
        }
        return { seq, state: idx < windowSize + 1 ? 'acked' : 'in-flight', payload: `SEG_${seq}` };
      }),
    },
    {
      cycle: 4,
      timestampNs: 56,
      phaseLabel: 'Stream Synchronized',
      activeLine: 6,
      explanation:
        hasDrop && !fastRetransmit
          ? 'Stream eventually recovers after RTO penalty; throughput severely degraded.'
          : 'All 6 frames acknowledged in order. Receiver buffer drained cleanly.',
      registers: [
        { name: 'ACKED', value: '106/106', changed: true },
        { name: 'GOODPUT', value: `${hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.45) : baseThroughput}Mb/s` },
        { name: 'LOSS', value: `${dropRatePct}%` },
        { name: 'STATUS', value: hasDrop && !fastRetransmit ? 'TRIAGE' : 'PASS' },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Stream Delivery',
          severity: hasDrop && !fastRetransmit ? 'triage' : 'pass',
          detail:
            hasDrop && !fastRetransmit
              ? 'Delivered with 200ms tail-latency spike (enable Fast Retransmit)'
              : 'All 6 segments delivered in order with bounded latency',
        },
      ],
      consoleLine:
        hasDrop && !fastRetransmit
          ? '[56ms] TRIAGE: stream complete with RTO latency penalty'
          : '[56ms] ACK 106 -> PASS (all segments acknowledged)',
      metrics: {
        utilizationPct: hasDrop && !fastRetransmit ? 45 : Math.round((windowSize / 6) * 100),
        efficiencyPct: hasDrop ? (fastRetransmit ? 94 : 42) : 100,
        overheadValue: hasDrop ? (fastRetransmit ? 18 : 200) : 12,
      },
      throughputMbps: hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.45) : baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq) => ({
        seq,
        state: 'acked',
        payload: `SEG_${seq}`,
      })),
    },
  ];
}

export function generateSimulationFrames(
  moduleId: ModuleId,
  params: WorkbenchParams
): SimulationFrame[] {
  switch (moduleId) {
    case 'memory-stack':
      return buildMemoryFrames(params);
    case 'cpu-pipeline':
      return buildPipelineFrames(params);
    case 'concurrency-mutex':
      return buildConcurrencyFrames(params);
    case 'packet-routing':
      return buildPacketFrames(params);
  }
}
