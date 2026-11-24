import React, { useEffect, useState } from 'react';
import { Settings2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { api, MasterCategory, MasterItem } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

const CATEGORIES: { id: MasterCategory; label: string; hint: string }[] = [
  { id: 'DEPARTMENT', label: 'Departments', hint: 'e.g. Department of Teacher Education' },
  { id: 'DESIGNATION', label: 'Designations', hint: 'e.g. Assistant Professor' },
  { id: 'QUALIFICATION', label: 'Qualifications', hint: 'e.g. M.Ed., Ph.D.' },
  { id: 'SPECIALIZATION', label: 'Specializations', hint: 'e.g. Educational Psychology' },
];

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

/** Super Admin: manage the values used in the faculty form dropdowns. */
export const MasterDataView: React.FC = () => {
  const { playSuccess, playAlert, playTab } = useSound();
  const [items, setItems] = useState<MasterItem[]>([]);
  const [active, setActive] = useState<MasterCategory>('DEPARTMENT');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const load = () => api.getMasterData().then(setItems).catch((e) => alert(e.message));
  useEffect(() => {
    load();
  }, []);

  const run = async (fn: () => Promise<any>) => {
    try {
      await fn();
      playSuccess();
      await load();
    } catch (e: any) {
      playAlert();
      alert(e.message || 'Action failed');
    }
  };

  const list = items.filter((i) => i.category === active);
  const cat = CATEGORIES.find((c) => c.id === active)!;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Master Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Values shown in the Add / Edit Faculty form. Add, rename or delete anytime.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              playTab();
              setActive(c.id);
              setEditingId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              active === c.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {c.label} ({items.filter((i) => i.category === c.id).length})
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          run(() => api.createMasterItem(active, newName.trim()).then(() => setNewName('')));
        }}
        className="flex gap-2 max-w-xl"
      >
        <input className={inputCls} placeholder={cat.hint} value={newName} onChange={(e) => setNewName(e.target.value)} />
        <SoundButton type="submit" icon={<Plus className="w-4 h-4" />}>Add</SoundButton>
      </form>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-w-xl">
        {list.length === 0 && <p className="p-6 text-xs text-slate-400 text-center">No {cat.label.toLowerCase()} yet.</p>}
        {list.map((i) => (
          <div key={i.id} className="flex items-center gap-2 px-4 py-3">
            {editingId === i.id ? (
              <>
                <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                <button type="button" className="p-2 text-emerald-600" onClick={() => run(() => api.renameMasterItem(i.id, editName).then(() => setEditingId(null)))}>
                  <Check className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 text-slate-400" onClick={() => setEditingId(null)}>
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-xs font-bold">{i.name}</span>
                <button type="button" className="p-2 text-slate-400 hover:text-blue-600" onClick={() => { setEditingId(i.id); setEditName(i.name); }}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-rose-600"
                  onClick={() => window.confirm(`Delete "${i.name}"?`) && run(() => api.deleteMasterItem(i.id))}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
