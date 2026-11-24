import {
  User,
  UserRole,
  Student,
  Faculty,
  Course,
  Subject,
  AcademicSession,
  Examination,
  Marksheet,
  MarksheetStatus,
  FeeOverview,
  Invoice,
  FeeStructure,
  Notice,
  StudyMaterial,
  AuditLog,
  LeaveApplication,
  StudentFeedback,
  ClassAnnouncement,
} from '../types';
import {
  mockCourses,
  mockSubjects,
  mockFaculty,
  mockStudents,
  mockExaminations,
  mockMarksheets,
  mockFeeOverview,
  mockInvoices,
  mockFeeStructure,
  mockNotices,
  mockStudyMaterials,
  mockAuditLogs,
} from './mockData';

const DEFAULT_API_URL = 'https://annapurna-memorial-college-erp-adminpanel.onrender.com/api/v1';
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

export interface RegisteredAccount {
  id: string;
  email: string;
  password: string;
  alt_password?: string;
  role: UserRole;
  full_name: string;
  avatar_url: string;
  is_active: boolean;
  department?: string;
  roll_number?: string;
}

export const INITIAL_REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'user-admin-1',
    email: 'admin@annapurnacollege.edu.in',
    password: 'Admin@123456',
    alt_password: 'Admin@Amce2024#',
    role: 'SUPER_ADMIN',
    full_name: 'Dr. Arnab Senapati, Principal',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
  },
  {
    id: 'user-admin-alias',
    email: 'admin@annapurnacollege.org',
    password: 'Admin@123456',
    alt_password: 'Admin@Amce2024#',
    role: 'SUPER_ADMIN',
    full_name: 'Dr. Arnab Senapati, Principal',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
  },
  {
    id: 'user-fac-0',
    email: 'teacher@annapurnacollege.org',
    password: 'Teacher@Amce2024#',
    alt_password: 'Teacher@123456',
    role: 'FACULTY',
    full_name: 'Prof. Soumen Mukherjee',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    is_active: true,
    department: 'Department of Teacher Education',
  },
  {
    id: 'user-fac-1',
    email: 'faculty.soumen@annapurnacollege.edu.in',
    password: 'Teacher@Amce2024#',
    alt_password: 'Teacher@123456',
    role: 'FACULTY',
    full_name: 'Prof. Soumen Mukherjee',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    is_active: true,
    department: 'Department of Teacher Education',
  },
  {
    id: 'user-fac-2',
    email: 'soumen.m@annapurnacollege.edu.in',
    password: 'Teacher@Amce2024#',
    alt_password: 'Teacher@123456',
    role: 'FACULTY',
    full_name: 'Prof. Soumen Mukherjee',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    is_active: true,
    department: 'Department of Teacher Education',
  },
  {
    id: 'user-fac-3',
    email: 'debabrata.roy@annapurnacollege.org',
    password: 'Teacher@Amce2024#',
    alt_password: 'Teacher@123456',
    role: 'FACULTY',
    full_name: 'Dr. Debabrata Roy',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    is_active: true,
    department: 'Department of Teacher Education',
  },
  {
    id: 'user-stud-0',
    email: 'student@annapurnacollege.org',
    password: 'Student@Amce2024#',
    alt_password: 'Student@123456',
    role: 'STUDENT',
    full_name: 'Teacher Trainee',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    is_active: true,
    roll_number: 'AMC-TR-2024-001',
  },
  {
    id: 'user-stud-demo',
    email: 'student@annapurnacollege.edu.in',
    password: 'Student@Amce2024#',
    alt_password: 'Student@123456',
    role: 'STUDENT',
    full_name: 'Teacher Trainee',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    is_active: true,
    roll_number: 'AMC-TR-2024-002',
  },
  {
    id: 'user-stud-live',
    email: 'arnabsenapati573@gmail.com',
    password: 'Student@Amce2024#',
    alt_password: 'Student@123456',
    role: 'STUDENT',
    full_name: 'Arnab Senapati',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TEST-999',
    is_active: true,
    roll_number: '101',
  },
];

class ApiClient {
  private token: string | null = null;
  // Local reactive cache for mock fallback mode with local persistence
  private students: Student[] = [];
  private faculty: Faculty[] = [];
  private courses: Course[] = [...mockCourses];
  private subjects: Subject[] = [];
  private studyMaterials: StudyMaterial[] = [];
  private marksheets: any[] = [];
  private notices: any[] = [];
  private invoices: any[] = [];
  private auditLogs: any[] = [];
  private leaveApplications: LeaveApplication[] = [];
  private feedbacks: StudentFeedback[] = [];
  private announcements: ClassAnnouncement[] = [];
  private collegeProfile = {
    name: 'Annapurna Memorial College of Education',
    tagline: 'Premier Teacher Training & Pedagogy Institution',
    affiliation: 'Baba Saheb Ambedkar Education University (BSAEU) & WBBPE',
    recognition: 'Recognized by NCTE (National Council for Teacher Education)',
    college_code: 'AMCE-743349',
    aishe_code: 'C-58921',
    address: 'Kashinagar, South 24 Parganas, West Bengal 743349',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    pincode: '743349',
    principal_name: 'Dr. Arnab Senapati, M.Ed., Ph.D.',
    email: 'office@annapurnacollege.edu.in',
    phone: '+91 98765 43210',
    academic_year: '2024-2026',
    established: 2012,
  };

