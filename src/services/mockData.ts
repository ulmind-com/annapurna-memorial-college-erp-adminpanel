import {
  Student,
  Faculty,
  Course,
  Subject,
  Examination,
  Marksheet,
  FeeStructure,
  Invoice,
  FeeOverview,
  Notice,
  StudyMaterial,
  AuditLog,
} from '../types';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    code: 'BED',
    name: 'Bachelor of Education (B.Ed.)',
    department: 'Department of Teacher Education',
    duration_years: 2,
    total_semesters: 4,
    affiliation: 'BSAEU & NCTE Recognized',
    max_intake: 100,
    description: 'Professional secondary teacher training curriculum with NCTE compliance.',
    is_active: true,
  },
  {
    id: 'course-2',
    code: 'DELED',
    name: 'Diploma in Elementary Education (D.El.Ed.)',
    department: 'Department of Primary Education',
    duration_years: 2,
    total_semesters: 4,
    affiliation: 'WBBPE Recognized',
    max_intake: 50,
    description: 'Foundational primary school teacher education course.',
    is_active: true,
  },
  {
    id: 'course-3',
    code: 'BA_ED',
    name: 'B.A. in Education (Honours)',
    department: 'Department of Educational Studies',
    duration_years: 3,
    total_semesters: 6,
    affiliation: 'Calcutta University',
    max_intake: 60,
    description: 'Undergraduate degree focusing on educational sociology and philosophy.',
    is_active: true,
  },
  {
    id: 'course-4',
    code: 'BTECH',
    name: 'Bachelor of Technology (B.Tech)',
    department: 'Department of Engineering & Technology',
    duration_years: 4,
    total_semesters: 8,
    affiliation: 'MAKAUT Recognized',
    max_intake: 300,
    description: 'Four-year degree program in engineering and technology.',
    is_active: true,
  },
];

export const mockSubjects: Subject[] = [];
export const mockFaculty: Faculty[] = [];
export const mockStudents: Student[] = [];
export const mockExaminations: Examination[] = [];
export const mockMarksheets: Marksheet[] = [];

export const mockFeeOverview: FeeOverview = {
  total_billed: 0,
  total_collected: 0,
  total_outstanding: 0,
  collection_rate: 0,
  paid_invoices: 0,
  unpaid_invoices: 0,
  partial_invoices: 0,
  total_invoices: 0,
};

export const mockFeeStructure: FeeStructure = {
  id: 'fee-bed-1',
  title: 'B.Ed. Academic Year Fee Schedule',
  course_code: 'BED',
  academic_session: '2024-2026',
  semester: 1,
  components: [],
  total_amount: 0,
  due_date: '2026-12-31',
};

export const mockInvoices: Invoice[] = [];
export const mockNotices: Notice[] = [];
export const mockStudyMaterials: StudyMaterial[] = [];
export const mockAuditLogs: AuditLog[] = [];
