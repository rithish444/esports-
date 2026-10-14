import React, { useState } from 'react';
import { 
  Coins, 
  Plus, 
  Minus, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Modal } from '../../components/common/Modal';

export const CoinManager = () => {
  const { 
    teams, 
    wallets, 
    transactions, 
    getTeamWallet, 
    adjustCoins, 
    bulkCreditCoins 
  } = useData();

  const [selectedTeamFilter, setSelectedTeamFilter] = useState('All');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Single adjust form
  const [targetTeamId, setTargetTeamId] = useState(teams[0]?.id || '');
  const [amount, setAmount] = useState(100);
  const [isAddition, setIsAddition] = useState(true);
  const [reason, setReason] = useState('Prize distribution');

  // Bulk form
  const [bulkAmount, setBulkAmount] = useState(50);
  const [bulkReason, setBulkReason] = useState('Community tournament bonus');

  const [feedback, setFeedback] = useState(null);

  const filteredTransactions = transactions.filter(t => 
    selectedTeamFilter === 'All' || t.team_id === selectedTeamFilter
  );

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const finalAmount = isAddition ? Math.abs(Number(amount)) : -Math.abs(Number(amount));
      adjustCoins(targetTeamId, finalAmount, reason);
      setFeedback({ type: 'success', message: `Coins adjusted successfully!` });
      setIsAdjustModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const allTeamIds = teams.map(t => t.id);
      bulkCreditCoins(allTeamIds, Math.abs(Number(bulkAmount)), bulkReason);
      setFeedback({ type: 'success', message: `Credited ${bulkAmount} coins to all ${allTeamIds.length} teams!` });
      setIsBulkModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <Coins className="w-7 h-7 text-yellow-400" />
            Coin Dispenser & Wallets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Grant tournament prize coins, adjust balances, and review full transaction ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs font-bold uppercase border border-yellow-500/30 transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" /> Bulk Credit All Teams
          </button>

          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-neon-orange flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Adjust Team Wallet
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Team Wallets Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((t) => {
          const bal = getTeamWallet(t.id);
          return (
            <div key={t.id} className="gaming-card p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                {t.team_name}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-yellow-400 font-gaming">
                  {bal} <span className="text-xs font-normal text-slate-400 font-sans">Coins</span>
                </span>
                <button
                  onClick={() => {
                    setTargetTeamId(t.id);
                    setIsAdjustModalOpen(true);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700"
                >
                  Adjust
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Ledger Table */}
      <div className="gaming-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-gaming">
              Master Coin Transactions Ledger ({filteredTransactions.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Filter by Team:</span>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.team_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0d121e] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1f2b45]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2b45]/60">
              {filteredTransactions.map((tx) => {
                const team = teams.find(t => t.id === tx.team_id);
                const isPositive = tx.amount > 0;

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {team?.team_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {tx.reason}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      <span className="inline-flex items-center gap-1">
                        {isPositive ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {isPositive ? `+${tx.amount}` : tx.amount} Coins
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-200">
                      {tx.balance_after} Coins
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST COINS MODAL */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Team Wallet Coins"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Team</label>
            <select
              value={targetTeamId}
              onChange={(e) => setTargetTeamId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.team_name} (Current: {getTeamWallet(t.id)} Coins)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsAddition(true)}
                className={`py-2 rounded-lg text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  isAddition 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Credit (+)
              </button>
              <button
                type="button"
                onClick={() => setIsAddition(false)}
                className={`py-2 rounded-lg text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  !isAddition 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Debit (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (Coins)</label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Note <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. 1st place prize for Match 1"
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs uppercase"
            >
              Execute Coin Change
            </button>
          </div>
        </form>
      </Modal>

      {/* BULK CREDIT MODAL */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Credit Coins to All Teams"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            This will add coins simultaneously to all <strong className="text-white">{teams.length}</strong> active teams in the system.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Coins Per Team</label>
            <input
              type="number"
              min="1"
              required
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Broadcast Reason</label>
            <input
              type="text"
              required
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-yellow-500 text-black font-bold text-xs uppercase"
            >
              Credit {bulkAmount * teams.length} Total Coins
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
