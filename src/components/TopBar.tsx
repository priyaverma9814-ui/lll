import React from 'react';
import { Play, Pause, Menu, X } from 'lucide-react';
import { AppScreen } from '../types/workbench';

interface TopBarProps {
  activeScreen: AppScreen;
  onSelectScreen: (screen: AppScreen) => void;
  isPlaying: boolean;
  onPrimaryAction: () => void;
}

const NAV_ITEMS: { id: AppScreen; label: string }[] = [
  { id: 'workbench', label: 'Workbench' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'curriculum', label: 'Curriculum' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onSelectScreen,
  isPlaying,
  onPrimaryAction,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const primaryLabel =
    activeScreen === 'workbench'
      ? isPlaying
        ? 'Pause Simulation'
        : 'Run Simulation'
      : 'Open Workbench';

  return (
    <header className="sticky top-0 z-40 border-b border-[#232d3f] bg-[#0b0f17]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-10">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectScreen('workbench')}
          className="font-display text-lg font-bold tracking-tight text-[#e0fdff] transition-colors hover:text-[#00f2fe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe] whitespace-nowrap shrink-0 cursor-pointer"
        >
          CoreTech Zero-to-One
        </button>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const active = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectScreen(item.id)}
                className={`relative py-1.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe] rounded-sm ${
                  active ? 'text-[#00f2fe]' : 'text-[#b9cacb] hover:text-[#dfe2ee]'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#00f2fe] shadow-[0_0_8px_rgba(0,242,254,0.65)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[#00f2fe] px-4 py-2 text-xs font-semibold text-[#0b0f17] transition-all duration-150 ct-btn-cyan-hover hover:bg-[#6ff6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {activeScreen === 'workbench' && (
              isPlaying ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{primaryLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-[0.25rem] border border-[#232d3f] bg-[#141a24] text-[#dfe2ee] hover:border-[#38bdf8] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#232d3f] bg-[#101622] px-4 py-3 flex flex-wrap gap-2"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectScreen(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`rounded-[0.25rem] px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1c2433] text-[#00f2fe] border border-[#00f2fe]'
                    : 'bg-[#141a24] text-[#b9cacb] border border-[#232d3f]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};
