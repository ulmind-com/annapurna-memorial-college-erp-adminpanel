import React, { useState, useEffect } from 'react';
import {
  Library,
  Download,
  FileText,
  Search,
  Tag,
  Plus,
  Upload,
  BookOpen,
  Calendar,
  CheckCircle,
  FileUp,
  X,
  Filter,
} from 'lucide-react';
import { StudyMaterial, Course, Subject } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

export const StudyMaterialsView: React.FC = () => {
  const { isFaculty, isSuperAdmin, user } = useAuth();
  const canUpload = isFaculty || isSuperAdmin;
  const { playSuccess, playPop, playAlert } = useSound();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCourse, setUploadCourse] = useState('BED');
  const [uploadSemester, setUploadSemester] = useState(1);
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAcademicsData = async () => {
    try {
      const [cList, sList] = await Promise.all([
        api.getCourses(),
        api.getSubjects(),
      ]);
      setCourses(cList);
      setSubjects(sList);
      if (cList.length > 0 && !uploadCourse) {
        setUploadCourse(cList[0].code);
      }
    } catch (e) {
      console.error('Error loading academic curriculum:', e);
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await api.getStudyMaterials();
      setMaterials(data);
    } catch (e) {
      console.error('Error loading study materials:', e);
    }
  };

  useEffect(() => {
    loadAcademicsData();
    loadMaterials();
  }, []);

  // Update default subject when upload course or semester changes
  useEffect(() => {
    const relevantSubjects = subjects.filter(
      (s) => s.course_code === uploadCourse && Number(s.semester) === Number(uploadSemester)
    );
    if (relevantSubjects.length > 0) {
      setUploadSubject(relevantSubjects[0].code);
    } else {
      const anyCourseSub = subjects.filter((s) => s.course_code === uploadCourse);
      setUploadSubject(anyCourseSub.length > 0 ? anyCourseSub[0].code : `${uploadCourse}-101`);
    }
  }, [uploadCourse, uploadSemester, subjects]);

  const handleOpenUpload = () => {
    playPop();
    loadAcademicsData();
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      playAlert();
      alert('Please provide a title for the study material.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      formData.append('description', uploadDesc.trim());
      formData.append('course_code', uploadCourse);
      formData.append('semester', String(uploadSemester));
      formData.append('subject_code', uploadSubject || `${uploadCourse}-101`);
      formData.append('tags', uploadTags.trim() || `Lecture Notes, ${uploadCourse}`);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.uploadStudyMaterial(formData);
      playSuccess();
      setIsUploadModalOpen(false);

      // Reset form
      setUploadTitle('');
      setUploadDesc('');
      setUploadTags('');
      setSelectedFile(null);

      // Refresh list so students & teachers immediately see it
      await loadMaterials();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to upload study material. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (m: StudyMaterial) => {
    playSuccess();
    if (m.file_url && m.file_url !== '/sample_study_material.pdf' && m.file_url !== '/sample_note.pdf') {
      window.open(m.file_url, '_blank');
    } else {
      // Create a downloadable syllabus notes document
      const noteContent = `ANNAPURNA MEMORIAL COLLEGE OF EDUCATION\nDIGITAL SYLLABUS VAULT\n\nTitle: ${m.title}\nCourse: ${m.course_code} (Semester ${m.semester})\nSubject: ${m.subject_code}\nUploaded By: ${m.uploaded_by_name}\nDate: ${m.created_at || new Date().toLocaleDateString()}\n\nDescription:\n${m.description || 'Comprehensive lecture notes and practicum guidelines prepared per BSAEU & NCTE curriculum.'}\n\nTopics Covered:\n${m.tags.join(', ')}\n\n(Official Certified Digital Material)`;
      const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${m.subject_code}_${m.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject_code.toLowerCase().includes(search.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase())) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesCourse = selectedCourseFilter ? m.course_code === selectedCourseFilter : true;
    const matchesSemester = selectedSemesterFilter ? Number(m.semester) === Number(selectedSemesterFilter) : true;

    return matchesSearch && matchesCourse && matchesSemester;
  });

  const paginatedMaterials = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const selectedCourseObj = courses.find((c) => c.code === uploadCourse);
  const maxSemesters = selectedCourseObj ? selectedCourseObj.total_semesters : 4;
  const filteredSubjects = subjects.filter((s) => s.course_code === uploadCourse);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Library className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Digital Library & Syllabus Materials Vault</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access lecture notes, practicum guidelines, lesson plans, and model question banks uploaded by faculty
          </p>
        </div>

        {canUpload && (
          <div className="flex items-center gap-2">
            <SoundButton
              onClick={handleOpenUpload}
              variant="primary"
              soundType="pop"
              icon={<Plus className="w-4 h-4" />}
            >
              Upload Notes & Materials
            </SoundButton>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, subjects, topics, tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Dynamic Program Filter */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => {
              setSelectedCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Academic Programs ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={selectedSemesterFilter}
            onChange={(e) => {
              setSelectedSemesterFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
            {filtered.length} Resources
          </span>
        </div>
      </div>

      {/* Materials Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Study Materials Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {search || selectedCourseFilter || selectedSemesterFilter
              ? 'No lecture notes match your current filters. Try resetting the search or filter.'
              : 'No notes uploaded yet. Faculty members can upload lecture notes, question banks, and syllabus guides here.'}
          </p>
          {canUpload && (
            <div className="pt-2">
              <SoundButton
                onClick={handleOpenUpload}
                variant="primary"
                size="sm"
                soundType="pop"
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Upload First Note
              </SoundButton>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedMaterials.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs font-mono">
                        {m.subject_code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                        {m.course_code} • Sem {m.semester}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                      {m.downloads_count || 0} downloads
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 leading-snug">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {m.description || 'BSAEU syllabus notes, practicum unit breakdown, and model examination questions.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {m.tags &&
                      m.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {t}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Uploaded by <b className="text-slate-700 dark:text-slate-300">{m.uploaded_by_name}</b>
                  </span>
                  <SoundButton
                    onClick={() => handleDownload(m)}
                    size="sm"
                    variant="outline"
                    soundType="pop"
                    icon={<Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  >
                    Download
                  </SoundButton>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            totalItems={filtered.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      {/* Upload Notes Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => !isSubmitting && setIsUploadModalOpen(false)}
          title="Upload Study Material / Lecture Notes"
          subtitle="Add syllabus resources to the college digital repository"
          maxWidth="lg"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document / Notes Title *
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Unit 2: Cognitive Development Theories & Lesson Blueprints"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description / Syllabus Topics
              </label>
              <textarea
                rows={3}
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Summary of topics covered, unit references, and practicum guidelines..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Program *
                </label>
                <select
                  value={uploadCourse}
                  onChange={(e) => setUploadCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Semester *
                </label>
                <select
                  value={uploadSemester}
                  onChange={(e) => setUploadSemester(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Module *
                </label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code}: {s.title}
                      </option>
                    ))
                  ) : (
                    <option value={`${uploadCourse}-101`}>{uploadCourse}-101</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Attach File (PDF, DOCX, PPTX)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Leave empty to publish textual lecture summary and outline.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="e.g. Unit 2, Pedagogy, BSAEU, Micro-Teaching"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <SoundButton
                type="submit"
                variant="primary"
                soundType="haptic"
                disabled={isSubmitting}
                icon={<Upload className="w-4 h-4" />}
              >
                {isSubmitting ? 'Uploading Notes...' : 'Publish to Students'}
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
