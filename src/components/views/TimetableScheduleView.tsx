import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Course } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';

export const TimetableScheduleView: React.FC = () => {
  const { playTab, playPop, playSuccess, playAlert } = useSound();
  const { activeRole, user } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const isTeacher = activeRole === 'TEACHER';

  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'>('MON');
  const [slotsList, setSlotsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for adding a new timetable slot (Teachers & Admin only)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    time: '',
    subject: '',
    room: '',
    faculty: '',
    type: 'Theory Lecture',
  });
  const [isSavingSlot, setIsSavingSlot] = useState(false);

  const days: { key: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'; label: string; full: string }[] = [
    { key: 'MON', label: 'Mon', full: 'Monday' },
    { key: 'TUE', label: 'Tue', full: 'Tuesday' },
    { key: 'WED', label: 'Wed', full: 'Wednesday' },
    { key: 'THU', label: 'Thu', full: 'Thursday' },
    { key: 'FRI', label: 'Fri', full: 'Friday' },
    { key: 'SAT', label: 'Sat', full: 'Saturday' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      let course = selectedCourse;
      let sem = selectedSemester;
      if (isStudent) {
        const me = await api.getMyStudentProfile();
        course = me.course_code;
        sem = Number(me.semester);
        if (course !== selectedCourse) setSelectedCourse(course);
        if (sem !== selectedSemester) setSelectedSemester(sem);
      }
      const cList = await api.getCourses();
      if (!course && cList.length) {
        course = cList[0].code;
        setSelectedCourse(course);
      }
      const [fRes, sList, slots] = await Promise.all([
        isStudent ? Promise.resolve({ items: [] as any[] }) : api.getFaculty(),
        api.getSubjects(course, sem),
        course ? api.getTimetableSlots(course, sem, selectedDay) : Promise.resolve([]),
      ]);
      setCourses(cList);
      const fItems = Array.isArray(fRes) ? fRes : (fRes?.items || []);
      setFacultyList(fItems);
      setSubjectList(sList || []);
      setSlotsList(slots);

      if (fItems.length > 0 && !newSlot.faculty) {
        setNewSlot((prev) => ({ ...prev, faculty: fItems[0].full_name }));
      }

    } catch (e: any) {
      alert(e.message || 'Error loading timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourse, selectedSemester, selectedDay]);

  const activeCourseObj = courses.find((c) => c.code === selectedCourse);
  const totalSemesters = activeCourseObj?.total_semesters || 4;

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.subject.trim() || !newSlot.time.trim() || !newSlot.room.trim()) {
      alert('Time, subject and room are required.');
      return;
    }

    setIsSavingSlot(true);
    try {
      const created = await api.createTimetableSlot({
        day: selectedDay,
        course_code: selectedCourse,
        semester: selectedSemester,
        time: newSlot.time.trim(),
        subject: newSlot.subject.trim(),
        class_label: `${activeCourseObj?.name || selectedCourse} Sem ${selectedSemester}`,
        room: newSlot.room.trim(),
        faculty: newSlot.faculty.trim(),
        type: newSlot.type,
        status: 'Scheduled',
      });
      playSuccess();
      setSlotsList((prev) => [...prev, created]);
      setIsAddModalOpen(false);
      setNewSlot({
        time: '',
        subject: '',
        room: '',
        faculty: facultyList[0]?.full_name || '',
        type: 'Theory Lecture',
      });
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to save timetable slot');
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, subject: string) => {
    if (!window.confirm(`Are you sure you want to remove the lecture slot for "${subject}"?`)) {
      return;
    }
    try {
      await api.deleteTimetableSlot(slotId);
      playSuccess();
      setSlotsList((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to delete slot');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              {isStudent ? 'Class Timetable' : 'Academic Scheduling Engine'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Indian Standard Time (IST)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>
              {isStudent ? 'Weekly Lecture & Practicum Schedule' : 'Academic Lecture & Practicum Timetable'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isStudent
              ? 'View your class schedule, laboratory sessions, assigned faculty, and room locations.'
              : 'Weekly institutional timetable • Manage department lecture slots and room allocations.'}
          </p>
        </div>

        {/* Timetable is managed by the Super Admin; teachers and students view it */}
        {isSuperAdmin && (
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
        )}
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
              disabled={isStudent}
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
                  disabled={isStudent && sem !== selectedSemester}
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

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Session 2026</span>
        </div>
      </div>

      {/* Weekday Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            onClick={() => {
              playTab();
              setSelectedDay(day.key);
            }}
            className={`flex-1 min-w-[90px] py-3 px-4 rounded-2xl text-xs font-extrabold transition-all text-center border ${
              selectedDay === day.key
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <span className="block text-base font-black">{day.label}</span>
            <span className="text-[10px] opacity-80 uppercase tracking-wider">{day.full}</span>
          </button>
        ))}
      </div>

      {/* Slots Schedule List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Loading schedule from database...</p>
          </div>
        ) : slotsList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Lectures Scheduled for {days.find((d) => d.key === selectedDay)?.full}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {!isStudent
                ? 'Click "Add Lecture / Lab Slot" above to schedule a new class for this degree cohort.'
                : 'No academic classes scheduled for this day. Enjoy your study or library hours.'}
            </p>
          </div>
        ) : (
          slotsList.map((slot) => (
            <div
              key={slot.id}
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
                      <span>{slot.class_label || `${slot.course_code} Sem ${slot.semester}`}</span>
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
                  {slot.status || 'Scheduled'}
                </span>

                {/* Only the Super Admin can delete slots */}
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id, slot.subject)}
                    title="Remove Lecture Slot"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Lecture/Lab Slot (Teachers & Super Admin ONLY) */}
      {!isStudent && isAddModalOpen && (
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Timing (IST) *</label>
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room / Lab No. *</label>
                <input
                  type="text"
                  required
                  value={newSlot.room}
                  onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                  placeholder="e.g. Room 201 / ICT Lab"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Faculty</label>
                <input
                  type="text"
                  list="faculty-suggestions"
                  value={newSlot.faculty}
                  onChange={(e) => setNewSlot({ ...newSlot, faculty: e.target.value })}
                  placeholder="Faculty Member Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <datalist id="faculty-suggestions">
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.full_name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Session Type</label>
                <select
                  value={newSlot.type}
                  onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                >
                  <option value="Theory Lecture">Theory Lecture</option>
                  <option value="Practicum / Lab">Practicum / Lab Session</option>
                  <option value="Tutorial Session">Tutorial Session</option>
                  <option value="Microteaching">Microteaching Practicum</option>
                  <option value="Seminar / Workshop">Seminar / Workshop</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton type="button" onClick={() => setIsAddModalOpen(false)} variant="secondary" size="sm">
                Cancel
              </SoundButton>
              <SoundButton
                type="submit"
                variant="primary"
                size="sm"
                soundType="success"
                disabled={isSavingSlot}
              >
                {isSavingSlot ? 'Saving...' : 'Add Slot to Schedule'}
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
