import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle,
  Layers,
  Calendar,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  GraduationCap,
  Sparkles,
  Users,
  Search,
  Mail,
  Phone,
  UserCheck,
} from 'lucide-react';
import { Course, Subject, Student, Faculty } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

export const AcademicsView: React.FC = () => {
  const { activeRole } = useAuth();
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const { playClick, playSuccess, playAlert, playPop } = useSound();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [facultyOptions, setFacultyOptions] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'CURRICULUM' | 'STUDENTS'>('CURRICULUM');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentPage, setStudentPage] = useState<number>(1);
  const [studentPageSize, setStudentPageSize] = useState<number>(10);

  // Course Modals
  const [isAddCourseModal, setIsAddCourseModal] = useState(false);
  const [isEditCourseModal, setIsEditCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState<Partial<Course>>({
    code: '',
    name: '',
    department: 'Department of Teacher Education',
    duration_years: 2,
    total_semesters: 4,
    affiliation: 'BSAEU & NCTE Recognized',
    max_intake: 100,
    description: '',
  });

  // Subject Modals
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [isEditSubjectModal, setIsEditSubjectModal] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState<Partial<Subject>>({
    code: '',
    title: '',
    course_code: '',
    semester: 1,
    credits: 4,
    full_marks: 100,
    pass_marks: 40,
    theory_marks: 70,
    practical_marks: 30,
    faculty_id: '',
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const loadAcademics = async () => {
    try {
      const [cList, stRes, fRes] = await Promise.all([
        api.getCourses(),
        api.getStudents(),
        api.getFaculty(),
      ]);
      setCourses(cList);
      setStudents(stRes.items || []);
      setFacultyOptions(fRes.items || []);
      if (cList.length > 0 && !cList.some((c) => c.code === selectedCourse)) {
        setSelectedCourse(cList[0].code);
        return;
      }
      setSubjects(selectedCourse ? await api.getSubjects(selectedCourse) : []);
    } catch (e: any) {
      alert(e.message || 'Failed to load academic structure');
    }
  };

  useEffect(() => {
    loadAcademics();
  }, [selectedCourse]);

  // Course Handlers
  const handleOpenAddCourse = () => {
    playPop();
    setCourseFormData({
      code: '',
      name: '',
      department: 'Department of Teacher Education',
      duration_years: 2,
      total_semesters: 4,
      affiliation: 'BSAEU & NCTE Approved',
      max_intake: 100,
      description: '',
    });
    setIsAddCourseModal(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    playPop();
    setCourseFormData({ ...course });
    setIsEditCourseModal(true);
  };

  const handleSaveAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.code || !courseFormData.name) {
      alert('Course Code and Name are required.');
      return;
    }
    try {
      await api.createCourse(courseFormData);
      playSuccess();
      setIsAddCourseModal(false);
      loadAcademics();
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    }
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.id) return;
    try {
      await api.updateCourse(courseFormData.id, courseFormData);
      playSuccess();
      setIsEditCourseModal(false);
      loadAcademics();
    } catch (err: any) {
      alert(err.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete program: ${course.name} (${course.code})?`)) return;
    try {
      playAlert();
      await api.deleteCourse(course.id);
      playSuccess();
      loadAcademics();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  // Subject Handlers
  const handleOpenAddSubject = () => {
    playPop();
    setSubjectFormData({
      code: `${selectedCourse}-`,
      title: '',
      course_code: selectedCourse,
      semester: 1,
      credits: 4,
      full_marks: 100,
      pass_marks: 40,
      theory_marks: 70,
      practical_marks: 30,
      faculty_id: '',
    });
    setIsAddSubjectModal(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    playPop();
    setSelectedSubjectId(sub.id);
    setSubjectFormData({ ...sub, faculty_id: sub.faculty_id || '' });
    setIsEditSubjectModal(true);
  };

  const handleSaveAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFormData.code || !subjectFormData.title) {
      alert('Subject code and title are required.');
      return;
    }
    try {
      await api.createSubject({ ...subjectFormData, course_code: selectedCourse });
      playSuccess();
      setIsAddSubjectModal(false);
      const updated = await api.getSubjects(selectedCourse);
      setSubjects(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to add subject');
    }
  };

  const handleSaveEditSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    try {
      await api.updateSubject(selectedSubjectId, subjectFormData);
      playSuccess();
      setIsEditSubjectModal(false);
      const updated = await api.getSubjects(selectedCourse);
      setSubjects(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (sub: Subject) => {
    if (!confirm(`Delete subject module: ${sub.title} (${sub.code})?`)) return;
    try {
      playAlert();
      await api.deleteSubject(sub.id);
      playSuccess();
      const updated = await api.getSubjects(selectedCourse);
      setSubjects(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    }
  };

  const activeCourseObj = courses.find((c) => c.code === selectedCourse);

  const isStudentInCourse = (s: any, c?: Course) => {
    if (!c) return false;
    const studentCourseCode = (s.course_code || s.course || '').trim().toUpperCase();
    const targetCode = (c.code || '').trim().toUpperCase();
    if (studentCourseCode && targetCode) {
      if (studentCourseCode === targetCode) return true;
      if (studentCourseCode.replace(/[^A-Z0-9]/g, '') === targetCode.replace(/[^A-Z0-9]/g, '')) return true;
    }
    const studentCourseName = (s.course_name || s.course || '').trim().toLowerCase();
    const targetName = (c.name || '').trim().toLowerCase();
    if (targetName && studentCourseName) {
      if (studentCourseName === targetName) return true;
      if (studentCourseName.includes(targetName) || targetName.includes(studentCourseName)) return true;
    }
    if (s.course_id && c.id && String(s.course_id) === String(c.id)) {
      return true;
    }
    return false;
  };

  const enrolledStudents = activeCourseObj ? students.filter((s) => isStudentInCourse(s, activeCourseObj)) : [];

  const filteredEnrolledStudents = enrolledStudents.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.roll_number?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q))
    );
  });

  const paginatedEnrolledStudents = filteredEnrolledStudents.slice(
    (studentPage - 1) * studentPageSize,
    studentPage * studentPageSize
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header Desk */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Academic Curriculum
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeCourseObj?.affiliation || 'Affiliated & Approved Degree Programs'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Courses, Syllabus & Subject Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage academic programs, credit weightage, theory/practicum splits, and course syllabus allocations
          </p>
        </div>

        {isSuperAdmin && (
          <SoundButton
            onClick={handleOpenAddCourse}
            size="md"
            variant="primary"
            soundType="pop"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Academic Program
          </SoundButton>
        )}
      </div>

      {/* Courses Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {courses.map((c) => {
          const isSelected = selectedCourse === c.code;
          const courseTraineeCount = students.filter((s) => isStudentInCourse(s, c)).length;
          const remainingSeats = Math.max(0, (c.max_intake || 100) - courseTraineeCount);

          return (
            <div
              key={c.id}
              onClick={() => {
                playClick();
                setSelectedCourse(c.code);
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all relative group ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 shadow-md ring-2 ring-blue-600/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-extrabold text-xs shadow-2xs">
                  {c.code}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3 h-3" />
                    Approved
                  </span>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(c)}
                        title="Edit Program"
                        className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c)}
                        title="Delete Program"
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-3 leading-snug">{c.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {c.description || 'Comprehensive curriculum conforming to national education standards.'}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px]">
                <div className="text-slate-500 dark:text-slate-400">
                  Duration: <span className="font-bold text-slate-800 dark:text-slate-200">{c.duration_years} Years</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-right">
                  Semesters: <span className="font-bold text-slate-800 dark:text-slate-200">{c.total_semesters}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Total Intake: <span className="font-bold text-slate-800 dark:text-slate-200">{c.max_intake || 100} Seats</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-right truncate">
                  Enrolled: <span className="font-bold text-blue-600 dark:text-blue-400">{courseTraineeCount} Trainees</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Remaining / Available:</span>
                  <span className={`font-mono font-bold ${
                    remainingSeats <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {remainingSeats} Vacant Seats
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeCourseObj && (
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-[11px]">
              {activeCourseObj.code}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{activeCourseObj.name}</span>
            <span className="text-slate-500 dark:text-slate-400">({activeCourseObj.affiliation})</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Total Intake: <b className="text-slate-900 dark:text-white">{activeCourseObj.max_intake || 100} Seats</b></span>
            <span>Enrolled: <b className="text-blue-600 dark:text-blue-400">{enrolledStudents.length} Trainees</b></span>
            <span>Remaining: <b className="text-emerald-600 dark:text-emerald-400">{Math.max(0, (activeCourseObj.max_intake || 100) - enrolledStudents.length)} Vacant</b></span>
          </div>
        </div>
      )}

      {/* Program Details: Tab Bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => { playClick(); setActiveTab('CURRICULUM'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'CURRICULUM'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Syllabus & Subject Modules ({subjects.length})
        </button>

        <button
          type="button"
          onClick={() => { playClick(); setActiveTab('STUDENTS'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'STUDENTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Enrolled Trainees Roster ({enrolledStudents.length})
        </button>
      </div>

      {/* Tab 1: Subjects Catalog for Selected Course */}
      {activeTab === 'CURRICULUM' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {selectedCourse}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Syllabus & Subject Modules
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeCourseObj ? activeCourseObj.name : selectedCourse} • {subjects.length} Total Curricular Modules
              </p>
            </div>

            {isSuperAdmin && (
              <SoundButton
                onClick={handleOpenAddSubject}
                size="sm"
                variant="secondary"
                soundType="pop"
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Subject Module
              </SoundButton>
            )}
          </div>

          {/* Subjects Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Title & Module Name</th>
                  <th className="py-3 px-4 text-center">Semester</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4 text-center">Theory (Max)</th>
                  <th className="py-3 px-4 text-center">Practicum (Max)</th>
                  <th className="py-3 px-4 text-center">Full Marks</th>
                  <th className="py-3 px-4">Assigned Faculty</th>
                  {isSuperAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No subjects defined for this course yet.
                    </td>
                  </tr>
                ) : (
                  subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{s.code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.title}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        Sem {s.semester}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {s.credits} Credits
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        {s.theory_marks}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        {s.practical_marks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 dark:text-white">
                        {s.full_marks}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {s.faculty_name || <span className="text-amber-600">Not assigned</span>}
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSubject(s)}
                              title="Edit Subject"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(s)}
                              title="Delete Subject"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Enrolled Trainees Roster */}
      {activeTab === 'STUDENTS' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {selectedCourse}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Enrolled Trainees Roster
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeCourseObj ? activeCourseObj.name : selectedCourse} • {enrolledStudents.length} Enrolled Trainees
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setStudentPage(1);
                  }}
                  placeholder="Search enrolled trainees..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Enrolled Students Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-4">Trainee</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Registration No</th>
                  <th className="py-3 px-4 text-center">Semester</th>
                  <th className="py-3 px-4 text-center">Session</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEnrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                        <p className="font-medium text-xs">
                          {studentSearch
                            ? 'No enrolled trainees match your search query.'
                            : `No trainees currently enrolled in ${activeCourseObj?.name || selectedCourse}.`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Admit trainees from Student Management to see them enrolled here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEnrolledStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${st.roll_number}`}
                            alt={st.full_name}
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{st.full_name}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {st.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {st.roll_number}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {st.registration_number || (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-sans">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        Sem {st.semester || 1} {st.section ? `(${st.section})` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {st.academic_session || '2024-2026'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {st.category || 'GEN'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {st.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {st.phone}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={filteredEnrolledStudents.length}
            currentPage={studentPage}
            pageSize={studentPageSize}
            onPageChange={setStudentPage}
            onPageSizeChange={(s) => {
              setStudentPageSize(s);
              setStudentPage(1);
            }}
          />
        </div>
      )}

      {/* Modal: Add Academic Program */}
      <Modal
        isOpen={isAddCourseModal}
        onClose={() => setIsAddCourseModal(false)}
        title="Add New Academic Program"
        subtitle="Annapurna Memorial College of Education, Kashinagar, South 24 Parganas"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAddCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={courseFormData.code || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BED, DELED, MED"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Program Title *</label>
              <input
                type="text"
                required
                value={courseFormData.name || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                placeholder="e.g. Master of Education (M.Ed.)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Years)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={courseFormData.duration_years || 2}
                onChange={(e) => setCourseFormData({ ...courseFormData, duration_years: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Semesters</label>
              <input
                type="number"
                min={1}
                max={10}
                value={courseFormData.total_semesters || 4}
                onChange={(e) => setCourseFormData({ ...courseFormData, total_semesters: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Intake Capacity</label>
              <input
                type="number"
                min={10}
                value={courseFormData.max_intake || 100}
                onChange={(e) => setCourseFormData({ ...courseFormData, max_intake: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={courseFormData.department || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Affiliation / Approval</label>
              <input
                type="text"
                value={courseFormData.affiliation || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, affiliation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={courseFormData.description || ''}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsAddCourseModal(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Save Academic Program
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Academic Program */}
      <Modal
        isOpen={isEditCourseModal}
        onClose={() => setIsEditCourseModal(false)}
        title="Edit Academic Program"
        subtitle="Update curriculum specifications and intake quota"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEditCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={courseFormData.code || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Program Title *</label>
              <input
                type="text"
                required
                value={courseFormData.name || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Years)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={courseFormData.duration_years || 2}
                onChange={(e) => setCourseFormData({ ...courseFormData, duration_years: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Semesters</label>
              <input
                type="number"
                min={1}
                max={10}
                value={courseFormData.total_semesters || 4}
                onChange={(e) => setCourseFormData({ ...courseFormData, total_semesters: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Intake Capacity</label>
              <input
                type="number"
                min={10}
                value={courseFormData.max_intake || 100}
                onChange={(e) => setCourseFormData({ ...courseFormData, max_intake: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={courseFormData.department || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Affiliation</label>
              <input
                type="text"
                value={courseFormData.affiliation || ''}
                onChange={(e) => setCourseFormData({ ...courseFormData, affiliation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={courseFormData.description || ''}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsEditCourseModal(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Update Program
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Subject */}
      <Modal
        isOpen={isAddSubjectModal}
        onClose={() => setIsAddSubjectModal(false)}
        title="Add Subject Module"
        subtitle={`Allocate module to ${selectedCourse}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAddSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={subjectFormData.code || ''}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BED-105"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Module Title *</label>
              <input
                type="text"
                required
                value={subjectFormData.title || ''}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, title: e.target.value })}
                placeholder="e.g. Educational Technology & ICT"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <select
                value={subjectFormData.semester || 1}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Credits</label>
              <input
                type="number"
                min={1}
                max={10}
                value={subjectFormData.credits || 4}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, credits: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Marks</label>
              <input
                type="number"
                value={subjectFormData.full_marks || 100}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, full_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Theory Marks</label>
              <input
                type="number"
                value={subjectFormData.theory_marks || 70}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, theory_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Practicum Marks</label>
              <input
                type="number"
                value={subjectFormData.practical_marks || 30}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, practical_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Faculty</label>
              <select
                value={subjectFormData.faculty_id || ''}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, faculty_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="">— Not assigned —</option>
                {facultyOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.full_name} ({f.employee_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsAddSubjectModal(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Save Subject Module
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Subject */}
      <Modal
        isOpen={isEditSubjectModal}
        onClose={() => setIsEditSubjectModal(false)}
        title="Edit Subject Module"
        subtitle={`Modify curriculum requirements for ${subjectFormData.code}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEditSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={subjectFormData.code || ''}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Module Title *</label>
              <input
                type="text"
                required
                value={subjectFormData.title || ''}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <select
                value={subjectFormData.semester || 1}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Credits</label>
              <input
                type="number"
                min={1}
                max={10}
                value={subjectFormData.credits || 4}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, credits: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Marks</label>
              <input
                type="number"
                value={subjectFormData.full_marks || 100}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, full_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Theory Marks</label>
              <input
                type="number"
                value={subjectFormData.theory_marks || 70}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, theory_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Practicum Marks</label>
              <input
                type="number"
                value={subjectFormData.practical_marks || 30}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, practical_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Faculty</label>
              <select
                value={subjectFormData.faculty_id || ''}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, faculty_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="">— Not assigned —</option>
                {facultyOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.full_name} ({f.employee_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsEditSubjectModal(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Update Module
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
