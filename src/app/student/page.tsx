'use client';

import { useStore } from '@/store/useStore';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  categoryLabels,
  clubs,
  type Club,
  type ClubCategory,
  type CommitmentTag,
  type CoreMotivationTag,
  type InterestTag,
} from '@/data/clubs';

function StudentPageInner() {
  const { applications, clubOverrides, currentStudent, favorites, toggleFavorite, testCompleted, setTestCompleted } = useStore();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const [activeView, setActiveView] = useState<'hall' | 'my' | 'fav'>(
    viewParam === 'my' ? 'my' : viewParam === 'fav' ? 'fav' : 'hall'
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const router = useRouter();

  useEffect(() => {
    setActiveView(viewParam === 'my' ? 'my' : viewParam === 'fav' ? 'fav' : 'hall');
  }, [viewParam]);

  const questions = [
    {
      id: 1,
      type: 'single',
      title: "探寻「核心动机」",
      description: "你希望在社团里收获怎样的体验？",
      options: [
        { label: "🍻 寻找搭子", val: "social", subtext: "氛围轻松的兴趣社团" },
        { label: "🚀 技能飞跃", val: "skill", subtext: "硬核、有挑战性的社团" },
        { label: "💼 简历加分", val: "career", subtext: "学生组织或新媒体中心" },
        { label: "🧘 佛系解压", val: "relax", subtext: "低门槛的兴趣小组" }
      ]
    },
    {
      id: 2,
      type: 'single',
      title: "明确「投入度与角色」",
      description: "面对即将加入的社团，你更倾向于哪种参与节奏？",
      options: [
        { label: "🔥 全情投入，想当骨干", val: "high_commitment", subtext: "活动丰富、有门槛的社团" },
        { label: "🌱 零基础小白，求带飞", val: "teaching", subtext: "有完善培训机制的社团" },
        { label: "🎭 只想跨界，玩点不一样的", val: "exploration", subtext: "探索类或跨领域社团" },
        { label: "👻 潜水观察，偶尔冒泡", val: "low_commitment", subtext: "无考核、氛围宽松的社团" }
      ]
    },
    {
      id: 3,
      type: 'multi',
      max: 3,
      title: "圈定「兴趣大类」",
      description: "选出最让你心动的领域吧！（最多3项）",
      options: [
        { label: "💻 科技与学术", val: "tech" },
        { label: "🏃 体育与户外", val: "sports" },
        { label: "🎨 舞台与演艺", val: "art" },
        { label: "❤️ 公益与志愿", val: "volunteer" },
        { label: "📸 传媒与设计", val: "media" },
        { label: "💡 创新与创业", val: "startup" }
      ]
    }
  ];

  const handleSelect = (val: string) => {
    const question = questions[currentStep];
    if (question.type === 'single') {
      setAnswers(prev => ({ ...prev, [currentStep]: val }));
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setTestCompleted(true);
      }
    } else {
      const currentSelections = (answers[currentStep] as string[]) || [];
      let newSelections;
      if (currentSelections.includes(val)) {
        newSelections = currentSelections.filter(v => v !== val);
      } else if (currentSelections.length < (question.max || 3)) {
        newSelections = [...currentSelections, val];
      } else {
        return; // Limit reached
      }
      setAnswers(prev => ({ ...prev, [currentStep]: newSelections }));
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<
    "全部" | "学术科技" | "文化艺术" | "体育健身" | "公益实践" | "职场创投" | "校级组织"
  >("全部");
  const [randomOpen, setRandomOpen] = useState(false);
  const [randomClubId, setRandomClubId] = useState<number | null>(null);

  const tagToCategory: Record<Exclude<typeof selectedTag, "全部">, ClubCategory> = {
    学术科技: "academic_tech",
    文化艺术: "culture_art",
    体育健身: "sports_fitness",
    公益实践: "public_practice",
    职场创投: "career_venture",
    校级组织: "campus_org",
  };

  const mergedClubs = useMemo(() => {
    return clubs.map((c) => ({ ...c, ...(clubOverrides[c.id] || {}) }));
  }, [clubOverrides]);

  const mergedById = useMemo(() => {
    return new Map<number, (typeof mergedClubs)[number]>(mergedClubs.map((c) => [c.id, c]));
  }, [mergedClubs]);

  const preferences = useMemo(() => {
    const core = answers[0] as CoreMotivationTag | undefined;
    const commitment = answers[1] as CommitmentTag | undefined;
    const interests = ((answers[2] as string[] | undefined) || []) as InterestTag[];
    return { core, commitment, interests };
  }, [answers]);

  const scoreClub = (club: Club) => {
    let score = 0;
    if (preferences.core && club.motives.includes(preferences.core)) score += 6;
    if (preferences.commitment && club.commitment.includes(preferences.commitment)) score += 4;
    for (const it of preferences.interests) {
      if (club.interests.includes(it)) score += 3;
    }
    if (selectedTag !== "全部") {
      const cat = tagToCategory[selectedTag];
      if (club.category === cat) score += 2;
    }
    return score;
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredClubs = useMemo(() => {
    let list = mergedClubs;
    if (selectedTag !== "全部") {
      const category = tagToCategory[selectedTag];
      list = list.filter((c) => c.category === category);
    }

    if (normalizedQuery) {
      list = list.filter((c) => {
        const haystack = [c.name, c.description, ...c.tags, ...c.keywords, categoryLabels[c.category]]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    return [...list].sort((a, b) => scoreClub(b) - scoreClub(a));
  }, [mergedClubs, normalizedQuery, selectedTag, preferences.core, preferences.commitment, preferences.interests]);

  const getRandomInt = (maxExclusive: number) => {
    if (maxExclusive <= 0) return 0;
    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % maxExclusive;
    }
    return Math.floor(Math.random() * maxExclusive);
  };

  const pickRandomClubId = (excludeId?: number | null) => {
    const pool =
      selectedTag === "全部"
        ? mergedClubs
        : mergedClubs.filter((c) => c.category === tagToCategory[selectedTag]);
    if (pool.length === 0) return null;
    if (pool.length === 1) return pool[0].id;
    let next = pool[getRandomInt(pool.length)].id;
    let guard = 0;
    while (excludeId != null && next === excludeId && guard < 10) {
      next = pool[getRandomInt(pool.length)].id;
      guard += 1;
    }
    return next;
  };

  const openRandom = () => {
    const nextId = pickRandomClubId(randomClubId);
    setRandomClubId(nextId);
    setRandomOpen(true);
  };

  const switchRandom = () => {
    setRandomClubId((prev) => pickRandomClubId(prev));
  };

  const randomClub = randomClubId != null ? mergedById.get(randomClubId) : null;

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Sidebar/Top Bar */}
        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-yellow-500">社团匹配平台</h1>
            <div className="flex space-x-6 text-sm font-bold">
              <button 
                onClick={() => router.push('/student?view=hall')}
                className={activeView === 'hall' ? "text-black" : "text-gray-400 hover:text-gray-600"}
              >
                社团大厅
              </button>
              <button 
                onClick={() => router.push('/student?view=my')}
                className={activeView === 'my' ? "text-black" : "text-gray-400 hover:text-gray-600"}
              >
                我的报名
              </button>
              <button
                onClick={() => router.push('/student?view=fav')}
                className={activeView === 'fav' ? "text-black" : "text-gray-400 hover:text-gray-600"}
              >
                我的收藏
              </button>
              <button
                onClick={() => router.push('/student/profile')}
                className="text-gray-400 hover:text-gray-600"
              >
                个人信息
              </button>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-600 text-sm font-bold"
          >
            退出登录
          </button>
        </nav>

        <main className="p-6 flex-1 overflow-auto">
          {activeView === 'hall' ? (
            <>
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">社团大厅</h1>
                  <p className="text-gray-400">基于你的测试结果，我们为你推荐了以下社团</p>
                </div>
                <button 
                  onClick={openRandom}
                  className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-full font-semibold transition-all shadow-md flex items-center space-x-2 whitespace-nowrap"
                >
                  <span>🎁</span>
                  <span>随机推荐</span>
                </button>
              </header>

              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="搜索社团名称或描述..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {([
                    "全部",
                    "学术科技",
                    "文化艺术",
                    "体育健身",
                    "公益实践",
                    "职场创投",
                    "校级组织",
                  ] as const).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-semibold ${
                        selectedTag === tag 
                        ? "bg-yellow-400 text-black shadow-md" 
                        : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                  <div key={club.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl">
                        🏢
                      </div>
                      <div className="flex space-x-2">
                        <span className="text-xs px-2 py-1 bg-yellow-50 rounded-md text-yellow-700 font-semibold">
                          {categoryLabels[club.category]}
                        </span>
                        {club.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                    <p className="text-gray-500 mb-6 text-sm line-clamp-2">{club.description}</p>
                    <button 
                      onClick={() => router.push(`/student/club/${club.id}`)}
                      className="w-full py-2 bg-white border border-yellow-400 text-yellow-600 rounded-xl hover:bg-yellow-400 hover:text-white transition-all font-semibold"
                    >
                      查看详情
                    </button>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {randomOpen && randomClub && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={() => setRandomOpen(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.92, y: 12 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.96, y: 8 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                      className="bg-white rounded-3xl p-8 pt-14 max-w-lg w-full shadow-2xl relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setRandomOpen(false)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                        aria-label="关闭"
                      >
                        ✕
                      </button>

                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl">
                            🏢
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            <span className="text-xs px-2 py-1 bg-yellow-50 rounded-md text-yellow-700 font-semibold">
                              {categoryLabels[randomClub.category]}
                            </span>
                            {randomClub.tags.slice(0, 3).map((t) => (
                              <span key={t} className="text-xs px-2 py-1 bg-white rounded-md text-gray-600 border border-gray-100">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <h3 className="text-2xl font-extrabold mb-2">{randomClub.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{randomClub.description}</p>
                        <div className="mt-4 text-xs text-gray-400">当前已有 {randomClub.memberCount} 人关注/报名</div>
                      </div>

                      <div className="mt-8 flex gap-3">
                        <button
                          onClick={switchRandom}
                          className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold transition-all"
                        >
                          换一个
                        </button>
                        <button
                          onClick={() => {
                            setRandomOpen(false);
                            router.push(`/student/club/${randomClub.id}`);
                          }}
                          className="flex-1 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 font-bold transition-all shadow-lg active:scale-95"
                        >
                          了解一下
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : activeView === 'my' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">我的报名记录</h2>
              <div className="space-y-4">
                {applications.filter((a) => a.studentId === currentStudent.id).length > 0 ? (
                  applications
                    .filter((a) => a.studentId === currentStudent.id)
                    .map((app) => (
                    <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                          🏢
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{app.clubName}</h4>
                          <p className="text-sm text-gray-400">申请时间：{app.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                          app.status === 'pending' ? "bg-yellow-50 text-yellow-600" :
                          app.status === 'admitted' ? "bg-green-50 text-green-600" :
                          app.status === 'rejected' ? "bg-red-50 text-red-600" :
                          "bg-blue-50 text-blue-600"
                        }`}>
                          {app.status === 'pending' ? "待处理" :
                           app.status === 'admitted' ? "已录取" :
                           app.status === 'rejected' ? "已婉拒" :
                           "待线下确认"}
                        </span>
                        {app.status === 'to_confirm' && (
                          <button className="text-sm font-bold text-yellow-600 underline">查看群二维码</button>
                        )}
                        <button
                          onClick={() => router.push(`/student/club/${app.clubId}`)}
                          className="text-sm font-bold text-gray-500 hover:text-gray-700"
                        >
                          查看社团
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                    <span className="text-4xl block mb-2">📄</span>
                    <span>还没有报名任何社团，快去大厅看看吧！</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">我的收藏</h2>
              <div className="space-y-4">
                {favorites.length > 0 ? (
                  favorites
                    .map((id) => mergedById.get(id))
                    .filter(Boolean)
                    .map((club) => (
                      <div
                        key={club!.id}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                            {club!.logo || '🏢'}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{club!.name}</h4>
                            <p className="text-sm text-gray-400 line-clamp-1">{club!.slogan || categoryLabels[club!.category]}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-semibold">
                                {categoryLabels[club!.category]}
                              </span>
                              {club!.tags.slice(0, 3).map((t) => (
                                <span key={t} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => toggleFavorite(club!.id)}
                            className="text-sm font-bold text-gray-500 hover:text-gray-700"
                          >
                            取消收藏
                          </button>
                          <button
                            onClick={() => router.push(`/student/club/${club!.id}`)}
                            className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 font-bold"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                    <span className="text-4xl block mb-2">⭐</span>
                    <span>你还没有收藏社团，去大厅看看吧！</span>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/student?view=hall')}
                        className="px-8 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 font-bold"
                      >
                        去社团大厅
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 max-w-xl w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <motion.div 
            className="h-full bg-yellow-400" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-yellow-600 font-mono font-bold text-sm">STEP 0{currentStep + 1}</p>
              <p className="text-gray-400 text-xs uppercase tracking-widest">Onboarding Test</p>
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-gray-900">{questions[currentStep].title}</h2>
            <p className="text-gray-500 mb-8">{questions[currentStep].description}</p>
            
            <div className="space-y-4 flex-1">
              {questions[currentStep].options.map((option) => {
                const isSelected = questions[currentStep].type === 'single' 
                  ? answers[currentStep] === option.val
                  : (answers[currentStep] as string[] || []).includes(option.val);
                  
                return (
                  <button
                    key={option.val}
                    onClick={() => handleSelect(option.val)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all group flex flex-col ${
                      isSelected 
                        ? "border-yellow-400 bg-yellow-50 shadow-md ring-2 ring-yellow-400/20" 
                        : "border-gray-100 hover:border-yellow-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-lg font-bold ${isSelected ? "text-yellow-900" : "text-gray-700"}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <span className="text-yellow-500">
                          {questions[currentStep].type === 'single' ? "●" : "✔"}
                        </span>
                      )}
                    </div>
                    {'subtext' in option && (
                      <span className={`text-xs mt-1 ${isSelected ? "text-yellow-700/60" : "text-gray-400"}`}>
                        {option.subtext}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  currentStep === 0 
                    ? "opacity-0 pointer-events-none" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                ← 返回上一题
              </button>
              
              {questions[currentStep].type === 'multi' && (
                <button
                  onClick={handleNext}
                  disabled={!(answers[currentStep] as string[] || []).length}
                  className={`px-10 py-3 rounded-xl font-bold transition-all shadow-lg ${
                    (answers[currentStep] as string[] || []).length
                      ? "bg-yellow-400 text-black hover:bg-yellow-500 active:scale-95"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  下一步
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={null}>
      <StudentPageInner />
    </Suspense>
  );
}
