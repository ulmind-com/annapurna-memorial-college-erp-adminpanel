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
} from 'lucide-react';
import { Student } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';

export const StudentsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const { playSuccess } = useSound();

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
    if (!newName || !newRoll || !newEmail) return;

    try {
      await api.createStudent({
        roll_number: newRoll,
        full_name: newName,
        email: newEmail,
        phone: newPhone || '+91 9876543210',
        course_code: newCourse,
        course_name: newCourse === 'BED' ? 'Bachelor of Education (B.Ed.)' : 'Diploma in Elementary Education (D.El.Ed.)',
        academic_session: newSession,
        semester: newSemester,
        gender: newGender,
        category: newCategory,
        guardian_name: newGuardian || 'Guardian Name',
        guardian_phone: newGuardianPhone || '+91 9876500000',
        guardian_relation: 'Parent',
        status: 'ACTIVE',
      });

      playSuccess();
      setIsEnrollModalOpen(false);
      // Reset form
      setNewRoll('');
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      loadStudents();
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Student Admission & Trainee Roster
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage student registrations, academic tracks, semester details, and official documents
          </p>
        </div>

        <SoundButton
          onClick={() => setIsEnrollModalOpen(true)}
          variant="primary"
          soundType="pop"
          icon={<Plus className="w-4 h-4" />}
        >
          Enroll New Trainee
        </SoundButton>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Roll No, Registration, Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700/70 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Programs</option>
            <option value="BED">B.Ed. (Bachelor of Education)</option>
            <option value="DELED">D.El.Ed. (Elementary)</option>
            <option value="BA_ED">B.A. Education</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Trainee</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Registration No</th>
                <th className="py-3 px-4">Course & Session</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${st.roll_number}`}
                        alt={st.full_name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="font-semibold text-white">{st.full_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" />
                          {st.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-indigo-400">{st.roll_number}</td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {st.registration_number || 'Pending'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{st.course_code} - Sem {st.semester}</div>
                    <div className="text-[10px] text-slate-500">{st.academic_session}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {st.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={st.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <SoundButton
                      onClick={() => setSelectedStudent(st)}
                      size="sm"
                      variant="ghost"
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Profile
                    </SoundButton>
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
        title="Enroll New Teacher Trainee"
        subtitle="Sundarban Ashutosh B.Ed. College & Annapurna Memorial College"
        maxWidth="2xl"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ananya Das"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={newRoll}
                onChange={(e) => setNewRoll(e.target.value)}
                placeholder="e.g. AMC-BED-2024-007"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="student@annapurnacollege.org"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Academic Program</label>
              <select
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="BED">Bachelor of Education (B.Ed.)</option>
                <option value="DELED">Diploma in Elementary Education (D.El.Ed.)</option>
                <option value="BA_ED">B.A. (Honours) in Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Academic Session</label>
              <select
                value={newSession}
                onChange={(e) => setNewSession(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="2024-2026">2024-2026</option>
                <option value="2023-2025">2023-2025</option>
                <option value="2025-2027">2025-2027</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Name</label>
              <input
                type="text"
                value={newGuardian}
                onChange={(e) => setNewGuardian(e.target.value)}
                placeholder="Parent or Guardian"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Contact</label>
              <input
                type="tel"
                value={newGuardianPhone}
                onChange={(e) => setNewGuardianPhone(e.target.value)}
                placeholder="+91 9876500000"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <SoundButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </SoundButton>
            <SoundButton
              type="submit"
              variant="primary"
              size="sm"
              soundType="success"
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Confirm Enrollment
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: View Student Profile Details */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Trainee Profile: ${selectedStudent.full_name}`}
          subtitle={`Roll: ${selectedStudent.roll_number} | BSAEU Reg: ${selectedStudent.registration_number || 'N/A'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <img
                src={selectedStudent.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={selectedStudent.full_name}
                className="w-16 h-16 rounded-full border-2 border-indigo-500/40 object-cover shadow-lg"
              />
              <div className="space-y-1">
                <div className="text-base font-bold text-white">{selectedStudent.full_name}</div>
                <div className="text-xs text-indigo-400 font-medium">{selectedStudent.course_name}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Semester {selectedStudent.semester} (Section {selectedStudent.section})</span>
                  <span>•</span>
                  <span>Session: {selectedStudent.academic_session}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Email Address</div>
                <div className="font-semibold text-white mt-0.5 truncate">{selectedStudent.email}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Contact Phone</div>
                <div className="font-semibold text-white mt-0.5">{selectedStudent.phone}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Blood Group</div>
                <div className="font-semibold text-white mt-0.5">{selectedStudent.blood_group || 'O+'}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Category</div>
                <div className="font-semibold text-white mt-0.5">{selectedStudent.category}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Guardian</div>
                <div className="font-semibold text-white mt-0.5">{selectedStudent.guardian_name}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Guardian Phone</div>
                <div className="font-semibold text-white mt-0.5">{selectedStudent.guardian_phone}</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800 text-xs">
              <div className="text-slate-400 text-[10px] uppercase">Permanent Address</div>
              <div className="text-white mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                {selectedStudent.address || 'Kakdwip, South 24 Parganas, West Bengal 743347'}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <SoundButton
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </SoundButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
