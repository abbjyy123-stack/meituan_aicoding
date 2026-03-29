'use client';

import AdminShell from '@/app/admin/AdminShell';
import { categoryLabels, clubs } from '@/data/clubs';
import { useStore } from '@/store/useStore';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVerifyPage() {
  const router = useRouter();
  const { setAdminClubId, setRole } = useStore();
  const [clubId, setClubId] = useState<number>(clubs[0]?.id || 101);
  const [password, setPassword] = useState('');
  const selectedClub = useMemo(() => clubs.find((c) => c.id === clubId), [clubId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-sm border border-gray-100 space-y-8">
        <div className="space-y-2">
          <div className="text-3xl font-extrabold text-gray-900">管理员信息验证</div>
          <div className="text-gray-400">请选择你负责的社团并输入指定密码后进入管理后台</div>
        </div>

        <div className="space-y-6">
          <label className="space-y-2 block">
            <div className="text-sm font-bold text-gray-700">负责社团</div>
            <select
              value={clubId}
              onChange={(e) => setClubId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}（{categoryLabels[c.category]}）
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 block">
            <div className="text-sm font-bold text-gray-700">指定密码</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="请输入数字（任意数字即可）"
              inputMode="numeric"
              type="password"
            />
          </label>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
          <div className="text-sm font-bold text-gray-700">当前选择</div>
          <div className="mt-2 text-gray-500">
            {selectedClub ? `${selectedClub.logo || '🏢'} ${selectedClub.name}` : '—'}
          </div>
        </div>

        <button
          onClick={() => {
            setRole('admin');
            setAdminClubId(clubId);
            router.push('/admin');
          }}
          disabled={!password.trim()}
          className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
            password.trim() ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          进入管理后台
        </button>

        <div className="text-xs text-gray-400">说明：此处仅做交互演示，密码不进行真实校验。</div>
      </div>
    </div>
  );
}

