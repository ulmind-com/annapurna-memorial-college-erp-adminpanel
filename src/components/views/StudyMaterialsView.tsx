import React, { useState, useEffect } from 'react';
import { Library, Download, FileText, Search, Tag } from 'lucide-react';
import { StudyMaterial } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

export const StudyMaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [search, setSearch] = useState('');
  const { playSuccess } = useSound();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getStudyMaterials();
        setMaterials(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleDownload = (m: StudyMaterial) => {
    playSuccess();
    alert(`Downloading study material: ${m.title}`);
  };

  const filtered = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Library className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Digital Library & Syllabus Materials Vault</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Access lecture notes, practicum guidelines, and question banks uploaded by college faculty
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search study materials, subjects, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {filtered.length} Resources Available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs font-mono">
                  {m.subject_code} (Sem {m.semester})
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {m.downloads_count} downloads
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 leading-snug">
                {m.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {m.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {m.tags.map((t) => (
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

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Uploaded by {m.uploaded_by_name}</span>
              <SoundButton
                onClick={() => handleDownload(m)}
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
    </div>
  );
};
