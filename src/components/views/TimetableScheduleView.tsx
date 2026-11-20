import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const TimetableScheduleView: React.FC = () => {
  const { playTab } = useSound();
  const [selectedDay, setSelectedDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'>('MON');

  const days: { key: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'; label: string; full: string }[] = [
    { key: 'MON', label: 'Mon', full: 'Monday' },
    { key: 'TUE', label: 'Tue', full: 'Tuesday' },
    { key: 'WED', label: 'Wed', full: 'Wednesday' },
    { key: 'THU', label: 'Thu', full: 'Thursday' },
    { key: 'FRI', label: 'Fri', full: 'Friday' },
    { key: 'SAT', label: 'Sat', full: 'Saturday' },
  ];

  const scheduleData: Record<string, any[]> = {
    MON: [
      {
        time: '08:30 AM - 09:30 AM IST',
        subject: 'Childhood & Growing Up (Course 1.1.1)',
        class: 'B.Ed. Sem 1 (Sec A)',
        room: 'Room 204',
        faculty: 'Dr. Debabrata Roy',
        type: 'Theory Lecture',
        status: 'Completed',
      },
      {
        time: '09:30 AM - 10:45 AM IST',
        subject: 'Contemporary India & Education (Course 1.1.2)',
        class: 'B.Ed. Sem 1 (Sec B)',
        room: 'Room 205',
        faculty: 'Dr. Debabrata Jana',
        type: 'Interactive Seminar',
        status: 'Live Now',
      },
      {
        time: '11:15 AM - 01:00 PM IST',
        subject: 'Micro-Teaching Simulation Practicum',
        class: 'B.Ed. Sem 2',
        room: 'Pedagogy Lab 1',
        faculty: 'Faculty Pedagogical Team',
        type: 'NCTE Practicum',
        status: 'Upcoming',
      },
      {
        time: '02:00 PM - 03:30 PM IST',
        subject: 'Language Across Curriculum (Course 1.1.4)',
        class: 'B.Ed. Sem 1',
        room: 'Room 204',
        faculty: 'Prof. Subhasish Mondal',
        type: 'Theory Lecture',
        status: 'Upcoming',
      },
    ],
    TUE: [
      {
        time: '09:00 AM - 10:30 AM IST',
        subject: 'Learning & Teaching (Course 1.2.3)',
        class: 'B.Ed. Sem 2',
        room: 'Room 206',
        faculty: 'Dr. Debabrata Roy',
        type: 'Theory Lecture',
        status: 'Scheduled',
      },
      {
        time: '11:00 AM - 01:00 PM IST',
        subject: 'School Internship Orientation & Lesson Drafting',
        class: 'B.Ed. Sem 3',
        room: 'Auditorium',
        faculty: 'Principal Arnab Senapati',
        type: 'Workshop',
        status: 'Scheduled',
      },
      {
        time: '02:00 PM - 03:30 PM IST',
        subject: 'Assessment for Learning (Course 1.2.7)',
        class: 'B.Ed. Sem 2',
        room: 'Room 205',
        faculty: 'Dr. Debabrata Jana',
        type: 'Theory Lecture',
        status: 'Scheduled',
      },
    ],
    WED: [
      {
        time: '08:30 AM - 10:00 AM IST',
        subject: 'Pedagogy of School Subject (Mathematics / Science)',
        class: 'B.Ed. Sem 2',
        room: 'Science Lab 2',
        faculty: 'Prof. S. Halder',
        type: 'Practicum',
        status: 'Scheduled',
      },
      {
        time: '10:30 AM - 12:00 PM IST',
        subject: 'Pedagogy of Language (Bengali / English)',
        class: 'B.Ed. Sem 2',
        room: 'Language Lab',
        faculty: 'Dr. Debabrata Roy',
        type: 'Practicum',
        status: 'Scheduled',
      },
      {
        time: '01:30 PM - 03:30 PM IST',
        subject: 'Drama & Art in Education (EPC-2)',
        class: 'B.Ed. Sem 2',
        room: 'Cultural Hall',
        faculty: 'Smt. P. Mukherjee',
        type: 'Activity',
        status: 'Scheduled',
      },
    ],
    THU: [
      {
        time: '09:00 AM - 10:30 AM IST',
        subject: 'Knowledge and Curriculum (Course 1.4.8)',
        class: 'B.Ed. Sem 4',
        room: 'Room 208',
        faculty: 'Dr. Debabrata Jana',
        type: 'Theory',
        status: 'Scheduled',
      },
      {
        time: '11:00 AM - 01:00 PM IST',
        subject: 'Foundational Literacy Practicum (D.El.Ed.)',
        class: 'D.El.Ed. Sem 1',
        room: 'Primary Lab 1',
        faculty: 'Dr. Debabrata Roy',
        type: 'Practicum',
        status: 'Scheduled',
      },
    ],
    FRI: [
      {
        time: '09:30 AM - 11:30 AM IST',
        subject: 'Yoga Education & Holistic Health (EPC-4)',
        class: 'All Trainees',
        room: 'Sports Ground / Gym',
        faculty: 'Physical Edu Instructor',
        type: 'Practical',
        status: 'Scheduled',
      },
      {
        time: '12:00 PM - 01:30 PM IST',
        subject: 'Creating an Inclusive School (Course 1.4.10)',
        class: 'B.Ed. Sem 4',
        room: 'Room 205',
        faculty: 'Prof. Subhasish Mondal',
        type: 'Theory',
        status: 'Scheduled',
      },
    ],
    SAT: [
      {
        time: '10:00 AM - 12:30 PM IST',
        subject: 'Community Engagement & Sunderban Field Study',
        class: 'B.Ed. & D.El.Ed.',
        room: 'Field Project',
        faculty: 'Faculty Committee',
        type: 'Field Study',
        status: 'Scheduled',
      },
    ],
  };

  const currentSlots = scheduleData[selectedDay] || [];

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
            Weekly institutional timetable in Indian Standard Time (IST) • BSAEU Curriculum Schedule
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs">
          Academic Session 2024-2026
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
        {currentSlots.map((slot, index) => (
          <div
            key={index}
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
        ))}
      </div>
    </div>
  );
};
