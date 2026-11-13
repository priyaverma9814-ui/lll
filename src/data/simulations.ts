import {
  EngineeringModule,
  MemoryCell,
  ModuleId,
  SimulationFrame,
  WorkbenchParams,
} from '../types/workbench';

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
    index: 'Step 1',
    title: 'How Function Memory Works',
    subtitle: 'See how local data sits next to return addresses on the stack',
    conceptSummary:
      'Every time a function runs, it reserves a small block of memory called a stack frame. Your local data sits right below the address that tells the computer where to return when the function finishes.',
    mentalModel:
      'Imagine writing notes on a lined notepad: if you write past the lines reserved for your note, your ink spills onto the next page’s instructions.',
    estimatedMinutes: 12,
    topics: [
      '1. Enter the function',
      '2. Reserve local space',
      '3. Check the data size',
      '4. Copy data & verify safety',
    ],
    stepTopics: [
      {
        stepNumber: 1,
        title: 'Function starts',
        summary: 'The computer saves where to return after this function finishes.',
        frameIndex: 0,
      },
      {
        stepNumber: 2,
        title: 'Reserve 12 bytes of space',
        summary: 'A 12-byte box (buf) and an optional safety marker are placed in memory.',
        frameIndex: 1,
      },
      {
        stepNumber: 3,
        title: 'Check input size',
        summary: 'Decide if the incoming data fits safely inside the 12-byte box.',
        frameIndex: 2,
      },
      {
        stepNumber: 4,
        title: 'Copy bytes into memory',
        summary: 'Watch whether the copied bytes stay inside the box or spill over.',
        frameIndex: 3,
      },
      {
        stepNumber: 5,
        title: 'Return safely or catch error',
        summary: 'Check the safety marker and return to the caller.',
        frameIndex: 4,
      },
    ],
    sourceCode: [
      'fn save_message(input: &[u8], size: usize) {',
      '  let mut box: [u8; 12] = [0; 12]; // 12-byte space',
      '  let guard: u32 = 0xCAFE_BABE;    // Safety marker',
      '  if check_size && size > 12 { return Err(TooBig); }',
      '  copy_bytes(&mut box, input, size);',
      '  check_safety_marker(guard);',
      '} // Finish and jump back to caller',
    ],
  },
  {
    id: 'cpu-pipeline',
    index: 'Step 2',
    title: 'How the CPU Runs Instructions',
    subtitle: 'See how a CPU overlaps steps and avoids waiting delays',
    conceptSummary:
      'Instead of finishing one instruction completely before starting the next, a CPU runs 5 small steps at once—just like an assembly line. When one step needs an answer from the step right ahead of it, a delay can happen.',
    mentalModel:
      'Like a car wash assembly line: if car #2 needs something car #1 just finished, passing it directly forward keeps the line moving without stopping.',
    estimatedMinutes: 15,
    topics: [
      '1. Fetch next instruction',
      '2. Spot a data dependency',
      '3. Pass result early or wait',
      '4. Finish and save answer',
    ],
    stepTopics: [
      {
        stepNumber: 1,
        title: 'Fetch ADD instruction',
        summary: 'The CPU reads ADD into the first stage of the assembly line.',
        frameIndex: 0,
      },
      {
        stepNumber: 2,
        title: 'SUB needs ADD’s answer',
        summary: 'SUB enters right behind ADD and needs R1 before ADD is done.',
        frameIndex: 1,
      },
      {
        stepNumber: 3,
        title: 'Compute R1 in Execute',
        summary: 'ADD calculates the answer. With Fast Pass on, it shares R1 right away.',
        frameIndex: 2,
      },
      {
        stepNumber: 4,
        title: 'SUB runs with or without delay',
        summary: 'Fast Pass avoids waiting; without it, empty wait bubbles slow the CPU.',
        frameIndex: 3,
      },
      {
        stepNumber: 5,
        title: 'Save final results',
        summary: 'Both instructions finish and write their results to memory.',
        frameIndex: 4,
      },
    ],
    sourceCode: [
      '0x100: LOAD  R2, [0x4000]    ; Read first number',
      '0x104: LOAD  R3, [0x4004]    ; Read second number',
      '0x108: ADD   R1, R2, R3      ; R1 = R2 + R3',
      '0x10C: SUB   R4, R1, #8      ; Needs R1 from line above!',
      '0x110: STORE [0x4008], R4    ; Save answer to memory',
      '0x114: JMP   0x120           ; Move to next block',
    ],
  },
  {
    id: 'concurrency-mutex',
    index: 'Step 3',
    title: 'How Two Threads Share Data',
    subtitle: 'See why simultaneous updates clash and how locks fix them',
    conceptSummary:
      'When two tasks (threads) read and update the same number at the exact same time, one task can accidentally erase the other task’s work. A lock makes them take turns.',
    mentalModel:
      'Like two people editing the same shared note at once: if both read "$100" before either saves, the second person’s save overwrites the first person’s change.',
    estimatedMinutes: 15,
    topics: [
      '1. Start with shared balance',
      '2. Two threads try to update',
      '3. Take turns or clash',
      '4. Check the final total',
    ],
    stepTopics: [
      {
        stepNumber: 1,
        title: 'Initial shared balance (100)',
        summary: 'Thread A wants to add +50 and Thread B wants to subtract -30.',
        frameIndex: 0,
      },
      {
        stepNumber: 2,
        title: 'Reading the balance',
        summary: 'With a lock, Thread B waits. Without a lock, both read 100 at once.',
        frameIndex: 1,
      },
      {
        stepNumber: 3,
        title: 'Thread A calculates & saves',
        summary: 'Thread A updates the balance to 150.',
        frameIndex: 2,
      },
      {
        stepNumber: 4,
        title: 'Thread B takes its turn',
        summary: 'With a lock, Thread B reads fresh 150. Without a lock, it uses stale 100.',
        frameIndex: 3,
      },
      {
        stepNumber: 5,
        title: 'Compare final balance',
        summary: 'Correct total is 120. Clashing updates leave 70 instead!',
        frameIndex: 4,
      },
    ],
    sourceCode: [
      '// Starting balance = 100',
      'fn update_balance(change: i32) {',
      '  if use_lock { lock.wait_for_turn(); }',
      '  let current = read_shared(BALANCE);',
      '  let updated = current + change;',
      '  save_shared(BALANCE, updated);',
      '  if use_lock { lock.done(); }',
      '}',
    ],
  },
  {
    id: 'packet-routing',
    index: 'Step 4',
    title: 'How Network Packets Recover',
    subtitle: 'See how data travels in groups and recovers from dropped pieces',
    conceptSummary:
      'Data sent over a network is split into numbered packets. Instead of sending one packet and waiting, the sender sends a small group (a window) at once and quickly resends any missing piece.',
    mentalModel:
      'Like mailing 6 numbered postcards in batches: if postcard #2 gets lost in the mail, the receiver tells you which number is missing so you only resend #2.',
    estimatedMinutes: 14,
    topics: [
      '1. Queue numbered packets',
      '2. Send a batch at once',
      '3. Spot a dropped packet',
      '4. Resend & finish delivery',
    ],
    stepTopics: [
      {
        stepNumber: 1,
        title: 'Prepare 6 numbered packets',
        summary: 'Packets 101 through 106 wait in the sender queue.',
        frameIndex: 0,
      },
      {
        stepNumber: 2,
        title: 'Send a batch together',
        summary: 'Send up to Window Size packets at once without waiting.',
        frameIndex: 1,
      },
      {
        stepNumber: 3,
        title: 'Handle a lost packet',
        summary: 'If Packet 102 is dropped, later packets signal that #102 is missing.',
        frameIndex: 2,
      },
      {
        stepNumber: 4,
        title: 'Resend right away or stall',
        summary: 'Quick Resend fixes #102 immediately; otherwise the sender waits 200ms.',
        frameIndex: 3,
      },
      {
        stepNumber: 5,
        title: 'All packets confirmed',
        summary: 'All 6 packets arrive in order at the receiver.',
        frameIndex: 4,
      },
    ],
    sourceCode: [
      'struct Batch { first: u32, next: u32, limit: u32 }',
      'while batch.in_transit() < batch.limit {',
      '  send_packet(batch.next);',
      '  batch.next += 1;',
      '}',
      'on_missing_notice(num) => if quick_resend { resend(num); }',
      'on_confirmed(num) => batch.move_forward(num + 1);',
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
        label: 'Return Address',
        region: 'control',
        hex: phase === 'write' || phase === 'verify' ? (retCorrupted ? '0x41414141' : '0x004011A8') : '0x004011A8',
        state: retCorrupted && (phase === 'write' || phase === 'verify') ? 'corrupted' : 'clean',
      },
      {
        address: '0x7FF8',
        label: 'Caller Frame',
        region: 'control',
        hex: phase === 'write' || phase === 'verify' ? (isFault && overflowBytes >= 3 ? '0x41417FF0' : '0x7FFF0020') : '0x7FFF0020',
        state: isFault && overflowBytes >= 3 && (phase === 'write' || phase === 'verify') ? 'corrupted' : 'clean',
      },
      {
        address: '0x7FF4',
        label: stackCanary ? 'Safety Marker' : 'Unused Gap',
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
        label: 'box[8..11]',
        region: 'stack',
        hex: phase === 'write' || phase === 'verify' ? (clampedWrite >= 9 ? '0x41414141' : '0x00000000') : '0x00000000',
        state: phase === 'write' && clampedWrite >= 9 ? 'active' : 'clean',
      },
      {
        address: '0x7FEC',
        label: 'box[4..7]',
        region: 'stack',
        hex: phase === 'write' || phase === 'verify' ? (clampedWrite >= 5 ? '0x41414141' : '0x00000000') : '0x00000000',
        state: phase === 'write' && clampedWrite >= 5 ? 'active' : 'clean',
      },
      {
        address: '0x7FE8',
        label: 'box[0..3]',
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
      phaseLabel: 'Step 1: Enter Function',
      activeLine: 0,
      explanation:
        'The function begins. The CPU remembers where to jump back (0x004011A8) once this function finishes.',
      registers: [
        { name: 'STACK_TOP', value: '0x7FF8' },
        { name: 'FRAME_BASE', value: '0x7FFC' },
        { name: 'INPUT_SIZE', value: `${writeSize} B` },
        { name: 'MARKER', value: stackCanary ? 'READY' : 'OFF' },
      ],
      assertions: [
        { id: 'a1', label: 'Memory Aligned', severity: 'pass', detail: 'Stack starts cleanly at an 8-byte boundary' },
        {
          id: 'a2',
          label: 'Size Check',
          severity: boundsCheck ? 'pass' : 'triage',
          detail: boundsCheck ? 'Size check will stop oversized data' : 'Size check is turned off',
        },
      ],
      consoleLine: '[0ns] Step 1: Function started with input size = ' + writeSize + ' bytes',
      memoryCells: baseCells('init'),
    },
    {
      cycle: 1,
      timestampNs: 12,
      phaseLabel: 'Step 2: Reserve 12-Byte Box',
      activeLine: 1,
      explanation:
        'Memory reserves 12 empty bytes (box[0..11]) for local data, sitting right underneath the Return Address.',
      registers: [
        { name: 'STACK_TOP', value: '0x7FE8', changed: true },
        { name: 'FRAME_BASE', value: '0x7FF8', changed: true },
        { name: 'BOX_CAP', value: '12 B' },
        { name: 'MARKER', value: stackCanary ? '0xCAFEBABE' : 'NONE' },
      ],
      assertions: [
        { id: 'a1', label: 'Local Space Ready', severity: 'pass', detail: '12-byte box reserved at 0x7FE8..0x7FF3' },
        {
          id: 'a2',
          label: 'Safety Marker',
          severity: stackCanary ? 'pass' : 'triage',
          detail: stackCanary ? 'Safety marker placed right above box[11]' : 'No safety marker protecting the return address',
        },
      ],
      consoleLine: '[12ns] Step 2: Reserved 12 bytes for local box',
      memoryCells: baseCells('alloc'),
    },
    {
      cycle: 2,
      timestampNs: 24,
      phaseLabel: 'Step 3: Check Data Size',
      activeLine: 3,
      explanation:
        boundsCheck && writeSize > 12
          ? `The size check spots that ${writeSize} bytes is bigger than the 12-byte box and safely stops before copying.`
          : writeSize > 12
            ? `No size check stopped the copy! ${writeSize} bytes is ${overflowBytes} bytes larger than the 12-byte box.`
            : `The ${writeSize}-byte input fits comfortably inside the 12-byte box.`,
      registers: [
        { name: 'STACK_TOP', value: '0x7FE8' },
        { name: 'INPUT_SIZE', value: `${writeSize} B`, changed: true },
        { name: 'BOX_CAP', value: '12 B' },
        { name: 'SIZE_GUARD', value: boundsCheck ? 'ACTIVE' : writeSize > 12 ? 'SKIPPED' : 'OK', changed: true },
      ],
      assertions: [
        {
          id: 'a1',
          label: 'Fits in 12-Byte Box',
          severity: boundsCheck && writeSize > 12 ? 'pass' : writeSize > 12 ? 'fault' : 'pass',
          detail:
            boundsCheck && writeSize > 12
              ? 'Oversized input safely rejected before copying'
              : writeSize > 12
                ? `Too big by +${overflowBytes} bytes`
                : 'Input fits inside 12-byte capacity',
        },
      ],
      consoleLine:
        boundsCheck && writeSize > 12
          ? `[24ns] Step 3: Size check blocked ${writeSize}B copy (limit 12B)`
          : `[24ns] Step 3: Continuing to copy ${writeSize} bytes`,
      memoryCells: baseCells('alloc'),
    },
    {
      cycle: 3,
      timestampNs: 42,
      phaseLabel: boundsCheck && writeSize > 12 ? 'Step 4: Stopped Safely' : 'Step 4: Copy Bytes',
      activeLine: boundsCheck && writeSize > 12 ? 3 : 4,
      explanation:
        boundsCheck && writeSize > 12
          ? 'Because the size check stopped early, nothing spilled over. Your return address is completely safe.'
          : isFault
            ? `Copying ${writeSize} bytes fills the 12-byte box and spills upward, overwriting ${canaryCorrupted ? 'the Safety Marker' : ''}${retCorrupted ? ' and Return Address' : ''}!`
            : `All ${writeSize} bytes fit neatly inside the 12-byte box without touching anything above it.`,
      registers: [
        { name: 'COPIED', value: `${boundsCheck && writeSize > 12 ? 0 : writeSize} B`, changed: true },
        { name: 'MARKER', value: canaryCorrupted ? 'OVERWRITTEN' : stackCanary ? '0xCAFEBABE' : 'NONE', changed: canaryCorrupted },
        { name: 'RETURN_TO', value: retCorrupted ? '0x41414141' : '0x004011A8', changed: retCorrupted },
        { name: 'SPILL', value: isFault ? `+${overflowBytes} B` : '0 B', changed: isFault },
      ],
      assertions: [
        {
          id: 'a1',
          label: 'No Memory Spill',
          severity: isFault ? 'fault' : 'pass',
          detail: isFault ? `Spilled ${overflowBytes} bytes past box boundary` : 'Zero bytes spilled outside the box',
        },
        {
          id: 'a2',
          label: 'Return Address Safe',
          severity: retCorrupted ? 'fault' : 'pass',
          detail: retCorrupted ? 'Return address broken (changed to 0x41414141)' : 'Return address intact (0x004011A8)',
        },
      ],
      consoleLine:
        boundsCheck && writeSize > 12
          ? '[42ns] Step 4: Stopped safely (0 bytes copied)'
          : isFault
            ? `[42ns] FAULT: ${writeSize}B spilled out of 12B box and broke nearby memory`
            : `[42ns] Step 4: Copied ${writeSize} bytes cleanly`,
      memoryCells: boundsCheck && writeSize > 12 ? baseCells('alloc') : baseCells('write'),
    },
    {
      cycle: 4,
      timestampNs: 58,
      phaseLabel: 'Step 5: Check & Return',
      activeLine: 5,
      explanation: isFault
        ? stackCanary
          ? 'The Safety Marker noticed it was overwritten and stopped the program before jumping to a broken address.'
          : 'With no Safety Marker, the CPU tries to jump to the broken address 0x41414141 and crashes!'
        : 'Everything checks out! The function finishes and returns cleanly to 0x004011A8.',
      registers: [
        { name: 'NEXT_STEP', value: isFault ? (stackCanary ? 'STOPPED' : 'CRASH') : '0x004011A8', changed: true },
        { name: 'MARKER', value: canaryCorrupted ? 'BROKEN' : stackCanary ? 'INTACT' : 'OFF' },
        { name: 'RESULT', value: isFault ? 'FAULT' : 'PASS', changed: true },
        { name: 'OVERFLOW', value: isFault ? `${overflowBytes} B` : '0 B' },
      ],
      assertions: [
        {
          id: 'a1',
          label: 'Clean Function Return',
          severity: isFault ? 'fault' : 'pass',
          detail: isFault
            ? stackCanary
              ? 'Safety Marker stopped the crash, but the copy still failed'
              : 'Program crashed jumping to broken return address'
            : 'Returned cleanly to caller instruction 0x004011A8',
        },
        {
          id: 'a2',
          label: 'How to Fix',
          severity: isFault ? 'triage' : 'pass',
          detail: isFault ? 'Turn on "Check Size Before Copying" or lower size to 12B or less' : 'Memory is completely safe',
        },
      ],
      consoleLine: isFault
        ? stackCanary
          ? '[58ns] STOPPED: Safety Marker caught memory corruption'
          : '[58ns] CRASH: CPU jumped to invalid address 0x41414141'
        : '[58ns] Step 5: Returned cleanly -> PASS',
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
        phaseLabel: 'Step 1: Fetch ADD',
        activeLine: 2,
        explanation: 'The CPU brings ADD into Stage 1 (Fetch) while earlier LOAD instructions finish up.',
        registers: [
          { name: 'STEP_PTR', value: '0x108' },
          { name: 'R1', value: '0x0000' },
          { name: 'R2', value: '0x0024' },
          { name: 'SPEED', value: '1.00 IPC' },
        ],
        assertions: [
          { id: 'p1', label: 'Fast Pass Shortcut', severity: 'pass', detail: 'Ready to share answers early between stages' },
          { id: 'p2', label: 'Wait Delays', severity: 'pass', detail: '0 wait cycles' },
        ],
        consoleLine: '[Step 1] Fetch: ADD R1, R2, R3',
        forwardingActive: false,
        pipelineStages: [
          { stage: 'IF', instruction: 'ADD R1, R2, R3', status: 'active' },
          { stage: 'ID', instruction: 'LOAD R3', status: 'active' },
          { stage: 'EX', instruction: 'LOAD R2', status: 'active' },
          { stage: 'MEM', instruction: 'EMPTY', status: 'idle' },
          { stage: 'WB', instruction: 'EMPTY', status: 'idle' },
        ],
      },
      {
        cycle: 1,
        timestampNs: Math.round(cyclePeriodNs * 10) / 10,
        phaseLabel: 'Step 2: SUB Needs R1',
        activeLine: 3,
        explanation: 'SUB enters right behind ADD. The CPU notices SUB wants to read R1 before ADD has saved it.',
        registers: [
          { name: 'STEP_PTR', value: '0x10C', changed: true },
          { name: 'R1', value: 'WAITING' },
          { name: 'R2', value: '0x0024' },
          { name: 'SPEED', value: '1.00 IPC' },
        ],
        assertions: [
          { id: 'p1', label: 'Dependency Found', severity: 'theory', detail: 'SUB needs R1, which ADD is still computing' },
          { id: 'p2', label: 'Fast Pass Shortcut', severity: 'pass', detail: 'No pause needed because Fast Pass is enabled' },
        ],
        consoleLine: '[Step 2] Fetch: SUB R4, R1, #8 (needs R1 from ADD)',
        forwardingActive: false,
        pipelineStages: [
          { stage: 'IF', instruction: 'SUB R4, R1, #8', status: 'active' },
          { stage: 'ID', instruction: 'ADD R1, R2, R3', status: 'active' },
          { stage: 'EX', instruction: 'LOAD R3', status: 'active' },
          { stage: 'MEM', instruction: 'LOAD R2', status: 'active' },
          { stage: 'WB', instruction: 'EMPTY', status: 'idle' },
        ],
      },
      {
        cycle: 2,
        timestampNs: Math.round(cyclePeriodNs * 20) / 10,
        phaseLabel: 'Step 3: ADD Finishes Math',
        activeLine: 2,
        explanation: 'ADD finishes calculating R1 = 0x003C in Execute. The Fast Pass wire prepares to hand it directly to SUB.',
        registers: [
          { name: 'STEP_PTR', value: '0x110', changed: true },
          { name: 'MATH_OUT', value: '0x003C', changed: true },
          { name: 'R1', value: 'FAST PASS' },
          { name: 'SPEED', value: '1.00 IPC' },
        ],
        assertions: [
          { id: 'p1', label: 'Answer Ready Early', severity: 'pass', detail: 'R1=0x003C is ready right after Execute' },
        ],
        consoleLine: '[Step 3] Execute: ADD calculated R1=0x003C -> Fast Pass ready',
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
        phaseLabel: 'Step 4: Fast Pass Skips Waiting',
        activeLine: 3,
        explanation: 'SUB grabs R1=0x003C directly over the Fast Pass shortcut without pausing the assembly line!',
        registers: [
          { name: 'STEP_PTR', value: '0x114', changed: true },
          { name: 'R1', value: '0x003C', changed: true },
          { name: 'R4', value: '0x0034', changed: true },
          { name: 'SPEED', value: '1.00 IPC' },
        ],
        assertions: [
          { id: 'p1', label: 'Fast Pass Used', severity: 'pass', detail: 'Passed R1 directly to SUB without waiting' },
          { id: 'p2', label: 'Full Speed Kept', severity: 'pass', detail: '1.00 instruction per cycle (0 pauses)' },
        ],
        consoleLine: '[Step 4] Fast Pass: SUB got R1=0x003C early -> R4=0x0034',
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
        phaseLabel: 'Step 5: Save Final Answers',
        activeLine: 4,
        explanation: 'ADD saves R1 permanently while STORE saves R4. Zero time was wasted waiting!',
        registers: [
          { name: 'STEP_PTR', value: '0x120', changed: true },
          { name: 'R1', value: '0x003C' },
          { name: 'R4', value: '0x0034' },
          { name: 'SPEED', value: '1.00 IPC' },
        ],
        assertions: [
          { id: 'p1', label: 'Pipeline Efficiency', severity: 'pass', detail: '100% smooth flow across dependency' },
        ],
        consoleLine: '[Step 5] Done: ADD and SUB both finished with 0 wait delays -> PASS',
        forwardingActive: false,
        pipelineStages: [
          { stage: 'IF', instruction: 'NEXT_TASK', status: 'active' },
          { stage: 'ID', instruction: 'JMP 0x120', status: 'active' },
          { stage: 'EX', instruction: 'STORE [0x4008]', status: 'active' },
          { stage: 'MEM', instruction: 'SUB R4=0x34', status: 'active' },
          { stage: 'WB', instruction: 'ADD R1=0x3C', status: 'active' },
        ],
      },
    ];
  }

  return [
    {
      cycle: 0,
      timestampNs: 0,
      phaseLabel: 'Step 1: Fetch ADD',
      activeLine: 2,
      explanation: 'ADD enters the CPU assembly line. The Fast Pass shortcut is currently turned off.',
      registers: [
        { name: 'STEP_PTR', value: '0x108' },
        { name: 'R1', value: '0x0000' },
        { name: 'WAITS', value: '0' },
        { name: 'SPEED', value: '1.00 IPC' },
      ],
      assertions: [
        { id: 'p1', label: 'Fast Pass Shortcut', severity: 'triage', detail: 'Turned off — CPU will have to pause for R1' },
      ],
      consoleLine: '[Step 1] Fetch: ADD R1, R2, R3',
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'ADD R1, R2, R3', status: 'active' },
        { stage: 'ID', instruction: 'LOAD R3', status: 'active' },
        { stage: 'EX', instruction: 'LOAD R2', status: 'active' },
        { stage: 'MEM', instruction: 'EMPTY', status: 'idle' },
        { stage: 'WB', instruction: 'EMPTY', status: 'idle' },
      ],
    },
    {
      cycle: 1,
      timestampNs: Math.round(cyclePeriodNs * 10) / 10,
      phaseLabel: 'Step 2: SUB Pauses to Wait',
      activeLine: 3,
      explanation: 'SUB needs R1, which ADD has not saved yet. The CPU pauses SUB and inserts an empty WAIT slot.',
      registers: [
        { name: 'STEP_PTR', value: '0x10C', changed: true },
        { name: 'R1', value: 'NOT READY' },
        { name: 'WAITS', value: '1', changed: true },
        { name: 'SPEED', value: '0.67 IPC', changed: true },
      ],
      assertions: [
        { id: 'p1', label: 'Assembly Line Paused', severity: 'triage', detail: 'Empty WAIT bubble inserted (1 cycle lost)' },
      ],
      consoleLine: '[Step 2] PAUSE: SUB waiting for ADD to save R1',
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'SUB R4, R1, #8', status: 'stall' },
        { stage: 'ID', instruction: 'WAIT (EMPTY)', status: 'stall' },
        { stage: 'EX', instruction: 'ADD R1, R2, R3', status: 'active' },
        { stage: 'MEM', instruction: 'LOAD R3', status: 'active' },
        { stage: 'WB', instruction: 'LOAD R2', status: 'active' },
      ],
    },
    {
      cycle: 2,
      timestampNs: Math.round(cyclePeriodNs * 20) / 10,
      phaseLabel: 'Step 3: Second Wait Cycle',
      activeLine: 3,
      explanation: 'ADD is still one stage away from saving R1, so SUB has to wait a second cycle.',
      registers: [
        { name: 'STEP_PTR', value: '0x10C' },
        { name: 'R1', value: 'NOT READY' },
        { name: 'WAITS', value: '2', changed: true },
        { name: 'SPEED', value: '0.50 IPC', changed: true },
      ],
      assertions: [
        { id: 'p1', label: 'Speed Dropped', severity: 'triage', detail: '2 empty wait cycles cut CPU speed in half' },
      ],
      consoleLine: '[Step 3] PAUSE: 2nd WAIT bubble inserted while ADD moves to MEM',
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'SUB R4, R1, #8', status: 'stall' },
        { stage: 'ID', instruction: 'WAIT (EMPTY)', status: 'stall' },
        { stage: 'EX', instruction: 'WAIT (EMPTY)', status: 'stall' },
        { stage: 'MEM', instruction: 'ADD R1, R2, R3', status: 'active' },
        { stage: 'WB', instruction: 'LOAD R3', status: 'active' },
      ],
    },
    {
      cycle: 3,
      timestampNs: Math.round(cyclePeriodNs * 30) / 10,
      phaseLabel: 'Step 4: ADD Saves R1',
      activeLine: 2,
      explanation: 'ADD finally writes R1=0x003C in the last stage. Now SUB can finally read it and move forward.',
      registers: [
        { name: 'STEP_PTR', value: '0x110', changed: true },
        { name: 'R1', value: '0x003C', changed: true },
        { name: 'WAITS', value: '2' },
        { name: 'SPEED', value: '0.60 IPC', changed: true },
      ],
      assertions: [
        { id: 'p1', label: 'R1 Saved', severity: 'pass', detail: 'R1=0x003C is now available' },
        { id: 'p2', label: 'Wasted Time', severity: 'triage', detail: '2 cycles wasted; turn on Fast Pass Shortcut to fix' },
      ],
      consoleLine: '[Step 4] Saved: ADD wrote R1=0x003C | SUB resumes',
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'STORE [0x4008], R4', status: 'active' },
        { stage: 'ID', instruction: 'SUB R4, R1, #8', status: 'active' },
        { stage: 'EX', instruction: 'WAIT (EMPTY)', status: 'stall' },
        { stage: 'MEM', instruction: 'WAIT (EMPTY)', status: 'stall' },
        { stage: 'WB', instruction: 'ADD R1=0x3C', status: 'active' },
      ],
    },
    {
      cycle: 4,
      timestampNs: Math.round(cyclePeriodNs * 40) / 10,
      phaseLabel: 'Step 5: SUB Finishes Late',
      activeLine: 3,
      explanation: 'SUB gets the right answer (R4=0x0034), but it finished 2 cycles later than necessary.',
      registers: [
        { name: 'STEP_PTR', value: '0x114', changed: true },
        { name: 'R1', value: '0x003C' },
        { name: 'R4', value: '0x0034', changed: true },
        { name: 'SPEED', value: '0.60 IPC' },
      ],
      assertions: [
        { id: 'p1', label: 'Answer Correct', severity: 'pass', detail: 'R4=0x0034 calculated accurately' },
        { id: 'p2', label: 'Slowdown Detected', severity: 'triage', detail: 'Turn on "Fast Pass Shortcut" to remove the 2 wait cycles' },
      ],
      consoleLine: '[Step 5] Done: SUB finished late (2 wait cycles lost)',
      forwardingActive: false,
      pipelineStages: [
        { stage: 'IF', instruction: 'JMP 0x120', status: 'active' },
        { stage: 'ID', instruction: 'STORE [0x4008], R4', status: 'active' },
        { stage: 'EX', instruction: 'SUB R4 (0x34)', status: 'active' },
        { stage: 'MEM', instruction: 'WAIT (EMPTY)', status: 'stall' },
        { stage: 'WB', instruction: 'WAIT (EMPTY)', status: 'stall' },
      ],
    },
  ];
}

