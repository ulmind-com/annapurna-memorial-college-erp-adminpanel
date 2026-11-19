import {
  User,
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

class ApiClient {
  private token: string | null = null;
  // Local reactive cache for mock fallback mode
  private students = [...mockStudents];
  private faculty = [...mockFaculty];
  private marksheets = [...mockMarksheets];
  private notices = [...mockNotices];
  private invoices = [...mockInvoices];
  private auditLogs = [...mockAuditLogs];

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('annapurna_erp_token');
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      // Re-throw to allow fallback in specific service methods
      throw err;
    }
  }

  // --- AUTH ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    try {
      const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(res.access_token);
      return res;
    } catch {
      // Fallback mock login
      const mockUser: User = {
        id: 'admin-1',
        email: email || 'admin@annapurnacollege.org',
        full_name: 'Principal Arnab Senapati',
        role: 'SUPER_ADMIN',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        is_active: true,
      };
      this.setToken('mock_jwt_token_annapurna');
      return { access_token: 'mock_jwt_token_annapurna', user: mockUser };
    }
  }

  async getMe(): Promise<User> {
    try {
      return await this.request<User>('/auth/me');
    } catch {
      return {
        id: 'admin-1',
        email: 'admin@annapurnacollege.org',
        full_name: 'Principal Arnab Senapati',
        role: 'SUPER_ADMIN',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        is_active: true,
      };
    }
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

  async createStudent(data: Partial<Student>): Promise<Student> {
    try {
      return await this.request<Student>('/students', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newStudent: Student = {
        id: `st-${Date.now()}`,
        roll_number: data.roll_number || `AMC-BED-2024-${this.students.length + 10}`,
        full_name: data.full_name || 'New Trainee',
        email: data.email || 'student@annapurnacollege.org',
        phone: data.phone || '+91 9999999999',
        course_code: data.course_code || 'BED',
        course_name: 'Bachelor of Education (B.Ed.)',
        academic_session: data.academic_session || '2024-2026',
        semester: Number(data.semester) || 1,
        section: data.section || 'A',
        gender: data.gender || 'FEMALE',
        category: data.category || 'GEN',
        guardian_name: data.guardian_name || 'Guardian',
        guardian_phone: data.guardian_phone || '+91 9999999990',
        guardian_relation: data.guardian_relation || 'Parent',
        status: 'ACTIVE',
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.roll_number || 'AMC'}`,
      };
      this.students.unshift(newStudent);
      return newStudent;
    }
  }

  // --- FACULTY ---
  async getFaculty(): Promise<{ items: Faculty[]; total: number }> {
    try {
      return await this.request<{ items: Faculty[]; total: number }>('/faculty');
    } catch {
      return { items: this.faculty, total: this.faculty.length };
    }
  }

  // --- ACADEMICS ---
  async getCourses(): Promise<Course[]> {
    try {
      return await this.request<Course[]>('/academics/courses');
    } catch {
      return mockCourses;
    }
  }

  async getSubjects(course_code?: string): Promise<Subject[]> {
    try {
      const qs = course_code ? `?course_code=${course_code}` : '';
      return await this.request<Subject[]>(`/academics/subjects${qs}`);
    } catch {
      return course_code ? mockSubjects.filter((s) => s.course_code === course_code) : mockSubjects;
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
        return { status: nextStatus };
      }
      throw new Error('Marksheet not found');
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
          college: 'Annapurna Memorial College & Sundarban Ashutosh B.Ed. College',
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

  // --- NOTICES ---
  async getNotices(): Promise<Notice[]> {
    try {
      return await this.request<Notice[]>('/notices');
    } catch {
      return this.notices;
    }
  }

  async createNotice(data: Partial<Notice>): Promise<Notice> {
    try {
      return await this.request<Notice>('/notices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const n: Notice = {
        id: `not-${Date.now()}`,
        title: data.title || 'New Announcement',
        content: data.content || '',
        category: data.category || 'ACADEMIC',
        target_audience: data.target_audience || 'ALL',
        priority: data.priority || 'NORMAL',
        is_pinned: !!data.is_pinned,
        published_by_name: 'Principal Arnab Senapati',
        views_count: 1,
        created_at: new Date().toISOString(),
      };
      this.notices.unshift(n);
      return n;
    }
  }

  // --- STUDY MATERIALS ---
  async getStudyMaterials(): Promise<StudyMaterial[]> {
    try {
      return await this.request<StudyMaterial[]>('/study-materials');
    } catch {
      return mockStudyMaterials;
    }
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<{ items: AuditLog[]; total: number }> {
    try {
      return await this.request<{ items: AuditLog[]; total: number }>('/audit');
    } catch {
      return { items: this.auditLogs, total: this.auditLogs.length };
    }
  }
}

export const api = new ApiClient();
