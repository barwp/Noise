import React, { useState } from 'react';
import { Shield, Key, User, Star, Briefcase, Activity, FileText, BarChart3, Sliders, LogIn, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface StaffAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  description: string;
  badge: string;
  colorClass: string;
  permissionsList: string[];
}

interface LoginPortalProps {
  onLoginSuccess: (user: { id: string; username: string; name: string; role: UserRole }) => void;
}

export default function LoginPortal({ onLoginSuccess }: LoginPortalProps) {
  // Traditional Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Predefined Staff Profiles for Quick Login (Single-Click Access)
  const staffAccounts: StaffAccount[] = [
    {
      id: 'usr-1',
      username: 'admin',
      name: 'Admin SCM',
      role: 'admin',
      badge: 'Operational Control',
      colorClass: 'from-blue-650 from-blue-600 to-blue-800 focus:ring-blue-500 hover:from-blue-700 hover:to-blue-900 text-white',
      description: 'Pendaftaran order kustom, validasi bukti transfer pembayaran, logistik, pengiriman, & manajemen data customer.',
      permissionsList: [
        'Input order & pelacakan status FIFO',
        'Verifikasi & Approved Pembayaran transfer',
        'Akses visual database SCM lengkap'
      ]
    },
    {
      id: 'usr-2',
      username: 'owner',
      name: 'Owner NoiseCustom',
      role: 'owner',
      badge: 'Executive Oversight',
      colorClass: 'from-slate-800 via-slate-950 to-black focus:ring-blue-500 hover:from-black hover:to-slate-800 text-white border border-slate-800',
      description: 'Review ringkasan analytics, diagram laporan omzet total, analisis penumpukan (bottleneck), & efisiensi bahan baku.',
      permissionsList: [
        'Akses dashboard eksekutif & ringkasan omzet',
        'Tinjauan diagram performa operasional',
        'Identifikasi bottleneck produksi untuk keputusan strategis'
      ]
    },
    {
      id: 'usr-3',
      username: 'produksi',
      name: 'Tim Produksi & QC',
      role: 'produksi',
      badge: 'Floor Operations',
      colorClass: 'from-blue-500 to-slate-900 focus:ring-blue-500 hover:from-slate-900 hover:to-blue-600 text-white',
      description: 'Kontrol progress cetak DTF, press sablon, log inspections Quality Control (QC), serta deplesi stok DTF desimal.',
      permissionsList: [
        'Update status real-time 6 langkah produksi',
        'Pencatatan persetujuan & revisi mutu QC',
        'Deplesi roll DTF manual & audit stok kaos'
      ]
    }
  ];

  // Quick select login
  const handleQuickLogin = (account: StaffAccount) => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        id: account.id,
        username: account.username,
        name: account.name,
        role: account.role
      });
      setIsLoading(false);
    }, 600);
  };

  // Traditional credential authentication login
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Harap masukkan username dan password.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      // Find matching user from staff list
      const matched = staffAccounts.find(acc => acc.username === trimmedUser);
      
      if (matched) {
        // Accept password matching username or with '123' suffix for ease of usage
        const expectedPasswords = [matched.username, `${matched.username}123`, 'admin123', 'owner123', 'produksi123', 'noise123', 'password'];
        if (expectedPasswords.includes(trimmedPass)) {
          onLoginSuccess({
            id: matched.id,
            username: matched.username,
            name: matched.name,
            role: matched.role
          });
        } else {
          setError(`Password salah. Coba gunakan password "${matched.username}123" atau klik tombol profil di sebelah kiri.`);
        }
      } else {
        setError('Username tidak terdaftar sebagai staf NoiseCustom SCM.');
      }
      setIsLoading(false);
    }, 700);
  };

  return (
    <div id="login-portal-wrapper" className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Dynamic background lighting elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-blue-900/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl w-full space-y-8 z-10">
        
        {/* Header branding info */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800/80 mb-2">
            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">NoiseCustom Studio SCM Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sistem Informasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-blue-650 to-blue-600">Supply Chain Management</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-450 text-slate-400">
            Hak akses menu, manipulasi order, penyetujuan pembayaran, dan audit stok kaus otomatis tergantung pada akun jabatan staf yang Anda gunakan saat login.
          </p>
        </div>

        {/* Outer Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">
          
          {/* LEFT SIDE: Profiles selector (Quick single-click login) */}
          <div className="lg:col-span-7 bg-slate-900/45 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
            <div>
              <div className="flex items-center space-x-2.5 mb-4">
                <Star className="w-5 h-5 text-blue-400 shrink-0" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Akses Cepat (Sekali Klik Staf)</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Pilih salah satu profil karyawan di bawah ini untuk mensimulasikan login instan dan mengamati perbedaan filter hak akses otorisasi secara langsung.
              </p>

              <div className="space-y-4">
                {staffAccounts.map((account) => {
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleQuickLogin(account)}
                      disabled={isLoading}
                      className="w-full text-left bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/80 p-4 rounded-xl transition-all duration-200 group flex items-start gap-4 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {/* Left Badge/Icon color */}
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${account.colorClass} flex items-center justify-center font-black text-white text-lg shrink-0 capitalize shadow-lg`}>
                        {account.username.substring(0, 2)}
                      </div>

                      {/* Info Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            {account.name}
                            <span className="text-[10px] text-slate-500 font-mono font-normal">(@{account.username})</span>
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-850 px-2 py-0.5 rounded-full border border-slate-800">
                            {account.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          {account.description}
                        </p>
                        
                        {/* Scope Checklist block */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/60">
                          {account.permissionsList.map((perm, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                              <span className="truncate">{perm}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/10 p-1.5 rounded-full border border-blue-500/20 text-blue-450">
                        <LogIn className="w-4 h-4 text-blue-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/40 text-[11px] text-slate-500 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Sistem SCM real-time sinkronisasi, terintegrasi restok audit & deplesi DTF.</span>
            </div>
          </div>

          {/* RIGHT SIDE: Standard Login Form (Manual Authentication simulation) */}
          <div className="lg:col-span-5 bg-slate-900/45 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="space-y-6">
              
              <div className="flex items-center space-x-2.5">
                <Lock className="w-5 h-5 text-blue-400 shrink-0" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Sign In Form Manual</h2>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Mensimulasikan form autentikasi manual dengan verifikasi username dan password.
              </p>

              {error && (
                <div id="login-error-alert" className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs font-semibold leading-relaxed animate-shake">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Username Staff:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. admin atau owner atau produksi"
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Password Kontrol:</label>
                    <span className="text-[9px] text-slate-600">Simulasi: samakan dng username</span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="e.g. admin123"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></div>
                      Mengautentikasi...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Masuk Ke Dashboard SCM
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Quick credentials hint card at footer */}
            <div className="mt-6 bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-[11px] text-slate-500 space-y-1 leading-relaxed">
              <span className="font-bold text-slate-400 block mb-1">🔑 PIN KREDENSIAL MOCK:</span>
              <p>&bull; <b>Admin</b> &mdash; User: <code className="text-slate-300 font-mono">admin</code> / Pass: <code className="text-slate-300 font-mono">admin123</code></p>
              <p>&bull; <b>Owner</b> &mdash; User: <code className="text-slate-300 font-mono">owner</code> / Pass: <code className="text-slate-300 font-mono">owner123</code></p>
              <p>&bull; <b>Produksi</b> &mdash; User: <code className="text-slate-300 font-mono">produksi</code> / Pass: <code className="text-slate-300 font-mono">produksi123</code></p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
