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
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
  };

  const [scheduleData, setScheduleData] = useState<Record<string, any[]>>(() => {
    const cached = api.getCachedList<Record<string, any[]>>('amce_timetable_schedule', defaultSchedule as any) as any;
    if (cached && typeof cached === 'object') {
      const cleaned: Record<string, any[]> = {};
      for (const d of ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']) {
        cleaned[d] = Array.isArray(cached[d])
          ? cached[d].filter((s: any) => !s?.id?.startsWith('slot-') && s?.faculty !== 'Dr. Debabrata Roy' && s?.faculty !== 'Dr. Debabrata Jana')
          : [];
      }
      return cleaned;
    }
    return defaultSchedule;
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
