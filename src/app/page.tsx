'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { role, setRole } = useStore();
  const router = useRouter();

  const selectRole = (role: 'student' | 'admin') => {
    setRole(role);
    if (role === 'student') {
      router.push('/student');
    } else {
      router.push('/admin');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-yellow-50 to-white">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-sm flex flex-col space-y-12">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          社团招新智能匹配平台
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl text-center mx-auto">
            基于“意图驱动”的双边匹配平台。<br />
            为新生提供个性化探索，为社团提供高效管理工具。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <button
            onClick={() => selectRole('student')}
            className="group rounded-2xl border border-transparent px-8 py-10 transition-colors bg-white hover:border-yellow-400 hover:shadow-xl flex flex-col items-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <span className="text-3xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold">我是新生</h2>
            <p className="text-gray-500 text-center">
              开启探索小测试，发现你的理想社团，一键授权报名。
            </p>
          </button>

          <button
            onClick={() => selectRole('admin')}
            className="group rounded-2xl border border-transparent px-8 py-10 transition-colors bg-white hover:border-gray-300 hover:shadow-xl flex flex-col items-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold">我是社团管理员</h2>
            <p className="text-gray-500 text-center">
              高效处理报名申请，批量筛选，一键导出录取名单。
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
