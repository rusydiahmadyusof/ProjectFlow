'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAV_ITEMS, UTILITY_NAV_ITEMS } from './constants/navigation';

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1a202c] border-r border-[#e8ebf3] dark:border-[#2d3748]">
      <Link href="/" className="p-6 pb-2 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary aspect-square rounded-full size-10 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold leading-normal">ProjectFlow</h1>
            <p className="text-[#506395] text-xs font-normal">Manage efficiently</p>
          </div>
        </div>
      </Link>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold text-[#506395] uppercase tracking-wider mb-2">
            Main
          </p>
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:text-blue-400'
                    : 'text-[#506395] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label={item.label}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-1' : ''}`}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#e8ebf3] dark:border-[#2d3748]">
          <p className="px-3 text-xs font-semibold text-[#506395] uppercase tracking-wider mb-2">
            Utility
          </p>
          {UTILITY_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            if (item.isDanger) {
              return (
                <button
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-danger hover:bg-red-50 dark:hover:bg-red-900/10"
                  aria-label={item.label}
                  onClick={() => console.log('Logout')}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:text-blue-400'
                    : 'text-[#506395] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label={item.label}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
