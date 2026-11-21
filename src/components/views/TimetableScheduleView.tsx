import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Plus } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { api } from '../../services/api';
import { Course } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';

export const TimetableScheduleView: React.FC = () => {
  const { playTab, playPop, playSuccess } = useSound();
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('BED');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'>('MON');

  // Modal for adding a new timetable slot
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    time: '10:00 AM - 11:15 AM IST',
    subject: '',
    room: 'Room 201',
    faculty: 'Dr. Debabrata Roy',
    type: 'Theory Lecture',
  });

  const days: { key: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'; label: string; full: string }[] = [
    { key: 'MON', label: 'Mon', full: 'Monday' },
    { key: 'TUE', label: 'Tue', full: 'Tuesday' },
    { key: 'WED', label: 'Wed', full: 'Wednesday' },
    { key: 'THU', label: 'Thu', full: 'Thursday' },
    { key: 'FRI', label: 'Fri', full: 'Friday' },
    { key: 'SAT', label: 'Sat', full: 'Saturday' },
  ];

  const defaultSchedule: Record<string, any[]> = {
    MON: [
      {
        id: 'slot-1',
        course_code: 'BED',
        semester: 1,
        time: '08:30 AM - 09:30 AM IST',
        subject: 'Childhood & Growing Up (Course 1.1.1)',
        class: 'B.Ed. Sem 1 (Sec A)',
        room: 'Room 204',
        faculty: 'Dr. Debabrata Roy',
        type: 'Theory Lecture',
        status: 'Completed',
      },
      {
        id: 'slot-2',
        course_code: 'BED',
        semester: 1,
        time: '09:30 AM - 10:45 AM IST',
        subject: 'Contemporary India & Education (Course 1.1.2)',
        class: 'B.Ed. Sem 1 (Sec B)',
        room: 'Room 205',
        faculty: 'Dr. Debabrata Jana',
        type: 'Interactive Seminar',
        status: 'Live Now',
      },
      {
        id: 'slot-3',
        course_code: 'B.TECH',
        semester: 3,
        time: '10:00 AM - 11:30 AM IST',
        subject: 'Data Structures & Algorithms Laboratory',
        class: 'B.TECH Sem 3',
        room: 'Computing Lab 2',
        faculty: 'Prof. Soumen Mukherjee',
        type: 'Technical Practicum',
        status: 'Live Now',
      },
      {
        id: 'slot-4',
        course_code: 'BED',
        semester: 2,
        time: '11:15 AM - 01:00 PM IST',
        subject: 'Micro-Teaching Simulation Practicum',
        class: 'B.Ed. Sem 2',
        room: 'Pedagogy Lab 1',
        faculty: 'Faculty Pedagogical Team',
        type: 'NCTE Practicum',
        status: 'Upcoming',
      },
      {
        id: 'slot-5',
        course_code: 'B.TECH',
        semester: 3,
        time: '02:00 PM - 03:30 PM IST',
        subject: 'Computer Organization & Architecture',
        class: 'B.TECH Sem 3',
        room: 'Lecture Hall 102',
        faculty: 'Prof. Anirban Roy',
        type: 'Theory Lecture',
        status: 'Upcoming',
      },
    ],
    TUE: [
      {
        id: 'slot-6',
        course_code: 'B.TECH',
        semester: 3,
        time: '09:00 AM - 10:30 AM IST',
        subject: 'Discrete Mathematics & Graph Theory',
        class: 'B.TECH Sem 3',
        room: 'Room 105',
        faculty: 'Dr. S. K. Das',
        type: 'Theory Lecture',
        status: 'Scheduled',
      },
      {
        id: 'slot-7',
        course_code: 'BED',
        semester: 2,
        time: '09:00 AM - 10:30 AM IST',
        subject: 'Learning & Teaching (Course 1.2.3)',
        class: 'B.Ed. Sem 2',
        room: 'Room 206',
        faculty: 'Dr. Debabrata Roy',
        type: 'Theory Lecture',
        status: 'Scheduled',
      },
      {
        id: 'slot-8',
        course_code: 'BED',
        semester: 3,
        time: '11:00 AM - 01:00 PM IST',
        subject: 'School Internship Orientation & Lesson Drafting',
        class: 'B.Ed. Sem 3',
        room: 'Auditorium',
        faculty: 'Principal Arnab Senapati',
        type: 'Workshop',
        status: 'Scheduled',
      },
    ],
    WED: [
      {
        id: 'slot-9',
        course_code: 'BED',
        semester: 2,
        time: '08:30 AM - 10:00 AM IST',
        subject: 'Pedagogy of School Subject (Mathematics / Science)',
        class: 'B.Ed. Sem 2',
        room: 'Science Lab 2',
        faculty: 'Prof. S. Halder',
        type: 'Practicum',
        status: 'Scheduled',
      },
      {
        id: 'slot-10',
        course_code: 'B.TECH',
        semester: 3,
        time: '11:00 AM - 01:00 PM IST',
        subject: 'Object Oriented Programming with Java',
        class: 'B.TECH Sem 3',
        room: 'Software Lab 1',
        faculty: 'Prof. Soumen Mukherjee',
        type: 'Lab Practicum',
        status: 'Scheduled',
      },
    ],
    THU: [
      {
        id: 'slot-11',
        course_code: 'BED',
        semester: 4,
        time: '09:00 AM - 10:30 AM IST',
        subject: 'Knowledge and Curriculum (Course 1.4.8)',
        class: 'B.Ed. Sem 4',
        room: 'Room 208',
        faculty: 'Dr. Debabrata Jana',
        type: 'Theory',
        status: 'Scheduled',
      },
      {
        id: 'slot-12',
        course_code: 'B.TECH',
        semester: 3,
        time: '01:30 PM - 03:00 PM IST',
        subject: 'Digital Electronics & Logic Design',
        class: 'B.TECH Sem 3',
        room: 'Circuits Lab',
        faculty: 'Prof. B. Mondal',
        type: 'Hardware Lab',
        status: 'Scheduled',
      },
    ],
    FRI: [
      {
        id: 'slot-13',
        course_code: 'BED',
        semester: 1,
        time: '09:30 AM - 11:30 AM IST',
        subject: 'Yoga Education & Holistic Health (EPC-4)',
        class: 'All Trainees',
        room: 'Sports Ground / Gym',
        faculty: 'Physical Edu Instructor',
        type: 'Practical',
        status: 'Scheduled',
      },
      {
        id: 'slot-14',
        course_code: 'B.TECH',
        semester: 3,
        time: '11:00 AM - 12:30 PM IST',
        subject: 'Professional Communication & Soft Skills',
        class: 'B.TECH Sem 3',
        room: 'Language Lab',
        faculty: 'Prof. P. Sengupta',
        type: 'Practical Workshop',
        status: 'Scheduled',
      },
    ],
    SAT: [
      {
        id: 'slot-15',
        course_code: 'BED',
        semester: 2,
        time: '10:00 AM - 12:30 PM IST',
        subject: 'Community Engagement & Sunderban Field Study',
        class: 'B.Ed. & D.El.Ed.',
        room: 'Field Project',
        faculty: 'Faculty Committee',
        type: 'Field Study',
        status: 'Scheduled',
      },
      {
        id: 'slot-16',
        course_code: 'B.TECH',
        semester: 3,
        time: '10:00 AM - 01:00 PM IST',
        subject: 'Industry Capstone & Technical Seminar',
        class: 'B.TECH Sem 3',
        room: 'Auditorium',
        faculty: 'Departmental Faculty Team',
        type: 'Industry Seminar',
        status: 'Scheduled',
      },
    ],
  };

  const [scheduleData, setScheduleData] = useState<Record<string, any[]>>(() => {
    return api.getCachedList<Record<string, any[]>>('amce_timetable_schedule', defaultSchedule as any) as any || defaultSchedule;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cList, fRes, sList] = await Promise.all([
          api.getCourses(),
          api.getFaculty(),
          api.getSubjects(),
        ]);
        setCourses(cList);
        setFacultyList(fRes.items || []);
        setSubjectList(sList || []);
        if (cList.length > 0 && !cList.some((c) => c.code === selectedCourse)) {
          setSelectedCourse(cList[0].code);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const activeCourseObj = courses.find((c) => c.code === selectedCourse);
  const totalSemesters = activeCourseObj?.total_semesters || 4;

  const currentSlots = (scheduleData[selectedDay] || []).filter((slot) => {
    if (!slot.course_code) return true;
    const matchCourse = slot.course_code.toUpperCase() === selectedCourse.toUpperCase();
    const matchSem = !slot.semester || Number(slot.semester) === Number(selectedSemester);
    return matchCourse && matchSem;
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.subject.trim()) {
      alert('Subject title is required.');
      return;
    }

    const slotToAdd = {
      id: `slot-${Date.now()}`,
      course_code: selectedCourse,
      semester: selectedSemester,
      time: newSlot.time,
      subject: newSlot.subject,
      class: `${activeCourseObj?.name || selectedCourse} Sem ${selectedSemester}`,
      room: newSlot.room,
      faculty: newSlot.faculty,
      type: newSlot.type,
      status: 'Scheduled',
    };

    const updated = {
      ...scheduleData,
      [selectedDay]: [slotToAdd, ...(scheduleData[selectedDay] || [])],
    };

    setScheduleData(updated);
    api.setCachedList('amce_timetable_schedule', updated as any);
    playSuccess();
    setIsAddModalOpen(false);
    setNewSlot({
      time: '10:00 AM - 11:15 AM IST',
      subject: '',
      room: 'Room 201',
      faculty: 'Dr. Debabrata Roy',
      type: 'Theory Lecture',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Academic Lecture & Practicum Timetable</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly institutional timetable in Indian Standard Time (IST) • Dynamic Multi-Program Schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SoundButton
            onClick={() => {
              playPop();
              setIsAddModalOpen(true);
            }}
            variant="primary"
            size="sm"
            soundType="pop"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Lecture / Lab Slot
          </SoundButton>
        </div>
      </div>

      {/* Program & Semester Selector */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Degree Program
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                playTab();
                setSelectedCourse(e.target.value);
                setSelectedSemester(1);
              }}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {courses.map((c) => (
                <option key={c.id || c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Semester
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => {
                    playTab();
                    setSelectedSemester(sem);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedSemester === sem
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing: <span className="font-bold text-slate-900 dark:text-white">{activeCourseObj?.name || selectedCourse}</span> (Sem {selectedSemester})
        </div>
      </div>

      {/* Weekday Switcher Bar */}
      <div className="grid grid-cols-6 gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {days.map((d) => {
          const isSelected = selectedDay === d.key;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => {
                playTab();
                setSelectedDay(d.key);
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-75">{d.label}</div>
              <div className="text-sm font-black mt-0.5">{d.full}</div>
            </button>
          );
        })}
      </div>

      {/* Slots List */}
      <div className="space-y-3.5">
        {currentSlots.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="font-semibold text-xs">
              No lecture or lab periods scheduled for {selectedCourse} (Sem {selectedSemester}) on {days.find((d) => d.key === selectedDay)?.full}.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click &quot;Add Lecture / Lab Slot&quot; above to schedule periods.
            </p>
          </div>
        ) : (
          currentSlots.map((slot, index) => (
            <div
              key={slot.id || index}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                      {slot.time}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {slot.type}
                    </span>
                    {slot.status === 'Live Now' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse">
                        Live Now
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                    {slot.subject}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.class}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.room}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.faculty}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {slot.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Lecture/Lab Slot */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={`Add Schedule Slot (${selectedCourse} - Sem ${selectedSemester})`}
          subtitle={`Day: ${days.find((d) => d.key === selectedDay)?.full}`}
          maxWidth="lg"
        >
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject / Module Title *
              </label>
              <input
                type="text"
                required
                list="subject-suggestions"
                value={newSlot.subject}
                onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                placeholder="e.g. Data Structures & Algorithms / Pedagogy Practicum"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <datalist id="subject-suggestions">
                {subjectList.map((s) => (
                  <option key={s.id || s.code} value={`${s.code} - ${s.title}`} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Timing (IST)</label>
                <input
                  type="text"
                  required
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  placeholder="e.g. 10:00 AM - 11:30 AM IST"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Slot Type</label>
                <select
                  value={newSlot.type}
                  onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Theory Lecture">Theory Lecture</option>
                  <option value="Lab Practicum">Lab Practicum</option>
                  <option value="Interactive Seminar">Interactive Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Field Engagement">Field Engagement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Classroom / Lab</label>
                <input
                  type="text"
                  value={newSlot.room}
                  onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                  placeholder="e.g. Room 204 / Computer Lab 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Faculty</label>
                <input
                  type="text"
                  list="faculty-suggestions"
                  value={newSlot.faculty}
                  onChange={(e) => setNewSlot({ ...newSlot, faculty: e.target.value })}
                  placeholder="e.g. Prof. Soumen Mukherjee"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <datalist id="faculty-suggestions">
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.full_name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton type="button" onClick={() => setIsAddModalOpen(false)} variant="secondary" size="sm">
                Cancel
              </SoundButton>
              <SoundButton type="submit" variant="primary" size="sm" soundType="success">
                Save Schedule Slot
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
