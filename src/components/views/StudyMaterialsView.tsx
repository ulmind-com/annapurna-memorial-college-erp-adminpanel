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
    // Simulate download
    alert(`Downloading: ${m.title}`);
  };

  const filtered = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Library className="w-5 h-5 text-sky-400" />
          Digital Library & Study Materials Repository
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Access lecture notes, practicum guidelines, and question banks uploaded by college faculty
        </p>
      </div>

      <div className="glass-card p-4 rounded-xl flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search study materials, subjects, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold text-xs font-mono">
                  {m.subject_code} (Sem {m.semester})
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {m.downloads_count} downloads
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3 leading-snug">{m.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                {m.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {m.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">By {m.uploaded_by_name}</span>
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
