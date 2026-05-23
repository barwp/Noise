/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Package,
  FileText,
  DollarSign,
  Activity,
  PlusCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Users,
  Image,
  ClipboardList,
  Sliders,
  Bell,
  Check,
  AlertCircle,
  PhoneCall,
  FileDown,
  Clock,
  Gauge,
  Sparkles,
  Zap
} from 'lucide-react';
import { UserRole, Order, Customer, StockKaos, StockDtf, Notification } from './types';
import LoginPortal from './components/LoginPortal';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function App() {
  // Session Authentication state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const cached = localStorage.getItem('noise_scm_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Authentication Role Switcher (synced with logged-in user)
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const cached = localStorage.getItem('noise_scm_user');
    if (cached) {
      try {
        return JSON.parse(cached).role || 'admin';
      } catch (e) {
        return 'admin';
      }
    }
    return 'admin';
  });

  const handleLoginSuccess = (user: { id: string; username: string; name: string; role: UserRole }) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    localStorage.setItem('noise_scm_user', JSON.stringify(user));
    if (user.role === 'produksi') {
      setActiveTab('production');
    } else if (user.role === 'owner') {
      setActiveTab('reports');
    } else {
      setActiveTab('dashboard');
    }
    showBanner('success', `Berhasil masuk! Selamat bekerja kembali, ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('noise_scm_user');
  };

  // Active Menu Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'payments' | 'production' | 'inventory' | 'reports' | 'customers'>('dashboard');

  // State Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stockKaos, setStockKaos] = useState<StockKaos[]>([]);
  const [stockDtf, setStockDtf] = useState<StockDtf[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<any>({
    totalOmzet: 0,
    totalOrders: 0,
    statusInvoiceGroups: {},
    bottleneckCounts: {},
    highestBottleneck: '',
    highestBottleneckCount: 0,
    dtfUsedTotal: 0,
    totalStockKaosRemaining: 0,
    totalStockDtfRemaining: 0
  });

  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // UI States & Modals
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal togglers
  const [showAddOrderModal, setShowAddOrderModal] = useState<boolean>(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [showDeductDtfModal, setShowDeductDtfModal] = useState<boolean>(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState<boolean>(false);
  const [showUploadPaymentModal, setShowUploadPaymentModal] = useState<boolean>(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // New Order Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderDesc, setOrderDesc] = useState('');
  const [orderRemarks, setOrderRemarks] = useState('');
  const [orderDesignFile, setOrderDesignFile] = useState('desain_kaos_noise.png');
  const [orderDesignUrl, setOrderDesignUrl] = useState('https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400');
  const [orderPrintSize, setOrderPrintSize] = useState('A3');
  const [orderDesignNotes, setOrderDesignNotes] = useState('');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState('Transfer BCA');
  const [orderItemsInput, setOrderItemsInput] = useState<{ jenis_kaos: string, warna: string, size: string, quantity: number, unit_price: number }[]>([
    { jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'M', quantity: 5, unit_price: 60000 }
  ]);

  // Upload Payment Form State (Manual Simulation)
  const [payOrderTarget, setPayOrderTarget] = useState<Order | null>(null);
  const [payAmountPaid, setPayAmountPaid] = useState<number>(0);
  const [payProofUrl, setPayProofUrl] = useState('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400');
  const [payNotes, setPayNotes] = useState('');

  // Manual Stock Kaos Adjust Form State
  const [selectedStockKaosId, setSelectedStockKaosId] = useState('');
  const [adjKaosQty, setAdjKaosQty] = useState<number>(10);
  const [adjKaosType, setAdjKaosType] = useState<'in' | 'out'>('in');
  const [adjKaosNote, setAdjKaosNote] = useState('Restock Kaos manual');

  // Manual DTF Deduct / Adjust Form State
  const [selectedDtfId, setSelectedDtfId] = useState('');
  const [adjDtfMeters, setAdjDtfMeters] = useState<number>(5);
  const [adjDtfType, setAdjDtfType] = useState<'in' | 'out'>('out');
  const [adjDtfNote, setAdjDtfNote] = useState('Pemakaian produksi sablon');

  // Selected Order for log views / modal verification
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  // Fetch all endpoints
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [resOrders, resCustomers, resKaos, resDtf, resNotif, resReports] = await Promise.all([
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/stock/kaos').then(r => r.json()),
        fetch('/api/stock/dtf').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/reports').then(r => r.json())
      ]);

      setOrders(resOrders);
      setCustomers(resCustomers);
      setStockKaos(resKaos);
      setStockDtf(resDtf);
      setNotifications(resNotif);
      setReports(resReports);

      // Pre-select form fields
      if (resCustomers && resCustomers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(resCustomers[0].id);
      }
      if (resKaos && resKaos.length > 0 && !selectedStockKaosId) {
        setSelectedStockKaosId(resKaos[0].id);
      }
      if (resDtf && resDtf.length > 0 && !selectedDtfId) {
        setSelectedDtfId(resDtf[0].id);
      }
    } catch (err) {
      console.error('Failed to load SCM data', err);
      showBanner('error', 'Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 6000);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Branding Colors Configuration
      const navy = [15, 23, 42]; // #0f172a
      const indigoMain = [37, 99, 235]; // #2563eb (Blue Accent)
      const greenAccent = [16, 185, 129]; // #10b981
      const textMuted = [100, 116, 139]; // #64748b
      const shadingBg = [248, 250, 252]; // #f8fafc

      // 1. Corporate Brand Header Block
      doc.setFillColor(navy[0], navy[1], navy[2]);
      doc.rect(0, 0, 210, 42, 'F');

      // Indigo underline brand highlight
      doc.setFillColor(indigoMain[0], indigoMain[1], indigoMain[2]);
      doc.rect(0, 42, 210, 3, 'F');

      // Brand Title Typography
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('NOISECUSTOM STUDIO SCM', 15, 18);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(191, 196, 210);
      doc.text('SISTEM UTAMA SUPPLY CHAIN MANAGEMENT & ANALYTICS', 15, 25);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Otoritas: ${currentUser?.name || 'Owner'}`, 15, 31);

      // Certificate Tag Accent
      doc.setFillColor(indigoMain[0], indigoMain[1], indigoMain[2]);
      doc.roundedRect(145, 12, 50, 8, 1, 1, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('LAPORAN STRATEGIS', 151, 17.5);

      // Section I: Financial Metrics & Operations overview
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text('I. RINGKASAN STATISTIK OPERASIONAL & MATERIAL', 15, 58);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(15, 61, 195, 61);

      // Stat Box 1: Total Omzet
      doc.setFillColor(shadingBg[0], shadingBg[1], shadingBg[2]);
      doc.roundedRect(15, 66, 56, 24, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(15, 66, 56, 24, 2, 2, 'S');
      
      doc.setFontSize(7);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('TOTAL OMZET TEREALISASI', 19, 72);
      
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text(`Rp ${reports.totalOmzet?.toLocaleString('id-ID') || '0'}`, 19, 81);
      
      doc.setFontSize(6.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('*Pembayaran Terverifikasi', 19, 86);

      // Stat Box 2: Total Orders
      doc.setFillColor(shadingBg[0], shadingBg[1], shadingBg[2]);
      doc.roundedRect(77, 66, 56, 24, 2, 2, 'F');
      doc.roundedRect(77, 66, 56, 24, 2, 2, 'S');
      
      doc.setFontSize(7);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('KAPASITAS KERJA TERPASANG', 81, 72);
      
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text(`${reports.totalOrders || '0'} Order Terdaftar`, 81, 81);
      
      doc.setFontSize(6.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('*Seluruh antrean produksi', 81, 86);

      // Stat Box 3: DTF Material Consumed
      doc.setFillColor(shadingBg[0], shadingBg[1], shadingBg[2]);
      doc.roundedRect(139, 66, 56, 24, 2, 2, 'F');
      doc.roundedRect(139, 66, 56, 24, 2, 2, 'S');
      
      doc.setFontSize(7);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('BAHAN BAKU DTF TERPAKAI', 143, 72);
      
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text(`${reports.dtfUsedTotal || '0'} Meter`, 143, 81);
      
      doc.setFontSize(6.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('*Audit roll deplesi terekam', 143, 86);

      // Section II: Monthly Revenue Trends (Table Representation)
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text('II. ANALISIS TREN OMZET BULANAN (REVENUE REALIZATION)', 15, 101);
      doc.line(15, 104, 195, 104);

      // Table Header Row
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 108, 180, 7, 'F');
      
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text('Bulan / Periode', 18, 113);
      doc.text('Omzet Realisasi', 70, 113);
      doc.text('Target SCM', 120, 113);
      doc.text('Indeks Capaian (%)', 165, 113);

      let currentY = 115;
      if (reports.monthlyRevenueTrends && reports.monthlyRevenueTrends.length > 0) {
        reports.monthlyRevenueTrends.forEach((item: any) => {
          currentY += 6;
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(item.month, 18, currentY);
          doc.text(`Rp ${item.omzet?.toLocaleString('id-ID')}`, 70, currentY);
          doc.text(`Rp ${item.target?.toLocaleString('id-ID')}`, 120, currentY);
          
          const pct = item.target > 0 ? Math.round((item.omzet / item.target) * 100) : 0;
          if (pct >= 100) {
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
          } else {
            doc.setFont('Helvetica', 'semibold');
            doc.setTextColor(indigoMain[0], indigoMain[1], indigoMain[2]);
          }
          doc.text(`${pct}%`, 165, currentY);
        });
      } else {
        currentY += 6;
        doc.setFont('Helvetica', 'italic');
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text('Data tren omzet bulanan belum tersedia atau kosong.', 18, currentY);
      }

      // Section III: Production Performance Antar Divisi
      currentY += 12;
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text('III. PERBANDINGAN TINGKAT PERFORMA PROSES ANTAR DIVISI', 15, currentY);
      doc.line(15, currentY + 3, 195, currentY + 3);

      currentY += 7;
      doc.setFillColor(241, 245, 249);
      doc.rect(15, currentY, 180, 7, 'F');
      
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text('Divisi / Pos Stasiun', 18, currentY + 5);
      doc.text('Beban Kerja (Antrean)', 70, currentY + 5);
      doc.text('Log Output Berhasil', 120, currentY + 5);
      doc.text('Rasio Efisiensi Kerja', 165, currentY + 5);

      if (reports.divisionPerformance && reports.divisionPerformance.length > 0) {
        reports.divisionPerformance.forEach((div: any) => {
          currentY += 6;
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(div.name, 18, currentY + 5);
          doc.text(`${div['Beban Kerja']} Order`, 70, currentY + 5);
          doc.text(`${div['Selesai']} Order`, 120, currentY + 5);
          
          const efficiency = div['Persentase Efisiensi'] || 0;
          if (efficiency >= 80) {
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
          } else if (efficiency >= 50) {
            doc.setFont('Helvetica', 'semibold');
            doc.setTextColor(indigoMain[0], indigoMain[1], indigoMain[2]);
          } else {
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(239, 68, 68); // Red indicator
          }
          doc.text(`${efficiency}%`, 165, currentY + 5);
        });
      } else {
        currentY += 6;
        doc.setFont('Helvetica', 'italic');
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text('Data performa divisi belum direkam.', 18, currentY + 5);
      }

      // Section IV: Bottleneck Diagnostic & Decisive Recommendation
      currentY += 16;
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.text('IV. DIAGNOSTIK PEMETAAN BOTTLENECK & REKOMENDASI STRATEGIS', 15, currentY);
      doc.line(15, currentY + 3, 195, currentY + 3);

      currentY += 7;
      doc.setFillColor(shadingBg[0], shadingBg[1], shadingBg[2]);
      doc.rect(15, currentY, 180, 36, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, currentY, 180, 36, 'S');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      
      const isCritical = (reports.highestBottleneckCount || 0) > 3;
      doc.setTextColor(isCritical ? 220 : 79, isCritical ? 38 : 70, isCritical ? 38 : 229);
      doc.text(`TITIK BOTTLENECK UTAMA: ${reports.highestBottleneck?.replace(/_/g, ' ').toUpperCase() || 'NORMAL'} (${reports.highestBottleneckCount || 0} Antrean Aktif)`, 20, currentY + 6);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      const reportNote = `Hasil analisis log SCM mendeteksi antrean tumpukan desain di stasiun ${reports.highestBottleneck || 'N/A'}. Kecepatan throughput pada tahap ini sangat kritis agar alur kerja FIFO tetap terjaga dan menghindari komplain deplesi bahan baku.`;
      const splitReportNote = doc.splitTextToSize(reportNote, 170);
      doc.text(splitReportNote, 20, currentY + 12);

      const managerRec = `Saran Manajer Produksi: Tingkatkan kapasitas personil pada stasiun bottleneck tersebut, lakukan verifikasi ulang material kaos/DTF, dan optimalkan setting file kompresi sablon sehingga memperlancar eksekusi QC.`;
      const splitManagerRec = doc.splitTextToSize(managerRec, 170);
      doc.text(splitManagerRec, 20, currentY + 23);

      // Footer corporate metadata
      doc.setFontSize(6.5);
      doc.setFont('Helvetica', 'italic');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('* Dokumen analisis strategic ini dicetak secara dinamis berdasarkan data tervalidasi di server basis data SCM NoiseCustom Studio.', 15, 281);
      doc.text('Halaman 1 dari 1 - SCM Intelligence Suite', 150, 281);

      // Trigger actual download save action
      doc.save(`Laporan_Owner_NoiseCustom_SCM_${new Date().toISOString().split('T')[0]}.pdf`);
      showBanner('success', 'Unduhan Laporan PDF berhasil dibuat! Silakan tinjau file di folder download Anda.');
    } catch (e: any) {
      console.error('Failed to export PDF report', e);
      showBanner('error', `Gagal mengekspor laporan: ${e.message || e}`);
    }
  };

  // 1. Tambah Customer Baru Action
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      showBanner('error', 'Nama dan nomor WhatsApp wajib diisi.');
      return;
    }
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName,
          phone: newCustPhone,
          email: newCustEmail,
          address: newCustAddress
        })
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', `Customer ${newCustName} berhasil ditambahkan!`);
        setNewCustName('');
        setNewCustPhone('');
        setNewCustEmail('');
        setNewCustAddress('');
        setShowAddCustomerModal(false);
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal menambahkan customer.');
      }
    } catch (err) {
      showBanner('error', 'Kesalahan koneksi saat menambah customer.');
    }
  };

  // 2. Tambah Order Baru (Simulasi) Action
  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showBanner('error', 'Pilih customer terlebih dahulu.');
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          description: orderDesc || 'Pekerjaan sablon kaos custom',
          remarks: orderRemarks,
          items: orderItemsInput,
          design: {
            design_file_name: orderDesignFile,
            design_file_url: orderDesignUrl,
            print_size: orderPrintSize,
            notes: orderDesignNotes
          },
          payment_method: orderPaymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', `Order baru ${data.order.id} berhasil terdaftar. Status: Menunggu Verifikasi Pembayaran.`);
        setOrderDesc('');
        setOrderRemarks('');
        setOrderDesignNotes('');
        setShowAddOrderModal(false);
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal meregistrasi order baru.');
      }
    } catch (err) {
      showBanner('error', 'Gagal memproses pendaftaran order baru.');
    }
  };

  // Helper to add item row into order creation form
  const addOrderItemRow = () => {
    setOrderItemsInput([...orderItemsInput, { jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'L', quantity: 5, unit_price: 60000 }]);
  };

  const removeOrderItemRow = (index: number) => {
    const updated = [...orderItemsInput];
    updated.splice(index, 1);
    setOrderItemsInput(updated);
  };

  const updateOrderItemRow = (index: number, key: string, value: any) => {
    const updated = [...orderItemsInput];
    updated[index] = { ...updated[index], [key]: value };
    setOrderItemsInput(updated);
  };

  // 3. Upload Bukti Bayar Simulasi Action
  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payOrderTarget) return;

    try {
      const res = await fetch(`/api/orders/${payOrderTarget.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_paid: Number(payAmountPaid),
          payment_proof_url: payProofUrl,
          notes: payNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', 'Bukti transfer berhasil di-upload! Admin SCM sekarang dapat memverifikasinya.');
        setPayOrderTarget(null);
        setShowUploadPaymentModal(false);
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal menyimpan bukti transfer.');
      }
    } catch (err) {
      showBanner('error', 'Koneksi error saat upload pembayaran.');
    }
  };

  // 4. Admin verifikasi pembayaran Action
  const handleVerifyPayment = async (paymentId: string, action: 'disetujui' | 'ditolak', notes: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: notes || `Pembayaran diverifikasi oleh ${activeRole}`,
          verifier_name: `NoiseCustom Staff (${activeRole})`
        })
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', `Pembayaran ${action === 'disetujui' ? 'berhasil DISETUJUI' : 'telah DITOLAK'}. Stok kaos otomatis diperbarui.`);
        setSelectedOrderDetails(null);
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal memverifikasi pembayaran.');
      }
    } catch (err) {
      showBanner('error', 'Koneksi error saat verifikasi.');
    }
  };

  // 5. Update Status Produksi Action
  const handleUpdateProductionStatus = async (orderId: string, status: string, note: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/production-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: note || `Operasional produksi berpindah ke status ${status.replace(/_/g, ' ')}`,
          updated_by: `Staf Produksi (${activeRole})`
        })
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', `Status produksi order ${orderId} di-update ke ${status.replace(/_/g, ' ')}`);
        // Refresh detail view
        const updatedOrders = await fetch('/api/orders').then(r => r.json());
        setOrders(updatedOrders);
        const thisOrd = updatedOrders.find((x: any) => x.id === orderId);
        if (thisOrd) setSelectedOrderDetails(thisOrd);
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal update status produksi.');
      }
    } catch (err) {
      showBanner('error', 'Terjadi kesalahan jaringan.');
    }
  };

  // 6. Quality Control Lolos / Gagal Action
  const handleQCCheck = async (orderId: string, status: 'lolos' | 'tidak_lolos', note: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          revisi_note: note,
          checked_by: `Inspektor QC (${activeRole})`
        })
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', `Hasil QC dicatat secara permanen: Lolos=${status === 'lolos'}. Status order otomatis di-shift.`);
        // Refresh details
        const updatedOrders = await fetch('/api/orders').then(r => r.json());
        setOrders(updatedOrders);
        const thisOrd = updatedOrders.find((x: any) => x.id === orderId);
        if (thisOrd) setSelectedOrderDetails(thisOrd);
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal menyimpan hasil QC.');
      }
    } catch (err) {
      showBanner('error', 'Jaringan gagal saat memproses QC.');
    }
  };

  // 7. Manual DTF Stock Reduction (Tim Produksi)
  const handleDeductDTF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDtfId || !adjDtfMeters) return;
    try {
      const endpoint = adjDtfType === 'out' ? '/api/stock/dtf/deduct' : '/api/stock/dtf/adjust';
      const bodyPayload = adjDtfType === 'out' 
        ? { id: selectedDtfId, meters: adjDtfMeters, note: adjDtfNote, updated_by: `Tim SCM (${activeRole})` }
        : { id: selectedDtfId, meters: adjDtfMeters, type: 'in', note: adjDtfNote, updated_by: `Tim SCM (${activeRole})` };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', `Stok roll DTF berhasil diperbarui! Log audit terdaftar.`);
        setShowDeductDtfModal(false);
        setAdjDtfNote('Pemakaian produksi sablon');
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal mengupdate stok DTF.');
      }
    } catch (err) {
      showBanner('error', 'Koneksi error saat update DTF.');
    }
  };

  // 8. Adjust / Refill Kaos Stock Action
  const handleAdjustKaosStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockKaosId || !adjKaosQty) return;
    try {
      const res = await fetch('/api/stock/kaos/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStockKaosId,
          qty: adjKaosQty,
          type: adjKaosType,
          note: adjKaosNote,
          updated_by: `Manajemen Stok (${activeRole})`
        })
      });
      const data = await res.json();
      if (data.success) {
        showBanner('success', `Aksi audit stok kaos sukses dicatat!`);
        setShowAdjustStockModal(false);
        setAdjKaosNote('Restock Kaos manual');
        refreshAllData();
      } else {
        showBanner('error', data.error || 'Gagal mengeksekusi stok kaos.');
      }
    } catch (err) {
      showBanner('error', 'Koneksi database/server gagal.');
    }
  };

  // Clear all notifications
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      showBanner('success', 'Semua peringatan dibersihkan.');
      refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Direct WhatsApp Notification text generator
  const getWhatsAppLink = (order: any) => {
    const phone = order.customer_phone || '081234567890';
    let text = `Halo, Kak ${order.customer_name}. Kami dari NoiseCustom Studio ingin melaporkan nomor order Anda *${order.id}* dengan status produksi terbaru: *[${order.production_status.replace(/_/g, ' ').toUpperCase()}]*.\n\nDetail Order:\n- ${order.description}\n- Total Tagihan: Rp ${order.total_amount.toLocaleString()}\n- Status Bayar: ${order.invoice?.status_pembayaran.toUpperCase()}\n\nKami berkomitmen menjaga kualitas terbaik. Proses Anda sedang dikerjakan dengan prioritas tinggi di NoiseCustom Studio! Terima kasih.`;
    
    // Add custom helper context
    if (order.production_status === 'menunggu_verifikasi_pembayaran') {
      text = `Halo, Kak ${order.customer_name}. Kami mengkonfirmasi order *${order.id}* telah terdaftar. Mohon segera melengkapi pembayaran atau mengupload bukti transfer agar kami dapat memproses order masuk prioritas utama produksi!\n\nTagihan: Rp ${order.total_amount.toLocaleString()}.\n\nSalam Hangat,\nNoiseCustom Studio`;
    } else if (order.production_status === 'revisi_komplain') {
      text = `Halo, Kak ${order.customer_name}. Kami dari NoiseCustom Studio SCM memberitahukan bahwa order Anda *${order.id}* masuk pada antrian revisi/perbaikan agar detail pengerjaan sablon Anda lolos Quality Control secara presisi.\n\nMohon ditunggu, kami prioritaskan agar segera selesai dengan mulus!`;
    } else if (order.production_status === 'selesai') {
      text = `Kabar Baik, Kak ${order.customer_name}! Order kustom *${order.id}* Anda dari NoiseCustom Studio sudah sepenuhnya SELESAI dan lunas. Terima kasih banyak atas kepercayaan Anda dalam mengcustom kaos premium bersama kami. Kami tunggu orderan selanjutnya!`;
    }

    return `https://wa.me/${phone.replace(/^0/, '62')}?text=${encodeURIComponent(text)}`;
  };

  // Filtering & Ordering - **List order priority dari order terlama sampai terbaru dengan ORDER BY order_date ASC** (Logic 3 & 5)
  // Only qualifies active production status (DP or Lunas, or waiting verify, excluding completely finished)
  const priorityQueue = orders
    .filter(o => o.production_status !== 'selesai')
    .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime());

  // Stock warning counts
  const stockKaosAlerts = stockKaos.filter(s => s.stock_qty <= s.min_stock);
  const stockDtfAlerts = stockDtf.filter(d => d.stock_meter <= d.min_stock);
  const totalAlertsCount = stockKaosAlerts.length + stockDtfAlerts.length;

  if (!currentUser) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="scm-layout-root" className="flex h-screen bg-[#F5F7FA] text-slate-800 overflow-hidden font-sans">
      
      {/* SIDEBAR COMPONENT - Premium SaaS Minimalist Light Style */}
      <aside className="w-64 bg-white text-slate-600 flex flex-col shrink-0 border-r border-slate-200/80 z-10 shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/10">N</div>
          <div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight block">NoiseCustom</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block -mt-1">Studio SCM</span>
          </div>
        </div>

        {/* ROLE SIMULASI SWITCHER - Sleek SaaS Pill Indicator */}
        <div className="p-4 bg-slate-50/75 border-b border-slate-200/50">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" /> OVERRIDE HAK AKSES DETIL:
          </div>
          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            {([ 'admin', 'produksi', 'owner' ] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  // Dynamic user profiles sync when switching
                  const profileName = role === 'admin' ? 'Admin SCM' : role === 'owner' ? 'Owner NoiseCustom' : 'Tim Produksi';
                  const mockId = role === 'admin' ? 'usr-1' : role === 'owner' ? 'usr-2' : 'usr-3';
                  const syncedUser = { id: mockId, username: role, name: profileName, role };
                  setCurrentUser(syncedUser);
                  localStorage.setItem('noise_scm_user', JSON.stringify(syncedUser));

                  if (role === 'produksi') {
                    setActiveTab('production');
                  } else if (role === 'owner') {
                    setActiveTab('reports');
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                  activeRole === role
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {role === 'produksi' ? 'PROD' : role.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Jabatan: <b className="text-slate-800 capitalize font-bold">{activeRole}</b></span>
            </span>
          </div>
        </div>

        {/* Dynamic Sidebar Menus matches Role and User Context */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-2.5">MODUL OPERASIONAL</div>
          
          {(activeRole === 'admin' || activeRole === 'owner') && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100/30 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Activity className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeTab === 'dashboard' ? 'text-blue-600 scale-110' : 'text-slate-400'}`} /> Ringkasan SCM
            </button>
          )}

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-blue-50 text-blue-600 border border-blue-100/30 shadow-2xs font-bold' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Layers className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeTab === 'orders' ? 'text-blue-600 scale-110' : 'text-slate-400'}`} /> Prioritas & List Order
          </button>

          {(activeRole === 'admin' || activeRole === 'owner') && (
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === 'payments' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100/30 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <DollarSign className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeTab === 'payments' ? 'text-blue-600 scale-110' : 'text-slate-400'}`} /> Verifikasi Pembayaran
            </button>
          )}

          <button
            onClick={() => setActiveTab('production')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === 'production' 
                ? 'bg-blue-50 text-blue-600 border border-blue-100/30 shadow-2xs font-bold' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Sliders className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeTab === 'production' ? 'text-blue-600 scale-110' : 'text-slate-400'}`} /> Kontrol Produksi & QC
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === 'inventory' 
                ? 'bg-blue-50 text-blue-600 border border-blue-100/30 shadow-2xs font-bold' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Package className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeTab === 'inventory' ? 'text-blue-600 scale-110' : 'text-slate-400'}`} /> Stok Kaos & DTF
          </button>

          {(activeRole === 'owner' || activeRole === 'admin') && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100/30 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeTab === 'reports' ? 'text-blue-600 scale-110' : 'text-slate-400'}`} /> Laporan Owner
            </button>
          )}

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === 'customers' 
                ? 'bg-blue-50 text-blue-600 border border-blue-100/30 shadow-2xs font-bold' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeTab === 'customers' ? 'text-blue-600 scale-110' : 'text-slate-400'}`} /> Data Customers
          </button>
        </nav>

          {/* Logged in summary info box with logouts */}
          <div className="p-4 bg-slate-50/85 m-4 rounded-xl border border-slate-200/60 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7.5 h-7.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-[11px] uppercase shrink-0">
                {activeRole.substring(0,2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate" title={currentUser?.name || 'Staf NoiseCustom'}>
                  {currentUser?.name || 'Staf NoiseCustom'}
                </div>
                <div className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">{activeRole} System</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-center py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-600 hover:text-rose-700 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Keluar / Sign Out
            </button>
          </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* UPPER STATUS HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-5">
          <div className="flex items-center gap-3 text-slate-500">
            <button 
              onClick={refreshAllData}
              title="Refresh SCM Data" 
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <h1 className="text-base font-bold text-slate-900 tracking-tight capitalize">
              Panel {activeRole} &mdash; <span className="text-blue-600 font-semibold">{activeTab.replace(/_/g, ' ')} SCM</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time alert pill (Logic 13) */}
            {totalAlertsCount > 0 ? (
              <div className="flex items-center bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200 text-[11px] font-semibold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-500" />
                <span>{totalAlertsCount} Notifikasi Stok Tipis!</span>
              </div>
            ) : (
              <div className="flex items-center bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px] font-semibold">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                <span>Semua Stok Aman</span>
              </div>
            )}

            {/* Simulated Action buttons to easily trigger custom demo events */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Order Baru
              </button>
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Customer
              </button>
            </div>
          </div>
        </header>

        {/* MAIN DISPLAY SCROLL AREA */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Notification Alert Banner */}
          {message && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
              <div className="flex-1 text-xs font-medium">{message.text}</div>
              <button onClick={() => setMessage(null)} className="text-xs hover:underline">Tutup</button>
            </div>
          )}

          {/* TAB 1: DASHBOARD RINGKASAN ADMIN SCM */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Summary Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md hover:translate-y-[-1px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">TOTAL OMZET TEREALISASI</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">Rp {reports.totalOmzet?.toLocaleString() || '0'}</div>
                  <div className="text-[10px] text-slate-450 mt-1 pb-0.5 font-medium">Omset berstatus terverifikasi lunas</div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md hover:translate-y-[-1px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">TOTAL ORDER MASUK</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{reports.totalOrders || '0'} <span className="text-xs font-semibold text-slate-400">Order</span></div>
                  <div className="text-[10px] text-slate-450 mt-1 pb-0.5 font-medium">Total pesanan dalam sistem SCM</div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md hover:translate-y-[-1px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">BOTTLENECK UTAMA</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-amber-600 truncate pt-1">{reports.highestBottleneck?.replace(/_/g, ' ').toUpperCase() || 'NORMAL'}</div>
                  <div className="text-[10px] text-slate-450 mt-1 pb-0.5 font-medium">Antrean terpadat ({reports.highestBottleneckCount || 0} order)</div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md hover:translate-y-[-1px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">TOTAL STOK KAOS</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{reports.totalStockKaosRemaining || '0'} <span className="text-xs font-semibold text-slate-400">Pcs</span></div>
                  <div className="text-[10px] text-slate-450 mt-1 pb-0.5 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Stok aman di gudang
                  </div>
                </div>
              </div>

              {/* Grid 2: Priority List (Oldest to Newest) + Critical Stocks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 8-Cols Order Priority Queue (Logic 5: ORDER BY order_date ASC) */}
                <div className="lg:col-span-8 flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                    <div>
                      <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" /> TIMELINE ANTRIAN PRIORITAS (FIFO SYSTEM)
                      </h2>
                      <p className="text-[10px] text-slate-400 mt-1">Urutan ketat <code>ORDER BY order_date ASC</code> untuk mencegah delay pengiriman.</p>
                    </div>
                    <span className="bg-blue-50 border border-blue-100/60 text-blue-700 font-bold px-3 py-1 rounded-lg text-[9.5px] uppercase tracking-wider">
                      Antrian SCM ({priorityQueue.length})
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#F8FAFC]/75 text-slate-400 font-semibold uppercase border-b border-slate-150">
                        <tr>
                          <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Tanggal SCM</th>
                          <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">ID Order</th>
                          <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Pelanggan</th>
                          <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Fase / Tahapan</th>
                          <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Status Bayar</th>
                          <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {priorityQueue.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-medium">
                              Tidak ada antrian order yang aktif saat ini.
                            </td>
                          </tr>
                        ) : (
                          priorityQueue.map((order, idx) => {
                            const isOldest = idx === 0;
                            return (
                              <tr key={order.id} className={`hover:bg-slate-50/50 transition-colors ${isOldest ? 'bg-amber-50/20' : ''}`}>
                                <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                  {new Date(order.order_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  {isOldest && <span className="ml-1.5 px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-650 font-black rounded-md text-[8px] uppercase tracking-wider">Prioritas</span>}
                                </td>
                                <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{order.id}</td>
                                <td className="px-5 py-3.5 font-bold text-slate-800">{order.customer_name}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${
                                    order.production_status === 'menunggu_verifikasi_pembayaran' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                                    order.production_status === 'antri_produksi' ? 'bg-amber-50 text-amber-600 border border-amber-200/55' :
                                    order.production_status === 'cetak_dtf' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                                    order.production_status === 'press_sablon' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                    order.production_status === 'quality_control' ? 'bg-teal-50 text-teal-650 border border-teal-100' :
                                    order.production_status === 'revisi_komplain' ? 'bg-rose-50 text-rose-650 border border-rose-200' :
                                    'bg-blue-50 text-blue-600'
                                  }`}>
                                    {order.production_status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider whitespace-nowrap ${
                                    order.invoice?.status_pembayaran === 'lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    order.invoice?.status_pembayaran === 'dp' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                  }`}>
                                    {order.invoice ? order.invoice.status_pembayaran.toUpperCase() : 'BELUM BAYAR'}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => setSelectedOrderDetails(order)}
                                    className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-3xs transition-all cursor-pointer text-[11px]"
                                  >
                                    Atur
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-auto p-4 bg-slate-50/55 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500 rounded-b-2xl">
                    <span className="font-medium">Prioritas teratas wajib diproses sesuai anjuran FIFO.</span>
                    <button onClick={() => setActiveTab('orders')} className="text-blue-600 font-bold hover:underline cursor-pointer">Selengkapnya &rarr;</button>
                  </div>
                </div>

                {/* 4-Cols Stocks, Alerts & Bottleneck Info */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Stock Level Quick Summary (Logic 9 & 10) */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" /> STATUS BAHAN & STOK CRITICAL
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {stockDtf.map(dtf => (
                        <div key={dtf.id} className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl shadow-3xs">
                          <div className="text-[10px] text-slate-400 uppercase font-bold truncate">{dtf.roll_name}</div>
                          <div className="text-xl font-black mt-1 text-slate-800">
                            {dtf.stock_meter} <span className="text-xs font-normal text-slate-400">M</span>
                          </div>
                          <span className={`text-[8.5px] font-extrabold uppercase block mt-1 ${dtf.stock_meter <= dtf.min_stock ? 'text-red-500' : 'text-emerald-600'}`}>
                            {dtf.stock_meter <= dtf.min_stock ? '⚠️ Re-Stock' : '✓ Kapasitas Aman'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Low stock indicators itemized table (Logic 13) */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Warning Stok Kaos Gudang:</div>
                      {stockKaosAlerts.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic bg-emerald-50/70 border border-emerald-100 text-emerald-800 p-2 rounded-xl">
                          ✓ Semua varian kaos memiliki cadangan memadai di atas limit aman.
                        </p>
                      ) : (
                        stockKaosAlerts.map(kaos => (
                          <div key={kaos.id} className="flex items-center justify-between text-[11px] bg-red-50/60 border border-red-100/60 p-2.5 rounded-xl">
                            <div>
                              <b className="text-slate-800 font-bold block">{kaos.jenis_kaos}</b>
                              <span className="text-slate-400 text-[10px]">{kaos.warna} &bull; Size {kaos.size}</span>
                            </div>
                            <span className="bg-red-100/70 text-red-750 font-bold px-2 py-0.5 rounded-lg text-[10.5px]">
                              {kaos.stock_qty} Pcs
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                       <button
                         onClick={() => {
                           setActiveTab('inventory');
                           setShowDeductDtfModal(true);
                         }}
                         className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-center py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                       >
                         Potong DTF
                       </button>
                       <button
                         onClick={() => {
                           setActiveTab('inventory');
                           setShowAdjustStockModal(true);
                         }}
                         className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-center py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                       >
                         Restock Kaos
                       </button>
                    </div>
                  </div>

                  {/* Operational Alerts / Activity (Logs & Notifications) */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600" /> NOTIFIKASI AKTIVITAS
                      </h3>
                      {notifications.some(n => !n.is_read) && (
                        <button onClick={handleMarkAllRead} className="text-[9px] text-blue-600 font-extrabold hover:underline cursor-pointer bg-blue-50 px-2.5 py-1 rounded-md">
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-[11px] text-slate-450 italic text-center py-6">Tidak ada log notifikasi terbaru.</p>
                      ) : (
                        notifications.slice(0, 5).map(notif => (
                          <div key={notif.id} className={`p-3 rounded-xl text-[11px] border leading-normal transition-all ${
                            notif.is_read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-blue-50/40 border-blue-100/70 text-slate-800'
                          }`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[9px] text-slate-400 font-bold block">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                              {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block animate-pulse"></span>}
                            </div>
                            <p className="leading-tight text-slate-700 font-medium">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MANAGEMENT ORDER & PRIORITY QUEUE (Logic 1, 2, 5, 14, 15) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">REDAKSI DAN PRIORITAS UTAMA ANTRIAN ORDER</h2>
                  <p className="text-xs text-slate-500">Daftar order aktif diurutkan dari terlama sampai terbaru (ORDER BY order_date ASC).</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddOrderModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-all"
                  >
                    + Buat Simulasi Order Pelanggan
                  </button>
                </div>
              </div>

              {/* Order List Table */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 bg-[#F8FAFC]/55 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">DAFTAR KANBAN SCM (TOTAL: {orders.length} PESANAN)</span>
                  <div className="text-[11px] text-slate-400 font-medium">Klik "Kelola" untuk memproses verifikasi, cetak, sablon, QC, dsb.</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#F8FAFC]/75 text-slate-400 font-semibold uppercase border-b border-slate-150">
                      <tr>
                        <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Tanggal Reg</th>
                        <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">ID Order / Invoice</th>
                        <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Customer & WA</th>
                        <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Detail Desain (DP/Full)</th>
                        <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Tagihan / Bayar</th>
                        <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold">Status SCM</th>
                        <th className="px-5 py-3 text-[10px] tracking-wider font-extrabold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order, index) => {
                        const isAwaitingPayment = order.production_status === 'menunggu_verifikasi_pembayaran';
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                              {new Date(order.order_date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-5 py-3.5 font-mono">
                              <div className="font-bold text-slate-900">{order.id}</div>
                              <div className="text-[10px] text-blue-600 font-semibold">{order.invoice_id}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-800">{order.customer_name}</div>
                              <div className="text-slate-400 font-medium text-[10px]">{order.customer_phone}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-slate-700 font-bold max-w-xs truncate">{order.description}</div>
                              <div className="text-[10px] text-slate-405 mt-0.5 font-semibold">Ukuran Print: {order.designs?.print_size || 'N/A'}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-900">Rp {order.total_amount.toLocaleString()}</div>
                              <div className="mt-0.5">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                  order.invoice?.status_pembayaran === 'lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  order.invoice?.status_pembayaran === 'dp' ? 'bg-blue-50 text-blue-600 border border-blue-105' :
                                  order.invoice?.status_pembayaran === 'ditolak' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                  {order.invoice?.status_pembayaran || 'Belum Lunas'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col">
                                <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${
                                  order.production_status === 'selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                                  order.production_status === 'revisi_komplain' ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' :
                                  'bg-slate-50 text-slate-500 border border-slate-200'
                                }`}>
                                  {order.production_status.replace(/_/g, ' ')}
                                </span>
                                {order.payment && (
                                  <span className="text-[9px] text-slate-400 mt-1 font-medium">
                                    Verifikasi: <b className="text-slate-600 font-semibold">{order.payment.status_verifikasi.toUpperCase()}</b>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Simulated action: customer upload pay proof if status awaits */}
                                {isAwaitingPayment && (
                                  <button
                                    onClick={() => {
                                      setPayOrderTarget(order);
                                      setPayAmountPaid(order.total_amount);
                                      setShowUploadPaymentModal(true);
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-1 rounded-lg text-[10px] cursor-pointer transition-all shadow-3xs"
                                    title="Simulasi link customer upload struk transfer"
                                  >
                                    Struk Bayar
                                  </button>
                                )}

                                {/* Compose direct WhatsApp trigger (Logic 15) */}
                                <a
                                  href={getWhatsAppLink(order)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-bold rounded-lg flex items-center gap-1 text-[10px] transition-all"
                                  title="Kirim status ke WhatsApp customer langsung"
                                >
                                  <PhoneCall className="w-3 h-3 text-emerald-600" /> WA
                                </a>

                                <button
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer transition-all shadow-3xs"
                                >
                                  Kelola
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGEMENT VERIFIKASI PEMBAYARAN REQUISITE (Logic 1, 2, 3, 4) */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">VERIFIKASI & VALIDASI PEMBAYARAN MASUK</h2>
                <p className="text-xs text-slate-500 mt-2">
                  Harap verifikasi bukti bayar yang masuk dari pelanggan. Jika disetujui, order masuk antrean produksi utama, status invoice menjadi DP/Lunas dan <b>stok kaos otomatis dipotong secara seketika!</b>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pending Verification Left Itemized List */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span>MENUNGGU VERIFIKASI PEMBAYARAN</span>
                    <span className="bg-amber-100/60 text-amber-700 font-bold text-[8.5px] px-2 py-0.5 rounded-full">
                      {orders.filter(o => o.payment && o.payment.status_verifikasi === 'menunggu_verifikasi').length} TERTUNDA
                    </span>
                  </h3>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {orders.filter(o => o.payment && o.payment.status_verifikasi === 'menunggu_verifikasi').length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        Semua pembayaran lunas/DP sudah di-verifikasi. Tidak ada antrian pembayaran tertunda!
                      </p>
                    ) : (
                      orders.filter(o => o.payment && o.payment.status_verifikasi === 'menunggu_verifikasi').map(order => (
                        <div key={order.payment?.id} className="p-4 bg-amber-50/30 border border-amber-200/50 rounded-xl space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-blue-600">{order.id}</span>
                            <span className="text-slate-450 font-bold text-[10px]">{new Date(order.payment!.payment_date).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{order.customer_name} &bull; <span className="text-slate-500">{order.customer_phone}</span></div>
                            <div className="text-slate-500 text-[10px] mt-1 line-clamp-1">{order.description}</div>
                          </div>
                          <div className="border-t border-amber-100/60 pt-2.5 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Nominal Ditransfer:</span>
                              <span className="font-black text-slate-900 text-sm">Rp {order.payment?.amount_paid.toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer transition-all shadow-3xs"
                            >
                              Tinjau Struk
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* History Verified Right Panel */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-3">
                    RIWAYAT VERIFIKASI PEMBAYARAN TERBARU
                  </h3>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {orders.filter(o => o.payment && o.payment.status_verifikasi !== 'menunggu_verifikasi').length === 0 ? (
                      <p className="text-xs text-slate-450 italic py-10 text-center bg-slate-50/50 rounded-2xl">Nol riwayat verifikasi.</p>
                    ) : (
                      orders.filter(o => o.payment && o.payment.status_verifikasi !== 'menunggu_verifikasi').map(order => (
                        <div key={order.payment?.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono text-slate-500 font-bold">{order.id}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                              order.payment?.status_verifikasi === 'disetujui' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-rose-50 text-rose-650 border border-rose-200/50'
                            }`}>
                              {order.payment?.status_verifikasi}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-450 font-medium">Penyetor:</span> <b className="text-slate-800">{order.customer_name}</b>
                            <div className="text-[11px] text-slate-800 mt-1.5 font-bold">Transfer Rp {order.payment?.amount_paid.toLocaleString()} &bull; Inv: <span className="text-blue-600">{order.invoice?.status_pembayaran.toUpperCase()}</span></div>
                          </div>
                          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex flex-col gap-1">
                            <div>Disetujui oleh: <b className="text-slate-500">{order.payment?.verified_by}</b> pada {new Date(order.payment?.verified_at || '').toLocaleDateString('id-ID')}</div>
                            {order.payment?.notes && <p className="italic text-slate-550 text-[10.5px] bg-white p-2 rounded border border-slate-200/50">"{order.payment.notes}"</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: MANAGEMENT PRODUKSI & QUALITY CONTROL (Logic 6, 7, 8) */}
          {activeTab === 'production' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">MEMPROSES KONTROL PRODUKSI & QUALITY CONTROL</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Khusus tim Produksi SCM NoiseCustom. Di sini, Anda dapat melakukan update status pengerjaan sablon fisik secara manual, mengarahkan ke divisi pemotong DTF, press sablon, memeriksa kegagalan uji mutu (QC), dan melihat log timeline produksi.
                </p>
              </div>

              {/* Grid Layout of active status for quick execution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Active orders needing process update */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
                    MONITORING STAGE PRODUKSI AKTIF
                  </h3>

                  <div className="space-y-3">
                    {priorityQueue.map(order => (
                      <div key={order.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-350 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-blue-600 block">{order.id} &bull; Inv {order.invoice?.status_pembayaran || 'No pay'}</span>
                            <b className="text-xs text-slate-800 block mt-1">{order.customer_name} &bull; <span className="text-blue-600 font-medium">{order.description}</span></b>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.production_status === 'antri_produksi' ? 'bg-amber-100 text-amber-700' :
                            order.production_status === 'cetak_dtf' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                            order.production_status === 'press_sablon' ? 'bg-purple-100 text-purple-700' :
                            order.production_status === 'quality_control' ? 'bg-orange-100 text-orange-700 font-extrabold' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.production_status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Order Designs specifics display (Logic 14) */}
                        <div className="mt-3 bg-white p-2.5 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 text-[11px]">
                          <div>
                            <span className="text-slate-405 block">Ukuran Print: <b>{order.designs?.print_size || 'Standar'}</b></span>
                            <span className="text-slate-405 block mt-0.5">Catatan Desain: <i className="text-slate-600">"{order.designs?.notes || '-'}"</i></span>
                          </div>
                          <div>
                            <span className="text-slate-405 block">Desain File: <b>{order.designs?.design_file_name || 'raw.png'}</b></span>
                            {order.designs?.design_file_url && (
                              <a href={order.designs?.design_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline block mt-0.5">
                                [Buka File &rarr;]
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Order Items list layout */}
                        <div className="mt-2 px-1 text-[11px] text-slate-500">
                          Item: {order.items?.map((it: any) => `${it.jenis_kaos} - ${it.warna} (${it.size}) x${it.quantity}`).join(', ')}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Total Tagihan: Rp {order.total_amount.toLocaleString()}</span>
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="bg-slate-900 text-white hover:bg-slate-800 font-bold py-1 px-3 rounded text-[10px]"
                          >
                            Kelola Produksi / QC &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Left side production history states logs (Logic 7) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">
                    TIMELINE PRODUCTION LOGS SCM
                  </h3>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {orders.slice(0, 8).map(ord => (
                      <div key={ord.id} className="space-y-1.5 border-b border-slate-100 pb-2">
                        <span className="text-[10px] text-blue-600 font-bold font-mono">{ord.id}</span>
                        {ord.logs?.slice(0, 3).map((log: any) => (
                          <div key={log.id} className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-sm">
                            <div className="flex justify-between font-medium text-slate-800 text-[10px]">
                              <span>Status: <b>{log.new_status}</b></span>
                              <span className="text-[9px] text-slate-400">{new Date(log.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-500 italic text-[10px] mt-0.5">"{log.note}"</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: MANAJEMEN INVENTORIS KAOS & DTF (Logic 9, 10, 11, 13) */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">AUDIT INVENTORIS & GUDANG GARMEN / DTF Film</h2>
                  <p className="text-xs text-slate-500">Stok terekam secara manual untuk deplesi DTF meteran atau restock kaos massal.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setShowDeductDtfModal(true)}
                    className="bg-slate-900 text-white font-bold py-2 px-3 rounded-lg text-xs"
                  >
                    Input Pemakaian DTF Produksi
                  </button>
                  <button
                    onClick={() => setShowAdjustStockModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs cursor-pointer"
                  >
                    Sesuaikan / Restock Kaos
                  </button>
                </div>
              </div>

              {/* Inventory warning logic triggers display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. STOK KAOS TABULAR VIEW */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">
                    GUDANG VARIETAS STOCK KAOS
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                        <tr>
                          <th className="px-3 py-2">Jenis Kaos / Warna</th>
                          <th className="px-3 py-2">Size</th>
                          <th className="px-3 py-2">Stok Aktual</th>
                          <th className="px-3 py-2">Min. Stok</th>
                          <th className="px-3 py-2">Sinyal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stockKaos.map(kaos => {
                          const isLow = kaos.stock_qty <= kaos.min_stock;
                          return (
                            <tr key={kaos.id} className={isLow ? 'bg-red-50/40 text-red-900' : 'text-slate-700'}>
                              <td className="px-3 py-2 font-medium">
                                <div>{kaos.jenis_kaos}</div>
                                <span className="text-xs font-normal text-slate-500">{kaos.warna}</span>
                              </td>
                              <td className="px-3 py-2 font-bold font-mono text-slate-800">{kaos.size}</td>
                              <td className="px-3 py-2 font-bold text-sm text-slate-900">{kaos.stock_qty} Pcs</td>
                              <td className="px-3 py-2 text-slate-400">{kaos.min_stock} Pcs</td>
                              <td className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                  isLow ? 'bg-red-200 text-red-800 animate-pulse' : 'bg-green-150 text-green-800'
                                }`}>
                                  {isLow ? 'TIPIS' : 'NORMAL'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. STOK DTF ROLL & HISTORY MANUAL AUDIT */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">
                      GUDANG ROLL FILM DTF (METERAN)
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {stockDtf.map(dtf => {
                      const isLow = dtf.stock_meter <= dtf.min_stock;
                      return (
                        <div key={dtf.id} className={`p-4 rounded-xl border ${isLow ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <b className="text-sm text-slate-800 block">{dtf.roll_name}</b>
                              <span className="text-slate-400 text-xs text-xs-italic">Batas Minimum: {dtf.min_stock} Meter</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isLow ? 'bg-red-100 text-red-700 font-extrabold' : 'bg-blue-100 text-blue-700'}`}>
                              {isLow ? 'Stok Kritis!' : 'Aman'}
                            </span>
                          </div>
                          <div className="mt-3 flex items-end justify-between">
                            <div>
                              <span className="text-[11px] text-slate-500 block">Stok Sisa SCM:</span>
                              <span className="text-3xl font-black">{dtf.stock_meter} <span className="text-sm font-normal text-slate-450">Meter</span></span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedDtfId(dtf.id);
                                setShowDeductDtfModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs select-none cursor-pointer"
                            >
                              Kurangi DTF Aktual &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DTF logs analysis */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">LOG AKTIVITAS MANAJEMEN INVENTORI TERBARU:</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {reports.dtfUsedTotal ? (
                        <div className="text-[10px] bg-blue-50 text-blue-800 p-2 rounded mb-2 font-semibold">
                          Total Pemakaian DTF Gabungan Produksi: {reports.dtfUsedTotal} Meter
                        </div>
                      ) : null}
                      <p className="text-[9px] text-slate-400 leading-tight">
                        *Sistem mencatat log in/out secara real-time untuk audit stok kaos otomatis setelah verifikasi pembayaran sukses disetujui admin.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: LAPORAN OWNER INSIGHTS & BOTTLENECK ANALYSIS (Logic 11) */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
                      {/* Strategic Layout Header Profile */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9.5px] uppercase font-bold tracking-widest text-blue-450 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                    Sistem Kontrol Eksekutif Staf
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white mt-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" /> LAPORAN ANALISIS STRATEGIS OWNER
                  </h3>
                  <p className="text-[11px] text-slate-450 leading-relaxed max-w-2xl">
                    Tinjau realisasi total omzet, tingkat efektivitas penyerapan bahan baku roll DTF manual, sisa kapasitas kaus di gudang, serta penanggulangan hambatan kemacetan operasional di bawah ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white hover:text-white shrink-0 self-start sm:self-auto cursor-pointer transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-500/30 border border-blue-500"
                >
                  <FileDown className="w-4 h-4 shrink-0" /> Unduh Laporan PDF
                </button>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block">Pemasukan Kas (Omzet Realized)</span>
                    <h2 className="text-2xl font-black">Rp {reports.totalOmzet?.toLocaleString() || '0'}</h2>
                    <p className="text-[10px] text-slate-500 leading-tight">Total pembayaran dari customer yang statusnya valid / disetujui staf.</p>
                  </div>
                </div>

                <div className="bg-zinc-100 border border-zinc-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
                  <div className="relative z-10 space-y-2 text-slate-800">
                    <Layers className="w-8 h-8 text-blue-600" />
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold block">Kapasitas Kerja Terpasang</span>
                    <h2 className="text-2xl font-black">{reports.totalOrders || '0'} Order Terdaftar</h2>
                    <p className="text-[10px] text-zinc-500 leading-tight">Mencakup order antre produksi, cetak dtf, revisi, hingga selesai.</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
                  <div className="relative z-10 space-y-2 text-slate-800">
                    <Package className="w-8 h-8 text-blue-600" />
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold block">Material Consumed (DTF Film)</span>
                    <h2 className="text-2xl font-black">{reports.dtfUsedTotal || '0'} Meter</h2>
                    <p className="text-[10px] text-slate-400 leading-tight">Panjang film dtf yang telah terpakai/dipotong manual oleh tim produksi.</p>
                  </div>
                </div>
              </div>

              {/* Recharts Analytics Visualization Section (User Request Component) */}
              <div id="recharts-analytics-dashboard" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Monthly Omzet Trend Chart Card */}
                <div id="monthly-revenue-trend-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" /> TREN OMZET BULANAN (PEMASUKAN KAS)
                      </h3>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Historical & Live</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Realisasi total omzet dari transaksi pembayaran disetujui staf dibandingkan target SCM.</p>
                  </div>

                  <div className="h-72 w-full pt-1">
                    {reports.monthlyRevenueTrends && reports.monthlyRevenueTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={reports.monthlyRevenueTrends}
                          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}J`}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs space-y-1 text-white">
                                    <p className="font-extrabold text-slate-200">{label}</p>
                                    <p className="text-blue-400 font-bold flex items-center justify-between gap-6">
                                      <span>Omzet:</span>
                                      <span>Rp {payload[0].value?.toLocaleString('id-ID')}</span>
                                    </p>
                                    {payload[1] && (
                                      <p className="text-emerald-400 font-bold flex items-center justify-between gap-6">
                                        <span>Target:</span>
                                        <span>Rp {payload[1].value?.toLocaleString('id-ID')}</span>
                                      </p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={32} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Area 
                            name="Omzet Realisasi" 
                            type="monotone" 
                            dataKey="omzet" 
                            stroke="#2563eb" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#omzetGradient)" 
                          />
                          <Area 
                            name="Target Bulanan" 
                            type="monotone" 
                            dataKey="target" 
                            stroke="#10b981" 
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            fill="none" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                        Data keuangan tidak tersedia
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Production Performance Comparison Chart Card */}
                <div id="division-performance-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" /> PERBANDINGAN PERFORMA PRODUKSI ANTAR DIVISI
                      </h3>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">SLA & Output</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Total order masuk (beban antrean) vs jumlah order berhasil lolos proses per stasiun divisi.</p>
                  </div>

                  <div className="h-72 w-full pt-1">
                    {reports.divisionPerformance && reports.divisionPerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reports.divisionPerformance}
                          layout={isMobile ? "vertical" : "horizontal"}
                          margin={isMobile ? { top: 10, right: 10, left: 40, bottom: 5 } : { top: 10, right: 10, left: 10, bottom: 5 }}
                          barGap={isMobile ? 0 : 4}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={isMobile} horizontal={!isMobile} stroke="#f1f5f9" />
                          {isMobile ? (
                            <>
                              <XAxis 
                                type="number"
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                type="category"
                                dataKey="name" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false}
                                axisLine={false}
                                width={85}
                              />
                            </>
                          ) : (
                            <>
                              <XAxis 
                                type="category"
                                dataKey="name" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val}`}
                              />
                            </>
                          )}
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs space-y-1 text-white">
                                    <p className="font-extrabold text-slate-200">{label}</p>
                                    <p className="text-blue-400 font-bold flex items-center justify-between gap-6">
                                      <span>Beban Kerja:</span>
                                      <span>{payload[0].value} Order</span>
                                    </p>
                                    {payload[1] && (
                                      <p className="text-slate-400 font-bold flex items-center justify-between gap-6">
                                        <span>Selesai:</span>
                                        <span>{payload[1].value} Order</span>
                                      </p>
                                    )}
                                    {payload[2] && (
                                      <p className="text-emerald-400 font-bold flex items-center justify-between gap-6 pt-1 border-t border-slate-800">
                                        <span>Efisiensi:</span>
                                        <span>{payload[2].value}%</span>
                                      </p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={32} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Bar name="Beban Kerja (Masuk)" dataKey="Beban Kerja" fill="#1e3a8a" stackId="a" radius={isMobile ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={isMobile ? 12 : 25} />
                          <Bar name="Selesai Diproses" dataKey="Selesai" fill="#3b82f6" stackId="a" radius={isMobile ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={isMobile ? 12 : 25} />
                          <Bar name="Persentase Efisiensi" dataKey="Persentase Efisiensi" fill="#10b981" stackId="b" radius={isMobile ? [0, 3, 3, 0] : [3, 3, 0, 0]} maxBarSize={isMobile ? 8 : 12} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                        Data performa tidak tersedia
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottleneck Order chart (Logic 11 & 17) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" /> GRAFIK PEMETAAN BOTTLENECK PRODUKSI AKTIF
                  </h3>
                  <p className="text-[11px] text-slate-400">Total akumulasi order per tingkat proses. Bagian dengan bar tertinggi adalah penyumbat laju rantai produksi!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* CSS Styled Graphic chart bars */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {['antri_produksi', 'cetak_dtf', 'press_sablon', 'quality_control', 'packing', 'revisi_komplain'].map(stage => {
                      const count = reports.bottleneckCounts?.[stage] || 0;
                      // Max percentage safety prevent division by 0
                      const maxTotal = Math.max(...Object.values(reports.bottleneckCounts || {}).map((v: any) => Number(v)), 1);
                      const percent = (count / maxTotal) * 105;
                      return (
                        <div key={stage} className="space-y-1 text-xs">
                          <div className="flex justify-between text-[11px] text-slate-600 font-semibold uppercase">
                            <span>{stage.replace(/_/g, ' ')}</span>
                            <span className="font-bold text-slate-900">{count} Pesanan</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                stage === 'revisi_komplain' ? 'bg-red-500' :
                                stage === 'antri_produksi' ? 'bg-amber-500' :
                                stage === 'press_sablon' ? 'bg-purple-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Owner diagnostic verdict Card */}
                  <div className="bg-slate-900 text-white p-5 rounded-xl space-y-4 shadow-md">
                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-blue-400">Diagnotis & Verifikasi Owner:</h4>
                    
                    <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Titik Bottleneck Tertinggi saat ini:</span>
                      <b className="text-lg text-rose-400 block mt-1">{reports.highestBottleneck || 'Normal'}</b>
                      <p className="text-xs text-slate-300 mt-2 leading-tight">
                        Divisi ini menampung antrean terbesar ({reports.highestBottleneckCount || 0} unit order/desain didalamnya). Direcommondasikan menambah shift staf produksi atau melakukan pemeliharaan mesin sablon terkait.
                      </p>
                    </div>

                    <p className="text-[10px] text-slate-500 italic">
                      Laporan diagnostik di atas ditarik langsung dari parameter data database `db_noisecustom_scm.json` SCM.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DATA CUSTOMERS (CRM) */}
          {activeTab === 'customers' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">DIREKTORI PELANGGAN SCM</h3>
                  <p className="text-[10px] text-slate-400">Total customer terintegrasi dalam pipeline order.</p>
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-white bg-blue-600 hover:bg-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                >
                  + Tambah Customer Baru
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3">Nama Lengkap</th>
                      <th className="px-4 py-3">No. WhatsApp</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Alamat Kirim</th>
                      <th className="px-4 py-3">Registrasi Pada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map(cust => (
                      <tr key={cust.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{cust.name}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          <a href={`https://wa.me/${cust.phone.replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 flex items-center gap-1 hover:underline">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> {cust.phone} [WA]
                          </a>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{cust.email || '-'}</td>
                        <td className="px-4 py-3 text-slate-500 font-medium max-w-sm">{cust.address || '-'}</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(cust.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* --- SIDE DETAILS DRAWER MODAL (ACTIVE OPERATIONAL CONTROLS) --- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col p-6 space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] text-blue-600 font-bold font-mono">DETAIL OPERASIONAL SCM:</span>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{selectedOrderDetails.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md text-sm font-bold"
              >
                Tutup [X]
              </button>
            </div>

            {/* Customer & Info Display */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-black block">INFORMASI PELANGGAN & OPERASI</span>
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Nama Customer:</span>
                  <b className="text-slate-800 text-sm block">{selectedOrderDetails.customer_name}</b>
                  <span className="text-slate-500 font-medium">{selectedOrderDetails.customer_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Metode Bayar:</span>
                  <b className="text-slate-700 block">{selectedOrderDetails.invoice?.payment_method || 'Transfer BCA'}</b>
                  <span className="text-slate-500 block">Jatuh Tempo: {selectedOrderDetails.invoice?.due_date}</span>
                </div>
              </div>
            </div>

            {/* --- VISUAL TIMELINE PROGRESS BAR & ESTIMASI SISA WAKTU (User Request) --- */}
            {(() => {
              const currentStatus = selectedOrderDetails.production_status || 'antri_produksi';
              
              const steps = [
                { id: 'antri_produksi', num: 1, label: 'Antri Produksi', pct: 15, duration: '4-6 Jam', detail: 'Menunggu alokasi antrean pencetakan (FIFO)', activeColor: 'bg-amber-500 text-amber-600' },
                { id: 'cetak_dtf', num: 2, label: 'Cetak DTF', pct: 35, duration: '3-4 Jam', detail: 'Pencetakan desain ke film PET Transfer', activeColor: 'bg-blue-600 text-blue-600' },
                { id: 'press_sablon', num: 3, label: 'Press Sablon', pct: 55, duration: '2-3 Jam', detail: 'Pemindahan sablon ke kaos dng thermal press', activeColor: 'bg-purple-600 text-purple-600' },
                { id: 'quality_control', num: 4, label: 'Quality Control', pct: 75, duration: '1-1.5 Jam', detail: 'Uji ketahanan mutu jaminan NoiseCustom', activeColor: 'bg-sky-600 text-sky-600' },
                { id: 'packing', num: 5, label: 'Packing', pct: 90, duration: '30 Menit', detail: 'Pemberian tag, pengemasan, & label kurir', activeColor: 'bg-teal-600 text-teal-600' },
                { id: 'selesai', num: 6, label: 'Selesai', pct: 100, duration: 'Selesai!', detail: 'Pesanan telah selesai & siap diserahkan/dikirim', activeColor: 'bg-emerald-600 text-emerald-600' }
              ];

              let displayPct = 0;
              let currentStepIndex = -1;
              let currentDuration = 'Selesai!';
              let stepExplanation = '';
              let badgeText = 'Proses Normal';
              let badgeColor = 'bg-blue-50 border-blue-200 text-blue-700';

              if (currentStatus === 'revisi_komplain') {
                displayPct = 60;
                currentStepIndex = 2.5; 
                currentDuration = '45 Menit';
                stepExplanation = 'Order masuk tahap REVISI / PERBAIKAN sablon ulang karena terindikasi gagal lolos mutu QC sebelumnya.';
                badgeText = 'Revisi Komplain (Prioritas)';
                badgeColor = 'bg-rose-50 border-rose-100 text-rose-700';
              } else {
                const targetStep = steps.find(s => s.id === currentStatus);
                if (targetStep) {
                  displayPct = targetStep.pct;
                  currentStepIndex = steps.indexOf(targetStep);
                  currentDuration = targetStep.duration;
                  stepExplanation = targetStep.detail;
                } else {
                  displayPct = 5;
                  currentStepIndex = -1;
                  currentDuration = 'Menunggu Pembayaran';
                  stepExplanation = 'Menunggu penyetoran bukti transfer & persetujuan keuangan sebelum dialokasikan ke antrean cetak.';
                  badgeText = 'Menunggu Verifikasi';
                  badgeColor = 'bg-amber-50 border-amber-100 text-amber-700';
                }
              }

              return (
                <div id="dynamic-production-tracker" className="p-4 rounded-xl border border-slate-200 space-y-4 bg-slate-50/70">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-blue-600" /> TIMELINE & ESTIMASI PRODUKSI SCM
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Estimated remaining countdown banner component */}
                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-150 shadow-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] text-slate-400 uppercase block font-semibold">Estimasi Sisa Pengerjaan</span>
                      <div className="flex items-center gap-1 text-slate-800 font-black">
                        <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-xs uppercase font-extrabold">{currentDuration}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[9.5px] text-slate-400 uppercase block font-semibold">Progress Tahap</span>
                      <div className="text-xs font-black text-blue-600">
                        {displayPct}% Rampung
                      </div>
                    </div>
                  </div>

                  {/* Custom CSS animated shimmer progress tracking line */}
                  <div className="relative pt-1">
                    <div id="timeline-rail" className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative border border-slate-300/40">
                      
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-blue-700 relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${displayPct}%` }}
                        transition={{ duration: 0.95, ease: "easeOut" }}
                      >
                        {/* Shimmer overlay class dynamically loaded from global CSS */}
                        <div className="absolute inset-x-0 top-0 bottom-0 w-24 h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.45)_50%,transparent_100%)] animate-shimmer"></div>
                      </motion.div>

                    </div>
                  </div>

                  {/* Horizontal visual checkpoint steps list */}
                  <div className="grid grid-cols-6 gap-0.5 relative pt-1">
                    {steps.map((st, sIdx) => {
                      const isCompleted = sIdx < currentStepIndex;
                      const isActive = sIdx === currentStepIndex;

                      return (
                        <div key={st.id} className="flex flex-col items-center text-center space-y-1">
                          <div className="relative">
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all duration-300 ${isCompleted ? 'bg-blue-600 border-blue-600 text-white shadow-xs' : isActive ? 'bg-blue-50 border-blue-505 text-blue-600 ring-3 ring-blue-500/20 font-black' : 'bg-white border-slate-200 text-slate-400'}`}>
                              {isCompleted ? '✓' : st.num}
                            </div>
                            {isActive && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                              </span>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <span className={`text-[8.5px] font-extrabold block truncate max-w-[65px] ${isActive ? 'text-blue-600 font-black' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                              {st.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Descriptive message box */}
                  <div className="p-3 rounded-lg bg-white border border-slate-150 text-slate-600 text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-700 uppercase block mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Status Operasional Produksi:
                    </span>
                    <p className="font-normal text-slate-600">{stepExplanation}</p>
                  </div>
                </div>
              );
            })()}

            {/* Design & Print Specifications */}
            <div className="border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-blue-600 uppercase font-black block">BERKAS DESAIN & FILE ORDER (DIREKTORI SCM)</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  Ukuran: {selectedOrderDetails.designs?.print_size || 'N/A'}
                </span>
              </div>

              {selectedOrderDetails.designs?.design_file_url && (
                <div className="relative rounded-lg overflow-hidden border border-slate-150 h-44 bg-slate-150 max-w-sm mx-auto">
                  <img src={selectedOrderDetails.designs.design_file_url} className="w-full h-full object-cover" alt="Custom Design layout" />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-2 text-[10px] text-white flex justify-between">
                    <span>File: {selectedOrderDetails.designs.design_file_name}</span>
                    <a href={selectedOrderDetails.designs.design_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-300 font-bold hover:underline">Full-res &rarr;</a>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded">
                <b>Catatan layout desain:</b> "{selectedOrderDetails.designs?.notes || 'Tidak ada catatan khusus.'}"
              </p>
            </div>

            {/* Tagged Items breakdown and Total price */}
            <div className="border border-slate-200 p-4 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">DAFTAR PILIHAN KAOS CUSTOM</span>
              <div className="space-y-1.5 text-xs text-slate-700">
                {selectedOrderDetails.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                    <span>{item.jenis_kaos} - {item.warna} (Size {item.size})</span>
                    <b className="text-slate-900">Qty: {item.quantity} Pcs &bull; Rp {item.subtotal.toLocaleString()}</b>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-black pt-2 text-blue-600 border-t border-dashed border-slate-200">
                  <span>GRAND TOTAL TAGIHAN:</span>
                  <span>Rp {selectedOrderDetails.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Verification Card (Strict Admin access logic 2 & 3 & 4) */}
            {selectedOrderDetails.payment && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                <span className="text-[10px] text-amber-700 uppercase font-black block">TINJAUAN BUKTI TRANSFER (ADMIN/OWNER ONLY)</span>
                
                <div className="text-xs space-y-1">
                  <div>Pembayaran Yang Disetor: <b>Rp {selectedOrderDetails.payment?.amount_paid?.toLocaleString()}</b></div>
                  <div>Status Verifikasi SCM: <span className="uppercase font-bold text-blue-600">{selectedOrderDetails.payment?.status_verifikasi}</span></div>
                  {selectedOrderDetails.payment?.notes && <p className="italic text-slate-600 p-1.5 bg-white border border-slate-150 rounded">Catatan Penyetor: "{selectedOrderDetails.payment.notes}"</p>}
                </div>

                {selectedOrderDetails.payment?.payment_proof_url && (
                  <div className="relative rounded-lg overflow-hidden border max-w-xs h-36 bg-slate-200">
                    <img src={selectedOrderDetails.payment.payment_proof_url} className="w-full h-full object-cover" alt="Proof of payment transfer slip" />
                    <a href={selectedOrderDetails.payment.payment_proof_url} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-1 px-1.5 bg-slate-900/80 text-white rounded text-[8px]">
                      Struk Ukuran Asli
                    </a>
                  </div>
                )}

                {/* Approve/Reject CTA only if waiting verification (Logic 3 & 4) */}
                {selectedOrderDetails.payment?.status_verifikasi === 'menunggu_verifikasi' ? (
                  <div>
                    {activeRole === 'produksi' ? (
                      <p className="text-[10px] text-slate-400 italic">
                        *Anda log-in sebagai PROD. Verifikasi keuangan hanya dapat dilakukan oleh Admin SCM atau Owner.
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyPayment(selectedOrderDetails.payment.id, 'disetujui', 'Bukti bayar lunas valid. Sistem SCM setujui.')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded shadow text-center"
                        >
                          SETUJUI (DP / Lunas + Auto Potong Kaos)
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Masukkan alasan penolakan pembayaran:");
                            if (reason !== null) {
                              handleVerifyPayment(selectedOrderDetails.payment.id, 'ditolak', reason || "Bukti transfer pudar atau tidak valid.");
                            }
                          }}
                          className="bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded"
                        >
                          TOLAK
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-500">
                    Selesai diproses oleh <b>{selectedOrderDetails.payment?.verified_by || 'Sistem'}</b>.
                  </div>
                )}
              </div>
            )}

            {/* Production Status Step Updates (Action logic 6) */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-black block">KONTROL UPDATE PROGRESS PRODUKSI</span>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'antri_produksi', label: '1. Antri Produksi' },
                  { value: 'cetak_dtf', label: '2. Cetak DTF' },
                  { value: 'press_sablon', label: '3. Press Sablon' },
                  { value: 'quality_control', label: '4. Quality Control' },
                  { value: 'packing', label: '5. Packing' },
                  { value: 'selesai', label: '6. Selesai' }
                ].map(item => (
                  <button
                    key={item.value}
                    onClick={() => {
                      const note = prompt(`Tambahkan catatan progress untuk status ${item.label.toUpperCase()}:`);
                      if (note !== null) {
                        handleUpdateProductionStatus(selectedOrderDetails.id, item.value, note);
                      }
                    }}
                    className={`py-1.5 px-2.5 rounded font-bold text-left text-[11px] transition-all border ${
                      selectedOrderDetails.production_status === item.value
                        ? 'bg-blue-600 border-blue-600 text-white shadow'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label} {selectedOrderDetails.production_status === item.value ? '✓' : ''}
                  </button>
                ))}
              </div>

              {/* Special QC check trigger (Action logic 8) */}
              <div className="border-t border-slate-100 pt-3.5 space-y-2">
                <span className="text-[10px] text-blue-600 uppercase font-black block">PENGUKURAN MUTU & REVISI (QUALITY CONTROL CHECK)</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleQCCheck(selectedOrderDetails.id, 'lolos', 'Mutu lolos verifikasi standar NoiseCustom!');
                    }}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-1.5 rounded-md text-center"
                  >
                    Lolos QC (Majukan ke Packing)
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt("Tuliskan catatan detail revisi kerusakan:");
                      if (notes !== null) {
                        handleQCCheck(selectedOrderDetails.id, 'tidak_lolos', notes || "Gagal QC: Sablon buram.");
                      }
                    }}
                    className="flex-1 bg-red-650 bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 rounded-md text-center"
                  >
                    Tolak QC (Kembali Revisi)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- ADD CUSTOMER MODAL --- */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomer} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">DAFTARKAN PELANGGAN BARU (SCM CRM)</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-505 font-bold block">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rizky Wijaya"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-505 font-bold block">No. WhatsApp / HP:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 081299998888"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-505 font-bold block">Email Pelanggan (Optional):</label>
                <input
                  type="email"
                  placeholder="e.g. rizky@gmail.com"
                  value={newCustEmail}
                  onChange={e => setNewCustEmail(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-505 font-bold block">Alamat Pengiriman Cargo:</label>
                <textarea
                  placeholder="Tulis alamat kirim lengkap"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-5 h-20"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-750 p-2 text-xs font-bold rounded-lg"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 text-xs font-bold rounded-lg shadow cursor-pointer"
              >
                Simpan Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAMBAH ORDER SIMULASI MODAL --- */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddOrder} className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm border-b border-slate-100 pb-2">
              SIMULATOR REGISTRASI ORDER BARU PELANGGAN
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Pilih Customer:</label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Judul Pekerjaan Custom:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kaos Gathering Kantor 10 Varian"
                    value={orderDesc}
                    onChange={e => setOrderDesc(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold block">Ukuran Print DTF:</label>
                    <select value={orderPrintSize} onChange={e => setOrderPrintSize(e.target.value)} className="w-full p-2 border rounded-lg">
                      <option value="A3">A3 Premium</option>
                      <option value="A4">A4 Medium</option>
                      <option value="A5">A5 Emblem</option>
                      <option value="1 Meter">Panjang 1 Meter</option>
                      <option value="2 Meter">Panjang 2 Meter</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold block">Metode Bayar:</label>
                    <select value={orderPaymentMethod} onChange={e => setOrderPaymentMethod(e.target.value)} className="w-full p-2 border rounded-lg">
                      <option value="Transfer BCA">Transfer BCA</option>
                      <option value="Transfer Mandiri">Transfer Mandiri</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Link File Desain:</label>
                  <input
                    type="text"
                    value={orderDesignUrl}
                    onChange={e => setOrderDesignUrl(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Catatan Pengerjaan Sablon:</label>
                  <textarea
                    placeholder="Warna cerah, press halus tebal"
                    value={orderRemarks}
                    onChange={e => setOrderRemarks(e.target.value)}
                    className="w-full p-2 border rounded-lg h-14"
                  />
                </div>
              </div>

              {/* Items Table inputs */}
              <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-205">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Pilih Jenis & Warna Kaos (Gudang)</span>
                  <button type="button" onClick={addOrderItemRow} className="text-[10px] text-blue-600 font-bold uppercase hover:underline cursor-pointer">
                    + Tambah Item
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {orderItemsInput.map((row, idx) => (
                    <div key={idx} className="p-2 border border-slate-200 rounded-md bg-white space-y-1.5 relative">
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <input
                          type="text"
                          placeholder="Cotton Combed 30s"
                          value={row.jenis_kaos}
                          onChange={e => updateOrderItemRow(idx, 'jenis_kaos', e.target.value)}
                          className="p-1 border rounded"
                        />
                        <input
                          type="text"
                          placeholder="Hitam"
                          value={row.warna}
                          onChange={e => updateOrderItemRow(idx, 'warna', e.target.value)}
                          className="p-1 border rounded"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        <select
                          value={row.size}
                          onChange={e => updateOrderItemRow(idx, 'size', e.target.value)}
                          className="p-1 border rounded"
                        >
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={row.quantity}
                          onChange={e => updateOrderItemRow(idx, 'quantity', Number(e.target.value))}
                          className="p-1 border rounded"
                        />
                        <input
                          type="number"
                          placeholder="Harga Satuan"
                          value={row.unit_price}
                          onChange={e => updateOrderItemRow(idx, 'unit_price', Number(e.target.value))}
                          className="p-1 border rounded text-right"
                        />
                      </div>

                      {orderItemsInput.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrderItemRow(idx)}
                          className="absolute text-[9px] -top-1.5 -right-1 text-red-500 font-extrabold"
                        >
                          [X]
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400">
                  *Setelah order disubmit dengan status 'Menunggu Pembayaran', Anda dapat meregistrasikan pembayaran (DP/Lunas) agar sistem otomatis mengurangi stok kaos sesuai pesanan.
                </div>
              </div>

            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddOrderModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold shadow cursor-pointer"
              >
                Kirim Pembukuan Order Pelanggan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- RE-UPLOAD / UPLOAD PAYMENT SIMULATOR MODAL --- */}
      {showUploadPaymentModal && payOrderTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUploadPayment} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
              SIMULATOR CUSTOMER: UNGGAH BUKTI BAYAR
            </h3>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mensimulasikan portal customer NoiseCustom Studio ketika melakukan transfer bank dan mengupload struk fisik ke dashboard admin.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Sisa Tagihan Tagged:</span>
                <b className="text-blue-600 text-sm">Rp {payOrderTarget.total_amount.toLocaleString()}</b>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Nominal Ditransfer (Rp):</label>
                <input
                  type="number"
                  required
                  value={payAmountPaid}
                  onChange={e => setPayAmountPaid(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Masukkan URL Foto Resi Transfer:</label>
                <input
                  type="text"
                  required
                  value={payProofUrl}
                  onChange={e => setPayProofUrl(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Tulis Catatan Transfer (Optional):</label>
                <textarea
                  placeholder="Transfer lunas dari rekening BCA an Ahmad"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg h-16"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPayOrderTarget(null);
                  setShowUploadPaymentModal(false);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold shadow"
              >
                Simpan & Upload Transferan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- DEDUCT DTF ROLL MANUAL MODAL (Logic 10) --- */}
      {showDeductDtfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleDeductDTF} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
              INPUT POTONG STOK DTF MANUAL (TIM PRODUKSI)
            </h3>

            <p className="text-[11px] text-slate-500">
              Tim Produksi dapat memotong stok DTF per roll secara desimal berdasarkan meter aktual yang di-press ke kaos sablon.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Pilih Roll DTF Gudang:</label>
                <select
                  value={selectedDtfId}
                  onChange={e => setSelectedDtfId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                >
                  {stockDtf.map(d => (
                    <option key={d.id} value={d.id}>{d.roll_name} (Sisa: {d.stock_meter} Meter)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-550 font-bold block">Aksi Stok:</label>
                  <select
                    value={adjDtfType}
                    onChange={e => setAdjDtfType(e.target.value as any)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="out">Potong Produksi (Out)</option>
                    <option value="in">Restock Tambahan (In)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-550 font-bold block">Panjang Meter:</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={adjDtfMeters}
                    onChange={e => setAdjDtfMeters(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Alasan / Catatan Audit:</label>
                <input
                  type="text"
                  required
                  placeholder="Pemakaian cetak 8 meter reuni"
                  value={adjDtfNote}
                  onChange={e => setAdjDtfNote(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeductDtfModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-bold"
              >
                Simpan Transaksi Stok DTF
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- AUDIT / RESTOCK KAOS MODAL --- */}
      {showAdjustStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAdjustKaosStock} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
              SESUAIKAN / RESTOCK AUDIT KAOS GUDANG
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Pilih Varian Kaos Di Gudang:</label>
                <select
                  value={selectedStockKaosId}
                  onChange={e => setSelectedStockKaosId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                >
                  {stockKaos.map(sk => (
                    <option key={sk.id} value={sk.id}>
                      {sk.jenis_kaos} &bull; {sk.warna} &bull; Size {sk.size} (Sisa: {sk.stock_qty} Pcs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-550 font-bold block">Tipe Penyesuaian:</label>
                  <select
                    value={adjKaosType}
                    onChange={e => setAdjKaosType(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="in">Audit Masuk / Tambah (+)</option>
                    <option value="out">Audit Keluar / Buang (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-550 font-bold block">Kuantitas (Pcs):</label>
                  <input
                    type="number"
                    required
                    value={adjKaosQty}
                    onChange={e => setAdjKaosQty(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Catatan Log Audit Kaos:</label>
                <input
                  type="text"
                  required
                  placeholder="Restock kiriman dari supplier garmen"
                  value={adjKaosNote}
                  onChange={e => setAdjKaosNote(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdjustStockModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold shadow cursor-pointer"
              >
                Simpan Log Audit Kaos
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
