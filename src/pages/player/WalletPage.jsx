import React from 'react';
import { 
  Wallet, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const WalletPage = () => {
  const { currentUser } = useAuth();
  const { getUserTeam, getTeamWallet, transactions } = useData();

  const userTeam = currentUser ? getUserTeam(currentUser.id) : null;
  const balance = userTeam ? getTeamWallet(userTeam.id) : (currentUser ? getTeamWallet(currentUser.id) : 0);

  // Filter transactions for this team
  const myTransactions = userTeam
    ? transactions.filter(t => t.team_id === userTeam.id)
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
          <Wallet className="w-7 h-7 text-amber-400" />
          Coin Wallet & Transactions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tournament entry fees and prize payouts are managed via your secure coin wallet.
        </p>
      </div>

      {/* Balance & Actions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Balance Display */}
        <div className="md:col-span-2 gaming-card p-6 sm:p-8 bg-gradient-to-br from-[#161c2d] via-[#111726] to-[#0d121e] border-amber-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4 animate-bounce" /> Esports Arena Coin Balance
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1 Coin = ₹1
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-6xl font-black font-gaming text-white tracking-tight">
                {balance}
              </span>
              <span className="text-lg sm:text-xl font-bold text-amber-400 font-gaming">
                COINS
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Team: <strong className="text-slate-200">{userTeam?.team_name || 'No Team Linked'}</strong>
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#1f2b45] flex flex-wrap items-center gap-3">
            {/* Disabled Buy Coins Button (Razorpay placeholder as requested) */}
            <div className="relative group">
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed border border-slate-700 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Buy Coins (Coming Soon - Razorpay)
              </button>
              <span className="absolute -top-8 left-0 px-2 py-1 rounded bg-black/90 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                Payment gateway integration placeholder
              </span>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Free Tier Demo Wallet System
            </p>
          </div>
        </div>

        {/* Quick Info Card */}
        <div className="gaming-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-gaming uppercase mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" /> How Coins Work
            </h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                Use coins to pay tournament entry fees.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                Joining a tournament unlocks private chat with the Admin.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                If rejected or cancelled, coins are 100% refunded to your balance.
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300">
            Need demo coins? Ask Admin in chat or use the Top-bar Demo Switcher to grant coins!
          </div>
        </div>

      </div>

      {/* Transaction History Table */}
      <div className="gaming-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-gaming flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Transaction History
          </h2>
          <span className="text-xs text-slate-400">{myTransactions.length} Total records</span>
        </div>

        {myTransactions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">
            No coin transactions found for your team.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0d121e] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1f2b45]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Description / Reason</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2b45]/60">
                {myTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
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
                      <td className="py-3 px-4 text-right font-bold text-slate-300 whitespace-nowrap">
                        {tx.balance_after} Coins
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
