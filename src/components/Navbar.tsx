import React from 'react';
import { Home, Dumbbell, Utensils, TrendingUp, User as UserIcon, Cloud, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

export type NavTab = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasActiveWorkout?: boolean;
  currentUser?: User | null;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  hasActiveWorkout,
  currentUser,
  onOpenLogin,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'workout' as NavTab, label: 'Gym Workout', icon: Dumbbell, badge: hasActiveWorkout ? 'Active' : undefined },
    { id: 'nutrition' as NavTab, label: 'Nutrition', icon: Utensils },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav
      id="bottom_main_navigation"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] px-2 py-2 max-w-5xl mx-auto md:sticky md:bottom-auto md:top-0 md:border-b md:border-t-0 md:py-2.5"
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

        <div className="flex items-center justify-around w-full md:w-auto md:gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav_btn_${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl transition-all duration-150 cursor-pointer ${
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

          {/* Google Auth Status / Sign In Button */}
          <div className="hidden md:flex items-center ml-2 pl-2 border-l border-[#262626]">
            {currentUser ? (
              <button
                type="button"
                id="navbar_user_profile_btn"
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#171717] hover:bg-[#262626] border border-emerald-500/40 text-xs font-semibold text-[#EDEDED] transition-all cursor-pointer"
                title={`Signed in as ${currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400/60"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <span className="max-w-[100px] truncate">{currentUser.displayName?.split(' ')[0] || 'Synced'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            ) : (
              <button
                type="button"
                id="navbar_signin_google_btn"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

