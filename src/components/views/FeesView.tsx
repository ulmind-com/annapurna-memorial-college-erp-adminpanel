import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle,
  Search,
  IndianRupee,
  FileText,
  Download,
  Edit3,
  Trash2,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Invoice, FeeOverview } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

export const FeesView: React.FC = () => {
  const { activeRole } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [feeOverview, setFeeOverview] = useState<FeeOverview | null>(null);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');

  // Super Admin CRUD Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoice_number: '',
    student_name: '',
    roll_number: '',
    course_code: 'BED',
    semester: 1,
    title: 'Semester 1 Tuition & Laboratory Fee',
    amount_due: 35000,
    amount_paid: 0,
    due_date: '2026-12-31',
    status: 'PENDING',
  });

  // Student Payment Modal
  const [isStudentPayOpen, setIsStudentPayOpen] = useState(false);

  const { playSuccess, playAlert, playPop } = useSound();

  const loadFeeData = async () => {
    try {
      const [invData, ovData] = await Promise.all([api.getInvoices(), api.getFeeOverview()]);
      setInvoices(invData.items);
      setFeeOverview(ovData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFeeData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    if (paymentAmount > selectedInvoice.balance) {
      playAlert();
      alert('Payment amount cannot exceed outstanding balance.');
      return;
    }

    try {
      await api.recordPayment(selectedInvoice.id, paymentAmount, paymentMethod);
      playSuccess();
      setSelectedInvoice(null);
      setPaymentAmount(0);
      loadFeeData();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    }
  };

  const handleOpenCreate = () => {
    playPop();
    setFormData({
      invoice_number: `INV-2024-${invoices.length + 101}`,
      student_name: '',
      roll_number: '',
      course_code: 'BED',
      semester: 1,
      title: 'Semester Tuition & Examination Fee',
      amount_due: 35000,
      amount_paid: 0,
      due_date: '2026-12-31',
      status: 'PENDING',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_name || !formData.roll_number) {
      alert('Student name and roll number are required.');
      return;
    }
    try {
      await api.createInvoice(formData);
      playSuccess();
      setIsCreateModalOpen(false);
      loadFeeData();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    }
  };

  const handleOpenEdit = (inv: Invoice) => {
    playPop();
    setEditingInvoice(inv);
    setFormData({ ...inv });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    try {
      await api.updateInvoice(editingInvoice.id, formData);
      playSuccess();
      setIsEditModalOpen(false);
      loadFeeData();
    } catch (err: any) {
      alert(err.message || 'Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async (inv: Invoice) => {
    if (!confirm(`Delete fee invoice: ${inv.invoice_number} for ${inv.student_name}?`)) return;
    try {
      playAlert();
      await api.deleteInvoice(inv.id);
      playSuccess();
      loadFeeData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  const handleStudentPay = () => {
    playSuccess();
    alert('Mock UPI payment processed successfully! Official fee receipt generated.');
    setIsStudentPayOpen(false);
  };

  // Student-specific view
  if (isStudent) {
    const studentInvoice = invoices.find((i) => i.roll_number === 'AMC-BED-2024-001') || invoices[0];

    return (
      <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Financial Accounts
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">B.Ed. Academic Ledger</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Fee Ledger & Payment Receipt
            </h1>
          </div>

          <SoundButton
            onClick={() => setIsStudentPayOpen(true)}
            variant="primary"
            size="md"
            soundType="pop"
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            Pay Semester Fees via UPI
          </SoundButton>
        </div>

        {studentInvoice && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {studentInvoice.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Invoice: #{studentInvoice.invoice_number} • Due: {studentInvoice.due_date}
                  </p>
                </div>
                <Badge status={studentInvoice.status} />
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Semester Tuition Fee (BSAEU Syllabus):</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">₹25,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">ICT & Curriculum Laboratory Charges:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">₹6,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Library Vault & Digital Books Access:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">₹2,500</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Examination & Evaluation Fee:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">₹1,500</span>
                </div>
                <div className="flex justify-between py-3 font-bold text-sm bg-slate-50 dark:bg-slate-800/60 px-4 rounded-xl">
                  <span className="text-slate-900 dark:text-white">Total Gross Billed:</span>
                  <span className="font-black text-slate-900 dark:text-white">₹{studentInvoice.amount_due.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Amount Paid</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{studentInvoice.amount_paid.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Balance Due</div>
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    ₹{studentInvoice.balance.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Pay Box */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Instant UPI Clearance
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Annapurna Memorial College
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Kashinagar, South 24 Parganas • Official SBI Institutional Account
                </p>

                <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                  <QrCode className="w-36 h-36 text-slate-800 dark:text-slate-100" />
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                    UPI ID: annapurnacollege@sbi
                  </span>
                </div>
              </div>

              <SoundButton
                onClick={() => setIsStudentPayOpen(true)}
                variant="primary"
                size="md"
                className="w-full"
                soundType="pop"
              >
                Open UPI Payment Gate
              </SoundButton>
            </div>
          </div>
        )}

        {/* Modal: Student Pay UPI */}
        <Modal
          isOpen={isStudentPayOpen}
          onClose={() => setIsStudentPayOpen(false)}
          title="College UPI Payment Gateway"
          subtitle="Annapurna Memorial College of Education, Kashinagar"
          maxWidth="md"
        >
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <QrCode className="w-40 h-40 mx-auto text-slate-800 dark:text-slate-100" />
              <div className="text-sm font-black text-slate-900 dark:text-white mt-3">
                Pay ₹{studentInvoice?.balance.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 font-mono">UPI ID: annapurnacollege@sbi</div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton type="button" onClick={() => setIsStudentPayOpen(false)} variant="secondary" size="sm">
                Cancel
              </SoundButton>
              <SoundButton type="button" onClick={handleStudentPay} variant="primary" size="sm" soundType="success">
                Simulate Successful Payment
              </SoundButton>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Super Admin view
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.student_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Financial Management
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fee Ledgers & Reconciliation</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Fee Management & Financial Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student fee structures, invoice generation, payment receipts, and collection auditing
          </p>
        </div>

        {isSuperAdmin && (
          <SoundButton
            onClick={handleOpenCreate}
            size="md"
            variant="primary"
            soundType="pop"
            icon={<Plus className="w-4 h-4" />}
          >
            Create Fee Invoice
          </SoundButton>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">Total Billed</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{feeOverview ? feeOverview.total_billed.toLocaleString() : '2,10,000'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Semester Invoices</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">Total Collected</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{feeOverview ? feeOverview.total_collected.toLocaleString() : '1,40,000'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Reconciled Payments</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">Outstanding Due</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{feeOverview ? feeOverview.total_outstanding.toLocaleString() : '70,000'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pending Collection</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">Collection Rate</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {feeOverview ? feeOverview.collection_rate : 66.7}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: 100%</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {filteredInvoices.length} Invoices
        </span>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Trainee</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Program & Sem</th>
                <th className="py-3.5 px-4 text-right">Amount Due</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Balance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                    {inv.student_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">{inv.roll_number}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inv.course_code}</span> - Sem {inv.semester}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                    ₹{inv.amount_due.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{inv.amount_paid.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                    ₹{inv.balance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge status={inv.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.balance > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            playPop();
                            setSelectedInvoice(inv);
                            setPaymentAmount(inv.balance);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 text-xs transition-colors"
                        >
                          Collect
                        </button>
                      )}

                      {isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(inv)}
                            title="Edit Invoice"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv)}
                            title="Delete Invoice"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Invoice */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Fee Invoice"
        subtitle="Annapurna Memorial College of Education"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.student_name || ''}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="Ananya Das"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={formData.roll_number || ''}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                placeholder="AMC-BED-2024-001"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Program</label>
              <select
                value={formData.course_code || 'BED'}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="BED">B.Ed.</option>
                <option value="DELED">D.El.Ed.</option>
                <option value="BA_ED">B.A. Education</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <select
                value={formData.semester || 1}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount Due (₹) *</label>
              <input
                type="number"
                required
                value={formData.amount_due || 35000}
                onChange={(e) => setFormData({ ...formData, amount_due: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsCreateModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Create Invoice
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Invoice */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Fee Invoice"
        subtitle={`Invoice #${editingInvoice?.invoice_number}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name</label>
              <input
                type="text"
                required
                value={formData.student_name || ''}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.roll_number || ''}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount Due (₹)</label>
              <input
                type="number"
                value={formData.amount_due || 0}
                onChange={(e) => setFormData({ ...formData, amount_due: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                value={formData.amount_paid || 0}
                onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsEditModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Update Invoice
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Fee Payment */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title="Collect Fee Payment"
          subtitle={`Student: ${selectedInvoice.student_name} (${selectedInvoice.roll_number})`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold">
              <span>Outstanding Balance:</span>
              <span className="text-rose-600">₹{selectedInvoice.balance.toLocaleString()}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount to Collect (₹) *</label>
              <input
                type="number"
                required
                min={1}
                max={selectedInvoice.balance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="BANK_TRANSFER">NEFT / RTGS Bank Transfer</option>
                <option value="CASH">Cash Counter Receipt</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton type="button" onClick={() => setSelectedInvoice(null)} variant="secondary" size="sm">
                Cancel
              </SoundButton>
              <SoundButton type="submit" variant="primary" size="sm" soundType="success">
                Confirm & Issue Receipt
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
