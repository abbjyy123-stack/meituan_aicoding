'use client';

import { useStore } from '@/store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

function StudentProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const { currentStudent, updateStudentProfile } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: currentStudent.name,
    college: currentStudent.college,
    gender: currentStudent.gender,
    grade: currentStudent.grade,
    studentNo: currentStudent.studentNo,
    bio: currentStudent.bio,
  });

  const isComplete = useMemo(() => {
    return Boolean(
      form.name.trim() &&
        form.college.trim() &&
        form.grade.trim() &&
        form.studentNo.trim() &&
        form.bio.trim()
    );
  }, [form]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const save = () => {
    updateStudentProfile({
      name: form.name.trim(),
      college: form.college.trim(),
      gender: form.gender.trim(),
      grade: form.grade.trim(),
      studentNo: form.studentNo.trim(),
      bio: form.bio.trim(),
    });
    showToast('个人信息已保存');
    setTimeout(() => {
      if (next) router.push(next);
      else router.push('/student');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="返回"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-xl font-bold text-yellow-500">社团匹配平台</h1>
          <div className="flex space-x-6 text-sm font-bold">
            <button onClick={() => router.push('/student?view=hall')} className="text-gray-400 hover:text-gray-600">
              社团大厅
            </button>
            <button onClick={() => router.push('/student?view=my')} className="text-gray-400 hover:text-gray-600">
              我的报名
            </button>
            <button onClick={() => router.push('/student?view=fav')} className="text-gray-400 hover:text-gray-600">
              我的收藏
            </button>
            <span className="text-black">个人信息</span>
          </div>
        </div>
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
          退出登录
        </button>
      </nav>

      <main className="p-6 flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold">完善个人信息</h2>
                <p className="text-gray-400 mt-2">完成后可一键授权报名，减少重复填写。</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-xs font-bold ${isComplete ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-700'}`}>
                {isComplete ? '已完成' : '待完善'}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="space-y-2">
                <div className="text-sm font-bold text-gray-700">姓名</div>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="请输入姓名"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-bold text-gray-700">学院</div>
                <input
                  value={form.college}
                  onChange={(e) => setForm((p) => ({ ...p, college: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="如：信息工程学院"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-bold text-gray-700">年级</div>
                <input
                  value={form.grade}
                  onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="如：2025级"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-bold text-gray-700">学号</div>
                <input
                  value={form.studentNo}
                  onChange={(e) => setForm((p) => ({ ...p, studentNo: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="请输入学号"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-bold text-gray-700">性别</div>
                <input
                  value={form.gender}
                  onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="如：男/女"
                />
              </label>
              <div />
              <label className="space-y-2 md:col-span-2">
                <div className="text-sm font-bold text-gray-700">个人简介</div>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
                  placeholder="简单介绍一下自己：兴趣、特长、想加入社团的原因等"
                />
              </label>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold"
              >
                取消
              </button>
              <button
                onClick={save}
                disabled={!isComplete}
                className={`px-8 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
                  isComplete ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                保存并继续
              </button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-black/80 text-white px-4 py-2 rounded-full text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={null}>
      <StudentProfilePageInner />
    </Suspense>
  );
}

