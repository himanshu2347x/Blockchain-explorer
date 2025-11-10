import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-2xl bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.05] rounded-3xl p-6 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_8px_48px_0_rgba(31,38,135,0.5)] hover:border-white/40 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subtitle, icon, gradient }) => (
  <GlassCard>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-white/70 text-xs font-semibold mb-2 tracking-widest uppercase">{title}</p>
        <h3 className="text-5xl font-black text-white mb-2 tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">{value}</h3>
        {subtitle && <p className="text-white/50 text-sm font-medium">{subtitle}</p>}
      </div>
      <div className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center shadow-xl transform hover:rotate-12 hover:scale-110 transition-all duration-300`}>
        {icon}
      </div>
    </div>
  </GlassCard>
);

const TransactionRow = ({ tx, index }) => {
  const truncate = (str, len = 10) => str ? `${str.slice(0, len)}...${str.slice(-8)}` : '';
  const valueEth = tx.value ? (parseInt(tx.value) / 1e18).toFixed(6) : '0';
  const timestamp = tx.timeStamp ? new Date(parseInt(tx.timeStamp) * 1000).toLocaleString() : 'N/A';
  const gasUsedFormatted = tx.gasUsed ? parseInt(tx.gasUsed).toLocaleString() : 'N/A';
  const status = tx.isError === "0" ? "Success" : "Failed";

  return (
    <div
      className="backdrop-blur-lg bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-5 border border-white/20 hover:border-cyan-400/50 hover:bg-white/15 transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <p className="text-cyan-400 text-xs mb-1 font-bold uppercase tracking-wider">Transaction Hash</p>
          <p className="text-white font-mono text-sm group-hover:text-cyan-300 transition-colors">{truncate(tx.hash, 16)}</p>
        </div>
        <div>
          <p className="text-purple-400 text-xs mb-1 font-bold uppercase tracking-wider">From</p>
          <p className="text-white font-mono text-xs">{truncate(tx.from, 8)}</p>
          <p className="text-pink-400 text-xs mt-2 font-bold uppercase tracking-wider">To</p>
          <p className="text-white font-mono text-xs">{truncate(tx.to, 8)}</p>
        </div>
        <div>
          <p className="text-emerald-400 text-xs mb-1 font-bold uppercase tracking-wider">Value</p>
          <p className="text-emerald-300 font-bold text-lg">{valueEth} ETH</p>
          <p className="text-orange-400 text-xs mt-2 font-bold uppercase tracking-wider">Gas Used</p>
          <p className="text-white text-xs">{gasUsedFormatted}</p>
        </div>
        <div>
          <p className="text-blue-400 text-xs mb-1 font-bold uppercase tracking-wider">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${status === 'Success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {status}
          </span>
          <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-wider">Time</p>
          <p className="text-white text-xs">{timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [address, setAddress] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const balanceRes = await fetch(`http://127.0.0.1:3000/eth/balance?address=${address}`);
      const balanceData = await balanceRes.json();
      if (balanceData.status === 'success') {
        setBalance(balanceData);
      }

      const txRes = await fetch(`http://127.0.0.1:3000/eth/transactions?address=${address}`);
      const txData = await txRes.json();
      if (txData.status === 'success' && txData.transactions) {
        setTransactions(txData.transactions);

        const grouped = {};
        txData.transactions.forEach(tx => {
          if (tx.timeStamp) {
            const date = new Date(parseInt(tx.timeStamp) * 1000);
            const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`;
            grouped[hourKey] = (grouped[hourKey] || 0) + 1;
          }
        });

        const chartArray = Object.entries(grouped)
          .map(([time, count]) => ({ time, transactions: count }))
          .sort((a, b) => parseInt(a.time) - parseInt(b.time));

        setChartData(chartArray.length > 0 ? chartArray : [
          { time: '00:00', transactions: 0 },
          { time: '06:00', transactions: 0 },
          { time: '12:00', transactions: 0 },
          { time: '18:00', transactions: 0 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setBalance({ balance_eth: '0.000000' });
      setTransactions([]);
      setChartData([
        { time: '00:00', transactions: 0 },
        { time: '06:00', transactions: 0 },
        { time: '12:00', transactions: 0 },
        { time: '18:00', transactions: 0 }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalValue = transactions.reduce((sum, tx) =>
    sum + (tx.value ? parseInt(tx.value) / 1e18 : 0), 0
  ).toFixed(4);

  const totalGasUsed = transactions.reduce((sum, tx) =>
    sum + (tx.gasUsed ? parseInt(tx.gasUsed) : 0), 0
  );

  const successCount = transactions.filter(tx => tx.isError === "0").length;
  const failedCount = transactions.length - successCount;

  const pieData = [
    { name: 'Success', value: successCount, color: '#10b981' },
    { name: 'Failed', value: failedCount, color: '#ef4444' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="backdrop-blur-2xl bg-gradient-to-r from-white/10 to-white/5 border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                  <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5L2 7v6l8 3.5 8-3.5V7l-8-3.5zM10 5.5l5.5 2.27L10 10.04 4.5 7.77 10 5.5zm-6 3.77l6 2.62v5.38l-6-2.62V9.27zm8 8l6-2.62V9.27l-6 2.62v5.38z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Blockchain Explorer
                  </h1>
                  <p className="text-white/70 text-sm font-medium mt-1">Real-time Ethereum analytics & insights</p>
                </div>
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-white px-8 py-4 rounded-2xl font-bold border-2 border-cyan-400/50 hover:border-cyan-300 transition-all duration-300 hover:scale-105 disabled:opacity-50 shadow-lg hover:shadow-cyan-500/50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Address input */}
          <GlassCard className="!bg-gradient-to-r !from-white/15 !to-white/5">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Ethereum address (0x...)"
                className="flex-1 bg-white/10 text-white placeholder-white/40 px-8 py-5 rounded-2xl border-2 border-white/30 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 font-mono text-lg"
              />
              <button
                onClick={fetchData}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-12 py-5 rounded-2xl font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50 text-lg"
              >
                🔍 Search Address
              </button>
            </div>
          </GlassCard>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Wallet Balance"
              value={balance ? `${parseFloat(balance.balance_eth).toFixed(4)}` : '0.0000'}
              subtitle="ETH"
              gradient="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600"
              icon={
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Transactions"
              value={transactions.length}
              subtitle="Total Count"
              gradient="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500"
              icon={
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              }
            />
            <StatCard
              title="Total Volume"
              value={`${totalValue}`}
              subtitle="ETH"
              gradient="bg-gradient-to-br from-orange-400 via-red-500 to-pink-600"
              icon={
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <StatCard
              title="Gas Used"
              value={totalGasUsed.toLocaleString()}
              subtitle="Total"
              gradient="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600"
              icon={
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <GlassCard className="lg:col-span-2">
              <h2 className="text-2xl font-black text-white mb-6 flex items-center">
                <span className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full mr-4"></span>
                Activity Timeline
                <span className="ml-auto text-sm font-normal text-white/60">Last 24 Hours</span>
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '2px solid rgba(6,182,212,0.5)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(10px)',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    fill="url(#colorTx)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Success/Failed Pie Chart */}
            <GlassCard>
              <h2 className="text-2xl font-black text-white mb-6 flex items-center">
                <span className="w-2 h-10 bg-gradient-to-b from-emerald-400 to-red-500 rounded-full mr-4"></span>
                Status
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderRadius: '16px',
                      padding: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span className="text-white/80 font-semibold">{successCount} Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-white/80 font-semibold">{failedCount} Failed</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Transactions list */}
          <GlassCard className="!bg-gradient-to-br !from-white/10 !to-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white flex items-center">
                <span className="w-2 h-10 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full mr-4"></span>
                Recent Transactions
              </h2>
              <span className="text-white/60 font-bold text-lg">{transactions.length} Transactions</span>
            </div>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <TransactionRow key={tx.hash} tx={tx} index={index} />
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-white/70 text-xl font-bold">No transactions found</p>
                  <p className="text-white/50 text-sm mt-2">Try searching for a different address</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-6 py-8 mt-12">
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 text-center">
            <p className="text-white/60 font-medium">
              Powered by Ethereum Blockchain • Built with ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}