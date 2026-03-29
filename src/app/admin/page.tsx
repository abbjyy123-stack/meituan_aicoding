'use client';

import AdminShell from '@/app/admin/AdminShell';
import { useStore, Application } from '@/store/useStore';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const { adminClubId, applications, updateApplicationStatus, batchUpdateStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'admitted' | 'rejected'>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [sortField, setSortField] = useState<keyof Application>('studentName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredApps = useMemo(() => {
    const isInTab = (status: Application['status']) => {
      if (activeTab === 'pending') return status === 'pending';
      if (activeTab === 'rejected') return status === 'rejected';
      return status === 'admitted' || status === 'to_confirm';
    };

    let result = applications
      .filter((app) => (adminClubId ? app.clubId === adminClubId : true))
      .filter((app) => isInTab(app.status));
    
    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [applications, activeTab, sortField, sortOrder]);

  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchStatus = (status: Application['status']) => {
    batchUpdateStatus(selectedIds, status);
    setSelectedIds([]);
  };

  const exportToExcel = () => {
    const isInTab = (status: Application['status']) => {
      if (activeTab === 'pending') return status === 'pending';
      if (activeTab === 'rejected') return status === 'rejected';
      return status === 'admitted' || status === 'to_confirm';
    };

    if (activeTab === 'rejected') return;

    const exportData = applications
      .filter((app) => (adminClubId ? app.clubId === adminClubId : true))
      .filter((app) => isInTab(app.status))
      .map(({ studentName, college, grade, studentNo }) => ({
        '姓名': studentName,
        '学院': college,
        '年级': grade,
        '学号': studentNo,
      }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    const sheetName = activeTab === 'pending' ? '待处理名单' : '已通过名单';
    const fileName = activeTab === 'pending' ? '待处理名单.xlsx' : '已通过名单.xlsx';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  };

  const tabs: { id: 'pending' | 'admitted' | 'rejected'; label: string }[] = [
    { id: 'pending', label: '待处理' },
    { id: 'admitted', label: '已通过' },
    { id: 'rejected', label: '已拒绝' },
  ];

  return (
    <AdminShell>
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">报名管理工作台</h1>
            <p className="text-gray-400">专为“百团大战”高并发场景设计的高密度处理工具</p>
          </div>
          {(activeTab === 'pending' || activeTab === 'admitted') && (
            <button
              onClick={exportToExcel}
              className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all font-bold flex items-center space-x-2"
            >
              <span>📥</span>
              <span>导出 Excel</span>
            </button>
          )}
        </header>

        {/* Tabs & Filtering */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-50 bg-gray-50/50 p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedIds([]); }}
                className={`flex-1 py-4 text-sm font-bold transition-all rounded-2xl ${
                  activeTab === tab.id 
                  ? "bg-white text-yellow-600 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label} ({tab.id === 'admitted'
                  ? applications.filter(a => (adminClubId ? a.clubId === adminClubId : true) && (a.status === 'admitted' || a.status === 'to_confirm')).length
                  : applications.filter(a => (adminClubId ? a.clubId === adminClubId : true) && a.status === tab.id).length})
              </button>
            ))}
          </div>

          {/* Batch Actions */}
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">已选 {selectedIds.length} 项</span>
              {selectedIds.length > 0 && (
                <div className="flex space-x-2 animate-in slide-in-from-left-2 fade-in duration-200">
                  {activeTab !== 'rejected' && (
                    <>
                      <button
                        onClick={() => handleBatchStatus('admitted')}
                        className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600"
                      >
                        批量通过
                      </button>
                      <button
                        onClick={() => handleBatchStatus('rejected')}
                        className="px-4 py-1.5 bg-gray-100 text-xs font-bold rounded-lg hover:bg-gray-200"
                      >
                        批量拒绝
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredApps.map(a => a.id));
                      else setSelectedIds([]);
                    }}
                    checked={selectedIds.length === filteredApps.length && filteredApps.length > 0}
                  />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-yellow-600 transition-colors" onClick={() => handleSort('studentName')}>
                  姓名 {sortField === 'studentName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-yellow-600 transition-colors" onClick={() => handleSort('college')}>
                  学院 {sortField === 'college' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-yellow-600 transition-colors" onClick={() => handleSort('grade')}>
                  年级 {sortField === 'grade' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-yellow-600 transition-colors" onClick={() => handleSort('studentNo')}>
                  学号 {sortField === 'studentNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(app.id)}
                      onChange={() => toggleSelect(app.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-400">
                        {app.studentName[0]}
                      </div>
                      <span className="font-bold text-gray-900">{app.studentName}</span>
                      <span className="text-xs text-gray-400">{app.gender}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.college}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.grade}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{app.studentNo}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {activeTab !== 'rejected' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'admitted')}
                            className="text-green-600 font-bold hover:underline"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            className="text-gray-500 font-bold hover:underline"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-yellow-600 font-bold hover:underline"
                      >
                        查看详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredApps.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <span className="text-4xl block mb-4">📭</span>
              <span>暂无相关报名数据</span>
            </div>
          )}
        </div>
      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-2xl font-bold">档案详情</h2>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8 space-y-10">
                <section className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-yellow-100 rounded-3xl flex items-center justify-center text-4xl">
                    {selectedApp.studentName[0]}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-1">{selectedApp.studentName}</h3>
                    <p className="text-gray-400 text-lg">{selectedApp.college} · {selectedApp.gender}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">基础信息</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 mb-1">学院</p>
                      <p className="font-bold">{selectedApp.college}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 mb-1">年级</p>
                      <p className="font-bold">{selectedApp.grade}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 mb-1">学号</p>
                      <p className="font-bold font-mono">{selectedApp.studentNo}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 mb-1">报名社团</p>
                      <p className="font-bold">{selectedApp.clubName}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">个人档案</h4>
                  <div className="p-6 bg-gray-50 rounded-3xl leading-relaxed text-gray-700">
                    <div className="font-bold">个人简介</div>
                    <div className="text-gray-600 mt-2">{selectedApp.bio || '—'}</div>
                    <div className="mt-5 font-bold">特长</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(selectedApp.strengths || []).length
                        ? selectedApp.strengths.map((s) => (
                            <span key={s} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-semibold text-gray-700">
                              {s}
                            </span>
                          ))
                        : '—'}
                    </div>
                    <div className="mt-5 font-bold">过往经历</div>
                    <ul className="mt-2 space-y-2 text-gray-600 list-disc list-inside">
                      {(selectedApp.experience || []).length
                        ? selectedApp.experience.map((e) => <li key={e}>{e}</li>)
                        : null}
                    </ul>
                    {!((selectedApp.experience || []).length) && <div className="text-gray-500 mt-2">—</div>}
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-gray-50 flex space-x-4 bg-white">
                {selectedApp.status !== 'rejected' && (
                  <>
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApp.id, 'admitted');
                        setSelectedApp(null);
                      }}
                      className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg transition-all"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApp.id, 'rejected');
                        setSelectedApp(null);
                      }}
                      className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 font-bold rounded-2xl transition-all"
                    >
                      拒绝
                    </button>
                  </>
                )}
                {selectedApp.status === 'rejected' && (
                  <div className="flex-1 py-4 bg-red-50 text-red-600 text-center font-bold rounded-2xl">
                    已拒绝
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