  public getCachedList<T>(key: string, defaultData: T[]): T[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Purge legacy mock entries
            const cleaned = parsed.filter((item: any) => {
              if (item?.roll_number && ['AMC-BED-2024-001', 'AMC-BED-2024-002', 'AMC-BED-2024-003', 'AMC-BED-2024-004', 'AMC-BED-2024-005', 'AMC-BED-2024-006'].includes(item.roll_number)) return false;
              if (item?.full_name && ['Ananya Das', 'Souvik Halder', 'Rituparna Ghosh', 'Dr. Debabrata Roy', 'Prof. Mousumi Mukherjee'].includes(item.full_name)) return false;
              return true;
            });
            return cleaned as T[];
          }
        } catch {}
      }
    }
    return defaultData;
  }

  public setCachedList<T>(key: string, data: T[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('annapurna_erp_token');
    }
    this.students = this.getCachedList('annapurna_students', []);
    this.faculty = this.getCachedList('annapurna_faculty', []);
    this.courses = this.getCachedList('annapurna_courses', mockCourses);
    this.subjects = this.getCachedList('annapurna_subjects', []);
    this.studyMaterials = this.getCachedList('annapurna_study_materials', []);
    this.marksheets = this.getCachedList('annapurna_marksheets', []);
    this.notices = this.getCachedList('annapurna_notices', []);

    // Background keep-alive worker: Prevents Render free-tier spin-down & keeps backend warm
    if (typeof window !== 'undefined') {
      const pingHealth = () => {
        const rootUrl = BASE_URL.replace(/\/api\/v1$/, '');
        fetch(`${rootUrl}/health`, { mode: 'no-cors' }).catch(() => {});
      };
      // Initial ping on app launch
      setTimeout(pingHealth, 1000);
      // Periodic ping every 4 minutes while browser session is active
      setInterval(pingHealth, 4 * 60 * 1000);
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('annapurna_erp_token', token);
    } else {
      localStorage.removeItem('annapurna_erp_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('annapurna_current_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Allocate 15s for authentication/critical endpoints to allow Render cold-starts, 6s for others
    const timeoutMs = options.timeoutMs ?? (endpoint.includes('/auth') ? 15000 : 6000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      clearTimeout(timeoutId);
      // Re-throw to allow fallback in specific service methods
      throw err;
    }
  }

  getRegisteredAccounts(): RegisteredAccount[] {
    let accounts: RegisteredAccount[] = [];
    const saved = localStorage.getItem('annapurna_registered_users_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) accounts = parsed;
      } catch (e) {
        // fallback
      }
    }

    // Always ensure every account in INITIAL_REGISTERED_ACCOUNTS is updated/upserted with latest credentials
    for (const initAcc of INITIAL_REGISTERED_ACCOUNTS) {
      const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === initAcc.email.toLowerCase());
      if (existingIdx >= 0) {
        accounts[existingIdx] = { ...accounts[existingIdx], ...initAcc };
      } else {
        accounts.unshift(initAcc);
      }
    }

    // Also include any faculty in cache
    for (const fac of this.faculty) {
      if (fac.email && !accounts.some((a) => a.email.toLowerCase() === fac.email.toLowerCase())) {
        accounts.push({
          id: `user-${fac.id}`,
          email: fac.email,
          password: 'Teacher@Amce2024#',
          alt_password: 'Teacher@123456',
          role: 'FACULTY',
          full_name: fac.full_name,
          avatar_url: fac.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          is_active: true,
          department: fac.department,
        });
      }
    }

    // Also include any students in cache
    for (const st of this.students) {
      if (st.email && !accounts.some((a) => a.email.toLowerCase() === st.email.toLowerCase())) {
        accounts.push({
          id: `user-${st.id}`,
          email: st.email,
          password: 'Student@Amce2024#',
          alt_password: 'Student@123456',
          role: 'STUDENT',
          full_name: st.full_name,
          avatar_url: st.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          is_active: true,
          roll_number: st.roll_number,
        });
      }
    }

    localStorage.setItem('annapurna_registered_users_v2', JSON.stringify(accounts));
    return accounts;
  }

  saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
    localStorage.setItem('annapurna_registered_users_v2', JSON.stringify(accounts));
  }

  // --- AUTH ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        timeoutMs: 15000,
      });
      this.setToken(res.access_token);
      localStorage.setItem('annapurna_current_user', JSON.stringify(res.user));
      return res;
    } catch {
      // Offline / fallback credential check against dynamic registered accounts directory
      const accounts = this.getRegisteredAccounts();
      let matched = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

      const lowerPass = cleanPassword.toLowerCase();
      const isAdminPass = ['admin@amce2024#', 'admin@123456', 'amce2024#', 'amce123456'].includes(lowerPass);
      const isTeacherPass = ['teacher@amce2024#', 'teacher@123456', 'amce2024#', 'amce123456'].includes(lowerPass);
      const isStudentPass = ['student@amce2024#', 'student@123456', 'amce2024#', 'amce123456'].includes(lowerPass);

      // If account not explicitly in registered list, check against live faculty and students caches
      if (!matched) {
        const foundFaculty = this.faculty.find((f) => f.email.toLowerCase() === cleanEmail);
        const foundStudent = this.students.find((s) => s.email.toLowerCase() === cleanEmail);

        if (cleanEmail.includes('admin') && isAdminPass) {
          matched = {
            id: `user-admin-auto-${Date.now()}`,
            email: cleanEmail,
            password: cleanPassword,
            role: 'SUPER_ADMIN',
            full_name: 'Dr. Arnab Senapati, Principal',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            is_active: true,
          };
          accounts.push(matched);
          this.saveRegisteredAccounts(accounts);
        } else if (foundFaculty || (cleanEmail.includes('faculty') || cleanEmail.includes('teacher') || isTeacherPass)) {
          matched = {
            id: foundFaculty ? `user-${foundFaculty.id}` : `user-fac-auto-${Date.now()}`,
            email: cleanEmail,
            password: cleanPassword,
            role: 'FACULTY',
            full_name: foundFaculty ? foundFaculty.full_name : 'Faculty Educator',
            avatar_url: foundFaculty?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            is_active: true,
            department: foundFaculty?.department || 'Department of Teacher Education',
          };
          accounts.push(matched);
          this.saveRegisteredAccounts(accounts);
        } else if (foundStudent || cleanEmail.includes('student') || isStudentPass) {
          matched = {
            id: foundStudent ? `user-${foundStudent.id}` : `user-stud-auto-${Date.now()}`,
            email: cleanEmail,
            password: cleanPassword,
            role: 'STUDENT',
            full_name: foundStudent ? foundStudent.full_name : 'Student Trainee',
            avatar_url: foundStudent?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            is_active: true,
            roll_number: foundStudent?.roll_number || 'AMC-TR-2024',
          };
          accounts.push(matched);
          this.saveRegisteredAccounts(accounts);
        }
      }

      const isValidPassword =
        Boolean(matched) &&
        (matched!.password === cleanPassword ||
          (matched as any)?.alt_password === cleanPassword ||
          (matched!.role === 'SUPER_ADMIN' && isAdminPass) ||
          ((matched!.role === 'FACULTY' || (matched!.role as any) === 'TEACHER') && isTeacherPass) ||
          (matched!.role === 'STUDENT' && isStudentPass));

      if (!matched || !isValidPassword) {
        throw new Error('Invalid email or password credentials. Please verify your details.');
      }

      if (!matched.is_active) {
        throw new Error('This account has been deactivated. Please contact the administrator.');
      }

      const user: User = {
        id: matched.id,
        email: matched.email,
        full_name: matched.full_name,
        role: matched.role,
        avatar_url: matched.avatar_url,
        is_active: matched.is_active,
      };

      const mockToken = `mock_token_${matched.id}`;
      this.setToken(mockToken);
      localStorage.setItem('annapurna_current_user', JSON.stringify(user));
      return { access_token: mockToken, user };
    }
  }

  async getMe(): Promise<User> {
    try {
      return await this.request<User>('/auth/me');
    } catch {
      const saved = localStorage.getItem('annapurna_current_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
      return {
        id: 'admin-1',
        email: 'admin@annapurnacollege.edu.in',
        full_name: 'Dr. Arnab Senapati, Principal',
        role: 'SUPER_ADMIN',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        is_active: true,
      };
    }
  }

  async changePassword(email: string, currentPass: string, newPass: string): Promise<boolean> {
    try {
      await this.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPass, new_password: newPass }),
      });
    } catch {
      // offline / client-side update fallback
    }

    const accounts = this.getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) {
      throw new Error('User account not found.');
    }
    if (accounts[idx].password !== currentPass) {
      throw new Error('Current security password does not match.');
    }

    accounts[idx].password = newPass;
    this.saveRegisteredAccounts(accounts);
    return true;
  }

  // --- STUDENTS ---
  async getStudents(params: Record<string, any> = {}): Promise<{ items: Student[]; total: number }> {
    try {
      const qs = new URLSearchParams(params).toString();
      return await this.request<{ items: Student[]; total: number }>(`/students?${qs}`);
    } catch {
      let filtered = [...this.students];
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.full_name.toLowerCase().includes(q) ||
            s.roll_number.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
      }
      if (params.course_code) {
        filtered = filtered.filter((s) => s.course_code === params.course_code);
      }
      return { items: filtered, total: filtered.length };
    }
  }

  async checkEmailAvailability(
    email: string,
    type?: 'FACULTY' | 'STUDENT'
  ): Promise<{ available: boolean; exists: boolean; role?: string; name?: string; detail: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { available: true, exists: false, detail: 'Enter a valid email address' };
    }
    try {
      const qs = new URLSearchParams({ email: cleanEmail, ...(type ? { type } : {}) }).toString();
      return await this.request<{ available: boolean; exists: boolean; role?: string; name?: string; detail: string }>(
        `/auth/check-email?${qs}`
      );
    } catch {
      // Local verification against active state
      const clean = cleanEmail;
      const existingFaculty = this.faculty.find((f) => f.email.toLowerCase() === clean);
      if (existingFaculty) {
        return {
          available: false,
          exists: true,
          role: 'FACULTY',
          name: existingFaculty.full_name,
          detail: `This email is already registered to faculty member '${existingFaculty.full_name}'. Please provide another email address.`,
        };
      }
      const existingStudent = this.students.find((s) => s.email.toLowerCase() === clean);
      if (existingStudent) {
        return {
          available: false,
          exists: true,
          role: 'STUDENT',
          name: existingStudent.full_name,
          detail: `This email is already registered to student '${existingStudent.full_name}' (Roll: ${existingStudent.roll_number}). Please provide another email address.`,
        };
      }
      return { available: true, exists: false, detail: 'Email address is available.' };
    }
  }

  async createStudent(data: Partial<Student>): Promise<Student & { generated_password?: string }> {
    const res = await this.request<any>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const createdStudent: Student = res;
    this.students = [createdStudent, ...this.students.filter((s) => s.id !== createdStudent.id)];
    this.setCachedList('annapurna_students', this.students);

    const finalPassword = (createdStudent as any).generated_password || `Amce#Stud${Math.floor(1000 + Math.random() * 9000)}`;
    const accounts = this.getRegisteredAccounts();
    const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === createdStudent.email.toLowerCase());
    const newAccount: RegisteredAccount = {
      id: `user-${createdStudent.id}`,
      email: createdStudent.email,
      password: finalPassword,
      alt_password: 'Student@123456',
      role: 'STUDENT',
      full_name: createdStudent.full_name,
      avatar_url: createdStudent.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      is_active: true,
      roll_number: createdStudent.roll_number,
    };
    if (existingIdx >= 0) {
      accounts[existingIdx] = newAccount;
    } else {
      accounts.push(newAccount);
    }
    this.saveRegisteredAccounts(accounts);
    return { ...createdStudent, generated_password: finalPassword };
  }

  // --- FACULTY ---
  async getFaculty(): Promise<{ items: Faculty[]; total: number }> {
    try {
      const res = await this.request<{ items: Faculty[]; total: number }>('/faculty');
      if (res && Array.isArray(res.items)) {
        this.faculty = res.items;
        this.setCachedList('annapurna_faculty', res.items);
        return res;
      }
    } catch {
      // fallback
    }
    return { items: this.faculty, total: this.faculty.length };
  }

  async createFaculty(data: Partial<Faculty>): Promise<Faculty & { generated_password?: string }> {
    const res = await this.request<any>('/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const createdFaculty: Faculty = res;
    this.faculty = [createdFaculty, ...this.faculty.filter((f) => f.id !== createdFaculty.id)];
    this.setCachedList('annapurna_faculty', this.faculty);

    const finalPassword = (createdFaculty as any).generated_password || `Amce#Teach${Math.floor(1000 + Math.random() * 9000)}`;
    const accounts = this.getRegisteredAccounts();
    const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === createdFaculty.email.toLowerCase());
    const newAccount: RegisteredAccount = {
      id: `user-${createdFaculty.id}`,
      email: createdFaculty.email,
      password: finalPassword,
      role: 'FACULTY',
      full_name: createdFaculty.full_name,
      avatar_url: createdFaculty.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      is_active: true,
      department: createdFaculty.department,
    };

    if (existingIdx >= 0) {
      accounts[existingIdx] = newAccount;
    } else {
      accounts.push(newAccount);
    }
    this.saveRegisteredAccounts(accounts);

    return { ...createdFaculty, generated_password: finalPassword };
  }

  // --- ACADEMICS ---
  async getCourses(): Promise<Course[]> {
    try {
      const res = await this.request<Course[]>('/academics/courses');
      if (Array.isArray(res)) {
        this.courses = res;
        this.setCachedList('annapurna_courses', res);
        return res;
      }
    } catch {
      // fallback
    }
    return this.courses;
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    const code = (data.code || `NEW_${Date.now()}`).toUpperCase().trim();
    try {
      const res = await this.request<Course>('/academics/courses', {
        method: 'POST',
        body: JSON.stringify({ ...data, code }),
      });
      this.courses = [res, ...this.courses.filter((c) => c.code !== code && c.id !== res.id)];
      this.setCachedList('annapurna_courses', this.courses);
      return res;
    } catch {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        code,
        name: data.name || 'New Degree Course',
        department: data.department || 'Department of Teacher Education',
        duration_years: Number(data.duration_years) || 2,
        total_semesters: Number(data.total_semesters) || 4,
        affiliation: data.affiliation || 'BSAEU & NCTE Approved',
        max_intake: Number(data.max_intake) || 100,
        description: data.description || 'Professional educator training program.',
        is_active: true,
      };
      this.courses = [newCourse, ...this.courses.filter((c) => c.code !== code)];
      this.setCachedList('annapurna_courses', this.courses);
      return newCourse;
    }
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    try {
      const res = await this.request<Course>(`/academics/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const idx = this.courses.findIndex((c) => c.id === id || c.code === id);
      if (idx !== -1) {
        this.courses[idx] = res;
      } else {
        this.courses.push(res);
      }
      this.setCachedList('annapurna_courses', this.courses);
      return res;
    } catch {
      const idx = this.courses.findIndex((c) => c.id === id || c.code === id);
      if (idx !== -1) {
        this.courses[idx] = { ...this.courses[idx], ...data };
        this.setCachedList('annapurna_courses', this.courses);
        return this.courses[idx];
      }
      throw new Error('Course not found');
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      await this.request(`/academics/courses/${id}`, { method: 'DELETE' });
    } catch {}
    this.courses = this.courses.filter((c) => c.id !== id && c.code !== id);
    this.setCachedList('annapurna_courses', this.courses);
    return true;
  }

  async getSubjects(course_code?: string): Promise<Subject[]> {
    try {
      const qs = course_code ? `?course_code=${course_code}` : '';
      const res = await this.request<Subject[]>(`/academics/subjects${qs}`);
      if (Array.isArray(res)) {
        if (!course_code) {
          this.subjects = res;
          this.setCachedList('annapurna_subjects', res);
        }
        return res;
      }
    } catch {}
    return course_code ? this.subjects.filter((s) => s.course_code === course_code) : this.subjects;
  }

  async createSubject(data: Partial<Subject>): Promise<Subject> {
    try {
      const res = await this.request<Subject>('/academics/subjects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.subjects.push(res);
      this.setCachedList('annapurna_subjects', this.subjects);
      return res;
    } catch {
      const sub: Subject = {
        id: `sub-${Date.now()}`,
        code: data.code || `SUB-${Date.now()}`,
        title: data.title || 'New Subject Module',
        course_code: data.course_code || 'BED',
        semester: Number(data.semester) || 1,
        credits: Number(data.credits) || 4,
        full_marks: Number(data.full_marks) || 100,
        pass_marks: Number(data.pass_marks) || 40,
        theory_marks: Number(data.theory_marks) || 70,
        practical_marks: Number(data.practical_marks) || 30,
        faculty_name: data.faculty_name || 'Faculty Member',
      };
      this.subjects.push(sub);
      this.setCachedList('annapurna_subjects', this.subjects);
      return sub;
    }
  }

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    try {
      return await this.request<Subject>(`/academics/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const idx = this.subjects.findIndex((s) => s.id === id);
      if (idx !== -1) {
        this.subjects[idx] = { ...this.subjects[idx], ...data };
        return this.subjects[idx];
      }
      throw new Error('Subject not found');
    }
  }

  async deleteSubject(id: string): Promise<boolean> {
    try {
      await this.request(`/academics/subjects/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      this.subjects = this.subjects.filter((s) => s.id !== id);
      return true;
    }
  }

  // --- EXAMINATIONS & MARKSHEET PIPELINE ---
  async getExaminations(): Promise<Examination[]> {
    try {
      return await this.request<Examination[]>('/examinations');
    } catch {
      return mockExaminations;
    }
  }

  async getExamMarksheets(examId: string, status?: MarksheetStatus): Promise<Marksheet[]> {
    try {
      const qs = status ? `?status=${status}` : '';
      return await this.request<Marksheet[]>(`/examinations/${examId}/marksheets${qs}`);
    } catch {
      let items = this.marksheets.filter((m) => m.exam_id === examId || examId === 'exam-1');
      if (status) {
        items = items.filter((m) => m.status === status);
      }
      return items;
    }
  }

  async executeMarksheetAction(marksheetId: string, action: string, remarks?: string): Promise<{ status: MarksheetStatus }> {
    try {
      return await this.request<{ status: MarksheetStatus }>(`/examinations/marksheets/${marksheetId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, remarks }),
      });
    } catch {
      const ms = this.marksheets.find((m) => m.id === marksheetId);
      if (ms) {
        const nextStatusMap: Record<string, MarksheetStatus> = {
          SUBMIT: 'SUBMITTED_BY_FACULTY',
          VERIFY: 'DEPARTMENT_VERIFIED',
          APPROVE: 'ADMIN_APPROVED',
          PUBLISH: 'PUBLISHED',
          REJECT: 'REJECTED',
        };
        const nextStatus = nextStatusMap[action.toUpperCase()] || 'DRAFT';
        ms.status = nextStatus;
        if (action.toUpperCase() === 'REJECT') {
          ms.rejection_reason = remarks || 'Requires corrections.';
        }
        ms.audit_trail.push({
          stage: nextStatus,
          performed_by_id: 'admin-1',
          performed_by_name: 'Principal Arnab Senapati',
          performed_by_role: 'SUPER_ADMIN',
          timestamp: new Date().toISOString(),
          action: action.toUpperCase(),
          remarks: remarks || `Status transitioned to ${nextStatus}`,
        });
        this.setCachedList('annapurna_marksheets', this.marksheets);
        return { status: nextStatus };
      }
      throw new Error('Marksheet not found');
    }
  }

  async getAllMarksheets(): Promise<Marksheet[]> {
    try {
      const res = await this.request<Marksheet[]>('/examinations/marksheets');
      if (Array.isArray(res)) {
        this.marksheets = res;
        this.setCachedList('annapurna_marksheets', res);
        return res;
      }
    } catch {}
    return this.marksheets;
  }

  async saveMarksheet(data: Partial<Marksheet>): Promise<Marksheet> {
    try {
      const res = await this.request<Marksheet>('/examinations/marksheets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.marksheets = [res, ...this.marksheets.filter((m) => m.id !== res.id)];
      this.setCachedList('annapurna_marksheets', this.marksheets);
      return res;
    } catch {
      const existingIdx = this.marksheets.findIndex(
        (m) =>
          m.id === data.id ||
          (m.student_id === data.student_id && m.semester === data.semester) ||
          (m.roll_number === data.roll_number && m.semester === data.semester)
      );
      const updatedMarksheet: Marksheet = {
        id: data.id || `ms-${Date.now()}`,
        exam_id: data.exam_id || 'exam-dynamic',
        exam_title: data.exam_title || `${data.course_name || 'Program'} Semester ${data.semester || 1} Examination`,
        student_id: data.student_id || 'st-unknown',
        roll_number: data.roll_number || 'AMC-000',
        registration_number: data.registration_number,
        student_name: data.student_name || 'Trainee',
        course_code: data.course_code || 'BED',
        course_name: data.course_name || 'Degree Program',
        semester: Number(data.semester) || 1,
        academic_session: data.academic_session || '2024-2026',
        subject_scores: data.subject_scores || [],
        total_marks_obtained: data.total_marks_obtained || 0,
        total_marks_maximum: data.total_marks_maximum || 500,
        grand_max_marks: data.grand_max_marks || data.total_marks_maximum || 500,
        percentage: data.percentage || 0,
        overall_percentage: data.overall_percentage || data.percentage || 0,
        sgpa: data.sgpa || 0,
        cgpa: data.cgpa || data.sgpa || 0,
        letter_grade: data.letter_grade || 'P',
        result_status: data.result_status || 'PASS',
        status: data.status || 'PUBLISHED',
        qr_code_hash: data.qr_code_hash || `AMCE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        audit_trail: data.audit_trail || [
          {
            stage: 'PUBLISHED',
            performed_by_id: 'admin-1',
            performed_by_name: 'Principal Arnab Senapati',
            performed_by_role: 'SUPER_ADMIN',
            timestamp: new Date().toISOString(),
            action: 'GENERATED_AND_PUBLISHED',
            remarks: 'Semester marksheet generated and certified.',
          },
        ],
        created_at: data.created_at || new Date().toISOString(),
      };
      if (existingIdx !== -1) {
        this.marksheets[existingIdx] = updatedMarksheet;
      } else {
        this.marksheets.unshift(updatedMarksheet);
      }
      this.setCachedList('annapurna_marksheets', this.marksheets);
      return updatedMarksheet;
    }
  }

  async downloadMarksheetPdf(marksheetId: string): Promise<Blob> {
    try {
      const res = await fetch(`${BASE_URL}/examinations/marksheets/${marksheetId}/pdf`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      if (!res.ok) throw new Error('PDF download failed');
      return await res.blob();
    } catch {
      // Create minimal client-side simulated PDF blob
      return new Blob(['%PDF-1.4 Simulated Marksheet Document'], { type: 'application/pdf' });
    }
  }

  async verifyMarksheet(qrHash: string): Promise<any> {
    try {
      return await this.request(`/examinations/verify/${qrHash}`);
    } catch {
      const ms = this.marksheets.find((m) => m.qr_code_hash.toUpperCase() === qrHash.toUpperCase());
      if (ms) {
        return {
          is_verified: true,
          college: 'Annapurna Memorial College of Education, Kashinagar',
          student_name: ms.student_name,
          roll_number: ms.roll_number,
          course: ms.course_name,
          semester: ms.semester,
          session: ms.academic_session,
          sgpa: ms.sgpa,
          result_status: ms.result_status,
          status: ms.status,
          issued_date: ms.published_at || new Date().toISOString(),
        };
      }
      throw new Error('Invalid verification hash. Record not found.');
    }
  }

  // --- ATTENDANCE ---
  async getAttendanceAnalytics(course_code: string, semester: number): Promise<any[]> {
    try {
      return await this.request(`/attendance/analytics?course_code=${course_code}&semester=${semester}`);
    } catch {
      return this.students.map((st, idx) => ({
        student_id: st.id,
        roll_number: st.roll_number,
        student_name: st.full_name,
        course_code,
        semester,
        total_classes: 30,
        classes_attended: idx === 4 ? 20 : 27 - idx,
        percentage: idx === 4 ? 66.7 : Math.round(((27 - idx) / 30) * 100),
        is_short_attendance: idx === 4,
      }));
    }
  }

  // --- FEES ---
  async getFeeOverview(): Promise<FeeOverview> {
    try {
      return await this.request<FeeOverview>('/fees/overview');
    } catch {
      return mockFeeOverview;
    }
  }

  async getInvoices(): Promise<{ items: Invoice[]; total: number }> {
    try {
      return await this.request<{ items: Invoice[]; total: number }>('/fees/invoices');
    } catch {
      return { items: this.invoices, total: this.invoices.length };
    }
  }

  async recordPayment(invoiceId: string, amount: number, method: string): Promise<any> {
    try {
      return await this.request('/fees/payments', {
        method: 'POST',
        body: JSON.stringify({ invoice_id: invoiceId, amount, payment_method: method }),
      });
    } catch {
      const inv = this.invoices.find((i) => i.id === invoiceId);
      if (inv) {
        inv.amount_paid += amount;
        inv.balance = Math.max(0, inv.amount_due - inv.amount_paid);
        inv.status = inv.balance === 0 ? 'PAID' : 'PARTIAL';
      }
      return { message: 'Payment recorded successfully' };
    }
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    try {
      return await this.request<Invoice>('/fees/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const total = Number(data.amount_due) || 35000;
      const paid = Number(data.amount_paid) || 0;
      const inv: Invoice = {
        id: `inv-${Date.now()}`,
        invoice_number: data.invoice_number || `INV-2024-${this.invoices.length + 101}`,
        student_id: data.student_id || 'st-1',
        student_name: data.student_name || 'Trainee',
        roll_number: data.roll_number || 'AMC-BED-2024-001',
        course_code: data.course_code || 'BED',
        semester: Number(data.semester) || 1,
        title: data.title || 'Semester Fee',
        amount_due: total,
        amount_paid: paid,
        balance: Math.max(0, total - paid),
        due_date: data.due_date || '2026-12-31',
        status: paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING',
        created_at: new Date().toISOString(),
      };
      this.invoices.unshift(inv);
      return inv;
    }
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    try {
      return await this.request<Invoice>(`/fees/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const idx = this.invoices.findIndex((i) => i.id === id);
      if (idx !== -1) {
        const total = data.amount_due !== undefined ? Number(data.amount_due) : this.invoices[idx].amount_due;
        const paid = data.amount_paid !== undefined ? Number(data.amount_paid) : this.invoices[idx].amount_paid;
        const bal = Math.max(0, total - paid);
        this.invoices[idx] = {
          ...this.invoices[idx],
          ...data,
          amount_due: total,
          amount_paid: paid,
          balance: bal,
          status: bal === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : (data.status || this.invoices[idx].status),
        };
        return this.invoices[idx];
      }
      throw new Error('Invoice not found');
    }
  }

  async deleteInvoice(id: string): Promise<boolean> {
    try {
      await this.request(`/fees/invoices/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      this.invoices = this.invoices.filter((i) => i.id !== id);
      return true;
    }
  }

  // --- INSTITUTION PROFILE SETTINGS ---
  getCollegeProfile() {
    return this.collegeProfile;
  }

  updateCollegeProfile(data: Partial<typeof this.collegeProfile>) {
    this.collegeProfile = { ...this.collegeProfile, ...data };
    return this.collegeProfile;
  }

  // --- NOTICES ---
  async getNotices(): Promise<Notice[]> {
    try {
      const res = await this.request<Notice[]>('/notices');
      if (Array.isArray(res)) {
        this.notices = res;
        this.setCachedList('annapurna_notices', res);
        return res;
      }
    } catch (e) {
      // Return cached notices or fallback
    }
    return this.getCachedList<Notice>('annapurna_notices', this.notices);
  }

  async createNotice(data: Partial<Notice>): Promise<Notice> {
    try {
      const res = await this.request<Notice>('/notices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.id) {
        this.notices = [res, ...this.notices.filter((n) => n.id !== res.id)];
        this.setCachedList('annapurna_notices', this.notices);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('annapurna_notice_created', { detail: res }));
        }
        return res;
      }
    } catch (e) {
      console.warn('Backend createNotice failed, saving locally:', e);
    }
    const n: Notice = {
      id: `not-${Date.now()}`,
      title: data.title || 'New Announcement',
      content: data.content || '',
      category: data.category || 'ACADEMIC',
      target_audience: data.target_audience || 'ALL',
      priority: data.priority || 'NORMAL',
      is_pinned: !!data.is_pinned,
      published_by_name: 'Dr. Arnab Senapati, Principal',
      views_count: 1,
      created_at: new Date().toISOString(),
    };
    this.notices = [n, ...this.notices.filter((item) => item.id !== n.id)];
    this.setCachedList('annapurna_notices', this.notices);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('annapurna_notice_created', { detail: n }));
    }
    return n;
  }

  // --- UPDATE & DELETE CAPABILITIES FOR SUPER ADMIN ---
  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    try {
      return await this.request<Student>(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const idx = this.students.findIndex((s) => s.id === id);
      if (idx !== -1) {
        this.students[idx] = { ...this.students[idx], ...data };
        return this.students[idx];
      }
      throw new Error('Student not found');
    }
  }

  async deleteStudent(id: string): Promise<boolean> {
    try {
      await this.request(`/students/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      this.students = this.students.filter((s) => s.id !== id);
      return true;
    }
  }

  async updateFaculty(id: string, data: Partial<Faculty>): Promise<Faculty> {
    try {
      return await this.request<Faculty>(`/faculty/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const idx = this.faculty.findIndex((f) => f.id === id);
      if (idx !== -1) {
        this.faculty[idx] = { ...this.faculty[idx], ...data };
        return this.faculty[idx];
      }
      throw new Error('Faculty not found');
    }
  }

  async deleteFaculty(id: string): Promise<boolean> {
    try {
      await this.request(`/faculty/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      this.faculty = this.faculty.filter((f) => f.id !== id);
      return true;
    }
  }

  async updateMarksheetScores(
    id: string,
    data: { scores: any[]; remarks?: string; status?: MarksheetStatus }
  ): Promise<Marksheet> {
    try {
      return await this.request<Marksheet>(`/examinations/marksheets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const idx = this.marksheets.findIndex((m) => m.id === id);
      if (idx !== -1) {
        let totalObtained = 0;
        let totalMax = 0;
        const updatedScores = data.scores || this.marksheets[idx].subject_scores;
        updatedScores.forEach((s) => {
          totalObtained += (Number(s.internal_marks) || 0) + (Number(s.external_marks) || 0);
          totalMax += Number(s.total_maximum) || 100;
        });

        const percent = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        const sgpa = Number((percent / 10).toFixed(2));

        this.marksheets[idx] = {
          ...this.marksheets[idx],
          subject_scores: updatedScores,
          total_marks_obtained: totalObtained,
          total_marks_maximum: totalMax,
          percentage: Number(percent.toFixed(1)),
          sgpa,
          remarks: data.remarks ?? this.marksheets[idx].remarks,
          status: data.status ?? this.marksheets[idx].status,
        };
        this.setCachedList('annapurna_marksheets', this.marksheets);
        return this.marksheets[idx];
      }
      throw new Error('Marksheet not found');
    }
  }

  async publishResults(courseCode: string, semester: number): Promise<{ message: string; modified_count: number }> {
    try {
      const res = await this.request<{ message: string; modified_count: number }>(
        `/examinations/publish-results?course_code=${encodeURIComponent(courseCode)}&semester=${semester}`,
        { method: 'POST' }
      );
      // Synchronize local cache
      const now = new Date().toISOString();
      this.marksheets = this.marksheets.map((m) =>
        m.course_code.toUpperCase() === courseCode.toUpperCase() && Number(m.semester) === Number(semester)
          ? { ...m, status: 'PUBLISHED', published_at: now, certified_at: now }
          : m
      );
      this.setCachedList('annapurna_marksheets', this.marksheets);
      return res;
    } catch {
      const now = new Date().toISOString();
      let count = 0;
      this.marksheets = this.marksheets.map((m) => {
        if (m.course_code.toUpperCase() === courseCode.toUpperCase() && Number(m.semester) === Number(semester)) {
          count++;
          return { ...m, status: 'PUBLISHED', published_at: now, certified_at: now };
        }
        return m;
      });
      this.setCachedList('annapurna_marksheets', this.marksheets);
      return { message: `Published results for ${courseCode} Semester ${semester}`, modified_count: count };
    }
  }

  async updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    try {
      return await this.request<Notice>(`/notices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const idx = this.notices.findIndex((n) => n.id === id);
      if (idx !== -1) {
        this.notices[idx] = { ...this.notices[idx], ...data };
        return this.notices[idx];
      }
      throw new Error('Notice not found');
    }
  }

  async deleteNotice(id: string): Promise<boolean> {
    try {
      await this.request(`/notices/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      this.notices = this.notices.filter((n) => n.id !== id);
      return true;
    }
  }

  // --- STUDY MATERIALS ---
  async getStudyMaterials(params?: { course_code?: string; semester?: number; subject_code?: string }): Promise<StudyMaterial[]> {
    try {
      const queryEntries = Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '');
      const qs = queryEntries.length > 0 ? '?' + new URLSearchParams(queryEntries.map(([k, v]) => [k, String(v)])).toString() : '';
      const list = await this.request<StudyMaterial[]>(`/study-materials${qs}`);
      if (Array.isArray(list)) {
        this.studyMaterials = list;
        this.setCachedList('annapurna_study_materials', list);
        return list;
      }
    } catch {}

    let res = [...this.studyMaterials];
    if (params?.course_code) {
      res = res.filter((m) => m.course_code.toUpperCase() === params.course_code?.toUpperCase());
    }
    if (params?.semester) {
      res = res.filter((m) => Number(m.semester) === Number(params.semester));
    }
    if (params?.subject_code) {
      res = res.filter((m) => m.subject_code.toUpperCase() === params.subject_code?.toUpperCase());
    }
    return res;
  }

  async uploadStudyMaterial(formData: FormData): Promise<StudyMaterial> {
    try {
      const res = await this.request<StudyMaterial>('/study-materials', {
        method: 'POST',
        body: formData,
      });
      this.studyMaterials = [res, ...this.studyMaterials.filter((m) => m.id !== res.id)];
      this.setCachedList('annapurna_study_materials', this.studyMaterials);
      return res;
    } catch {
      const title = (formData.get('title') as string) || 'Study Notes & Materials';
      const description = (formData.get('description') as string) || '';
      const course_code = ((formData.get('course_code') as string) || 'BED').toUpperCase();
      const semester = Number(formData.get('semester')) || 1;
      const subject_code = ((formData.get('subject_code') as string) || 'BED-101').toUpperCase();
      const tagsStr = (formData.get('tags') as string) || '';
      const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
      const file = formData.get('file') as File | null;

      const user = this.getCurrentUser();
      const newMat: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title,
        description,
        course_code,
        semester,
        subject_code,
        file_url: file ? URL.createObjectURL(file) : '/sample_study_material.pdf',
        file_type: file ? file.name.split('.').pop()?.toLowerCase() || 'pdf' : 'pdf',
        file_size_bytes: file ? file.size : 1024 * 350,
        tags: tags.length > 0 ? tags : ['Faculty Lecture Notes', course_code],
        uploaded_by_name: user?.full_name || 'Prof. Faculty Member',
        downloads_count: 0,
        created_at: new Date().toISOString(),
      };
      this.studyMaterials = [newMat, ...this.studyMaterials];
      this.setCachedList('annapurna_study_materials', this.studyMaterials);
      return newMat;
    }
  }

  async deleteStudyMaterial(id: string): Promise<boolean> {
    try {
      await this.request(`/study-materials/${id}`, { method: 'DELETE' });
    } catch {}
    this.studyMaterials = this.studyMaterials.filter((m) => m.id !== id);
    this.setCachedList('annapurna_study_materials', this.studyMaterials);
    return true;
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<{ items: AuditLog[]; total: number }> {
    try {
      return await this.request<{ items: AuditLog[]; total: number }>('/audit');
    } catch {
      return { items: this.auditLogs, total: this.auditLogs.length };
    }
  }
  // --- LEAVE APPLICATION MANAGEMENT (MODULE A.6 & C) ---
  async getLeaveApplications(student_id?: string): Promise<LeaveApplication[]> {
    try {
      const qs = student_id ? `?student_id=${student_id}` : '';
      return await this.request<LeaveApplication[]>(`/leaves${qs}`);
    } catch {
      return student_id
        ? this.leaveApplications.filter((l) => l.student_id === student_id || l.roll_number === student_id)
        : this.leaveApplications;
    }
  }

  async applyForLeave(data: Partial<LeaveApplication>): Promise<LeaveApplication> {
    try {
      return await this.request<LeaveApplication>('/leaves', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newLeave: LeaveApplication = {
        id: `leave-${Date.now()}`,
        student_id: data.student_id || 'st-1',
        student_name: data.student_name || 'Enrolled Student',
        roll_number: data.roll_number || 'AMC-TR-2024',
        course_code: data.course_code || 'BED',
        semester: Number(data.semester) || 1,
        leave_type: data.leave_type || 'MEDICAL',
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date || new Date().toISOString().split('T')[0],
        total_days: Number(data.total_days) || 1,
        reason: data.reason || 'Medical Leave',
        status: 'PENDING',
        applied_at: new Date().toISOString(),
      };
      this.leaveApplications.unshift(newLeave);
      return newLeave;
    }
  }

  async reviewLeaveApplication(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    remarks: string,
    reviewer_name: string
  ): Promise<LeaveApplication> {
    try {
      return await this.request<LeaveApplication>(`/leaves/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, remarks, reviewer_name }),
      });
    } catch {
      const idx = this.leaveApplications.findIndex((l) => l.id === id);
      if (idx !== -1) {
        this.leaveApplications[idx] = {
          ...this.leaveApplications[idx],
          status,
          remarks,
          reviewed_by: reviewer_name,
          reviewed_at: new Date().toISOString(),
        };
        return this.leaveApplications[idx];
      }
      throw new Error('Leave application not found');
    }
  }

  // --- STUDENT FEEDBACK SYSTEM (MODULE A.7 & C.11) ---
  async getStudentFeedbacks(): Promise<StudentFeedback[]> {
    try {
      return await this.request<StudentFeedback[]>('/feedback');
    } catch {
      return this.feedbacks;
    }
  }

  async submitFeedback(data: Partial<StudentFeedback>): Promise<StudentFeedback> {
    try {
      return await this.request<StudentFeedback>('/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newFb: StudentFeedback = {
        id: `fb-${Date.now()}`,
        student_id: data.student_id || 'st-1',
        student_name: data.is_anonymous ? 'Anonymous Trainee' : (data.student_name || 'Enrolled Student'),
        roll_number: data.is_anonymous ? 'ANON' : (data.roll_number || 'AMC-TR-2024'),
        course_code: data.course_code || 'BED',
        semester: Number(data.semester) || 1,
        subject_code: data.subject_code,
        faculty_name: data.faculty_name,
        category: data.category || 'CURRICULUM',
        rating: Number(data.rating) || 5,
        comments: data.comments || '',
        is_anonymous: !!data.is_anonymous,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };
      this.feedbacks.unshift(newFb);
      return newFb;
    }
  }

  async respondToFeedback(id: string, response: string): Promise<StudentFeedback> {
    try {
      return await this.request<StudentFeedback>(`/feedback/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
      });
    } catch {
      const idx = this.feedbacks.findIndex((f) => f.id === id);
      if (idx !== -1) {
        this.feedbacks[idx] = {
          ...this.feedbacks[idx],
          admin_response: response,
          status: 'RESOLVED',
        };
        return this.feedbacks[idx];
      }
      throw new Error('Feedback not found');
    }
  }

  // --- CLASS ANNOUNCEMENTS & COMMUNICATION (MODULE B.5) ---
  async getClassAnnouncements(): Promise<ClassAnnouncement[]> {
    try {
      return await this.request<ClassAnnouncement[]>('/announcements');
    } catch {
      return this.announcements;
    }
  }

  async createClassAnnouncement(data: Partial<ClassAnnouncement>): Promise<ClassAnnouncement> {
    try {
      return await this.request<ClassAnnouncement>('/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const ann: ClassAnnouncement = {
        id: `ann-${Date.now()}`,
        faculty_id: data.faculty_id || 'fac-1',
        faculty_name: data.faculty_name || 'Dr. Debabrata Roy',
        course_code: data.course_code || 'BED',
        semester: Number(data.semester) || 1,
        subject_code: data.subject_code,
        batch: data.batch || 'All Sections',
        title: data.title || 'Class Announcement',
        message: data.message || '',
        priority: data.priority || 'NORMAL',
        created_at: new Date().toISOString(),
      };
      this.announcements.unshift(ann);
      return ann;
    }
  }
}

export const api = new ApiClient();
