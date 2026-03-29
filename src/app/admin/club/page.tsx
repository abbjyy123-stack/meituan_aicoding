'use client';

import AdminShell from '@/app/admin/AdminShell';
import { categoryLabels, clubs, type Club, type HighlightItem } from '@/data/clubs';
import { useStore } from '@/store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

const toLines = (items?: string[]) => (items || []).join('\n');
const fromLines = (value: string) =>
  value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

const stripExt = (name: string) => {
  const idx = name.lastIndexOf('.');
  return idx > 0 ? name.slice(0, idx) : name;
};

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function AdminClubPage() {
  const { adminClubId, clubOverrides, updateClubOverride } = useStore();
  const selectedClubId = adminClubId || clubs[0]?.id || 101;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<HighlightItem | null>(null);

  const mergedClub = useMemo(() => {
    const base = clubs.find((c) => c.id === selectedClubId) || clubs[0];
    const override = clubOverrides[selectedClubId];
    if (!base) return undefined;
    return {
      ...base,
      ...(override || {}),
    } as Club;
  }, [clubOverrides, selectedClubId]);

  const [form, setForm] = useState(() => ({
    logo: mergedClub?.logo || '🏢',
    name: mergedClub?.name || '',
    slogan: mergedClub?.slogan || '',
    coreBadges: toLines(mergedClub?.coreBadges),
    description: mergedClub?.description || '',
    requirements: toLines(mergedClub?.requirements),
    benefits: toLines(mergedClub?.benefits),
    memberProfile: toLines(mergedClub?.memberProfile),
    highlights: (mergedClub?.highlights || []) as HighlightItem[],
  }));

  useEffect(() => {
    if (mergedClub) syncFromClub(mergedClub);
  }, [mergedClub]);

  const syncFromClub = (club: Club) => {
    setForm({
      logo: club.logo || '🏢',
      name: club.name,
      slogan: club.slogan || '',
      coreBadges: toLines(club.coreBadges),
      description: club.description,
      requirements: toLines(club.requirements),
      benefits: toLines(club.benefits),
      memberProfile: toLines(club.memberProfile),
      highlights: (club.highlights || []) as HighlightItem[],
    });
  };

  const save = () => {
    updateClubOverride(selectedClubId, {
      logo: form.logo.trim() || '🏢',
      name: form.name.trim() || mergedClub?.name || '未命名社团',
      slogan: form.slogan.trim(),
      coreBadges: fromLines(form.coreBadges),
      description: form.description.trim(),
      requirements: fromLines(form.requirements),
      benefits: fromLines(form.benefits),
      memberProfile: fromLines(form.memberProfile),
      highlights: form.highlights,
    } as Partial<Club>);
  };

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const nextItems: HighlightItem[] = [];
    for (const file of list) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) continue;
      const src = await readAsDataUrl(file);
      const title = stripExt(file.name);
      const aspect: HighlightItem['aspect'] = isVideo ? '16/9' : '4/3';
      nextItems.push({
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type: isVideo ? 'video' : 'photo',
        title,
        aspect,
        src,
      });
    }
    if (!nextItems.length) return;
    setForm((p) => ({ ...p, highlights: [...p.highlights, ...nextItems] }));
  };

  const removeHighlight = (id: string) => {
    setForm((p) => ({ ...p, highlights: p.highlights.filter((h) => h.id !== id) }));
  };

  if (!mergedClub) {
    return (
      <AdminShell>
        <div className="text-gray-400">暂无可编辑的社团数据</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">社团信息</h1>
          <p className="text-gray-400">编辑后会同步展示到新生端的社团主页</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/student/club/${selectedClubId}`}
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all font-bold"
          >
            预览新生端
          </a>
          <button
            onClick={save}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            保存
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="space-y-2">
                <div className="text-sm font-bold text-gray-700">社团 Logo（可用 emoji）</div>
                <input
                  value={form.logo}
                  onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="如：💻"
                />
              </label>
              <label className="space-y-2">
                <div className="text-sm font-bold text-gray-700">名称</div>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="请输入社团名称"
                />
              </label>
            </div>

            <label className="space-y-2">
              <div className="text-sm font-bold text-gray-700">Slogan</div>
              <input
                value={form.slogan}
                onChange={(e) => setForm((p) => ({ ...p, slogan: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="一句话介绍社团气质"
              />
            </label>

            <label className="space-y-2">
              <div className="text-sm font-bold text-gray-700">核心标签（每行一个）</div>
              <textarea
                value={form.coreBadges}
                onChange={(e) => setForm((p) => ({ ...p, coreBadges: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
                placeholder="如：需面试\n零基础友好\n每周约 3 小时"
              />
            </label>

            <label className="space-y-2">
              <div className="text-sm font-bold text-gray-700">社团简介</div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
                placeholder="社团是干什么的？活动形式是什么？"
              />
            </label>
          </div>

          <div className="space-y-6">
            <label className="space-y-2">
              <div className="text-sm font-bold text-gray-700">成员画像与福利：你会得到什么（每行一个）</div>
              <textarea
                value={form.benefits}
                onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
              />
            </label>

            <label className="space-y-2">
              <div className="text-sm font-bold text-gray-700">成员画像：适合什么样的你（每行一个）</div>
              <textarea
                value={form.memberProfile}
                onChange={(e) => setForm((p) => ({ ...p, memberProfile: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
              />
            </label>

            <label className="space-y-2">
              <div className="text-sm font-bold text-gray-700">招新要求说明（每行一个）</div>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
              />
            </label>

            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-700">高光时刻（照片/视频）</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (files && files.length) await addFiles(files);
                  e.target.value = '';
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files && files.length) await addFiles(files);
                }}
                className={`rounded-3xl border-2 border-dashed p-8 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">点击或拖拽上传</div>
                    <div className="text-sm text-gray-400 mt-1">支持图片/视频，上传后显示缩略图，可点击预览</div>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-yellow-400 text-black font-bold">上传</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {form.highlights.map((h) => (
                  <div key={h.id} className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <button
                      onClick={() => removeHighlight(h.id)}
                      className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/90 border border-gray-100 hover:bg-white flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="删除"
                      type="button"
                    >
                      ✕
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreview(h)}
                      className="w-full text-left"
                    >
                      <div className={`${
                        h.aspect === '16/9' ? 'aspect-video' : h.aspect === '4/3' ? 'aspect-[4/3]' : 'aspect-square'
                      } w-full bg-gray-100`}
                      >
                        {h.src ? (
                          h.type === 'video' ? (
                            <video
                              src={h.src}
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={h.src}
                              alt={h.title}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                            {h.type === 'video' ? 'VIDEO' : 'PHOTO'}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-bold text-gray-800 line-clamp-1">{h.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{h.type === 'video' ? '视频' : '照片'}</div>
                      </div>
                    </button>
                  </div>
                ))}

                {form.highlights.length === 0 && (
                  <div className="col-span-2 md:col-span-3 py-8 text-center text-gray-400">
                    还没有上传高光素材
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 6 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-extrabold">{preview.title}</div>
                <button
                  onClick={() => setPreview(null)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  aria-label="关闭"
                  type="button"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black">
                {preview.src ? (
                  preview.type === 'video' ? (
                    <video src={preview.src} controls className="w-full max-h-[70vh]" />
                  ) : (
                    <img src={preview.src} alt={preview.title} className="w-full max-h-[70vh] object-contain" />
                  )
                ) : (
                  <div className="w-full h-[40vh] flex items-center justify-center text-white/70 font-bold">无预览内容</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

