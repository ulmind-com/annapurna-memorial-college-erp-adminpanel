import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle, Search, IndianRupee, FileText, Download } from 'lucide-react';
import { Invoice, FeeOverview } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';

export const FeesView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [feeOverview, setFeeOverview] = useState<FeeOverview | null>(null);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const { playSuccess, playAlert } = useSound();

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

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.student_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Fee Management & Financial Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Student fee ledgers, invoice status, UPI reconciliation, and fee payment receipts
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Billed</div>
          <div className="text-xl font-extrabold text-white mt-1">
            ₹{feeOverview ? feeOverview.total_billed.toLocaleString() : '2,10,000'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Semester Invoices</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Collected</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            ₹{feeOverview ? feeOverview.total_collected.toLocaleString() : '1,40,000'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Reconciled Payments</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Outstanding Due</div>
          <div className="text-xl font-extrabold text-rose-400 mt-1">
            ₹{feeOverview ? feeOverview.total_outstanding.toLocaleString() : '70,000'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pending Collection</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Collection Rate</div>
          <div className="text-xl font-extrabold text-indigo-400 mt-1">
            {feeOverview ? feeOverview.collection_rate : 66.7}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target: 100%</div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-xl flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Trainee</th>
                <th className="py-3 px-4">Program & Sem</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{inv.invoice_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{inv.student_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.roll_number}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {inv.course_code} - Sem {inv.semester}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">₹{inv.amount_due.toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">
                    ₹{inv.amount_paid.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-rose-400">
                    ₹{inv.balance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={inv.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {inv.balance > 0 ? (
                      <SoundButton
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPaymentAmount(inv.balance);
                        }}
                        size="sm"
                        variant="primary"
                        soundType="pop"
                      >
                        Record Payment
                      </SoundButton>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title="Record Student Fee Payment"
          subtitle={`Invoice: ${selectedInvoice.invoice_number} | Trainee: ${selectedInvoice.student_name}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Billed:</span>
                <span className="text-white font-bold">₹{selectedInvoice.amount_due.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Already Paid:</span>
                <span className="text-emerald-400 font-bold">₹{selectedInvoice.amount_paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-700 font-bold">
                <span className="text-white">Outstanding Balance:</span>
                <span className="text-rose-400">₹{selectedInvoice.balance.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                max={selectedInvoice.balance}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Instrument / Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="UPI">UPI / QR Payment</option>
                <option value="BANK_TRANSFER">NEFT / RTGS Bank Transfer</option>
                <option value="CASH">Cash at Accounts Counter</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <SoundButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
              >
                Cancel
              </SoundButton>
              <SoundButton
                type="submit"
                variant="success"
                size="sm"
                soundType="success"
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Confirm Payment
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
