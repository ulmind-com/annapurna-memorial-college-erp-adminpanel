import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Mail, Phone, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { Faculty } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';

export const FacultyView: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { playSuccess } = useSound();

  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Department of Teacher Education');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('M.Ed., Ph.D.');
  const [specialization, setSpecialization] = useState('Educational Psychology');

  const loadFaculty = async () => {
    try {
      const res = await api.getFaculty();
      setFaculty(res.items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !empId || !email) return;

    const newFac: Faculty = {
      id: `fac-${Date.now()}`,
      employee_id: empId,
      full_name: name,
      email,
      phone: phone || '+91 9876543210',
      department,
      designation,
      qualification,
      specialization,
      assigned_subjects: ['BED-101'],
      status: 'ACTIVE',
      avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${empId}`,
    };

    setFaculty([newFac, ...faculty]);
    playSuccess();
    setIsAddModalOpen(false);
    setName('');
    setEmpId('');
    setEmail('');
    setPhone('');
  };

  const filtered = faculty.filter(
    (f) =>
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Faculty & Academic Staff Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Teaching staff profiles, qualifications, NCTE subject allotments, and contact details
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

      {/* Search */}
      <div className="glass-card p-4 rounded-xl flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, employee ID, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={f.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
                    alt={f.full_name}
                    className="w-12 h-12 rounded-full border border-indigo-500/30 object-cover shadow-md"
                  />
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">{f.full_name}</div>
                    <div className="text-[11px] text-indigo-400 font-medium">{f.designation}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{f.employee_id}</div>
                  </div>
                </div>
                <Badge status={f.status} size="sm" />
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Department</div>
                  <div className="text-slate-200 mt-0.5">{f.department}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Qualification</div>
                  <div className="text-slate-200 mt-0.5 font-medium">{f.qualification}</div>
                  {f.specialization && (
                    <div className="text-[10px] text-slate-400 mt-0.5 italic">{f.specialization}</div>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Subjects</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.assigned_subjects.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono font-semibold"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                {f.phone}
              </span>
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <Mail className="w-3 h-3 text-slate-500" />
                {f.email}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
        subtitle="Sundarban Ashutosh B.Ed. College & Annapurna Memorial College"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Full Name"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="AMC-FAC-005"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@annapurnacollege.org"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <SoundButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
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
              Add Member
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
