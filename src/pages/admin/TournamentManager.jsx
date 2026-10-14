import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Coins, 
  Users, 
  MapPin, 
  Image, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge, ModeBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const TournamentManager = () => {
  const { 
    tournaments, 
    createTournament, 
    updateTournament, 
    deleteTournament, 
    setTournamentStatus,
    settings 
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTourney, setEditingTourney] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('Free Fire');
  const [mode, setMode] = useState('Squad');
  const [map, setMap] = useState('Bermuda');
  const [startTime, setStartTime] = useState('');
  const [entryFee, setEntryFee] = useState(100);
  const [prizePool, setPrizePool] = useState('5,000 Coins');
  const [maxTeams, setMaxTeams] = useState(12);
  const [rules, setRules] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  const mapList = ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra'];
  const gameList = settings?.games || ['Free Fire', 'Free Fire MAX'];

  const handleOpenCreate = () => {
    setEditingTourney(null);
    setTitle('');
    setGame('Free Fire');
    setMode('Squad');
    setMap('Bermuda');
    setStartTime(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
    setEntryFee(100);
    setPrizePool('5,000 Coins');
    setMaxTeams(12);
    setRules('1. Standard Free Fire competitive room rules.\n2. No third-party scripts or hacks.\n3. Room details visible 15 minutes before match.');
    setBannerUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTourney(t);
    setTitle(t.title);
    setGame(t.game);
    setMode(t.mode);
    setMap(t.map);
    setStartTime(new Date(t.start_time).toISOString().slice(0, 16));
    setEntryFee(t.entry_fee);
    setPrizePool(t.prize_pool);
    setMaxTeams(t.max_teams);
    setRules(t.rules || '');
    setBannerUrl(t.banner_url || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      game,
      mode,
      map,
      start_time: new Date(startTime).toISOString(),
      entry_fee: Number(entryFee),
      prize_pool: prizePool,
      max_teams: Number(maxTeams),
      rules,
      banner_url: bannerUrl
    };

    if (editingTourney) {
      updateTournament(editingTourney.id, data);
    } else {
      createTournament(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteTournament(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <Trophy className="w-7 h-7 text-cyan-400" />
            Tournament Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create tournaments, configure modes, maps, coin fees, prizes, and toggle live statuses.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-neon-orange flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Tournament
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tourney) => (
          <div
            key={tourney.id}
            className="gaming-card flex flex-col justify-between overflow-hidden"
          >
            {/* Banner preview */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
              <img
                src={tourney.banner_url}
                alt={tourney.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111726] to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <StatusBadge status={tourney.status} />
                <ModeBadge mode={tourney.mode} />
              </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                  {tourney.game} • {tourney.map}
                </p>
                <h3 className="text-lg font-bold text-white font-gaming leading-tight truncate">
                  {tourney.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#0d121e]">
                  <span className="text-slate-500 text-[10px] uppercase block">Fee</span>
                  <span className="font-bold text-amber-400">{tourney.entry_fee} Coins</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0d121e]">
                  <span className="text-slate-500 text-[10px] uppercase block">Prize Pool</span>
                  <span className="font-bold text-emerald-400">{tourney.prize_pool}</span>
                </div>
              </div>

              {/* Status Switcher Quick Buttons */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Status Control (One-Click)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['Open', 'Live', 'Closed', 'Completed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setTournamentStatus(tourney.id, s)}
                      className={`py-1 rounded text-[10px] font-bold uppercase transition ${
                        tourney.status === s
                          ? s === 'Open'
                            ? 'bg-emerald-500 text-black'
                            : s === 'Live'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-700 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit & Delete row */}
              <div className="pt-2 flex items-center justify-between border-t border-[#1f2b45]/60 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Max: {tourney.max_teams} Teams
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(tourney)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    title="Edit Tournament"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(tourney.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                    title="Delete Tournament"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTourney ? 'Edit Tournament' : 'Create New Tournament'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tournament Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Free Fire Champions Cup Season 5"
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Game</label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {gameList.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Solo">Solo (1 Player)</option>
                <option value="Duo">Duo (2 Players)</option>
                <option value="Squad">Squad (4 Players)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Map</label>
              <select
                value={map}
                onChange={(e) => setMap(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {mapList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Fee (Coins)</label>
              <input
                type="number"
                min="0"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Teams</label>
              <input
                type="number"
                min="2"
                max="48"
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Prize Pool Display</label>
            <input
              type="text"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g. 5,000 Coins / ₹5,000"
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Rules & Regulations</label>
            <textarea
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-neon-orange"
            >
              {editingTourney ? 'Update Tournament' : 'Publish Tournament'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>Are you sure you want to delete this tournament? All registrations and matches under this tournament will be removed.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 rounded-lg bg-rose-500 text-xs text-white font-bold uppercase"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
