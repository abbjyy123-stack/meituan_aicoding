import { create } from 'zustand';
import type { Club } from '@/data/clubs';

export type UserRole = 'student' | 'admin' | null;

export interface StudentProfile {
  id: string;
  name: string;
  gender: string;
  college: string;
  grade: string;
  studentNo: string;
  bio: string;
  strengths: string[];
  experience: string[];
}

export interface Application {
  id: string;
  clubId: number;
  clubName: string;
  studentId: string;
  studentName: string;
  gender: string;
  college: string;
  grade: string;
  studentNo: string;
  bio: string;
  strengths: string[];
  experience: string[];
  intent: string;
  time: string;
  status: 'pending' | 'to_confirm' | 'admitted' | 'rejected';
  details: string;
}

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  adminClubId: number | null;
  setAdminClubId: (clubId: number | null) => void;
  testCompleted: boolean;
  setTestCompleted: (val: boolean) => void;
  currentStudent: StudentProfile;
  updateStudentProfile: (patch: Partial<StudentProfile>) => void;
  isStudentProfileComplete: () => boolean;
  clubOverrides: Record<number, Partial<Club>>;
  updateClubOverride: (clubId: number, patch: Partial<Club>) => void;
  favorites: number[];
  toggleFavorite: (clubId: number) => void;
  applications: Application[];
  applyToClub: (clubId: number, clubName: string) => void;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  batchUpdateStatus: (ids: string[], status: Application['status']) => void;
}

const formatDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isProfileComplete = (s: StudentProfile) => {
  return Boolean(
    s.name.trim() &&
      s.college.trim() &&
      s.grade.trim() &&
      s.studentNo.trim() &&
      s.bio.trim()
  );
};

export const useStore = create<AppState>((set, get) => ({
  role: null,
  setRole: (role) => set({ role }),
  adminClubId: null,
  setAdminClubId: (clubId) => set({ adminClubId: clubId }),
  testCompleted: false,
  setTestCompleted: (val) => set({ testCompleted: val }),
  currentStudent: {
    id: 'stu_001',
    name: '新生·小鹿',
    gender: '女',
    college: '信息工程学院',
    grade: '',
    studentNo: '',
    bio: '',
    strengths: ['沟通表达', '快速学习', '基础设计'],
    experience: ['担任班级宣传委员', '参与校园迎新志愿活动'],
  },
  updateStudentProfile: (patch) =>
    set((state) => ({
      currentStudent: { ...state.currentStudent, ...patch },
    })),
  isStudentProfileComplete: () => isProfileComplete(get().currentStudent),
  clubOverrides: {},
  updateClubOverride: (clubId, patch) =>
    set((state) => ({
      clubOverrides: {
        ...state.clubOverrides,
        [clubId]: { ...state.clubOverrides[clubId], ...patch },
      },
    })),
  favorites: [],
  toggleFavorite: (clubId) =>
    set((state) => {
      const exists = state.favorites.includes(clubId);
      return { favorites: exists ? state.favorites.filter((id) => id !== clubId) : [...state.favorites, clubId] };
    }),
  applications: [
    {
      id: '1',
      clubId: 102,
      clubName: '编程俱乐部',
      studentId: 'stu_002',
      studentName: '张三',
      gender: '男',
      college: '计算机学院',
      grade: '2024级',
      studentNo: '2024010101',
      bio: '喜欢编程与开源，希望交到一起成长的朋友。',
      strengths: ['前端基础', '快速学习'],
      experience: ['参与过学院网站重构', '校内编程比赛二等奖'],
      intent: '前端开发',
      time: '2024-03-29 10:00',
      status: 'pending',
      details: '对前端技术充满热情，熟练掌握 HTML/CSS/JS。',
    },
    {
      id: '2',
      clubId: 701,
      clubName: '摄影社',
      studentId: 'stu_003',
      studentName: '李四',
      gender: '女',
      college: '艺术学院',
      grade: '2024级',
      studentNo: '2024020202',
      bio: '喜欢用镜头记录校园生活，想学习后期与构图。',
      strengths: ['审美', '沟通表达'],
      experience: ['为学院活动拍摄宣传照', '运营过个人摄影账号'],
      intent: 'UI 设计',
      time: '2024-03-29 11:30',
      status: 'pending',
      details: '有丰富的设计经验，擅长使用 Figma 和 PS。',
    },
    {
      id: '3',
      clubId: 401,
      clubName: '青年志愿者协会',
      studentId: 'stu_004',
      studentName: '王五',
      gender: '男',
      college: '经管学院',
      grade: '2024级',
      studentNo: '2024030303',
      bio: '希望参加公益实践，提升组织与协作能力。',
      strengths: ['组织协调', '执行力'],
      experience: ['参与迎新志愿服务', '策划班级公益捐书活动'],
      intent: '运营',
      time: '2024-03-29 14:15',
      status: 'to_confirm',
      details: '沟通能力强，曾策划过校级活动。',
    },
  ],
  applyToClub: (clubId, clubName) =>
    set((state) => {
      const existing = state.applications.find(
        (a) => a.studentId === state.currentStudent.id && a.clubId === clubId
      );
      if (existing) return state;
      const now = new Date();
      const id = `app_${now.getTime()}`;
      const nextApp: Application = {
        id,
        clubId,
        clubName,
        studentId: state.currentStudent.id,
        studentName: state.currentStudent.name,
        gender: state.currentStudent.gender,
        college: state.currentStudent.college,
        grade: state.currentStudent.grade,
        studentNo: state.currentStudent.studentNo,
        bio: state.currentStudent.bio,
        strengths: state.currentStudent.strengths,
        experience: state.currentStudent.experience,
        intent: '综合方向',
        time: formatDateTime(now),
        status: 'pending',
        details: `年级：${state.currentStudent.grade}。学号：${state.currentStudent.studentNo}。简介：${state.currentStudent.bio}。特长：${state.currentStudent.strengths.join('、')}。经历：${state.currentStudent.experience.join('；')}。`,
      };
      return { applications: [nextApp, ...state.applications] };
    }),
  updateApplicationStatus: (id, status) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status } : app
      ),
    })),
  batchUpdateStatus: (ids, status) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        ids.includes(app.id) ? { ...app, status } : app
      ),
    })),
}));
