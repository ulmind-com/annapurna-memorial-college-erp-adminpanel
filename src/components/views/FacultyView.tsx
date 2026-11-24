import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Mail, Phone, BookOpen, GraduationCap, CheckCircle, Edit3, Trash2, KeyRound, Copy, Check, AlertCircle } from 'lucide-react';
import { Faculty, Course } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { useSound } from '../../context/SoundContext';

export const FacultyView: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const { playSuccess, playPop, playAlert } = useSound();

  // Add Form
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Department of Teacher Education');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('M.Ed., Ph.D.');
  const [specialization, setSpecialization] = useState('Educational Psychology');
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form
  const [editName, setEditName] = useState('');
  const [editEmpId, setEditEmpId] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');

  const loadFaculty = async () => {
    try {
      const [res, cList] = await Promise.all([api.getFaculty(), api.getCourses()]);
      setFaculty(res.items);
      setCourses(cList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const departmentSuggestions = Array.from(
    new Set([
      'Department of Teacher Education',
      'Department of Elementary Education',
      'Department of Computer Science & Engineering',
      'Department of Educational Foundation & Pedagogy',
      ...courses.map((c) => `Department of ${c.name}`),
      ...courses.map((c) => `Department of ${c.code}`),
      ...faculty.map((f) => f.department).filter(Boolean),
    ])
  );

  const handleEmailBlur = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@') || clean.length < 5) return;
    setEmailChecking(true);
    try {
      const res = await api.checkEmailAvailability(clean, 'FACULTY');
      if (!res.available) {
        setEmailError(res.detail);
      } else {
        setEmailError(null);
      }
    } catch {
      setEmailError(null);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name || !empId || !email) return;

    // Direct check email availability before dispatching
    setEmailChecking(true);
    try {
      const checkRes = await api.checkEmailAvailability(email.trim(), 'FACULTY');
      if (!checkRes.available) {
        setEmailError(checkRes.detail);
        setFormError(checkRes.detail);
        playAlert();
        setEmailChecking(false);
        return;
      }
    } catch {}
    setEmailChecking(false);

    try {
      const res = await api.createFaculty({
        employee_id: empId.trim(),
        full_name: name.trim(),
        email: email.trim(),
        phone: phone || '+91 9876543210',
        department,
        designation,
        qualification,
        specialization,
      });

      setFaculty([res, ...faculty]);
      playSuccess();
      setIsAddModalOpen(false);
      loadFaculty();
      setCreatedCredentials({
        name: res.full_name,
        email: res.email,
        password: res.generated_password || 'Amce#Teach2024!',
        role: 'Faculty / Assistant Professor',
      });
      setName('');
      setEmpId('');
      setEmail('');
      setPhone('');
      setEmailError(null);
      setFormError(null);
    } catch (err: any) {
      playAlert();
      const msg = err.message || 'Failed to add faculty';
      setFormError(msg);
      if (msg.toLowerCase().includes('email')) {
        setEmailError(msg);
      }
    }
  };

  const handleOpenEdit = (f: Faculty) => {
    playPop();
    setEditingFaculty(f);
    setEditName(f.full_name);
    setEditEmpId(f.employee_id);
    setEditEmail(f.email);
    setEditPhone(f.phone || '');
    setEditDepartment(f.department);
    setEditDesignation(f.designation);
    setEditQualification(f.qualification);
    setEditSpecialization(f.specialization || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;

    try {
      await api.updateFaculty(editingFaculty.id, {
        full_name: editName.trim(),
        employee_id: editEmpId.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        department: editDepartment,
        designation: editDesignation,
        qualification: editQualification,
        specialization: editSpecialization,
      });

      playSuccess();
      setEditingFaculty(null);
      loadFaculty();
    } catch (err: any) {
      alert(err.message || 'Failed to update faculty member');
    }
  };

  const handleDelete = async (f: Faculty) => {
    if (!window.confirm(`Are you sure you want to remove faculty member ${f.full_name}?`)) return;
    try {
      await api.deleteFaculty(f.id);
      playPop();
      loadFaculty();
    } catch (err: any) {
      alert(err.message || 'Failed to delete faculty');
    }
  };

  const filtered = faculty.filter(
    (f) =>
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedFaculty = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Faculty & Academic Staff Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            NCTE Recognized Teacher Educators, Assistant Professors, and Curriculum Mentors
          </p>
        </div>

        <SoundButton
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          soundType="pop"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Faculty Member
        </SoundButton>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, ID, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {filtered.length} Educators
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedFaculty.map((f) => (
          <div
            key={f.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {f.employee_id}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(f)}
                    title="Edit Faculty Record"
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f)}
                    title="Remove Faculty"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{f.full_name}</h3>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{f.designation}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{f.department}</div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
                <div className="text-slate-700 dark:text-slate-300">
                  <span className="font-bold">Qualification: </span>
                  <span>{f.qualification}</span>
                </div>
                {f.specialization && (
                  <div className="text-slate-700 dark:text-slate-300">
                    <span className="font-bold">Specialization: </span>
                    <span>{f.specialization}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="truncate">{f.email}</span>
              <span>{f.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Pagination Controls */}
      <div className="rounded-3xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 9, 18, 36]}
        />
      </div>

      {/* Modal: Add Faculty */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Appoint New Faculty Member"
        subtitle="Annapurna Memorial College of Education, Kashinagar, South 24 Parganas"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. S. Chatterjee"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="AMCE-FAC-011"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address * {emailChecking && <span className="text-[10px] text-blue-500 font-normal ml-1">Verifying availability...</span>}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                  setFormError(null);
                }}
                onBlur={handleEmailBlur}
                placeholder="faculty@annapurnacollege.org"
                className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  emailError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
              {emailError && (
                <div className="mt-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Email Already in Use:</span>
                    <p className="mt-0.5">{emailError}</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98300 00000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Professor & Principal">Professor & Principal</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Pedagogy Instructor">Pedagogy Instructor</option>
                <option value="Librarian">Librarian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                list="department-suggestions"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Select or enter department"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="M.Ed., Ph.D., NET"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Pedagogy of Mathematics"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Cannot Appoint Faculty Member</div>
                <p className="mt-0.5">{formError}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <SoundButton type="submit" variant="primary" soundType="success" disabled={!!emailError || emailChecking}>
              Save Faculty Record
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Faculty */}
      {editingFaculty && (
        <Modal
          isOpen={!!editingFaculty}
          onClose={() => setEditingFaculty(null)}
          title={`Edit Faculty: ${editingFaculty.full_name}`}
          subtitle="Super Admin Direct Edit Desk"
          maxWidth="lg"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={editEmpId}
                  onChange={(e) => setEditEmpId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  list="department-suggestions"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="Select or enter department"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
                <input
                  type="text"
                  value={editQualification}
                  onChange={(e) => setEditQualification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
                <input
                  type="text"
                  value={editSpecialization}
                  onChange={(e) => setEditSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingFaculty(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <SoundButton type="submit" variant="primary" soundType="success">
                Save & Update Faculty
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Generated Access Credentials Modal */}
      {createdCredentials && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedCredentials(null)}
          title="Faculty Portal Credentials Generated"
          subtitle="Secure Onboarding Information"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">
                Official Access Account Created Successfully!
              </span>
              <span className="text-[11px] block mt-0.5">
                The faculty member has been registered and onboarding email dispatched via Resend.
              </span>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty Name</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{createdCredentials.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Login Email</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{createdCredentials.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Temporary Security Password</span>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 mt-0.5">
                  <span className="font-bold text-purple-600 dark:text-purple-400">{createdCredentials.password}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
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
              * The faculty member can log in and update their password anytime through their profile settings.
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

      {/* Dynamic Department Datalist Auto-Suggestions */}
      <datalist id="department-suggestions">
        {departmentSuggestions.map((dep) => (
          <option key={dep} value={dep} />
        ))}
      </datalist>
    </div>
  );
};