function buildConcurrencyFrames(params: WorkbenchParams): SimulationFrame[] {
  const { mutexEnabled, atomicOps } = params;
  const protectedMode = mutexEnabled || atomicOps;

  if (protectedMode) {
    const modeLabel = atomicOps ? 'Single-Step Atomic Update' : 'Turn-Taking Lock';
    return [
      {
        cycle: 0,
        timestampNs: 0,
        phaseLabel: 'Step 1: Starting Balance',
        activeLine: 0,
        explanation: `Both threads want to update Balance = 100. ${modeLabel} makes sure they go one at a time.`,
        registers: [
          { name: 'BALANCE', value: '100' },
          { name: 'LOCK', value: 'OPEN' },
          { name: 'THREAD_A', value: '+50' },
          { name: 'THREAD_B', value: '-30' },
        ],
        assertions: [
          { id: 'c1', label: 'Turn-Taking Active', severity: 'pass', detail: `${modeLabel} keeps updates safe` },
        ],
        consoleLine: `[0ms] Step 1: Balance starts at 100 (${modeLabel})`,
        sharedBalance: 100,
        threadActions: [
          { thread: 'Thread A', operation: 'READY (+50)', status: 'running', localValue: '—' },
          { thread: 'Thread B', operation: 'READY (-30)', status: 'running', localValue: '—' },
        ],
      },
      {
        cycle: 1,
        timestampNs: 10,
        phaseLabel: 'Step 2: Thread A Goes First',
        activeLine: 2,
        explanation: 'Thread A locks the balance and reads 100. Thread B arrives and waits politely in line.',
        registers: [
          { name: 'BALANCE', value: '100' },
          { name: 'LOCK', value: 'THREAD_A', changed: true },
          { name: 'A_READ', value: '100', changed: true },
          { name: 'B_STATE', value: 'WAITING', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'Thread B Waiting', severity: 'triage', detail: 'Thread B waits until Thread A unlocks' },
          { id: 'c2', label: 'Safe Access', severity: 'pass', detail: 'Only one thread edits at a time' },
        ],
        consoleLine: '[10ms] Step 2: Thread A locked & read 100 | Thread B waiting',
        sharedBalance: 100,
        threadActions: [
          { thread: 'Thread A', operation: 'LOCKED · read 100', status: 'locked', localValue: 'read=100' },
          { thread: 'Thread B', operation: 'WAITING IN LINE', status: 'waiting', localValue: 'paused' },
        ],
      },
      {
        cycle: 2,
        timestampNs: 22,
        phaseLabel: 'Step 3: Thread A Saves 150',
        activeLine: 6,
        explanation: 'Thread A saves 150 (100 + 50) and unlocks so Thread B can go next.',
        registers: [
          { name: 'BALANCE', value: '150', changed: true },
          { name: 'LOCK', value: 'OPEN', changed: true },
          { name: 'A_SAVED', value: '150', changed: true },
          { name: 'B_STATE', value: 'NEXT', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'Thread A Done', severity: 'pass', detail: 'Balance updated 100 -> 150' },
        ],
        consoleLine: '[22ms] Step 3: Thread A saved 150 and unlocked',
        sharedBalance: 150,
        threadActions: [
          { thread: 'Thread A', operation: 'DONE · saved 150', status: 'done', localValue: '150' },
          { thread: 'Thread B', operation: 'STARTING', status: 'running', localValue: '—' },
        ],
      },
      {
        cycle: 3,
        timestampNs: 34,
        phaseLabel: 'Step 4: Thread B Reads 150',
        activeLine: 3,
        explanation: 'Thread B locks the balance, reads the fresh 150, and subtracts 30 to get 120.',
        registers: [
          { name: 'BALANCE', value: '150' },
          { name: 'LOCK', value: 'THREAD_B', changed: true },
          { name: 'B_READ', value: '150', changed: true },
          { name: 'B_NEW', value: '120', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'Fresh Read', severity: 'pass', detail: 'Thread B sees Thread A’s new balance (150)' },
        ],
        consoleLine: '[34ms] Step 4: Thread B locked, read 150, calculated 120',
        sharedBalance: 150,
        threadActions: [
          { thread: 'Thread A', operation: 'DONE', status: 'done', localValue: '150' },
          { thread: 'Thread B', operation: 'LOCKED · 150 - 30', status: 'locked', localValue: 'new=120' },
        ],
      },
      {
        cycle: 4,
        timestampNs: 46,
        phaseLabel: 'Step 5: Exact Final Balance',
        activeLine: 6,
        explanation: 'Thread B saves 120 and unlocks. 100 + 50 - 30 = 120 — nothing was lost!',
        registers: [
          { name: 'BALANCE', value: '120', changed: true },
          { name: 'EXPECTED', value: '120' },
          { name: 'LOCK', value: 'OPEN', changed: true },
          { name: 'STATUS', value: 'PASS', changed: true },
        ],
        assertions: [
          { id: 'c1', label: 'No Lost Updates', severity: 'pass', detail: 'Final balance 120 matches expected 120' },
        ],
        consoleLine: '[46ms] Step 5: Thread B saved 120 -> PASS',
        sharedBalance: 120,
        threadActions: [
          { thread: 'Thread A', operation: 'SAVED (+50)', status: 'done', localValue: '150' },
          { thread: 'Thread B', operation: 'SAVED (-30)', status: 'done', localValue: '120' },
        ],
      },
    ];
  }

  return [
    {
      cycle: 0,
      timestampNs: 0,
      phaseLabel: 'Step 1: Starting Balance',
      activeLine: 0,
      explanation: 'No lock is turned on. Both Thread A and Thread B jump in at the exact same time.',
      registers: [
        { name: 'BALANCE', value: '100' },
        { name: 'LOCK', value: 'OFF' },
        { name: 'THREAD_A', value: '+50' },
        { name: 'THREAD_B', value: '-30' },
      ],
      assertions: [
        { id: 'c1', label: 'Turn-Taking Off', severity: 'fault', detail: 'Nothing stops both threads from overlapping' },
      ],
      consoleLine: '[0ms] Step 1: Balance starts at 100 (NO LOCK)',
      sharedBalance: 100,
      threadActions: [
        { thread: 'Thread A', operation: 'READY (+50)', status: 'running', localValue: '—' },
        { thread: 'Thread B', operation: 'READY (-30)', status: 'running', localValue: '—' },
      ],
    },
    {
      cycle: 1,
      timestampNs: 10,
      phaseLabel: 'Step 2: Both Read 100 at Once',
      activeLine: 3,
      explanation: 'Thread A and Thread B both read 100 before either one saves. Now both hold the same old copy!',
      registers: [
        { name: 'BALANCE', value: '100' },
        { name: 'A_READ', value: '100', changed: true },
        { name: 'B_READ', value: '100', changed: true },
        { name: 'CLASH', value: 'YES', changed: true },
      ],
      assertions: [
        { id: 'c1', label: 'Overlapping Reads', severity: 'triage', detail: 'Both threads copied balance=100 at the same time' },
      ],
      consoleLine: '[10ms] Step 2: Thread A read 100 AND Thread B read 100',
      sharedBalance: 100,
      threadActions: [
        { thread: 'Thread A', operation: 'READ 100', status: 'race', localValue: 'read=100' },
        { thread: 'Thread B', operation: 'READ 100', status: 'race', localValue: 'read=100' },
      ],
    },
    {
      cycle: 2,
      timestampNs: 20,
      phaseLabel: 'Step 3: Separate Math',
      activeLine: 4,
      explanation: 'Thread A calculates 100 + 50 = 150. Meanwhile, Thread B calculates 100 - 30 = 70.',
      registers: [
        { name: 'BALANCE', value: '100' },
        { name: 'A_NEW', value: '150', changed: true },
        { name: 'B_NEW', value: '70', changed: true },
        { name: 'SKEW', value: `${params.threadSkewMs}ms` },
      ],
      assertions: [
        { id: 'c1', label: 'Out-of-Sync Values', severity: 'fault', detail: 'Thread B is using an outdated number' },
      ],
      consoleLine: '[20ms] Step 3: A calculated 150 | B calculated 70',
      sharedBalance: 100,
      threadActions: [
        { thread: 'Thread A', operation: 'ADD 100 + 50', status: 'race', localValue: 'new=150' },
        { thread: 'Thread B', operation: 'SUB 100 - 30', status: 'race', localValue: 'new=70' },
      ],
    },
    {
      cycle: 3,
      timestampNs: 30,
      phaseLabel: 'Step 4: Thread A Saves 150',
      activeLine: 5,
      explanation: 'Thread A saves 150 to the shared balance, not knowing Thread B is about to overwrite it.',
      registers: [
        { name: 'BALANCE', value: '150', changed: true },
        { name: 'A_STATE', value: 'DONE' },
        { name: 'B_NEW', value: '70' },
        { name: 'RISK', value: 'HIGH' },
      ],
      assertions: [
        { id: 'c1', label: 'Overwrite About to Happen', severity: 'fault', detail: 'Thread B is still holding 70' },
      ],
      consoleLine: '[30ms] Step 4: Thread A saved 150',
      sharedBalance: 150,
      threadActions: [
        { thread: 'Thread A', operation: 'SAVED 150', status: 'done', localValue: '150' },
        { thread: 'Thread B', operation: 'SAVING 70...', status: 'race', localValue: 'new=70' },
      ],
    },
    {
      cycle: 4,
      timestampNs: 42,
      phaseLabel: 'Step 5: Update Lost!',
      activeLine: 5,
      explanation: 'Thread B saves 70, wiping out Thread A’s +50 deposit! Expected 120, ended with 70.',
      registers: [
        { name: 'BALANCE', value: '70', changed: true },
        { name: 'EXPECTED', value: '120' },
        { name: 'MISSING', value: '-50', changed: true },
        { name: 'STATUS', value: 'FAULT', changed: true },
      ],
      assertions: [
        { id: 'c1', label: 'Final Balance == 120', severity: 'fault', detail: 'Got 70 instead of 120 — Thread A’s +50 was erased!' },
        { id: 'c2', label: 'How to Fix', severity: 'triage', detail: 'Turn on "Turn-Taking Lock" or "Single-Step Atomic Update"' },
      ],
      consoleLine: '[42ms] FAULT: Thread B overwrote 150 with 70 (+50 lost)',
      sharedBalance: 70,
      threadActions: [
        { thread: 'Thread A', operation: 'ERASED (+50)', status: 'race', localValue: '150' },
        { thread: 'Thread B', operation: 'OVERWROTE (70)', status: 'race', localValue: '70' },
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
      phaseLabel: 'Step 1: Queue 6 Packets',
      activeLine: 0,
      explanation: `Packets 101 to 106 are lined up to send. The batch size (window) allows ${windowSize} packets in transit at once.`,
      registers: [
        { name: 'BATCH_SIZE', value: `${windowSize}` },
        { name: 'FIRST_PKT', value: '101' },
        { name: 'DROP_RATE', value: `${dropRatePct}%` },
        { name: 'QUICK_RTX', value: fastRetransmit ? 'ON' : 'OFF' },
      ],
      assertions: [
        { id: 'n1', label: 'Queue Ready', severity: 'pass', detail: `6 packets waiting, batch size = ${windowSize}` },
      ],
      consoleLine: `[0ms] Step 1: 6 packets queued (batch size=${windowSize}, drop=${dropRatePct}%)`,
      throughputMbps: baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq) => ({
        seq,
        state: 'queued',
        payload: `PKT_${seq}`,
      })),
    },
    {
      cycle: 1,
      timestampNs: 14,
      phaseLabel: 'Step 2: Send Batch Together',
      activeLine: 2,
      explanation: `Instead of sending one by one, the sender puts ${Math.min(windowSize, 6)} packets on the wire at the same time.`,
      registers: [
        { name: 'IN_TRANSIT', value: `${Math.min(windowSize, 6)}`, changed: true },
        { name: 'NEXT_PKT', value: `${101 + Math.min(windowSize, 6)}`, changed: true },
        { name: 'TRIP_TIME', value: '14ms' },
        { name: 'SPEED', value: `${baseThroughput}Mb/s` },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Link Usage',
          severity: windowSize >= 3 ? 'pass' : 'triage',
          detail: windowSize >= 3 ? 'Batch size keeps the network busy' : 'Small batch leaves bandwidth unused',
        },
      ],
      consoleLine: `[14ms] Step 2: Sent batch 101..${100 + Math.min(windowSize, 6)}`,
      throughputMbps: baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq, idx) => ({
        seq,
        state: idx < windowSize ? 'in-flight' : 'queued',
        payload: `PKT_${seq}`,
      })),
    },
    {
      cycle: 2,
      timestampNs: 28,
      phaseLabel: hasDrop ? 'Step 3: Packet 102 Dropped' : 'Step 3: Smooth Travel',
      activeLine: 5,
      explanation: hasDrop
        ? 'Packet 102 gets lost on the wire! Packet 101 arrives safely, and later packets warn the sender that #102 is missing.'
        : 'All packets travel across the wire cleanly with zero loss.',
      registers: [
        { name: 'CONFIRMED', value: '101', changed: true },
        { name: 'LOST_PKT', value: hasDrop ? '102' : 'NONE', changed: hasDrop },
        { name: 'WARNINGS', value: hasDrop ? '2' : '0', changed: hasDrop },
        { name: 'SPEED', value: `${hasDrop ? Math.round(baseThroughput * 0.72) : baseThroughput}Mb/s` },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Packet Delivery',
          severity: hasDrop ? 'triage' : 'pass',
          detail: hasDrop ? 'Packet 102 dropped — receiver noticed a gap' : 'Zero packets lost',
        },
      ],
      consoleLine: hasDrop ? '[28ms] Step 3: Packet 102 lost; receiver asks for #102' : '[28ms] Step 3: Packets 101..103 arrived safely',
      throughputMbps: hasDrop ? Math.round(baseThroughput * 0.72) : baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq, idx) => {
        if (seq === 101) return { seq, state: 'acked', payload: `PKT_${seq}` };
        if (hasDrop && seq === 102) return { seq, state: 'dropped', payload: `PKT_${seq}` };
        return { seq, state: idx < windowSize ? 'in-flight' : 'queued', payload: `PKT_${seq}` };
      }),
    },
    {
      cycle: 3,
      timestampNs: 42,
      phaseLabel: hasDrop ? (fastRetransmit ? 'Step 4: Quick Resend' : 'Step 4: Slow Timeout') : 'Step 4: Batch Advances',
      activeLine: fastRetransmit ? 5 : 6,
      explanation: hasDrop
        ? fastRetransmit
          ? 'Because Quick Resend is on, the sender immediately resends Packet 102 without waiting for a long timer.'
          : 'Quick Resend is off! The sender freezes and waits 200ms for a timeout before resending #102.'
        : 'The batch moves forward smoothly to send the remaining packets.',
      registers: [
        { name: 'RESENT', value: hasDrop ? '1' : '0', changed: hasDrop },
        { name: 'WAIT_MS', value: hasDrop && !fastRetransmit ? '200ms' : '0ms', changed: hasDrop && !fastRetransmit },
        { name: 'FIRST_PKT', value: hasDrop ? '102' : '104', changed: true },
        { name: 'SPEED', value: `${hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.35) : baseThroughput}Mb/s` },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Loss Recovery',
          severity: !hasDrop || fastRetransmit ? 'pass' : 'fault',
          detail: !hasDrop
            ? 'No recovery needed'
            : fastRetransmit
              ? 'Quick Resend replaced Packet 102 right away'
              : '200ms timeout pause slowed down the entire transfer',
        },
      ],
      consoleLine: hasDrop
        ? fastRetransmit
          ? '[42ms] Step 4: Quick Resend sent Packet 102 immediately'
          : '[42ms] Step 4: Stalled for 200ms waiting on timeout'
        : '[42ms] Step 4: Batch moved forward to Packet 104',
      throughputMbps: hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.35) : baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq, idx) => {
        if (seq === 101) return { seq, state: 'acked', payload: `PKT_${seq}` };
        if (hasDrop && seq === 102) {
          return { seq, state: fastRetransmit ? 'retransmitted' : 'dropped', payload: `PKT_${seq}` };
        }
        return { seq, state: idx < windowSize + 1 ? 'acked' : 'in-flight', payload: `PKT_${seq}` };
      }),
    },
    {
      cycle: 4,
      timestampNs: 56,
      phaseLabel: 'Step 5: All Packets Confirmed',
      activeLine: 6,
      explanation:
        hasDrop && !fastRetransmit
          ? 'All 6 packets finally arrived, but the 200ms wait cut speed in half.'
          : 'All 6 packets arrived in order and were confirmed by the receiver.',
      registers: [
        { name: 'CONFIRMED', value: '6 / 6', changed: true },
        { name: 'SPEED', value: `${hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.45) : baseThroughput}Mb/s` },
        { name: 'LOSS', value: `${dropRatePct}%` },
        { name: 'STATUS', value: hasDrop && !fastRetransmit ? 'SLOW' : 'PASS' },
      ],
      assertions: [
        {
          id: 'n1',
          label: 'Complete Delivery',
          severity: hasDrop && !fastRetransmit ? 'triage' : 'pass',
          detail:
            hasDrop && !fastRetransmit
              ? 'Finished with a 200ms delay (turn on Quick Resend to fix)'
              : 'All 6 packets delivered in order at full speed',
        },
      ],
      consoleLine:
        hasDrop && !fastRetransmit
          ? '[56ms] Step 5: Finished slowly due to 200ms wait'
          : '[56ms] Step 5: All 6 packets confirmed -> PASS',
      throughputMbps: hasDrop && !fastRetransmit ? Math.round(baseThroughput * 0.45) : baseThroughput,
      packets: [101, 102, 103, 104, 105, 106].map((seq) => ({
        seq,
        state: 'acked',
        payload: `PKT_${seq}`,
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
