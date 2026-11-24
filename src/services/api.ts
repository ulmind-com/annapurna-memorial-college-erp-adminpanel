import {
  User,
  Student,
  Faculty,
  Course,
  Subject,
  Examination,
  Marksheet,
  MarksheetStatus,
  FeeOverview,
  Invoice,
  Notice,
  StudyMaterial,
  AuditLog,
  LeaveApplication,
  StudentFeedback,
  ClassAnnouncement,
} from '../types';

const DEFAULT_API_URL = 'https://annapurna-memorial-college-erp-adminpanel.onrender.com/api/v1';
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
export const API_ROOT = BASE_URL.replace(/\/api\/v1$/, '');

export interface CollegeProfile {
  name: string;
  tagline: string;
  affiliation: string;
  recognition: string;
  college_code: string;
  aishe_code: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  principal_name: string;
  email: string;
  phone: string;
  academic_year: string;
  established: number | string;
}

export const EMPTY_COLLEGE_PROFILE: CollegeProfile = {
  name: '',
  tagline: '',
  affiliation: '',
  recognition: '',
  college_code: '',
  aishe_code: '',
  address: '',
  district: '',
  state: '',
  pincode: '',
  principal_name: '',
  email: '',
  phone: '',
  academic_year: '',
  established: '',
};

export interface FacultySubject {
  id: string;
  code: string;
  title: string;
  course_code: string;
  semester: number;
  credits: number;
  full_marks: number;
  theory_marks: number;
  practical_marks: number;
  pass_marks: number;
  student_count: number;
}

export interface FacultyClass {
  course_code: string;
  course_name: string;
  semester: number;
  student_count: number;
}

