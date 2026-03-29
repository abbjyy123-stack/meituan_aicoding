'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryLabels, clubsById, type HighlightItem } from '@/data/clubs';
import { useStore } from '@/store/useStore';

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { applyToClub, applications, clubOverrides, currentStudent, favorites, toggleFavorite } = useStore();
  const [showAuthorize, setShowAuthorize] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const rawId = (params as { id?: string | string[] }).id;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  const clubId = Number(idStr);
  const baseClub = Number.isFinite(clubId) ? clubsById.get(clubId) : undefined;
  const club = useMemo(() => {
    if (!baseClub) return undefined;
    return { ...baseClub, ...(clubOverrides[baseClub.id] || {}) };
  }, [baseClub, clubOverrides]);

  const myApplication = useMemo(() => {
    if (!club) return undefined;
    return applications.find((a) => a.studentId === currentStudent.id && a.clubId === club.id);
  }, [applications, club, currentStudent.id]);

  const isFavorite = useMemo(() => {
    if (!club) return false;
    return favorites.includes(club.id);
  }, [favorites, club]);

  const statusText = useMemo(() => {
    if (!myApplication) return { label: '立即报名', tone: 'primary' as const };
    if (myApplication.status === 'pending') return { label: '等待确认', tone: 'pending' as const };
    if (myApplication.status === 'to_confirm') return { label: '待线下确认', tone: 'pending' as const };
    if (myApplication.status === 'admitted') return { label: '匹配成功', tone: 'success' as const };
    return { label: '暂未匹配', tone: 'rejected' as const };
  }, [myApplication]);

  const derivedCoreBadges = useMemo(() => {
    if (!club) return [] as string[];
    if (club.coreBadges && club.coreBadges.length) return club.coreBadges;
    const badges: string[] = [];
    const needInterview = club.requirements.some((r) => r.includes('面试'));
    if (needInterview) badges.push('需面试');
    if (club.commitment.includes('teaching')) badges.push('零基础友好');
    if (club.commitment.includes('low_commitment')) badges.push('无强制打卡');
    if (club.commitment.includes('exploration')) badges.push('跨界探索');
    if (club.commitment.includes('high_commitment')) badges.push('核心骨干机会');
    const hours = club.commitment.includes('high_commitment')
      ? '每周约 4-6 小时'
      : club.commitment.includes('teaching')
        ? '每周约 2-3 小时'
        : '每周约 1-2 小时';
    badges.push(hours);
    return badges.slice(0, 3);
  }, [club]);

  const slogan = useMemo(() => {
    if (!club) return '';
    return club.slogan || '在这里，遇见更好的自己';
  }, [club]);

  const logo = useMemo(() => {
    if (!club) return '🏢';
    return club.logo || '🏢';
  }, [club]);

  const benefits = useMemo(() => {
    if (!club) return [] as string[];
    if (club.benefits && club.benefits.length) return club.benefits;
    const byCategory: Record<string, string[]> = {
      学术科技: ['项目/课题实战', '技能体系化提升', '同好组队资源'],
      文化艺术: ['舞台与作品集', '结识同好搭子', '放松解压与表达'],
      体育健身: ['规律运动与体能提升', '户外/运动安全常识', '一起坚持的搭子'],
      公益实践: ['社会实践与志愿时长', '真实影响力体验', '团队协作与责任感'],
      职场创投: ['表达与思辨训练', '简历/面试能力提升', '跨界资源与视野'],
      校级组织: ['大型活动项目经验', '校园影响力与人脉', '作品集与履历沉淀'],
    };
    return byCategory[categoryLabels[club.category]] || ['结识同好搭子', '获得成长与体验', '留下高光回忆'];
  }, [club]);

  const memberProfile = useMemo(() => {
    if (!club) return [] as string[];
    if (club.memberProfile && club.memberProfile.length) return club.memberProfile;
    return ['愿意参与社团活动', '尊重团队协作', '保持好奇心与行动力'];
  }, [club]);

  const highlights = useMemo((): HighlightItem[] => {
    if (!club) return [];
    if (club.highlights && club.highlights.length) return club.highlights;
    return [
      { id: 'h-1', type: 'photo', title: '活动现场', aspect: '16/9' },
      { id: 'h-2', type: 'photo', title: '日常训练', aspect: '4/3' },
      { id: 'h-3', type: 'video', title: '高光瞬间', aspect: '16/9' },
      { id: 'h-4', type: 'photo', title: '社团合影', aspect: '1/1' },
      { id: 'h-5', type: 'photo', title: '作品展示', aspect: '4/3' },
      { id: 'h-6', type: 'photo', title: '校园记忆', aspect: '1/1' },
    ];
  }, [club]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-sm border border-gray-100 text-center space-y-6">
          <div className="text-4xl">🔎</div>
          <div className="text-2xl font-bold">未找到该社团</div>
          <div className="text-gray-400">该社团可能已下线或链接不正确。</div>
          <button
            onClick={() => router.push('/student')}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 rounded-2xl font-bold transition-all"
          >
            返回社团大厅
          </button>
        </div>
      </div>
    );
  }

  const canApply = !myApplication;
  const profileComplete = Boolean(
    currentStudent.name.trim() &&
      currentStudent.college.trim() &&
      currentStudent.grade.trim() &&
      currentStudent.studentNo.trim() &&
      currentStudent.bio.trim()
  );
  const applyButtonClass =
    statusText.tone === 'primary'
      ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
      : statusText.tone === 'success'
        ? 'bg-green-500 text-white'
        : statusText.tone === 'rejected'
          ? 'bg-red-50 text-red-600 border border-red-100'
          : 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-xl font-bold">{club.name}</h1>
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">🏢</div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl">
                {logo}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{club.name}</h1>
                <p className="text-gray-500 mt-1">{slogan}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
                    {categoryLabels[club.category]}
                  </span>
                  {derivedCoreBadges.map((t) => (
                    <span key={t} className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-semibold border border-gray-100">
                      {t}
                    </span>
                  ))}
                  {club.tags.slice(0, 3).map((t) => (
                    <span key={t} className="px-3 py-1 bg-white text-gray-500 rounded-full text-xs font-semibold border border-gray-100">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    toggleFavorite(club.id);
                    showToast(isFavorite ? '已取消收藏' : '已收藏');
                  }}
                  className={`px-5 py-3 rounded-2xl font-bold transition-all border ${
                    isFavorite ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {isFavorite ? '已收藏' : '收藏'}
                </button>
                <button
                  onClick={() => {
                    if (!canApply) return;
                  if (!profileComplete) {
                    setShowCompleteProfile(true);
                    return;
                  }
                  setShowAuthorize(true);
                  }}
                  disabled={!canApply}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${applyButtonClass} ${
                    canApply ? '' : 'cursor-not-allowed'
                  }`}
                >
                  {statusText.label}
                </button>
              </div>
              <div className="text-xs text-gray-400">当前已有 {club.memberCount} 人报名</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold">社团简介</h2>
            <p className="text-gray-600 leading-relaxed text-lg mt-4">{club.description}</p>
          </section>

          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">招新要求</h2>
              {myApplication && (
                <span className="text-xs text-gray-400">我的状态：{statusText.label}</span>
              )}
            </div>
            <ul className="mt-6 space-y-3">
              {club.requirements.map((r) => (
                <li key={r} className="text-gray-700 font-semibold">• {r}</li>
              ))}
            </ul>
            {myApplication && (
              <div className="mt-6 rounded-2xl p-5 border border-gray-100 bg-gray-50">
                <div className="text-sm font-bold text-gray-700">状态说明</div>
                <div className="mt-2 text-gray-500 text-sm">
                  {myApplication.status === 'pending' && '报名成功，等待社团确认。'}
                  {myApplication.status === 'to_confirm' && '已通过初筛，请按群通知参加线下流程。'}
                  {myApplication.status === 'admitted' && '匹配成功，欢迎加入！'}
                  {myApplication.status === 'rejected' && '暂未匹配，别灰心可以看看其他社团。'}
                </div>
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold">成员画像与福利</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">你会得到什么</div>
                <ul className="mt-4 space-y-3">
                  {benefits.map((b) => (
                    <li key={b} className="text-gray-700 font-semibold">• {b}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">适合什么样的你</div>
                <ul className="mt-4 space-y-3">
                  {memberProfile.map((p) => (
                    <li key={p} className="text-gray-700 font-semibold">• {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">高光时刻</h2>
              <div className="text-sm text-gray-400">照片 / 视频瀑布流</div>
            </div>
            <div className="mt-6 columns-2 md:columns-3 gap-4">
              {highlights.map((h) => (
                <div key={h.id} className="break-inside-avoid mb-4">
                  <div
                      className={`w-full rounded-2xl overflow-hidden border border-gray-100 bg-gradient-to-br from-yellow-50 to-white relative ${
                        h.aspect === '16/9' ? 'aspect-video' : h.aspect === '4/3' ? 'aspect-[4/3]' : 'aspect-square'
                      }`}
                  >
                      {h.src ? (
                        h.type === 'video' ? (
                          <video
                            src={h.src}
                            muted
                            playsInline
                            preload="metadata"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={h.src}
                            alt={h.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0" />
                      )}

                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <div className="flex justify-end">
                          <span className="text-xs px-2 py-1 rounded-full bg-white/85 border border-gray-100 text-gray-700 font-semibold">
                            {h.type === 'video' ? '视频' : '照片'}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="text-sm font-bold text-gray-900 drop-shadow-sm">{h.title}</div>
                          {h.type === 'video' && (
                            <div className="w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center font-bold">▶</div>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
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

      <AnimatePresence>
        {showAuthorize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAuthorize(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 6 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-2xl font-extrabold">授权发送个人档案</div>
              <div className="mt-3 text-gray-500 leading-relaxed">
                你将把基础档案（姓名、学院、特长、经历等）发送给社团管理员用于筛选与联系。
              </div>
              <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-5">
                <div className="text-sm font-bold text-gray-700">将发送的信息</div>
                <div className="mt-2 text-sm text-gray-600">
                  {currentStudent.name} · {currentStudent.college} · {currentStudent.gender}
                </div>
                <div className="mt-2 text-sm text-gray-600">年级：{currentStudent.grade} · 学号：{currentStudent.studentNo}</div>
                <div className="mt-2 text-sm text-gray-600">特长：{currentStudent.strengths.join('、')}</div>
                <div className="mt-1 text-sm text-gray-600">经历：{currentStudent.experience.join('；')}</div>
                <div className="mt-2 text-sm text-gray-600">简介：{currentStudent.bio}</div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowAuthorize(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    applyToClub(club.id, club.name);
                    setShowAuthorize(false);
                    setShowQR(true);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 font-bold shadow-lg active:scale-95"
                >
                  授权并报名
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompleteProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCompleteProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 6 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-2xl font-extrabold">先完善基础信息</div>
              <div className="mt-3 text-gray-500 leading-relaxed">
                首次报名需要补充姓名、学院、年级、学号、个人简介等信息。完善后可一键授权报名，不再重复填写。
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowCompleteProfile(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  稍后再说
                </button>
                <button
                  onClick={() => {
                    setShowCompleteProfile(false);
                    router.push(`/student/profile?next=/student/club/${club.id}`);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 font-bold shadow-lg active:scale-95"
                >
                  去完善
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full text-center space-y-6 relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-white">
                🎉
              </div>
              <h3 className="text-2xl font-bold mt-4">报名成功！</h3>
              <p className="text-gray-500">报名成功，等待社团确认！请务必扫码加入官方交流群，后续面试安排及社费缴纳事宜将在群内通知。</p>
              <div className="aspect-square w-full max-w-[200px] mx-auto bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300">
                <div className="w-full h-full bg-gray-200 rounded-xl mb-2 flex items-center justify-center text-gray-400">
                  QR CODE MOCK
                </div>
                <span className="text-xs text-gray-400">官方招新群：{club.name}</span>
              </div>
              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold transition-all"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
