export type Role = 'guru' | 'walas' | 'ortu' | 'bk' | 'pustaka' | 'kamad' | 'admin' | 'siswa' | 'wakakurikulum' | 'wakakesiswaan' | 'guru_quran';

export interface User {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: Role; // Active role
  roles?: Role[]; // Multiple roles support
  avatar?: string;
  gender?: 'L' | 'P';
  className?: string; // For Walas
  childId?: string; // For Ortu
  childName?: string; // For Ortu
  subjects?: { id: string; subjectName: string; className: string }[]; // For Guru
  nuptk?: string; // NUPTK/NIPTK
}

export interface AcademicHistory {
  className: string;
  academicYear?: string;
  attendance?: {
    present: number;
    absent: number;
    sick: number;
    permission: number;
  };
  behaviorScore?: number;
  grades?: any[]; // Placeholder for grades if implemented later
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  grade: string; // 'X', 'XI', 'XII' etc.
  className: string; // Rombel Name
  gender?: 'L' | 'P';
  attendance?: {
    present: number;
    absent: number;
    sick: number;
    permission: number;
  };
  behaviorScore?: number;
  academicHistory?: AcademicHistory[];
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'sakit' | 'izin_pribadi' | 'dinas_luar';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}
