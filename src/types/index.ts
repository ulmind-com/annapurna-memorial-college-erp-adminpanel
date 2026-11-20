export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'TEACHER' | 'STUDENT' | 'STAFF';

export type NoticeCategory = 'ACADEMIC' | 'EXAMINATION' | 'ADMISSION' | 'EVENT' | 'ADMINISTRATIVE' | 'EMERGENCY';
export type NoticePriority = 'NORMAL' | 'HIGH' | 'URGENT';
export type TargetAudience = 'ALL' | 'STUDENTS' | 'FACULTY' | 'STAFF';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  entity_id?: string;
  roll_number?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Student {
  id: string;
  roll_number: string;
  registration_number?: string;
  full_name: string;
  email: string;
  phone: string;
  course_code: string;
  course_name: string;
  academic_session: string;
  semester: number;
  section: string;
  date_of_birth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  blood_group?: string;
  category: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relation: string;
  address?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED';
  avatar_url?: string;
  documents?: { doc_type: string; filename: string; url: string; uploaded_at: string }[];
  created_at?: string;
}

export interface Faculty {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  specialization?: string;
  joining_date?: string;
  assigned_subjects: string[];
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  is_active?: boolean;
  avatar_url?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  duration_years: number;
  total_semesters: number;
  affiliation: string;
  max_intake: number;
  description?: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  code: string;
  title: string;
  course_code: string;
  semester: number;
  credits: number;
  full_marks: number;
  pass_marks: number;
  theory_marks: number;
  practical_marks: number;
  faculty_id?: string;
  faculty_name?: string;
  is_elective?: boolean;
}

export interface AcademicSession {
  id: string;
  label: string;
  start_year: number;
  end_year: number;
  is_current: boolean;
}

export type MarksheetStatus =
  | 'DRAFT'
  | 'SUBMITTED_BY_FACULTY'
  | 'DEPARTMENT_VERIFIED'
  | 'ADMIN_APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

export interface SubjectScore {
  subject_code: string;
  subject_title: string;
  credits: number;
  theory_obtained?: number;
  practical_obtained?: number;
  max_theory?: number;
  max_practical?: number;
  total_obtained: number;
  max_marks?: number;
  internal_marks?: number;
  external_marks?: number;
  total_maximum?: number;
  percentage?: number;
  grade_point: number;
  letter_grade: string;
  remarks?: string;
}

export interface AuditTrailEntry {
  stage: string;
  performed_by_id: string;
  performed_by_name: string;
  performed_by_role: string;
  timestamp: string;
  action: string;
  remarks?: string;
}

export interface Marksheet {
  id: string;
  exam_id: string;
  exam_title: string;
  student_id: string;
  roll_number: string;
  registration_number?: string;
  student_name: string;
  course_code: string;
  course_name: string;
  semester: number;
  academic_session: string;
  subject_scores: SubjectScore[];
  total_marks_obtained: number;
  grand_max_marks?: number;
  total_marks_maximum?: number;
  overall_percentage?: number;
  percentage?: number;
  sgpa: number;
  cgpa: number;
  letter_grade: string;
  result_status: string;
  status: MarksheetStatus;
  qr_code_hash: string;
  remarks?: string;
  faculty_submitted_by?: string;
  faculty_submitted_at?: string;
  department_verified_by?: string;
  department_verified_at?: string;
  admin_approved_by?: string;
  admin_approved_at?: string;
  published_at?: string;
  rejection_reason?: string;
  audit_trail: AuditTrailEntry[];
  created_at?: string;
}

export interface Examination {
  id: string;
  code: string;
  title: string;
  course_code: string;
  semester: number;
  academic_session: string;
  exam_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  course_code: string;
  semester: number;
  section: string;
  subject_code: string;
  faculty_name?: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  percentage: number;
  records: {
    student_id: string;
    roll_number: string;
    student_name: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }[];
}

export interface StudentAttendanceSummary {
  student_id: string;
  roll_number: string;
  student_name: string;
  course_code: string;
  semester: number;
  total_classes: number;
  classes_attended: number;
  percentage: number;
  is_short_attendance: boolean;
}

export interface LeaveApplication {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  course_code: string;
  semester: number;
  leave_type: 'MEDICAL' | 'PERSONAL' | 'ACADEMIC' | 'EMERGENCY';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  applied_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  remarks?: string;
  document_url?: string;
}

export interface StudentFeedback {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  course_code: string;
  semester: number;
  subject_code?: string;
  faculty_name?: string;
  category: 'CURRICULUM' | 'TEACHING_METHODOLOGY' | 'PRACTICUM_LAB' | 'FACILITIES' | 'GENERAL';
  rating: number;
  comments: string;
  is_anonymous: boolean;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  created_at: string;
  admin_response?: string;
}

export interface ClassAnnouncement {
  id: string;
  faculty_id: string;
  faculty_name: string;
  course_code: string;
  semester: number;
  subject_code?: string;
  batch?: string;
  title: string;
  message: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  created_at: string;
}

export interface FeeStructure {
  id: string;
  title: string;
  course_code: string;
  academic_session: string;
  semester: number;
  components: { name: string; amount: number }[];
  total_amount: number;
  due_date: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  roll_number: string;
  student_name: string;
  course_code: string;
  academic_session?: string;
  semester: number;
  title?: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'PENDING';
  due_date: string;
  components?: { name: string; amount: number }[];
  created_at?: string;
}

export interface FeeOverview {
  total_billed: number;
  total_collected: number;
  total_outstanding: number;
  collection_rate: number;
  paid_invoices: number;
  unpaid_invoices: number;
  partial_invoices: number;
  total_invoices: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'ACADEMIC' | 'EXAMINATION' | 'ADMISSION' | 'EVENT' | 'ADMINISTRATIVE' | 'EMERGENCY';
  target_audience: 'ALL' | 'STUDENTS' | 'FACULTY' | 'STAFF';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  is_pinned: boolean;
  attachment_url?: string;
  published_by_id?: string;
  published_by_name: string;
  views_count: number;
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  course_code: string;
  semester: number;
  subject_code: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  tags: string[];
  uploaded_by_name: string;
  downloads_count: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  ip_address?: string;
  details: Record<string, any>;
  timestamp: string;
}
