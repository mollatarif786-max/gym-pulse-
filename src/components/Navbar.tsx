import React from 'react';
import { Home, Dumbbell, Utensils, TrendingUp, User } from 'lucide-react';

export type NavTab = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasActiveWorkout?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, hasActiveWorkout }) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'workout' as NavTab, label: 'Gym Workout', icon: Dumbbell, badge: hasActiveWorkout ? 'Active' : undefined },
    { id: 'nutrition' as NavTab, label: 'Nutrition', icon: Utensils },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav
      id="bottom_main_navigation"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] px-2 py-2 max-w-5xl mx-auto md:sticky md:bottom-auto md:top-0 md:border-b md:border-t-0 md:py-3"
    >
      <div className="flex items-center justify-around md:justify-between max-w-4xl mx-auto">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-[#EDEDED]">GymPulse</span>
            <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-medium border border-orange-500/20">PRO</span>
          </div>
        </div>

        <div className="flex items-center justify-around w-full md:w-auto md:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav_btn_${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-orange-400 font-semibold bg-orange-500/10 border border-orange-500/30 shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-orange-400' : 'text-[#737373]'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-xs md:text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
