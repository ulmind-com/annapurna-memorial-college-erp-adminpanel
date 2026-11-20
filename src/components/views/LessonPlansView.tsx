import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Clock, BookOpen, Download, Search, Filter } from 'lucide-react';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Course } from '../../types';

export const LessonPlansView: React.FC = () => {
  const { playPop, playSuccess } = useSound();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState([
    {
      id: 'LP-101',
      title: 'Pedagogy of Science: Microscopic Cell Structure & Functions',
      course: 'B.Ed. Semester 2',
      unit: 'Unit 3: Plant & Animal Biology',
      pedagogyType: '5E Constructivist Model (Engage, Explore, Explain, Elaborate, Evaluate)',
      tlm: 'Compound Microscope, Prepared Onion Peel Slides, Interactive Smartboard Chart',
      duration: '45 Minutes',
      status: 'APPROVED',
      faculty: 'Dr. Debabrata Jana',
      updatedAt: '18 May 2026 IST',
    },
    {
      id: 'LP-102',
      title: 'Pedagogy of Mathematics: Pythagorean Theorem & Geometry Proofs',
      course: 'B.Ed. Semester 2',
      unit: 'Unit 2: Geometric Logic & Proofs',
      pedagogyType: 'Inductive-Deductive Method with Manipulatives',
      tlm: 'Cardboard square tiles, GeoGebra digital geometry app',
      duration: '45 Minutes',
      status: 'APPROVED',
      faculty: 'Prof. Subhasish Mondal',
      updatedAt: '17 May 2026 IST',
    },
    {
      id: 'LP-103',
      title: 'Foundational Bengali Pedagogy: Varnamala Phonics & Pronunciation',
      course: 'D.El.Ed. Semester 1',
      unit: 'Unit 1: Early Language Acquisition',
      pedagogyType: 'Activity-based Rhyme & Play-way Methodology',
      tlm: 'Flash cards, Illustrated Bengali storybook, Puppet figures',
      duration: '40 Minutes',
      status: 'SUBMITTED',
      faculty: 'Dr. Debabrata Jana',
      updatedAt: '19 May 2026 IST',
    },
    {
      id: 'LP-104',
      title: 'Inclusive Classroom Pedagogy: Adapting Lessons for Dyslexic Learners',
      course: 'B.Ed. Semester 4',
      unit: 'Unit 4: Universal Design for Learning (UDL)',
      pedagogyType: 'Multi-sensory Structured Language (MSL) Approach',
      tlm: 'Audio text-to-speech tools, High-contrast dyslexia-friendly fonts worksheets',
      duration: '50 Minutes',
      status: 'APPROVED',
      faculty: 'Prof. Subhasish Mondal',
      updatedAt: '15 May 2026 IST',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('B.Ed. Semester 2');
  const [newUnit, setNewUnit] = useState('');
  const [newTlm, setNewTlm] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const cList = await api.getCourses();
        setCourses(cList);
        if (cList.length > 0) {
          setNewCourse(`${cList[0].name} Semester 1`);
        }
      } catch (e) {
        console.error('Error loading courses for lesson plans:', e);
      }
    };
    loadCourses();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    playSuccess();
    const newPlan = {
      id: `LP-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      course: newCourse,
      unit: newUnit.trim() || 'Unit 1: Foundation Concept',
      pedagogyType: 'BSAEU Standard Lesson Plan Framework',
      tlm: newTlm.trim() || 'Blackboard, Chart paper & Textbooks',
      duration: '45 Minutes',
      status: 'SUBMITTED',
      faculty: user?.full_name || 'Faculty Member',
      updatedAt: 'Just Now IST',
    };

    setPlans([newPlan, ...plans]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewUnit('');
    setNewTlm('');
  };

  const filtered = plans.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.course.toLowerCase().includes(search.toLowerCase()) ||
      p.unit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>NCTE & BSAEU Lesson Pedagogy Planner</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured lesson designs, teaching learning materials (TLM), and instructional objectives
          </p>
        </div>

        <SoundButton
          onClick={() => {
            playPop();
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
          soundType="pop"
        >
          Create New Lesson Plan
        </SoundButton>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by lesson topic, course, unit..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing {filtered.length} lesson plans
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((plan) => (
          <div
            key={plan.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                  {plan.id} • {plan.course}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    plan.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {plan.status}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 leading-snug">
                {plan.title}
              </h3>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                {plan.unit}
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <div>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Methodology: </span>
                  <span className="text-slate-600 dark:text-slate-400">{plan.pedagogyType}</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Teaching Aids (TLM): </span>
                  <span className="text-slate-600 dark:text-slate-400">{plan.tlm}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">By {plan.faculty} • {plan.updatedAt}</span>
              <SoundButton
                onClick={() => alert(`Exporting ${plan.title} as BSAEU Official Lesson Plan PDF...`)}
                size="sm"
                variant="outline"
                soundType="pop"
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </SoundButton>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Create New Lesson Plan Draft</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lesson Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pedagogy of History: Sunderban Mangrove Heritage"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Course</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {courses.length > 0 ? (
                    courses.flatMap((c) =>
                      Array.from({ length: c.total_semesters || 4 }, (_, i) => (
                        <option key={`${c.code}-${i + 1}`} value={`${c.name} Semester ${i + 1}`}>
                          {c.code} - {c.name} (Semester {i + 1})
                        </option>
                      ))
                    )
                  ) : (
                    <>
                      <option value="B.Ed. Semester 1">B.Ed. Semester 1</option>
                      <option value="B.Ed. Semester 2">B.Ed. Semester 2</option>
                      <option value="B.Ed. Semester 3 (Internship)">B.Ed. Semester 3 (Internship)</option>
                      <option value="B.Ed. Semester 4">B.Ed. Semester 4</option>
                      <option value="D.El.Ed. Semester 1">D.El.Ed. Semester 1</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Syllabus Unit</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. Unit 2: Ecological Education"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teaching Aids (TLM)
                </label>
                <input
                  type="text"
                  value={newTlm}
                  onChange={(e) => setNewTlm(e.target.value)}
                  placeholder="e.g. Maps, Botanical samples, Digital projector"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <SoundButton type="submit" soundType="success">
                  Save & Submit Plan
                </SoundButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
