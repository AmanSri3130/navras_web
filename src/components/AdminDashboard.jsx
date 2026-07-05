import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  Users, Calendar, IndianRupee, Ticket, Download, TrendingUp,
  Mic, AlertCircle, RefreshCw, FileText, Table2
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const MAROON = '#4A121A';
const GOLD = '#C5A880';
const SAFFRON = '#D4863D';
const PURPLE = '#5B21B6';
const EMERALD = '#065F46';
const COLORS = [MAROON, SAFFRON, PURPLE, EMERALD, '#0369A1', '#92400E'];

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = MAROON, sub }) {
  return (
    <div className="bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">{label}</p>
        <p className="text-2xl font-bold text-maroon font-sans">{value}</p>
        {sub && <p className="text-[10px] text-charcoal/50 font-sans mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-white border border-gold/30 rounded-xl px-4 py-2 shadow-lg font-sans text-xs">
        <p className="font-bold text-maroon mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
}

// ── Export Button ──────────────────────────────────────────────────────────
function ExportBtn({ href, label, icon: Icon = Download }) {
  const token = localStorage.getItem('navras_token');
  const handleDownload = async () => {
    const res = await fetch(href, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { alert('Export failed — are you logged in as admin?'); return; }
    const blob = await res.blob();
    const ct = res.headers.get('Content-Type') || '';
    const ext = ct.includes('pdf') ? 'pdf' : 'xlsx';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `navras_export.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/40 text-charcoal hover:bg-maroon hover:text-cream hover:border-maroon transition-all text-xs font-semibold font-sans cursor-pointer"
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

// ── Main Admin Dashboard ───────────────────────────────────────────────────
export default function AdminDashboard({ currentUser, setView }) {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'poetry',
    tagline: '',
    description: '',
    date: '',
    time: '06:00 PM - 09:00 PM',
    city: 'Delhi',
    venue: '',
    price: 0,
    seatsTotal: 25,
    lineup: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const body = {
        title: newEvent.title,
        type: newEvent.type,
        tagline: newEvent.tagline,
        description: newEvent.description,
        date: newEvent.date,
        dateFormatted: new Date(newEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: newEvent.time,
        city: newEvent.city,
        venue: newEvent.venue,
        price: parseInt(newEvent.price || 0),
        seatsTotal: parseInt(newEvent.seatsTotal || 20),
        lineup: newEvent.lineup ? newEvent.lineup.split(',').map(item => item.trim()) : [],
      };

      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create event');
      
      setCreateSuccess('Event successfully hosted and added to explore page!');
      // Reset form
      setNewEvent({
        title: '',
        type: 'poetry',
        tagline: '',
        description: '',
        date: '',
        time: '06:00 PM - 09:00 PM',
        city: 'Delhi',
        venue: '',
        price: 0,
        seatsTotal: 25,
        lineup: ''
      });
      fetchAll();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const token = localStorage.getItem('navras_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const [statsRes, usersRes, regsRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers: authHeaders }),
        fetch(`${API}/admin/users`, { headers: authHeaders }),
        fetch(`${API}/admin/registrations`, { headers: authHeaders }),
      ]);
      if (!statsRes.ok) throw new Error('Access denied — admin only');
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setRegs(await regsRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto py-20 text-center font-sans space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-maroon">Admin Access Required</h2>
        <p className="text-sm text-charcoal/70">Your account does not have admin privileges.</p>
        <button onClick={() => setView('landing')} className="px-6 py-2 rounded-full bg-maroon text-cream text-sm font-bold cursor-pointer">← Go Home</button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <RefreshCw className="w-8 h-8 text-gold animate-spin" />
      <p className="text-sm text-charcoal/60 font-sans">Loading admin data…</p>
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto py-20 text-center font-sans space-y-4">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
      <h2 className="font-serif text-xl font-bold text-maroon">Error</h2>
      <p className="text-sm text-red-600">{error}</p>
      <button onClick={fetchAll} className="px-6 py-2 rounded-full bg-maroon text-cream text-sm font-bold cursor-pointer">Retry</button>
    </div>
  );

  // ── Build chart data ──────────────────────────────────────────────────────
  const audienceRegs = regs.filter(r => r.type === 'audience');
  const performerRegs = regs.filter(r => r.type === 'performer');

  // Registrations by event (top 8)
  const regByEvent = Object.values(
    regs.reduce((acc, r) => {
      const key = r.eventTitle || 'Unknown';
      if (!acc[key]) acc[key] = { name: key.length > 20 ? key.slice(0, 18) + '…' : key, audience: 0, performers: 0 };
      if (r.type === 'audience') acc[key].audience++;
      else acc[key].performers++;
      return acc;
    }, {})
  ).slice(0, 8);

  // Audience vs Performer pie
  const pieData = [
    { name: 'Audience', value: audienceRegs.length },
    { name: 'Performers', value: performerRegs.length },
  ];

  // Revenue by event (top 8)
  const revenueByEvent = Object.values(
    regs.filter(r => r.status !== 'cancelled').reduce((acc, r) => {
      const key = r.eventTitle || 'Unknown';
      if (!acc[key]) acc[key] = { name: key.length > 18 ? key.slice(0, 16) + '…' : key, revenue: 0 };
      acc[key].revenue += r.price || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // Monthly registration trend (last 6 months)
  const monthlyTrend = (() => {
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months[key] = { month: key, registrations: 0, revenue: 0 };
    }
    regs.forEach(r => {
      const d = new Date(r.createdAt);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (months[key]) {
        months[key].registrations++;
        months[key].revenue += r.price || 0;
      }
    });
    return Object.values(months);
  })();

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: `Users (${users.length})` },
    { id: 'registrations', label: `Registrations (${regs.length})` },
    { id: 'host', label: 'Host Event' },
    { id: 'exports', label: 'Export Data' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold/20 pb-4 gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-maroon">Admin Dashboard</h1>
          <p className="text-sm text-charcoal/60 font-sans mt-0.5">Platform-wide analytics, user management, and data exports.</p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 text-gold hover:bg-gold/10 text-xs font-bold font-sans cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gold/20 gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold font-sans border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              tab === t.id ? 'border-maroon text-maroon' : 'border-transparent text-charcoal/60 hover:text-maroon'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} color={MAROON} />
            <StatCard icon={Calendar} label="Total Events" value={stats?.totalEvents ?? 0} color={SAFFRON} />
            <StatCard icon={Ticket} label="Registrations" value={stats?.totalRegistrations ?? 0} color={PURPLE} />
            <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} color={EMERALD} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Calendar} label="Upcoming Events" value={stats?.upcomingEvents ?? 0} color={SAFFRON} />
            <StatCard icon={Calendar} label="Live Events" value={stats?.liveEvents ?? 0} color={EMERALD} sub="happening now" />
            <StatCard icon={Mic} label="Performers" value={performerRegs.length} color={PURPLE} />
            <StatCard icon={Users} label="Audience" value={audienceRegs.length} color={MAROON} />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registrations by Event */}
            <div className="bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-maroon mb-4">Registrations by Event</h3>
              {regByEvent.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={regByEvent} margin={{ top: 0, right: 10, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GOLD + '30'} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5C5549' }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: '#5C5549' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="audience" name="Audience" fill={MAROON} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="performers" name="Performers" fill={PURPLE} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-sm text-charcoal/40 py-12">No registration data yet</p>}
            </div>

            {/* Audience vs Performer Pie */}
            <div className="bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-maroon mb-4">Audience vs Performers</h3>
              {regs.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-sm text-charcoal/40 py-12">No registration data yet</p>}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-maroon mb-4">Monthly Registration Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyTrend} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GOLD + '30'} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5C5549' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5C5549' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="registrations" name="Registrations" stroke={MAROON} strokeWidth={2} dot={{ r: 4, fill: MAROON }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Event */}
            <div className="bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-maroon mb-4">Revenue by Event (₹)</h3>
              {revenueByEvent.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueByEvent} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GOLD + '30'} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#5C5549' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#5C5549' }} width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue (₹)" fill={SAFFRON} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-sm text-charcoal/40 py-12">No revenue data yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div className="bg-card-white border border-gold/20 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
            <h3 className="font-serif text-xl font-bold text-maroon">All Users</h3>
            <div className="flex gap-2">
              <ExportBtn href={`${API}/admin/export/users?fmt=xlsx`} label="Excel" />
              <ExportBtn href={`${API}/admin/export/users?fmt=pdf`} label="PDF" icon={FileText} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold/10 text-xs">
              <thead className="bg-cream/60">
                <tr className="text-gold uppercase tracking-wider font-sans font-bold">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Verified</th>
                  <th className="py-3 px-4 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 font-sans text-charcoal">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-4 font-bold">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">{u.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-maroon text-cream' : 'bg-gold/20 text-gold'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {u.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-charcoal/60">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-charcoal/40">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REGISTRATIONS TAB ── */}
      {tab === 'registrations' && (
        <div className="bg-card-white border border-gold/20 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
            <h3 className="font-serif text-xl font-bold text-maroon">All Registrations</h3>
            <div className="flex gap-2">
              <ExportBtn href={`${API}/admin/export/registrations?fmt=xlsx`} label="Excel" />
              <ExportBtn href={`${API}/admin/export/registrations?fmt=pdf`} label="PDF" icon={FileText} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold/10 text-xs">
              <thead className="bg-cream/60">
                <tr className="text-gold uppercase tracking-wider font-sans font-bold">
                  <th className="py-3 px-4 text-left">Ticket Code</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Event</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Seats</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 font-sans text-charcoal">
                {regs.map((r, i) => (
                  <tr key={i} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-maroon">{r.ticketCode}</td>
                    <td className="py-3 px-4 font-bold">{r.userName}</td>
                    <td className="py-3 px-4 max-w-[180px] truncate" title={r.eventTitle}>{r.eventTitle}</td>
                    <td className="py-3 px-4">
                      {r.type === 'audience' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 border border-amber-200 text-amber-800">
                          🎟 Audience
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 border border-purple-200 text-purple-800">
                          🎤 Performer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{r.seats}</td>
                    <td className="py-3 px-4 font-semibold">₹{r.price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700'
                        : r.status === 'cancelled' ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-charcoal/60">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {regs.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-charcoal/40">No registrations yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HOST EVENT TAB ── */}
      {tab === 'host' && (
        <div className="bg-card-white border border-gold/20 rounded-2xl shadow-sm p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-maroon">Host a New Mehfil</h3>
            <p className="text-xs text-charcoal/60 font-sans mt-0.5">Fill in the fields below to create a new cultural event on the Navras explore page.</p>
          </div>

          {createSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm font-semibold font-sans animate-fade-in">
              {createSuccess}
            </div>
          )}

          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm font-semibold font-sans animate-fade-in">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Event Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={newEvent.title} 
                  onChange={handleCreateInputChange} 
                  required 
                  placeholder="e.g. Sham-e-Sufi Baithak" 
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Art Form category</label>
                <select 
                  name="type" 
                  value={newEvent.type} 
                  onChange={handleCreateInputChange}
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                >
                  <option value="poetry">Urdu Shayari & Poetry circle</option>
                  <option value="singing">Acoustic & Sufi singing</option>
                  <option value="mehfil">Ghazal Mehfil & Sitar</option>
                  <option value="openmic">Open Mic (All forms)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Tagline / Short Hook</label>
              <input 
                type="text" 
                name="tagline" 
                value={newEvent.tagline} 
                onChange={handleCreateInputChange} 
                required 
                placeholder="e.g. A spiritual evening of folk music and coffee" 
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Detailed Story Description</label>
              <textarea 
                name="description" 
                value={newEvent.description} 
                onChange={handleCreateInputChange} 
                rows="4" 
                required 
                placeholder="Tell your attendees about the intimacy, food, cushions layout, and warm conversations..." 
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={newEvent.date} 
                  onChange={handleCreateInputChange} 
                  required 
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Seats Limit</label>
                <input 
                  type="number" 
                  name="seatsTotal" 
                  value={newEvent.seatsTotal} 
                  onChange={handleCreateInputChange} 
                  required 
                  min="5" 
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={newEvent.price} 
                  onChange={handleCreateInputChange} 
                  required 
                  placeholder="0 for Free entry" 
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Time Range</label>
                <input 
                  type="text" 
                  name="time" 
                  value={newEvent.time} 
                  onChange={handleCreateInputChange} 
                  required 
                  placeholder="06:00 PM - 09:00 PM" 
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">City</label>
                <select 
                  name="city" 
                  value={newEvent.city} 
                  onChange={handleCreateInputChange}
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Venue Address</label>
                <input 
                  type="text" 
                  name="venue" 
                  value={newEvent.venue} 
                  onChange={handleCreateInputChange} 
                  required 
                  placeholder="e.g. The Sufi Courtyard, Indiranagar" 
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Artists Lineup (comma separated)</label>
              <input 
                type="text" 
                name="lineup" 
                value={newEvent.lineup} 
                onChange={handleCreateInputChange} 
                placeholder="Ustad Kabir Sen (Rabab), Divya Hegde (Vocals)" 
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={creating}
              className="w-full py-3 bg-maroon hover:bg-maroon-light disabled:opacity-50 text-cream font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors cursor-pointer mt-4"
            >
              {creating ? 'Hosting Mehfil…' : 'Host Mehfil'}
            </button>
          </form>
        </div>
      )}

      {/* ── EXPORTS TAB ── */}
      {tab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Users Report', sub: 'All registered users with activity stats', xlsx: `${API}/admin/export/users?fmt=xlsx`, pdf: `${API}/admin/export/users?fmt=pdf` },
            { title: 'Events Report', sub: 'All events with host, dates, revenue', xlsx: `${API}/admin/export/events?fmt=xlsx`, pdf: `${API}/admin/export/events?fmt=pdf` },
            { title: 'Registrations Report', sub: 'All audience & performer bookings', xlsx: `${API}/admin/export/registrations?fmt=xlsx`, pdf: `${API}/admin/export/registrations?fmt=pdf` },
            { title: 'Revenue Report', sub: 'Revenue breakdown by event', xlsx: `${API}/admin/export/revenue?fmt=xlsx`, pdf: `${API}/admin/export/revenue?fmt=pdf` },
            { title: 'Venues Report', sub: 'All venues with contact details', xlsx: `${API}/admin/export/venues?fmt=xlsx`, pdf: `${API}/admin/export/venues?fmt=pdf` },
            { title: 'Sponsors Report', sub: 'All sponsors with tier and amount', xlsx: `${API}/admin/export/sponsors?fmt=xlsx`, pdf: `${API}/admin/export/sponsors?fmt=pdf` },
          ].map((item, i) => (
            <div key={i} className="bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm space-y-3">
              <div>
                <h4 className="font-serif text-lg font-bold text-maroon">{item.title}</h4>
                <p className="text-xs text-charcoal/60 font-sans">{item.sub}</p>
              </div>
              <div className="flex gap-3">
                <ExportBtn href={item.xlsx} label="Download Excel" icon={Table2} />
                <ExportBtn href={item.pdf} label="Download PDF" icon={FileText} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
