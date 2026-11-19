import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Download,
  Edit3,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { Student } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

export const StudentsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    roll: string;
    role: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { playSuccess, playPop } = useSound();
  const { isSuperAdmin } = useAuth();

  // Form State for New Student
  const [newRoll, setNewRoll] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCourse, setNewCourse] = useState('BED');
  const [newSession, setNewSession] = useState('2024-2026');
  const [newSemester, setNewSemester] = useState(1);
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [newCategory, setNewCategory] = useState('GEN');
  const [newGuardian, setNewGuardian] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');

  // Form State for Editing Student
  const [editName, setEditName] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCourse, setEditCourse] = useState('BED');
  const [editSemester, setEditSemester] = useState(1);
  const [editCategory, setEditCategory] = useState('GEN');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'GRADUATED'>('ACTIVE');
  const [editGuardian, setEditGuardian] = useState('');

  const loadStudents = async () => {
    try {
      const res = await api.getStudents({ search, course_code: courseFilter });
      setStudents(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search, courseFilter]);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createStudent({
        roll_number: newRoll.trim(),
        full_name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        course_code: newCourse,
        course_name: newCourse === 'BED' ? 'Bachelor of Education (B.Ed.)' : 'Diploma in Elementary Education (D.El.Ed.)',
        academic_session: newSession,
        semester: Number(newSemester),
        gender: newGender,
        category: newCategory,
        guardian_name: newGuardian.trim(),
        guardian_phone: newGuardianPhone.trim(),
        guardian_relation: 'Parent / Legal Guardian',
      });

      playSuccess();
      setIsEnrollModalOpen(false);
      setCreatedCredentials({
        name: res.full_name,
        email: res.email,
        password: res.generated_password || 'Amce#Stud2024!',
        roll: res.roll_number,
        role: 'Teacher Trainee (Student)',
      });
      resetNewForm();
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    }
  };

  const handleOpenEdit = (st: Student) => {
    playPop();
    setEditingStudent(st);
    setEditName(st.full_name);
    setEditRoll(st.roll_number);
    setEditEmail(st.email);
    setEditPhone(st.phone || '');
    setEditCourse(st.course_code);
    setEditSemester(st.semester);
    setEditCategory(st.category);
    setEditStatus((st.status as any) || 'ACTIVE');
    setEditGuardian(st.guardian_name || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await api.updateStudent(editingStudent.id, {
        full_name: editName.trim(),
        roll_number: editRoll.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        course_code: editCourse,
        semester: Number(editSemester),
        category: editCategory,
        status: editStatus,
        guardian_name: editGuardian.trim(),
      });

      playSuccess();
      setEditingStudent(null);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to update student profile');
    }
  };

  const handleDelete = async (st: Student) => {
    if (!window.confirm(`Are you sure you want to delete student ${st.full_name} (${st.roll_number})?`)) {
      return;
    }
    try {
      await api.deleteStudent(st.id);
      playPop();
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const resetNewForm = () => {
    setNewRoll('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewGuardian('');
    setNewGuardianPhone('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Student Trainees & Admissions Roster</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage enrolled B.Ed. & D.El.Ed. teacher trainees, BSAEU registrations, and student profiles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SoundButton
            onClick={() => setIsEnrollModalOpen(true)}
            variant="primary"
            soundType="pop"
            icon={<Plus className="w-4 h-4" />}
          >
            Admit New Trainee
          </SoundButton>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option value="">All Programs (B.Ed. & D.El.Ed.)</option>
            <option value="BED">Bachelor of Education (B.Ed.)</option>
            <option value="DELED">Diploma in Elem. Edu (D.El.Ed.)</option>
            <option value="BA_ED">B.A. (Honours) in Education</option>
          </select>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {students.length} Trainees
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-3.5 px-5">Trainee</th>
                <th className="py-3.5 px-5">Roll Number</th>
                <th className="py-3.5 px-5">Registration No</th>
                <th className="py-3.5 px-5">Course & Session</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${st.roll_number}`}
                        alt={st.full_name}
                        className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-2xs"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{st.full_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {st.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-600 dark:text-blue-400">{st.roll_number}</td>
                  <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {st.registration_number || 'Pending'}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{st.course_code} - Sem {st.semester}</div>
                    <div className="text-[10px] text-slate-400">{st.academic_session}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {st.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge status={st.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <SoundButton
                        onClick={() => setSelectedStudent(st)}
                        size="sm"
                        variant="ghost"
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Profile
                      </SoundButton>

                      {/* Edit Button for Super Admin */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(st)}
                        title="Edit Student Details"
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button for Super Admin */}
                      <button
                        type="button"
                        onClick={() => handleDelete(st)}
                        title="Delete Student"
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Enroll New Trainee */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Admit New Teacher Trainee"
        subtitle="Annapurna Memorial College of Education, Kashinagar, South 24 Parganas"
        maxWidth="2xl"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Suman Mondal"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={newRoll}
                onChange={(e) => setNewRoll(e.target.value)}
                placeholder="e.g. AMC-BED-2024-055"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="suman@annapurnacollege.org"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98320 00000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Program</label>
              <select
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BED">Bachelor of Education (B.Ed.)</option>
                <option value="DELED">Diploma in Elem. Edu (D.El.Ed.)</option>
                <option value="BA_ED">B.A. (Honours) Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Session</label>
              <input
                type="text"
                value={newSession}
                onChange={(e) => setNewSession(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <select
                value={newSemester}
                onChange={(e) => setNewSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
                <option value={3}>Semester 3</option>
                <option value={4}>Semester 4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GEN">General</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="OBC-A">OBC-A</option>
                <option value="OBC-B">OBC-B</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Guardian Name</label>
              <input
                type="text"
                value={newGuardian}
                onChange={(e) => setNewGuardian(e.target.value)}
                placeholder="Father / Guardian Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <SoundButton type="submit" variant="primary" soundType="success">
              Complete Admission
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Existing Trainee (Super Admin Full Control) */}
      {editingStudent && (
        <Modal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          title={`Edit Trainee Record: ${editingStudent.full_name}`}
          subtitle="Super Admin Direct Edit Desk • Instant Database Synchronized"
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Roll Number *</label>
                <input
                  type="text"
                  required
                  value={editRoll}
                  onChange={(e) => setEditRoll(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Program</label>
                <select
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BED">B.Ed.</option>
                  <option value="DELED">D.El.Ed.</option>
                  <option value="BA_ED">B.A. Education</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                <select
                  value={editSemester}
                  onChange={(e) => setEditSemester(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="GRADUATED">GRADUATED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GEN">General</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC-A">OBC-A</option>
                  <option value="OBC-B">OBC-B</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={editGuardian}
                  onChange={(e) => setEditGuardian(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <SoundButton type="submit" variant="primary" soundType="success">
                Save & Update Trainee
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Student Profile Details */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Trainee Dossier: ${selectedStudent.full_name}`}
          subtitle={`Roll: ${selectedStudent.roll_number} • ${selectedStudent.course_name}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <img
                src={selectedStudent.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedStudent.roll_number}`}
                alt={selectedStudent.full_name}
                className="w-16 h-16 rounded-full border-2 border-blue-600 object-cover"
              />
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedStudent.full_name}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Roll: {selectedStudent.roll_number} | BSAEU Reg: {selectedStudent.registration_number || 'N/A'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge status={selectedStudent.status} size="sm" />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {selectedStudent.category} Category
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Program</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.course_name}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Semester & Session</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Sem {selectedStudent.semester} ({selectedStudent.academic_session})
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Phone</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.phone || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Email</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{selectedStudent.email}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Guardian</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.guardian_name || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Guardian Contact</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.guardian_phone || 'N/A'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const current = selectedStudent;
                  setSelectedStudent(null);
                  handleOpenEdit(current);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit This Trainee</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Generated Student Access Credentials Modal */}
      {createdCredentials && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedCredentials(null)}
          title="Student Trainee Credentials Generated"
          subtitle="Official Admission Onboarding Notice"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">
                Trainee Enrolled & Account Created Successfully!
              </span>
              <span className="text-[11px] block mt-0.5">
                The trainee has been registered and admission welcome email dispatched via Resend.
              </span>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Trainee Name</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{createdCredentials.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{createdCredentials.roll}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Student Email</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{createdCredentials.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Temporary Security Password</span>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 mt-0.5">
                  <span className="font-bold text-purple-600 dark:text-purple-400">{createdCredentials.password}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Roll: ${createdCredentials.roll}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                      );
                      setHasCopied(true);
                      setTimeout(() => setHasCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                  >
                    {hasCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              * The student can log in and update their password anytime through their student profile.
            </p>

            <div className="flex justify-end pt-2">
              <SoundButton
                onClick={() => setCreatedCredentials(null)}
                variant="primary"
                size="sm"
              >
                Close & Done
              </SoundButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
