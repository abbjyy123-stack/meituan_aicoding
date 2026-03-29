'use client';

import { categoryLabels, clubs, clubsById } from '@/data/clubs';
import { useStore } from '@/store/useStore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminClubId, clubOverrides, setAdminClubId } = useStore();

  useEffect(() => {
    if (pathname === '/admin/verify') return;
    if (!adminClubId) router.replace('/admin/verify');
  }, [adminClubId, pathname, router]);

  const club = useMemo(() => {
    if (!adminClubId) return undefined;
    const base = clubsById.get(adminClubId) || clubs.find((c) => c.id === adminClubId);
    if (!base) return undefined;
    return { ...base, ...(clubOverrides[adminClubId] || {}) };
  }, [adminClubId, clubOverrides]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center font-bold text-xl">B</div>
          <span className="font-bold text-xl">管理后台</span>
        </div>

        {club && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs text-gray-400 font-bold">当前社团</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center text-lg">
                {club.logo || '🏢'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-gray-900 truncate">{club.name}</div>
                <div className="text-xs text-gray-400">{categoryLabels[club.category]}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setAdminClubId(null);
                router.push('/admin/verify');
              }}
              className="mt-3 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              切换社团
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => router.push('/admin')}
            className={`w-full text-left p-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              isActive('/admin')
                ? 'bg-yellow-50 text-yellow-700'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <span>📋</span>
            <span>报名管理</span>
          </button>

          <button
            onClick={() => router.push('/admin/club')}
            className={`w-full text-left p-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              isActive('/admin/club')
                ? 'bg-yellow-50 text-yellow-700'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <span>🏢</span>
            <span>社团信息</span>
          </button>
        </nav>

        <button
          onClick={() => router.push('/')}
          className="p-3 text-red-400 hover:bg-red-50 rounded-xl flex items-center space-x-2 mt-auto"
        >
          <span>🚪</span>
          <span>退出登录</span>
        </button>
      </aside>

      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}

