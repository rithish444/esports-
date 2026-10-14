import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Phone, 
  Coins, 
  Users, 
  FileSpreadsheet, 
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { RegStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const RegistrationManager = () => {
  const { 
    registrations, 
    tournaments, 
    teams, 
    players, 
    approveRegistration, 
    rejectRegistration, 
    bulkApprove, 
    bulkReject, 
    detectDuplicates, 
    exportRegistrations 
  } = useData();

  const [selectedTourneyFilter, setSelectedTourneyFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bulk selection set
  const [selectedRegIds, setSelectedRegIds] = useState(new Set());
  
  // Roster inspection modal
  const [inspectTeam, setInspectTeam] = useState(null);

  // Duplicates detector scan
  const duplicateFlags = detectDuplicates(
    selectedTourneyFilter === 'All' ? null : selectedTourneyFilter
  );

  // Filter registrations
  const filteredRegs = registrations.filter(r => {
    const tourney = tournaments.find(t => t.id === r.tournament_id);
    const team = teams.find(t => t.id === r.team_id);

    const matchesTourney = selectedTourneyFilter === 'All' || r.tournament_id === selectedTourneyFilter;
    const matchesStatus = selectedStatusFilter === 'All' || r.status === selectedStatusFilter;
    const matchesSearch = 
      team?.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourney?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team?.phone?.includes(searchQuery);

    return matchesTourney && matchesStatus && matchesSearch;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRegIds(new Set(filteredRegs.map(r => r.id)));
    } else {
      setSelectedRegIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedRegIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleBulkApprove = () => {
    bulkApprove(Array.from(selectedRegIds));
    setSelectedRegIds(new Set());
  };

  const handleBulkReject = () => {
    bulkReject(Array.from(selectedRegIds), true); // Refund coins by default
    setSelectedRegIds(new Set());
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <FileCheck2 className="w-7 h-7 text-cyan-400" />
            Registration Review & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Verify player rosters, approve teams, refund rejected entries, and detect duplicate Free Fire UIDs.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRegistrations(tournaments[0]?.id, 'csv')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </button>
          <button
            onClick={() => exportRegistrations(tournaments[0]?.id, 'xlsx')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition"
            title="Export to Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* SUSPICIOUS / DUPLICATE DETECTOR BANNER */}
      {duplicateFlags.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-2 animate-pulse-fast">
          <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
            <span className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              {duplicateFlags.length} Suspicious / Duplicate Entries Flagged!
            </span>
            <span className="text-[10px] uppercase tracking-wider text-rose-400">Anti-Cheat Alert</span>
          </div>

          <div className="space-y-1 text-xs text-rose-200/90 pl-7">
            {duplicateFlags.map((flag, i) => (
              <p key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                {flag.details}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="gaming-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search team name, tournament or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedTourneyFilter}
              onChange={(e) => setSelectedTourneyFilter(e.target.value)}
              className="px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Tournaments</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedRegIds.size > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d121e] border border-cyan-500/30 text-xs">
            <span className="text-cyan-400 font-bold">
              {selectedRegIds.size} Registrations Selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs uppercase"
              >
                ✓ Bulk Approve
              </button>
              <button
                onClick={handleBulkReject}
                className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs uppercase"
              >
                ✕ Bulk Reject & Refund
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Registrations Master Table */}
      <div className="gaming-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0d121e] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1f2b45]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredRegs.length > 0 && selectedRegIds.size === filteredRegs.length}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                </th>
                <th className="py-3 px-4">Team & Captain</th>
                <th className="py-3 px-4">Tournament</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4">Coins Paid</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2b45]/60">
              {filteredRegs.map((reg) => {
                const tourney = tournaments.find(t => t.id === reg.tournament_id);
                const team = teams.find(t => t.id === reg.team_id);
                const teamPlayersList = players.filter(p => p.team_id === reg.team_id);
                const captain = teamPlayersList.find(p => p.is_captain) || teamPlayersList[0];

                return (
                  <tr key={reg.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRegIds.has(reg.id)}
                        onChange={() => handleToggleSelect(reg.id)}
                        className="rounded bg-slate-900 border-slate-700"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {team?.team_name || 'Unknown'}
                        <button
                          onClick={() => setInspectTeam({ team, players: teamPlayersList })}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700"
                        >
                          View Roster ({teamPlayersList.length})
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Captain: {captain?.player_name} ({captain?.ff_name}) • UID: <span className="font-mono text-cyan-400">{captain?.ff_uid}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {tourney?.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {team?.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-400">{reg.coins_paid} Coins</span>
                      <span className="block text-[10px] text-slate-500 uppercase">{reg.payment_status}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RegStatusBadge status={reg.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {reg.status !== 'Approved' && (
                          <button
                            onClick={() => approveRegistration(reg.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs transition border border-emerald-500/40"
                            title="Approve Squad & Grant Permission to Play"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            Approve
                          </button>
                        )}
                        {reg.status !== 'Rejected' && (
                          <button
                            onClick={() => rejectRegistration(reg.id, true, 'Registration declined by Admin')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-xs font-semibold transition border border-rose-500/30"
                            title="Decline Registration"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROSTER INSPECTION MODAL */}
      <Modal
        isOpen={Boolean(inspectTeam)}
        onClose={() => setInspectTeam(null)}
        title={`Roster Inspection: ${inspectTeam?.team?.team_name}`}
      >
        {inspectTeam && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-[#0d121e] border border-[#1f2b45] flex justify-between">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Captain Contact</span>
                <p className="font-bold text-white">{inspectTeam.team.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Total Registered Squad</span>
                <p className="font-bold text-cyan-400">{inspectTeam.players.length} Players</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px]">Player Roster Verification:</h4>
              {inspectTeam.players.map((p, idx) => (
                <div key={p.id} className="p-3 rounded-lg bg-[#0d121e] border border-[#1f2b45] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm">
                      {p.player_name} {p.is_captain && '(Captain)'} {p.is_substitute && '(Sub)'}
                    </span>
                    <p className="text-slate-400 text-xs">In-Game Name: <strong className="text-slate-200">{p.ff_name}</strong></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Free Fire UID</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">{p.ff_uid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
