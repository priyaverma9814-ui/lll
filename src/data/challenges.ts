import { TriageChallenge, WorkbenchParams } from '../types/workbench';

export const TRIAGE_CHALLENGES: TriageChallenge[] = [
  {
    id: 'stack-smash-01',
    index: 'Lab 01',
    title: 'Stop Extra Bytes From Breaking the Return Address',
    moduleId: 'memory-stack',
    severity: 'fault',
    symptom:
      'Copying 20 bytes into a 12-byte box spills over, wiping out the Safety Marker and the Return Address.',
    rootCauseHint:
      'Turn on "Check Size Before Copying" so oversized inputs are blocked, and keep the Safety Marker turned on.',
    initialParams: {
      writeSize: 20,
      boundsCheck: false,
      stackCanary: false,
    },
    targetParams: {
      writeSize: 20,
      boundsCheck: true,
      stackCanary: true,
    },
    verify: (p: WorkbenchParams) => {
      const safeWrite = p.boundsCheck || p.writeSize <= 12;
      const canaryOk = p.stackCanary;
      return {
        passed: safeWrite && canaryOk,
        checks: [
          {
            id: 'chk-bounds',
            label: 'No Memory Spills Outside the 12-Byte Box',
            severity: safeWrite ? 'pass' : 'fault',
            detail: safeWrite
              ? p.boundsCheck
                ? 'Size check blocks inputs larger than 12 bytes before copying'
                : 'Input fits safely inside 12 bytes'
              : `Copying ${p.writeSize} bytes overflows the 12-byte box`,
          },
          {
            id: 'chk-canary',
            label: 'Safety Marker Turned On',
            severity: canaryOk ? 'pass' : 'triage',
            detail: canaryOk
              ? 'Safety marker watches the return address'
              : 'Turn on the Safety Marker for backup protection',
          },
        ],
      };
    },
  },
  {
    id: 'raw-hazard-02',
    index: 'Lab 02',
    title: 'Remove the 2-Cycle CPU Wait Delay',
    moduleId: 'cpu-pipeline',
    severity: 'triage',
    symptom:
      'SUB pauses for 2 cycles waiting for ADD to finish saving R1, slowing the CPU down to 0.60 instructions per cycle.',
    rootCauseHint:
      'Turn on the "Fast Pass Shortcut" so ADD hands R1 straight to SUB, and turn on Branch Prediction.',
    initialParams: {
      forwardingEnabled: false,
      branchPredict: false,
      clockRateGhz: 2.8,
    },
    targetParams: {
      forwardingEnabled: true,
      branchPredict: true,
      clockRateGhz: 3.6,
    },
    verify: (p: WorkbenchParams) => {
      const noStalls = p.forwardingEnabled;
      const ipcTarget = p.forwardingEnabled && p.branchPredict;
      return {
        passed: noStalls && ipcTarget,
        checks: [
          {
            id: 'chk-fwd',
            label: 'Fast Pass Shortcut Active',
            severity: noStalls ? 'pass' : 'fault',
            detail: noStalls
              ? '0 wait cycles when SUB reads R1'
              : '2 empty wait cycles slowing down the pipeline',
          },
          {
            id: 'chk-bp',
            label: 'Full Speed Kept (1.00 IPC)',
            severity: ipcTarget ? 'pass' : 'triage',
            detail: ipcTarget
              ? 'Pipeline runs smoothly at 1.00 instruction per cycle'
              : 'Turn on Branch Prediction so jumps do not pause the line',
          },
        ],
      };
    },
  },
  {
    id: 'lost-update-03',
    index: 'Lab 03',
    title: 'Stop Two Threads From Erasing Each Other’s Work',
    moduleId: 'concurrency-mutex',
    severity: 'fault',
    symptom:
      'Thread A (+50) and Thread B (-30) both read 100 at the same time. The final balance ends at 70 instead of 120.',
    rootCauseHint:
      'Make the threads take turns using the Turn-Taking Lock or Single-Step Atomic Update.',
    initialParams: {
      mutexEnabled: false,
      atomicOps: false,
      threadSkewMs: 15,
    },
    targetParams: {
      mutexEnabled: true,
      atomicOps: false,
      threadSkewMs: 15,
    },
    verify: (p: WorkbenchParams) => {
      const guarded = p.mutexEnabled || p.atomicOps;
      return {
        passed: guarded,
        checks: [
          {
            id: 'chk-serial',
            label: 'Final Balance Equals 120',
            severity: guarded ? 'pass' : 'fault',
            detail: guarded
              ? 'Threads took turns cleanly: 100 + 50 - 30 = 120'
              : 'Update lost! Balance ended at 70 instead of 120',
          },
          {
            id: 'chk-race',
            label: 'No Overlapping Reads',
            severity: guarded ? 'pass' : 'fault',
            detail: guarded
              ? 'Only one thread reads and saves at a time'
              : 'Both threads read the same old value simultaneously',
          },
        ],
      };
    },
  },
  {
    id: 'tail-latency-04',
    index: 'Lab 04',
    title: 'Resend a Lost Packet Without a 200ms Freeze',
    moduleId: 'packet-routing',
    severity: 'triage',
    symptom:
      'When Packet 102 gets dropped, the sender freezes for a 200ms timeout, making the transfer slow.',
    rootCauseHint:
      'Turn on "Quick Resend" and set Batch Size to at least 4 packets so missing notices arrive right away.',
    initialParams: {
      windowSize: 2,
      dropRatePct: 20,
      fastRetransmit: false,
    },
    targetParams: {
      windowSize: 4,
      dropRatePct: 20,
      fastRetransmit: true,
    },
    verify: (p: WorkbenchParams) => {
      const rtxOk = p.fastRetransmit;
      const winOk = p.windowSize >= 4;
      return {
        passed: rtxOk && winOk,
        checks: [
          {
            id: 'chk-rtx',
            label: 'Quick Resend Turned On',
            severity: rtxOk ? 'pass' : 'fault',
            detail: rtxOk
              ? 'Lost packet resent immediately on missing notice'
              : '200ms timeout pause is slowing down recovery',
          },
          {
            id: 'chk-win',
            label: 'Batch Size >= 4 Packets',
            severity: winOk ? 'pass' : 'triage',
            detail: winOk
              ? `Batch size (${p.windowSize}) is large enough to trigger quick resend`
              : `Batch size (${p.windowSize}) is too small to spot gaps early`,
          },
        ],
      };
    },
  },
];
