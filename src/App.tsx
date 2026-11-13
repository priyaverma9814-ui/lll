/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AppScreen,
  ModuleId,
  TriageChallenge,
  WorkbenchParams,
} from './types/workbench';
import {
  DEFAULT_PARAMS,
  ENGINEERING_MODULES,
  generateSimulationFrames,
} from './data/simulations';
import { TRIAGE_CHALLENGES } from './data/challenges';
import { TopBar } from './components/TopBar';
import { WorkbenchScreen } from './components/WorkbenchScreen';
import { ArchitectureScreen } from './components/ArchitectureScreen';
import { ChallengesScreen } from './components/ChallengesScreen';
import { CurriculumScreen } from './components/CurriculumScreen';

const STORAGE_MODULES_KEY = 'coretech_completed_modules_v1';
const STORAGE_CHALLENGES_KEY = 'coretech_solved_challenges_v1';

export default function App() {
  const [activeScreen, setActiveScreen] = React.useState<AppScreen>('workbench');
  const [activeModuleId, setActiveModuleId] =
    React.useState<ModuleId>('memory-stack');
  const [params, setParams] = React.useState<WorkbenchParams>(DEFAULT_PARAMS);
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  const [completedModules, setCompletedModules] = React.useState<ModuleId[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_MODULES_KEY);
      return raw ? (JSON.parse(raw) as ModuleId[]) : [];
    } catch {
      return [];
    }
  });

  const [solvedChallenges, setSolvedChallenges] = React.useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CHALLENGES_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const activeModule = React.useMemo(
    () =>
      ENGINEERING_MODULES.find((m) => m.id === activeModuleId) ??
      ENGINEERING_MODULES[0],
    [activeModuleId]
  );

  const frames = React.useMemo(
    () => generateSimulationFrames(activeModuleId, params),
    [activeModuleId, params]
  );

  // Clamp currentStep if frames length changes
  React.useEffect(() => {
    if (currentStep >= frames.length) {
      setCurrentStep(frames.length - 1);
    }
  }, [frames.length, currentStep]);

  // Playback loop when running simulation
  React.useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);
    return () => window.clearInterval(timer);
  }, [isPlaying, frames.length]);

  const handleSelectModule = (id: ModuleId) => {
    setIsPlaying(false);
    setActiveModuleId(id);
    setCurrentStep(0);
  };

  const handleUpdateParams = (patch: Partial<WorkbenchParams>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  };

  const handleTogglePlay = () => {
    if (!isPlaying && currentStep >= frames.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handlePrimaryTopBarAction = () => {
    if (activeScreen === 'workbench') {
      handleTogglePlay();
    } else {
      setActiveScreen('workbench');
    }
  };

  const handleMarkModuleComplete = (id: ModuleId) => {
    setCompletedModules((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_MODULES_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  };

  const handleSolveChallenge = (challengeId: string) => {
    setSolvedChallenges((prev) => {
      if (prev.includes(challengeId)) return prev;
      const next = [...prev, challengeId];
      try {
        localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  };

  const handleLaunchChallengeInWorkbench = (challenge: TriageChallenge) => {
    setIsPlaying(false);
    setActiveModuleId(challenge.moduleId);
    setParams((prev) => ({ ...prev, ...challenge.initialParams }));
    setCurrentStep(frames.length - 1);
    setActiveScreen('workbench');
  };

  const handleLaunchModuleFromCurriculum = (id: ModuleId) => {
    handleSelectModule(id);
    setActiveScreen('workbench');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-[#dfe2ee] flex flex-col">
      <TopBar
        activeScreen={activeScreen}
        onSelectScreen={(screen) => {
          if (screen !== 'workbench') setIsPlaying(false);
          setActiveScreen(screen);
        }}
        isPlaying={isPlaying}
        onPrimaryAction={handlePrimaryTopBarAction}
      />

      <div className="flex-1">
        {activeScreen === 'workbench' && (
          <WorkbenchScreen
            modules={ENGINEERING_MODULES}
            activeModule={activeModule}
            onSelectModule={handleSelectModule}
            params={params}
            onUpdateParams={handleUpdateParams}
            frames={frames}
            currentStep={currentStep}
            onStepChange={(step) => {
              setIsPlaying(false);
              setCurrentStep(step);
            }}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            completedModules={completedModules}
            onMarkComplete={handleMarkModuleComplete}
          />
        )}

        {activeScreen === 'architecture' && (
          <ArchitectureScreen
            onOpenWorkbench={() => setActiveScreen('workbench')}
          />
        )}

        {activeScreen === 'challenges' && (
          <ChallengesScreen
            challenges={TRIAGE_CHALLENGES}
            solvedChallenges={solvedChallenges}
            onSolveChallenge={handleSolveChallenge}
            onLaunchInWorkbench={handleLaunchChallengeInWorkbench}
            baseParams={DEFAULT_PARAMS}
          />
        )}

        {activeScreen === 'curriculum' && (
          <CurriculumScreen
            modules={ENGINEERING_MODULES}
            completedModules={completedModules}
            onLaunchModule={handleLaunchModuleFromCurriculum}
          />
        )}
      </div>

      {/* Quiet, minimal footer */}
      <footer className="border-t border-[#232d3f] bg-[#0f131c]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10 text-xs text-[#94a3b8]">
          <span>CoreTech Zero-to-One · Systems Engineering Environment</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveScreen('workbench')}
              className="hover:text-[#00f2fe] transition-colors cursor-pointer"
            >
              Workbench
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('architecture')}
              className="hover:text-[#00f2fe] transition-colors cursor-pointer"
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('challenges')}
              className="hover:text-[#00f2fe] transition-colors cursor-pointer"
            >
              Challenges
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('curriculum')}
              className="hover:text-[#00f2fe] transition-colors cursor-pointer"
            >
              Curriculum
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