export interface MyFacultyProfile extends Faculty {
  subjects: FacultySubject[];
  classes: FacultyClass[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  event_type: 'HOLIDAY' | 'EVENT' | 'EXAM';
  exam_kind?: 'SEMESTER' | 'INTERNAL' | 'PRACTICAL' | null;
  date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  course_code?: string | null;
  semester?: number | null;
  subject_code?: string | null;
  room?: string | null;
  description?: string | null;
}

export interface StudentQuery {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  course_code: string;
  semester: number;
  subject_code?: string;
  question: string;
  reply?: string;
  replied_by?: string;
  replied_at?: string;
  status: 'OPEN' | 'ANSWERED';
  created_at: string;
}

const qs = (params: Record<string, any> = {}): string => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'ALL');
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}`;
};

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('annapurna_erp_token');
      this.token = saved && saved !== 'null' && !saved.startsWith('mock_token_') ? saved : null;
      if (!this.token) localStorage.removeItem('annapurna_erp_token');

      // Keep Render free-tier instance warm while the panel is open
      const ping = () => fetch(`${API_ROOT}/health`, { mode: 'no-cors' }).catch(() => {});
      setTimeout(ping, 1000);
      setInterval(ping, 4 * 60 * 1000);
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('annapurna_erp_token', token);
    else localStorage.removeItem('annapurna_erp_token');
  }

  public getToken(): string | null {
    return this.token;
  }

  /** Turn a stored file path ("/uploads/x.pdf") into an absolute URL. */
  public fileUrl(url?: string | null): string {
    if (!url) return '';
    return url.startsWith('/') ? `${API_ROOT}${url}` : url;
  }

  private async request<T>(endpoint: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string>),
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    // Render free tier can take ~50s to cold start
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 60000);
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
    } catch (err: any) {
      throw new Error(
        err?.name === 'AbortError'
          ? 'Server is taking too long to respond. Please try again.'
          : 'Cannot reach the server. Check your internet connection.'
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 401 && !endpoint.startsWith('/auth/login')) {
      this.setToken(null);
      localStorage.removeItem('annapurna_current_user');
      window.dispatchEvent(new Event('annapurna_session_expired'));
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${(d.loc || []).slice(-1)[0] || 'field'}: ${d.msg}`).join(', ')
        : detail;
      throw new Error(msg || `Request failed (${response.status})`);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  // --- AUTH ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() }),
    });
    this.setToken(res.access_token);
    localStorage.setItem('annapurna_current_user', JSON.stringify(res.user));
    return res;
  }

  getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async changePassword(_email: string, currentPass: string, newPass: string): Promise<boolean> {
    await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPass, new_password: newPass }),
    });
    return true;
  }

  forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  }

  resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, new_password }) });
  }

  // --- STUDENTS ---
  getStudents(params: Record<string, any> = {}): Promise<{ items: Student[]; total: number }> {
    return this.request(`/students${qs({ limit: 1000, ...params })}`);
  }

  getMyStudentProfile(): Promise<Student> {
    return this.request('/students/me');
  }

  checkEmailAvailability(
    email: string,
    type?: 'FACULTY' | 'STUDENT'
  ): Promise<{ available: boolean; exists: boolean; role?: string; name?: string; detail: string }> {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      return Promise.resolve({ available: true, exists: false, detail: 'Enter a valid email address' });
    }
    return this.request(`/auth/check-email${qs({ email: clean, type })}`);
  }

  createStudent(data: Partial<Student>): Promise<Student & { generated_password?: string }> {
    return this.request('/students', { method: 'POST', body: JSON.stringify(data) });
  }

  updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    return this.request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteStudent(id: string): Promise<boolean> {
    await this.request(`/students/${id}`, { method: 'DELETE' });
    return true;
  }

  resendStudentCredentials(id: string): Promise<{ message: string }> {
    return this.request(`/students/${id}/resend-credentials`, { method: 'POST' });
  }

  // --- FACULTY ---
  getFaculty(): Promise<{ items: Faculty[]; total: number }> {
    return this.request('/faculty?limit=1000');
  }

  getMyFacultyProfile(): Promise<MyFacultyProfile> {
    return this.request('/faculty/me');
  }

  createFaculty(data: Partial<Faculty>): Promise<Faculty & { generated_password?: string }> {
    return this.request('/faculty', { method: 'POST', body: JSON.stringify(data) });
  }

  updateFaculty(id: string, data: Partial<Faculty>): Promise<Faculty> {
    return this.request(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteFaculty(id: string): Promise<boolean> {
    await this.request(`/faculty/${id}`, { method: 'DELETE' });
    return true;
  }

  resendFacultyCredentials(id: string): Promise<{ message: string }> {
    return this.request(`/faculty/${id}/resend-credentials`, { method: 'POST' });
  }

  // --- ACADEMICS ---
  getCourses(): Promise<Course[]> {
    return this.request('/academics/courses');
  }

  createCourse(data: Partial<Course>): Promise<Course> {
    return this.request('/academics/courses', { method: 'POST', body: JSON.stringify(data) });
  }

  updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    return this.request(`/academics/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteCourse(id: string): Promise<boolean> {
    await this.request(`/academics/courses/${id}`, { method: 'DELETE' });
    return true;
  }

  getSubjects(course_code?: string, semester?: number): Promise<Subject[]> {
    return this.request(`/academics/subjects${qs({ course_code, semester })}`);
  }

  createSubject(data: Partial<Subject>): Promise<Subject> {
    return this.request('/academics/subjects', { method: 'POST', body: JSON.stringify(data) });
  }

  updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    return this.request(`/academics/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSubject(id: string): Promise<boolean> {
    await this.request(`/academics/subjects/${id}`, { method: 'DELETE' });
    return true;
  }

  getTimetableSlots(courseCode?: string, semester?: number, day?: string): Promise<any[]> {
    return this.request(`/academics/timetable${qs({ course_code: courseCode, semester, day })}`);
  }

  createTimetableSlot(data: any): Promise<any> {
    return this.request('/academics/timetable', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteTimetableSlot(slotId: string): Promise<void> {
    await this.request(`/academics/timetable/${slotId}`, { method: 'DELETE' });
  }

  getCalendarEvents(params: { event_type?: string; course_code?: string; semester?: number } = {}): Promise<CalendarEvent[]> {
    return this.request(`/academics/calendar${qs(params)}`);
  }

  createCalendarEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request('/academics/calendar', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await this.request(`/academics/calendar/${id}`, { method: 'DELETE' });
  }

  // --- EXAMINATIONS & MARKSHEETS ---
  getExaminations(): Promise<Examination[]> {
    return this.request('/examinations');
  }

  createExamination(data: Partial<Examination>): Promise<Examination> {
    return this.request('/examinations', { method: 'POST', body: JSON.stringify(data) });
  }

  getExamMarksheets(examId: string, status?: MarksheetStatus): Promise<Marksheet[]> {
    return this.request(`/examinations/${examId}/marksheets${qs({ status })}`);
  }

  getAllMarksheets(params: { course_code?: string; semester?: number; status?: string } = {}): Promise<Marksheet[]> {
    return this.request(`/examinations/marksheets${qs({ limit: 500, ...params })}`);
  }

  executeMarksheetAction(marksheetId: string, action: string, remarks?: string): Promise<{ status: MarksheetStatus }> {
    return this.request(`/examinations/marksheets/${marksheetId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks }),
    });
  }

  /** Create/update a student's semester marksheet. Teachers save DRAFT (or submit with `submit: true`). */
  saveMarksheet(data: Partial<Marksheet> & { submit?: boolean }): Promise<Marksheet> {
    return this.request('/examinations/marksheets', { method: 'POST', body: JSON.stringify(data) });
  }

  updateMarksheetScores(
    id: string,
    data: { scores: any[]; remarks?: string; submit?: boolean }
  ): Promise<Marksheet> {
    return this.request(`/examinations/marksheets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  publishResults(courseCode: string, semester: number): Promise<{ message: string; modified_count: number }> {
    return this.request(`/examinations/publish-results${qs({ course_code: courseCode, semester })}`, { method: 'POST' });
  }

  async downloadMarksheetPdf(marksheetId: string): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/examinations/marksheets/${marksheetId}/pdf`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'PDF download failed');
    }
    return res.blob();
  }

  verifyMarksheet(qrHash: string): Promise<any> {
    return this.request(`/examinations/verify/${encodeURIComponent(qrHash.trim())}`);
  }

  // --- ATTENDANCE ---
  getAttendanceAnalytics(course_code: string, semester: number): Promise<any[]> {
    return this.request(`/attendance/analytics${qs({ course_code, semester })}`);
  }

  // --- FEES (not mounted in current scope; kept for type compatibility) ---
  getFeeOverview(): Promise<FeeOverview> {
    return this.request('/fees/overview');
  }

  getInvoices(): Promise<{ items: Invoice[]; total: number }> {
    return this.request('/fees/invoices');
  }

  // --- INSTITUTION SETTINGS ---
  async getCollegeProfile(): Promise<CollegeProfile> {
    const value = await this.request<Partial<CollegeProfile>>('/settings/college_profile');
    return { ...EMPTY_COLLEGE_PROFILE, ...value };
  }

  updateCollegeProfile(data: CollegeProfile): Promise<CollegeProfile> {
    return this.request('/settings/college_profile', { method: 'PUT', body: JSON.stringify(data) });
  }

  getMarksheetTemplate(): Promise<Record<string, any>> {
    return this.request('/settings/marksheet_template');
  }

  updateMarksheetTemplate(data: Record<string, any>): Promise<Record<string, any>> {
    return this.request('/settings/marksheet_template', { method: 'PUT', body: JSON.stringify(data) });
  }

  // --- NOTICES ---
  getNotices(): Promise<Notice[]> {
    return this.request('/notices');
  }

  async createNotice(data: Partial<Notice> & { send_push?: boolean; send_email?: boolean }): Promise<Notice> {
    const res = await this.request<Notice>('/notices', { method: 'POST', body: JSON.stringify(data) });
    window.dispatchEvent(new CustomEvent('annapurna_notice_created', { detail: res }));
    return res;
  }

  updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    return this.request(`/notices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteNotice(id: string): Promise<boolean> {
    await this.request(`/notices/${id}`, { method: 'DELETE' });
    return true;
  }

  // --- STUDY MATERIALS & LESSON PLANS ---
  getStudyMaterials(params: { course_code?: string; semester?: number; subject_code?: string; category?: string } = {}): Promise<StudyMaterial[]> {
    return this.request(`/study-materials${qs({ limit: 200, ...params })}`);
  }

  uploadStudyMaterial(formData: FormData): Promise<StudyMaterial> {
    return this.request('/study-materials', { method: 'POST', body: formData, timeoutMs: 120000 });
  }

  async deleteStudyMaterial(id: string): Promise<boolean> {
    await this.request(`/study-materials/${id}`, { method: 'DELETE' });
    return true;
  }

  trackDownload(id: string): Promise<void> {
    return this.request(`/study-materials/${id}/download`, { method: 'POST' });
  }

  /** Upload any document (e.g. assignment answer) and get back its URL. */
  uploadFile(file: File): Promise<{ url: string; file_name: string; size: number }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.request('/uploads', { method: 'POST', body: fd, timeoutMs: 120000 });
  }

  // --- AUDIT ---
  getAuditLogs(): Promise<{ items: AuditLog[]; total: number }> {
    return this.request('/audit?limit=200');
  }

  // --- LEAVES ---
  getLeaveApplications(student_id?: string): Promise<LeaveApplication[]> {
    return this.request(`/leaves${qs({ student_id })}`);
  }

  applyForLeave(data: Partial<LeaveApplication>): Promise<LeaveApplication> {
    return this.request('/leaves', { method: 'POST', body: JSON.stringify(data) });
  }

  reviewLeaveApplication(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    remarks: string,
    reviewer_name?: string
  ): Promise<LeaveApplication> {
    return this.request(`/leaves/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks, reviewer_name }),
    });
  }

  // --- FEEDBACK ---
  getStudentFeedbacks(): Promise<StudentFeedback[]> {
    return this.request('/feedback?limit=200');
  }

  submitFeedback(data: Partial<StudentFeedback>): Promise<StudentFeedback> {
    return this.request('/feedback', { method: 'POST', body: JSON.stringify(data) });
  }

  respondToFeedback(id: string, response: string): Promise<StudentFeedback> {
    return this.request(`/feedback/${id}/respond`, { method: 'POST', body: JSON.stringify({ response }) });
  }

  // --- CLASS ANNOUNCEMENTS & STUDENT QUERIES ---
  getClassAnnouncements(): Promise<ClassAnnouncement[]> {
    return this.request('/announcements');
  }

  createClassAnnouncement(data: Partial<ClassAnnouncement>): Promise<ClassAnnouncement> {
    return this.request('/announcements', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteClassAnnouncement(id: string): Promise<void> {
    await this.request(`/announcements/${id}`, { method: 'DELETE' });
  }

  getStudentQueries(): Promise<StudentQuery[]> {
    return this.request('/queries');
  }

  createStudentQuery(data: { subject_code?: string; question: string }): Promise<StudentQuery> {
    return this.request('/queries', { method: 'POST', body: JSON.stringify(data) });
  }

  replyStudentQuery(id: string, reply: string): Promise<StudentQuery> {
    return this.request(`/queries/${id}/reply`, { method: 'POST', body: JSON.stringify({ reply }) });
  }

  // --- ASSIGNMENTS ---
  getAssignments(courseCode?: string, semester?: number): Promise<any[]> {
    return this.request(`/assignments${qs({ course_code: courseCode, semester })}`);
  }

  createAssignment(data: any): Promise<any> {
    return this.request('/assignments', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    await this.request(`/assignments/${assignmentId}`, { method: 'DELETE' });
  }

  submitAssignment(assignmentId: string, data: any): Promise<any> {
    return this.request(`/assignments/${assignmentId}/submit`, { method: 'POST', body: JSON.stringify(data) });
  }

  getAssignmentSubmissions(assignmentId: string): Promise<any[]> {
    return this.request(`/assignments/${assignmentId}/submissions`);
  }

  gradeAssignmentSubmission(submissionId: string, data: { marks_awarded: number; feedback?: string }): Promise<any> {
    return this.request(`/assignments/submissions/${submissionId}/grade`, { method: 'POST', body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
