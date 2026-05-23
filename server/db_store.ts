/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  User,
  Customer,
  Order,
  OrderItem,
  OrderDesign,
  Invoice,
  Payment,
  StockKaos,
  StockKaosLog,
  StockDtf,
  StockDtfLog,
  ProductionLog,
  QualityControl,
  Notification,
  ProductionStatus,
  PaymentStatus
} from '../src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'db_noisecustom_scm.json');

interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  orders: Order[];
  order_items: OrderItem[];
  order_designs: OrderDesign[];
  invoices: Invoice[];
  payments: Payment[];
  stock_kaos: StockKaos[];
  stock_kaos_logs: StockKaosLog[];
  stock_dtf: StockDtf[];
  stock_dtf_logs: StockDtfLog[];
  production_logs: ProductionLog[];
  quality_controls: QualityControl[];
  notifications: Notification[];
}

// Seed Data
const getInitialSeed = (): DatabaseSchema => {
  const users: User[] = [
    { id: 'usr-1', username: 'admin', name: 'Admin SCM', role: 'admin' },
    { id: 'usr-2', username: 'owner', name: 'Owner NoiseCustom', role: 'owner' },
    { id: 'usr-3', username: 'produksi', name: 'Tim Produksi', role: 'produksi' }
  ];

  const customers: Customer[] = [
    { id: 'cust-1', name: 'Ahmad Fauzi', phone: '081234567890', email: 'ahmad.f@gmail.com', address: 'Jl. Merdeka No. 10, Jakarta Selatan', created_at: '2026-05-10T10:00:00Z' },
    { id: 'cust-2', name: 'Siti Aminah', phone: '085712345678', email: 'siti.aminah@yahoo.com', address: 'Jl. Dago No. 42, Bandung', created_at: '2026-05-12T11:30:00Z' },
    { id: 'cust-3', name: 'Budi Santoso', phone: '089876543210', email: 'budi.s@outlook.com', address: 'Jl. Malioboro No. 5, Yogyakarta', created_at: '2026-05-15T14:20:00Z' }
  ];

  const stock_kaos: StockKaos[] = [
    { id: 'sk-1', jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'S', stock_qty: 45, min_stock: 10 },
    { id: 'sk-2', jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'M', stock_qty: 120, min_stock: 15 },
    { id: 'sk-3', jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'L', stock_qty: 140, min_stock: 15 },
    { id: 'sk-4', jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'XL', stock_qty: 2, min_stock: 10 }, // Warning!
    { id: 'sk-5', jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'XXL', stock_qty: 25, min_stock: 5 },
    { id: 'sk-6', jenis_kaos: 'Cotton Combed 30s', warna: 'Putih', size: 'M', stock_qty: 85, min_stock: 10 },
    { id: 'sk-7', jenis_kaos: 'Cotton Combed 30s', warna: 'Putih', size: 'L', stock_qty: 90, min_stock: 10 },
    { id: 'sk-8', jenis_kaos: 'Cotton Combed 30s', warna: 'Putih', size: 'XL', stock_qty: 4, min_stock: 10 }, // Warning!
    { id: 'sk-9', jenis_kaos: 'Cotton Combed 30s', warna: 'Navy', size: 'M', stock_qty: 55, min_stock: 10 },
    { id: 'sk-10', jenis_kaos: 'Cotton Combed 30s', warna: 'Navy', size: 'L', stock_qty: 70, min_stock: 10 },
    { id: 'sk-11', jenis_kaos: 'Cotton Combed 24s', warna: 'Hitam', size: 'L', stock_qty: 60, min_stock: 10 },
    { id: 'sk-12', jenis_kaos: 'Cotton Combed 24s', warna: 'Hitam', size: 'XL', stock_qty: 35, min_stock: 10 },
    { id: 'sk-13', jenis_kaos: 'Cotton Bamboo 30s', warna: 'Merah', size: 'M', stock_qty: 22, min_stock: 5 },
    { id: 'sk-14', jenis_kaos: 'Cotton Bamboo 30s', warna: 'Hitam', size: 'L', stock_qty: 0, min_stock: 5 } // Warning!
  ];

  const stock_kaos_logs: StockKaosLog[] = [
    { id: 'skl-1', stock_kaos_id: 'sk-1', jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'S', type: 'in', qty: 50, note: 'Stock awal dari supplier', created_at: '2026-05-10T08:00:00Z', created_by: 'Admin SCM' },
    { id: 'skl-2', stock_kaos_id: 'sk-4', jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'XL', type: 'in', qty: 20, note: 'Stock awal dari supplier', created_at: '2026-05-10T08:00:00Z', created_by: 'Admin SCM' }
  ];

  const stock_dtf: StockDtf[] = [
    { id: 'sd-1', roll_name: 'Roll Premium DTF 60cm', stock_meter: 45.5, min_stock: 10.0, price_per_meter: 75000 },
    { id: 'sd-2', roll_name: 'Roll Standar DTF 30cm', stock_meter: 4.2, min_stock: 8.0, price_per_meter: 40000 } // Warning!
  ];

  const stock_dtf_logs: StockDtfLog[] = [
    { id: 'sdl-1', stock_dtf_id: 'sd-1', roll_name: 'Roll Premium DTF 60cm', type: 'in', meters: 50, note: 'Beli roll baru ukuran 60cm', created_at: '2026-05-09T09:00:00Z', created_by: 'Admin SCM' },
    { id: 'sdl-2', stock_dtf_id: 'sd-1', roll_name: 'Roll Premium DTF 60cm', type: 'out', meters: 4.5, note: 'Pemakaian produksi Order ORD-20260519-999', created_at: '2026-05-19T14:00:00Z', created_by: 'Tim Produksi' },
    { id: 'sdl-3', stock_dtf_id: 'sd-2', roll_name: 'Roll Standar DTF 30cm', type: 'in', meters: 10, note: 'Stok awal 30cm', created_at: '2026-05-09T09:00:00Z', created_by: 'Admin SCM' },
    { id: 'sdl-4', stock_dtf_id: 'sd-2', roll_name: 'Roll Standar DTF 30cm', type: 'out', meters: 5.8, note: 'Pemakaian manual produksi', created_at: '2026-05-18T10:00:00Z', created_by: 'Tim Produksi' }
  ];

  // 1. Order 1: Menunggu Verifikasi Pembayaran (Oldest)
  const ord1_id = 'ORD-20260520-001';
  const inv1_id = 'INV-20260520-001';
  const pay1_id = 'PAY-20260520-001';

  // 2. Order 2: Antri Produksi (Lunas, Priority 1)
  const ord2_id = 'ORD-20260521-001';
  const inv2_id = 'INV-20260521-001';
  const pay2_id = 'PAY-20260521-001';

  // 3. Order 3: Cetak DTF (Lunas, Priority 2)
  const ord3_id = 'ORD-20260522-001';
  const inv3_id = 'INV-20260522-001';
  const pay3_id = 'PAY-20260522-001';

  // 4. Order 4: Quality Control (Lunas, Priority 3)
  const ord4_id = 'ORD-20260522-002';
  const inv4_id = 'INV-20260522-002';
  const pay4_id = 'PAY-20260522-002';

  // 5. Order 5: Revisi Komplain (QC Gagal, Status DP, Priority 4)
  const ord5_id = 'ORD-20260522-003';
  const inv5_id = 'INV-20260522-003';
  const pay5_id = 'PAY-20260522-003';

  // 6. Order 6: Selesai (Completed, 100% lunas)
  const ord6_id = 'ORD-20260519-999';
  const inv6_id = 'INV-20260519-999';
  const pay6_id = 'PAY-20260519-999';

  const orders: Order[] = [
    {
      id: ord6_id,
      customer_id: 'cust-2',
      invoice_id: inv6_id,
      order_date: '2026-05-19T09:15:00Z',
      total_amount: 260000,
      description: 'Pembuatan Kaos Komunitas Reuni Lulusan L',
      production_status: 'selesai',
      remarks: 'Harap dikirim memakai paket instan GoSend',
      created_at: '2026-05-19T09:15:00Z'
    },
    {
      id: ord1_id,
      customer_id: 'cust-1',
      invoice_id: inv1_id,
      order_date: '2026-05-20T10:30:00Z',
      total_amount: 600000,
      description: 'Sablon Kaos Desain Logo Depan A3',
      production_status: 'menunggu_verifikasi_pembayaran',
      remarks: 'Pakai kaos Cotton Combed 30s Hitam L, sablon harus tebal',
      created_at: '2026-05-20T10:30:00Z'
    },
    {
      id: ord2_id,
      customer_id: 'cust-2',
      invoice_id: inv2_id,
      order_date: '2026-05-21T11:00:00Z',
      total_amount: 900000,
      description: 'Kaos Acara Custom Print Full Back',
      production_status: 'antri_produksi',
      remarks: 'Warna putih bersih, ukuran harus L',
      created_at: '2026-05-21T11:00:00Z'
    },
    {
      id: ord3_id,
      customer_id: 'cust-3',
      invoice_id: inv3_id,
      order_date: '2026-05-22T08:00:00Z',
      total_amount: 375000,
      description: 'Kaos Kafe Merah Cabang Yogyakarta',
      production_status: 'cetak_dtf',
      remarks: 'Kaos Bamboo Merah size M, logo dada kiri + emblem lengan',
      created_at: '2026-05-22T08:00:00Z'
    },
    {
      id: ord4_id,
      customer_id: 'cust-1',
      invoice_id: inv4_id,
      order_date: '2026-05-22T13:45:00Z',
      total_amount: 1300000,
      description: 'Project Kaos Band Metal Sablon Depan Besar',
      production_status: 'quality_control',
      remarks: 'Cotton Combed 24s Hitam L tebal 20 pcs',
      created_at: '2026-05-22T13:45:00Z'
    },
    {
      id: ord5_id,
      customer_id: 'cust-2',
      invoice_id: inv5_id,
      order_date: '2026-05-22T15:20:00Z',
      total_amount: 480000,
      description: 'Kaos Distro Musik Navy Blue M',
      production_status: 'revisi_komplain',
      remarks: 'Cotton Combed 30s Navy M 8 pcs. Kirim ke Bandung.',
      created_at: '2026-05-22T15:20:00Z'
    }
  ];

  const order_items: OrderItem[] = [
    // ORD-20260519-999 (Selesai)
    { id: 'oi-6', order_id: ord6_id, jenis_kaos: 'Cotton Combed 24s', warna: 'Hitam', size: 'XL', quantity: 4, unit_price: 65000, subtotal: 260000 },
    // ORD-20260520-001 (Menunggu Verifikasi)
    { id: 'oi-1', order_id: ord1_id, jenis_kaos: 'Cotton Combed 30s', warna: 'Hitam', size: 'L', quantity: 10, unit_price: 60000, subtotal: 600000 },
    // ORD-20260521-001 (Antri Produksi)
    { id: 'oi-2', order_id: ord2_id, jenis_kaos: 'Cotton Combed 30s', warna: 'Putih', size: 'L', quantity: 15, unit_price: 60000, subtotal: 900000 },
    // ORD-20260522-001 (Cetak DTF)
    { id: 'oi-3', order_id: ord3_id, jenis_kaos: 'Cotton Bamboo 30s', warna: 'Merah', size: 'M', quantity: 5, unit_price: 75000, subtotal: 375000 },
    // ORD-20260522-002 (Quality Control)
    { id: 'oi-4', order_id: ord4_id, jenis_kaos: 'Cotton Combed 24s', warna: 'Hitam', size: 'L', quantity: 20, unit_price: 65000, subtotal: 1300000 },
    // ORD-20260522-003 (Revisi)
    { id: 'oi-5', order_id: ord5_id, jenis_kaos: 'Cotton Combed 30s', warna: 'Navy', size: 'M', quantity: 8, unit_price: 60000, subtotal: 480000 }
  ];

  const order_designs: OrderDesign[] = [
    { id: 'od-6', order_id: ord6_id, design_file_name: 'reuni_lulusan.png', design_file_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400', print_size: 'A3', notes: 'Desain full belakang, dada depan logo kecil' },
    { id: 'od-1', order_id: ord1_id, design_file_name: 'logo_depan_ahmad.png', design_file_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400', print_size: 'A3', notes: 'Posisikan tepat di bagian tengah dada' },
    { id: 'od-2', order_id: ord2_id, design_file_name: 'anime_kawaii_print.png', design_file_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', print_size: 'A3', notes: 'Full back cetak super cerah, depan kosongan' },
    { id: 'od-3', order_id: ord3_id, design_file_name: 'logo_kafe_jogja.png', design_file_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400', print_size: 'A4', notes: 'Dada kiri 10cm, logo emblem di lengan kanan' },
    { id: 'od-4', order_id: ord4_id, design_file_name: 'metal_band_logo.png', design_file_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', print_size: 'A3', notes: 'Sablon super besar noda terciprat merah' },
    { id: 'od-5', order_id: ord5_id, design_file_name: 'music_distro_wave.png', design_file_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', print_size: 'A3', notes: 'Bagian tengah dada depan wave neon' }
  ];

  const invoices: Invoice[] = [
    { id: inv6_id, order_id: ord6_id, invoice_number: 'INV/20260519/001', total_amount: 260000, status_pembayaran: 'lunas', payment_method: 'Transfer BCA', due_date: '2026-05-20', created_at: '2026-05-19T09:15:00Z' },
    { id: inv1_id, order_id: ord1_id, invoice_number: 'INV/20260520/001', total_amount: 600000, status_pembayaran: 'belum_bayar', payment_method: 'Transfer Mandiri', due_date: '2026-05-21', created_at: '2026-05-20T10:30:00Z' },
    { id: inv2_id, order_id: ord2_id, invoice_number: 'INV/20260521/001', total_amount: 900000, status_pembayaran: 'lunas', payment_method: 'Transfer BCA', due_date: '2026-05-22', created_at: '2026-05-21T11:00:00Z' },
    { id: inv3_id, order_id: ord3_id, invoice_number: 'INV/20260522/001', total_amount: 375000, status_pembayaran: 'lunas', payment_method: 'Transfer BCA', due_date: '2026-05-23', created_at: '2026-05-22T08:00:00Z' },
    { id: inv4_id, order_id: ord4_id, invoice_number: 'INV/20260522/002', total_amount: 1300000, status_pembayaran: 'lunas', payment_method: 'Transfer Mandiri', due_date: '2026-05-23', created_at: '2026-05-22T13:45:00Z' },
    { id: inv5_id, order_id: ord5_id, invoice_number: 'INV/20260522/003', total_amount: 480000, status_pembayaran: 'dp', payment_method: 'Transfer BCA (DP 50%)', due_date: '2026-05-23', created_at: '2026-05-22T15:20:00Z' }
  ];

  const payments: Payment[] = [
    // Completed Order (Approved)
    { id: pay6_id, invoice_id: inv6_id, amount_paid: 260000, payment_date: '2026-05-19T09:30:00Z', payment_proof_url: 'https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?w=400', status_verifikasi: 'disetujui', notes: 'Pembayaran full, lunas langsung dikerjakan.', verified_by: 'Admin SCM', verified_at: '2026-05-19T10:00:00Z' },
    // ORD-20260520-001 (Menunggu Verifikasi)
    { id: pay1_id, invoice_id: inv1_id, amount_paid: 600000, payment_date: '2026-05-20T10:45:00Z', payment_proof_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', status_verifikasi: 'menunggu_verifikasi', notes: 'Mohon dicek transfer dari Rek Mandiri an Ahmad Fauzi' },
    // ORD-20260521-001 (Approved)
    { id: pay2_id, invoice_id: inv2_id, amount_paid: 900000, payment_date: '2026-05-21T11:15:00Z', payment_proof_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', status_verifikasi: 'disetujui', notes: 'Pembayaran Lunas', verified_by: 'Admin SCM', verified_at: '2026-05-21T11:45:00Z' },
    // ORD-20260522-001 (Approved)
    { id: pay3_id, invoice_id: inv3_id, amount_paid: 375000, payment_date: '2026-05-22T08:15:00Z', payment_proof_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', status_verifikasi: 'disetujui', notes: 'Lunas', verified_by: 'Admin SCM', verified_at: '2026-05-22T08:30:00Z' },
    // ORD-20260522-002 (Approved)
    { id: pay4_id, invoice_id: inv4_id, amount_paid: 1300000, payment_date: '2026-05-22T13:50:00Z', payment_proof_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', status_verifikasi: 'disetujui', notes: 'Sudah lunas', verified_by: 'Admin SCM', verified_at: '2026-05-22T14:00:00Z' },
    // ORD-20260522-003 (Approved DP)
    { id: pay5_id, invoice_id: inv5_id, amount_paid: 240000, payment_date: '2026-05-22T15:30:00Z', payment_proof_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', status_verifikasi: 'disetujui', notes: 'Bayar DP 50% dulu ya', verified_by: 'Admin SCM', verified_at: '2026-05-22T16:00:00Z' }
  ];

  const production_logs: ProductionLog[] = [
    { id: 'pl-1', order_id: ord6_id, previous_status: 'none', new_status: 'menunggu_verifikasi_pembayaran', note: 'Order didaftarkan oleh admin', updated_by: 'Admin SCM', created_at: '2026-05-19T09:15:00Z' },
    { id: 'pl-2', order_id: ord6_id, previous_status: 'menunggu_verifikasi_pembayaran', new_status: 'antri_produksi', note: 'Pembayaran disetujui, masuk antrian produksi', updated_by: 'Admin SCM', created_at: '2026-05-19T10:00:00Z' },
    { id: 'pl-3', order_id: ord6_id, previous_status: 'antri_produksi', new_status: 'cetak_dtf', note: 'DTF sedang di print ukuran 4.5 meter', updated_by: 'Tim Produksi', created_at: '2026-05-19T11:30:00Z' },
    { id: 'pl-4', order_id: ord6_id, previous_status: 'cetak_dtf', new_status: 'press_sablon', note: 'Sablon di-press ke kaos 24s XL', updated_by: 'Tim Produksi', created_at: '2026-05-19T13:10:00Z' },
    { id: 'pl-5', order_id: ord6_id, previous_status: 'press_sablon', new_status: 'quality_control', note: 'Masuk tahap pengecekan QC', updated_by: 'Tim Produksi', created_at: '2026-05-19T14:40:00Z' },
    { id: 'pl-6', order_id: ord6_id, previous_status: 'quality_control', new_status: 'packing', note: 'Lolos QC, siap dibungkus', updated_by: 'Tim Produksi', created_at: '2026-05-19T15:00:00Z' },
    { id: 'pl-7', order_id: ord6_id, previous_status: 'packing', new_status: 'selesai', note: 'Packing selesai dan diambil customer', updated_by: 'Tim Produksi', created_at: '2026-05-19T16:00:00Z' },

    // ORD-20260521-001 Logs
    { id: 'pl-8', order_id: ord2_id, previous_status: 'none', new_status: 'menunggu_verifikasi_pembayaran', note: 'Order didaftarkan', updated_by: 'Admin SCM', created_at: '2026-05-21T11:00:00Z' },
    { id: 'pl-9', order_id: ord2_id, previous_status: 'menunggu_verifikasi_pembayaran', new_status: 'antri_produksi', note: 'Pembayaran valid, stok kaos otomatis dipotong', updated_by: 'Admin SCM', created_at: '2026-05-21T11:45:00Z' },

    // ORD-20260522-003 Logs (Failed QC)
    { id: 'pl-10', order_id: ord5_id, previous_status: 'none', new_status: 'menunggu_verifikasi_pembayaran', note: 'Didaftarkan customer dengan DP', updated_by: 'Admin SCM', created_at: '2026-05-22T15:20:00Z' },
    { id: 'pl-11', order_id: ord5_id, previous_status: 'menunggu_verifikasi_pembayaran', new_status: 'antri_produksi', note: 'Pembayaran DP valid, masuk produksi', updated_by: 'Admin SCM', created_at: '2026-05-22T16:00:00Z' },
    { id: 'pl-12', order_id: ord5_id, previous_status: 'antri_produksi', new_status: 'quality_control', note: 'Langsung naik cepet ke QC', updated_by: 'Tim Produksi', created_at: '2026-05-22T18:00:00Z' },
    { id: 'pl-13', order_id: ord5_id, previous_status: 'quality_control', new_status: 'revisi_komplain', note: 'Gagal QC: Sablon pecah & warna pudar', updated_by: 'Tim QC', created_at: '2026-05-22T18:15:00Z' }
  ];

  const quality_controls: QualityControl[] = [
    { id: 'qc-1', order_id: ord6_id, qc_status: 'lolos', revisi_note: '', checked_by: 'Tim Produksi', checked_at: '2026-05-19T15:00:00Z' },
    { id: 'qc-2', order_id: ord5_id, qc_status: 'tidak_lolos', revisi_note: 'Warna sablon ada yang pudar di bagian lipatan, perlu di-press ulang dan direkatkan kembali.', checked_by: 'Tim QC', checked_at: '2026-05-22T18:15:00Z' }
  ];

  const notifications: Notification[] = [
    { id: 'n-1', message: 'Stok Cotton Combed 30s Hitam XL hampir habis! (Sisa 2 pcs)', type: 'stock_warning', is_read: false, created_at: '2026-05-22T10:00:00Z' },
    { id: 'n-2', message: 'Stok Roll Standar DTF 30cm di bawah minimum! (Sisa 4.2 meter)', type: 'stock_warning', is_read: false, created_at: '2026-05-21T14:30:00Z' },
    { id: 'n-3', message: 'Order ORD-20260522-003 gagal QC: Warna sablon pudar', type: 'qc_rejection', is_read: false, created_at: '2026-05-22T18:15:00Z' },
    { id: 'n-4', message: 'Komplain revisi masuk untuk order: ORD-20260522-003', type: 'qc_rejection', is_read: true, created_at: '2026-05-22T18:20:00Z' }
  ];

  return {
    users,
    customers,
    orders,
    order_items,
    order_designs,
    invoices,
    payments,
    stock_kaos,
    stock_kaos_logs,
    stock_dtf,
    stock_dtf_logs,
    production_logs,
    quality_controls,
    notifications
  };
};

export class SCMDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = getInitialSeed();
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        console.log('Database loaded successfully from', DB_FILE_PATH);
      } else {
        this.save();
        console.log('Database initialized with seed data at', DB_FILE_PATH);
      }
    } catch (error) {
      console.error('Error loading database, resetting to seed...', error);
      this.data = getInitialSeed();
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database', error);
    }
  }

  // --- GETTERS ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getOrdersCommon(): Order[] {
    return this.data.orders.map(o => {
      const cust = this.data.customers.find(c => c.id === o.customer_id);
      return {
        ...o,
        customer_name: cust ? cust.name : 'Unknown Customer',
        customer_phone: cust ? cust.phone : ''
      };
    });
  }

  public getOrderItems(orderId: string): OrderItem[] {
    return this.data.order_items.filter(item => item.order_id === orderId);
  }

  public getOrderDesigns(orderId: string): OrderDesign[] {
    return this.data.order_designs.filter(d => d.order_id === orderId);
  }

  public getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  public getPayments(): Payment[] {
    return this.data.payments;
  }

  public getStockKaos(): StockKaos[] {
    return this.data.stock_kaos;
  }

  public getStockKaosLogs(): StockKaosLog[] {
    return this.data.stock_kaos_logs;
  }

  public getStockDtf(): StockDtf[] {
    return this.data.stock_dtf;
  }

  public getStockDtfLogs(): StockDtfLog[] {
    return this.data.stock_dtf_logs;
  }

  public getProductionLogs(orderId?: string): ProductionLog[] {
    if (orderId) {
      return this.data.production_logs.filter(log => log.order_id === orderId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return this.data.production_logs;
  }

  public getQualityControls(): QualityControl[] {
    return this.data.quality_controls;
  }

  public getNotifications(): Notification[] {
    return this.data.notifications;
  }

  // --- ACTIONS ---

  // Create customer
  public createCustomer(name: string, phone: string, email: string, address: string): Customer {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      email,
      address,
      created_at: new Date().toISOString()
    };
    this.data.customers.push(newCust);
    this.save();
    return newCust;
  }

  // Create order
  public createOrder(
    customerId: string,
    description: string,
    remarks: string,
    items: { jenis_kaos: string; warna: string; size: string; quantity: number; unit_price: number }[],
    design: { design_file_name: string; design_file_url: string; print_size: string; notes: string },
    paymentMethod: string
  ): { order: Order; invoice: Invoice } {
    const timestamp = new Date().toISOString();
    const cleanDate = timestamp.split('T')[0].replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const orderId = `ORD-${cleanDate}-${rand}`;
    const invoiceId = `INV-${cleanDate}-${rand}`;

    let totalAmount = 0;
    const cleanItems: OrderItem[] = items.map((it, idx) => {
      const sub = it.quantity * it.unit_price;
      totalAmount += sub;
      return {
        id: `oi-${Date.now()}-${idx}`,
        order_id: orderId,
        jenis_kaos: it.jenis_kaos,
        warna: it.warna,
        size: it.size,
        quantity: it.quantity,
        unit_price: it.unit_price,
        subtotal: sub
      };
    });

    const newOrder: Order = {
      id: orderId,
      customer_id: customerId,
      invoice_id: invoiceId,
      order_date: timestamp,
      total_amount: totalAmount,
      description,
      production_status: 'menunggu_verifikasi_pembayaran',
      remarks,
      created_at: timestamp
    };

    const newInvoice: Invoice = {
      id: invoiceId,
      order_id: orderId,
      invoice_number: `INV/${cleanDate}/${rand}`,
      total_amount: totalAmount,
      status_pembayaran: 'belum_bayar',
      payment_method: paymentMethod,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day
      created_at: timestamp
    };

    const newDesign: OrderDesign = {
      id: `od-${Date.now()}`,
      order_id: orderId,
      design_file_name: design.design_file_name || 'design_upload.png',
      design_file_url: design.design_file_url || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400',
      print_size: design.print_size || 'A3',
      notes: design.notes || ''
    };

    this.data.orders.push(newOrder);
    this.data.order_items.push(...cleanItems);
    this.data.order_designs.push(newDesign);
    this.data.invoices.push(newInvoice);

    // Initial production log
    this.data.production_logs.push({
      id: `pl-${Date.now()}`,
      order_id: orderId,
      previous_status: 'none',
      new_status: 'menunggu_verifikasi_pembayaran',
      note: 'Order baru dibuat & dipersiapkan oleh Admin.',
      updated_by: 'Admin SCM',
      created_at: timestamp
    });

    this.save();
    return { order: newOrder, invoice: newInvoice };
  }

  // Upload proof of payment (simulating user ordering upload)
  public createPaymentProof(invoiceId: string, amount: number, proofUrl: string, notes: string): Payment {
    const timestamp = new Date().toISOString();
    const paymentId = `PAY-${Date.now()}`;

    const newPay: Payment = {
      id: paymentId,
      invoice_id: invoiceId,
      amount_paid: amount,
      payment_date: timestamp,
      payment_proof_url: proofUrl,
      status_verifikasi: 'menunggu_verifikasi',
      notes
    };

    this.data.payments.push(newPay);

    // Dynamic Notification
    this.data.notifications.push({
      id: `n-${Date.now()}`,
      message: `Pembayaran masuk untuk invoice ${invoiceId} sebesar Rp ${amount.toLocaleString()}`,
      type: 'new_payment',
      is_read: false,
      created_at: timestamp
    });

    this.save();
    return newPay;
  }

  // Verify Payment (crucial logic 3 & 4)
  public verifyPayment(paymentId: string, action: 'disetujui' | 'ditolak', notes: string, verifierName: string): { success: boolean; message: string } {
    const payment = this.data.payments.find(p => p.id === paymentId);
    if (!payment) return { success: false, message: 'Data pembayaran tidak ditemukan.' };

    const invoice = this.data.invoices.find(i => i.id === payment.invoice_id);
    if (!invoice) return { success: false, message: 'Invoice tidak ditemukan.' };

    const order = this.data.orders.find(o => o.id === invoice.order_id);
    if (!order) return { success: false, message: 'Order tidak ditemukan.' };

    const timestamp = new Date().toISOString();

    payment.status_verifikasi = action;
    payment.notes = notes;
    payment.verified_by = verifierName;
    payment.verified_at = timestamp;

    if (action === 'disetujui') {
      const isLunas = payment.amount_paid >= invoice.total_amount;
      invoice.status_pembayaran = isLunas ? 'lunas' : 'dp';
      order.production_status = 'antri_produksi'; // Siap diproses, masuk antrian priority

      // Stock reduction + logging kaos (Logic 3: stok kaos otomatis berkurang)
      const orderItems = this.thisGetOrderItems(order.id);
      let missingStockDetails: string[] = [];

      orderItems.forEach(item => {
        const stock = this.data.stock_kaos.find(sk =>
          sk.jenis_kaos.toLowerCase() === item.jenis_kaos.toLowerCase() &&
          sk.warna.toLowerCase() === item.warna.toLowerCase() &&
          sk.size.toLowerCase() === item.size.toLowerCase()
        );

        if (stock) {
          const prevQty = stock.stock_qty;
          stock.stock_qty = Math.max(0, stock.stock_qty - item.quantity);

          this.data.stock_kaos_logs.push({
            id: `skl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            stock_kaos_id: stock.id,
            jenis_kaos: stock.jenis_kaos,
            warna: stock.warna,
            size: stock.size,
            type: 'out',
            qty: item.quantity,
            note: `Auto-cut order ${order.id} (pembayaran disetujui, qty ${item.quantity})`,
            created_at: timestamp,
            created_by: verifierName
          });

          // Check for thin stock notifications
          if (stock.stock_qty <= stock.min_stock) {
            this.data.notifications.push({
              id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              message: `Stok Kaos ${stock.jenis_kaos} ${stock.warna} ${stock.size} menipis! Sisa ${stock.stock_qty} pcs (Minimum: ${stock.min_stock} pcs)`,
              type: 'stock_warning',
              is_read: false,
              created_at: timestamp
            });
          }
        } else {
          // Stock item didn't exist in stock_kaos at all! Add it dynamically with 0 stock and log.
          missingStockDetails.push(`${item.jenis_kaos} ${item.warna} ${item.size}`);
        }
      });

      // Production Log
      this.data.production_logs.push({
        id: `pl-${Date.now()}`,
        order_id: order.id,
        previous_status: 'menunggu_verifikasi_pembayaran',
        new_status: 'antri_produksi',
        note: `Pembayaran disetujui oleh ${verifierName}. Status Invoice: ${invoice.status_pembayaran.toUpperCase()}. Order masuk antrian prioritas produksi. Stok kaos otomatis dipotong.`,
        updated_by: verifierName,
        created_at: timestamp
      });

    } else {
      // action === 'ditolak'
      invoice.status_pembayaran = 'ditolak';
      order.production_status = 'menunggu_verifikasi_pembayaran'; // Menunggu upload ulang tapi status invoice ditolak

      // Log
      this.data.production_logs.push({
        id: `pl-${Date.now()}`,
        order_id: order.id,
        previous_status: 'menunggu_verifikasi_pembayaran',
        new_status: 'menunggu_verifikasi_pembayaran',
        note: `Pembayaran DITOLAK oleh ${verifierName}. Alasan: ${notes}. Sistem menunggu upload ulang bukti bayar dari customer. Stok tidak dipotong.`,
        updated_by: verifierName,
        created_at: timestamp
      });
    }

    this.save();
    return { success: true, message: `Status pembayaran berhasil di-update menjadi ${action}.` };
  }

  private thisGetOrderItems(orderId: string): OrderItem[] {
    return this.data.order_items.filter(item => item.order_id === orderId);
  }

  // Update Production Status (Logic 6 & 7)
  public updateProductionStatus(orderId: string, newStatus: ProductionStatus, note: string, updatedBy: string): { success: boolean; message: string } {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order tidak ditemukan' };

    const oldStatus = order.production_status;
    order.production_status = newStatus;

    // Log
    this.data.production_logs.push({
      id: `pl-${Date.now()}`,
      order_id: orderId,
      previous_status: oldStatus,
      new_status: newStatus,
      note: note || `Status produksi di-update ke ${newStatus.replace(/_/g, ' ')}`,
      updated_by: updatedBy,
      created_at: new Date().toISOString()
    });

    this.save();
    return { success: true, message: `Status produksi berhasil di-ubah ke ${newStatus.replace(/_/g, ' ')}` };
  }

  // Quality Control processing (Logic 8)
  public addQcCheck(orderId: string, status: 'lolos' | 'tidak_lolos', revisiNote: string, checkedBy: string): { success: boolean; message: string } {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order tidak ditemukan' };

    const timestamp = new Date().toISOString();

    const newQc: QualityControl = {
      id: `qc-${Date.now()}`,
      order_id: orderId,
      qc_status: status,
      revisi_note: status === 'tidak_lolos' ? revisiNote : '',
      checked_by: checkedBy,
      checked_at: timestamp
    };

    this.data.quality_controls.push(newQc);

    // Adjust production status based on QC
    if (status === 'tidak_lolos') {
      order.production_status = 'revisi_komplain';

      // Notification
      this.data.notifications.push({
        id: `n-${Date.now()}`,
        message: `KUALITAS TINJAUAN GAGAL untuk order ${orderId}: ${revisiNote}`,
        type: 'qc_rejection',
        is_read: false,
        created_at: timestamp
      });

      // Production log
      this.data.production_logs.push({
        id: `pl-${Date.now()}`,
        order_id: orderId,
        previous_status: 'quality_control',
        new_status: 'revisi_komplain',
        note: `QC Gagal oleh ${checkedBy}. Catatan Revisi: ${revisiNote}`,
        updated_by: checkedBy,
        created_at: timestamp
      });
    } else {
      order.production_status = 'packing';

      // Production log
      this.data.production_logs.push({
        id: `pl-${Date.now()}`,
        order_id: orderId,
        previous_status: 'quality_control',
        new_status: 'packing',
        note: `QC LOLOS oleh ${checkedBy}. Siap dipak dan dikirim ke loket.`,
        updated_by: checkedBy,
        created_at: timestamp
      });
    }

    this.save();
    return { success: true, message: `Laporan QC berhasil dicatat. Status order dirubah menjadi ${order.production_status}` };
  }

  // DTF Stock manual reduction (Logic 10)
  public deductDtfStock(stockDtfId: string, metersUsed: number, note: string, updatedBy: string): { success: boolean; message: string } {
    const dtf = this.data.stock_dtf.find(d => d.id === stockDtfId);
    if (!dtf) return { success: false, message: 'Jenis stok DTF tidak ditemukan.' };

    const timestamp = new Date().toISOString();

    dtf.stock_meter = parseFloat((dtf.stock_meter - metersUsed).toFixed(2));
    if (dtf.stock_meter < 0) dtf.stock_meter = 0;

    // Log DTF Stock
    this.data.stock_dtf_logs.push({
      id: `sdl-${Date.now()}`,
      stock_dtf_id: stockDtfId,
      roll_name: dtf.roll_name,
      type: 'out',
      meters: metersUsed,
      note,
      created_at: timestamp,
      created_by: updatedBy
    });

    // Notify low DTF stock
    if (dtf.stock_meter <= dtf.min_stock) {
      this.data.notifications.push({
        id: `n-${Date.now()}`,
        message: `Stok Roll DTF ${dtf.roll_name} menipis! Sisa ${dtf.stock_meter} meter. (Minimum: ${dtf.min_stock} meter.)`,
        type: 'stock_warning',
        is_read: false,
        created_at: timestamp
      });
    }

    this.save();
    return { success: true, message: `Stok DTF berhasil dideplesi sebanyak ${metersUsed} meter.` };
  }

  // Manual stock refilling / auditing for both Kaos and DTF
  public adjustKaosStock(stockId: string, qty: number, type: 'in' | 'out', note: string, updatedBy: string): { success: boolean; message: string } {
    const item = this.data.stock_kaos.find(sk => sk.id === stockId);
    if (!item) return { success: false, message: 'Stok Kaos tidak ditemukan.' };

    const timestamp = new Date().toISOString();
    if (type === 'in') {
      item.stock_qty += qty;
    } else {
      item.stock_qty = Math.max(0, item.stock_qty - qty);
    }

    this.data.stock_kaos_logs.push({
      id: `skl-${Date.now()}`,
      stock_kaos_id: stockId,
      jenis_kaos: item.jenis_kaos,
      warna: item.warna,
      size: item.size,
      type,
      qty,
      note,
      created_at: timestamp,
      created_by: updatedBy
    });

    // Dynamic low warning check if we reduced stock
    if (type === 'out' && item.stock_qty <= item.min_stock) {
      this.data.notifications.push({
        id: `n-${Date.now()}`,
        message: `Stok Kaos ${item.jenis_kaos} ${item.warna} ${item.size} menipis! Sisa ${item.stock_qty} pcs.`,
        type: 'stock_warning',
        is_read: false,
        created_at: timestamp
      });
    }

    this.save();
    return { success: true, message: `Stok Kaos berhasil disesuaikan.` };
  }

  public adjustDtfStockManual(stockDtfId: string, meters: number, type: 'in' | 'out', note: string, updatedBy: string): { success: boolean; message: string } {
    const dtf = this.data.stock_dtf.find(d => d.id === stockDtfId);
    if (!dtf) return { success: false, message: 'Stok DTF tidak ditemukan.' };

    const timestamp = new Date().toISOString();
    if (type === 'in') {
      dtf.stock_meter = parseFloat((dtf.stock_meter + meters).toFixed(2));
    } else {
      dtf.stock_meter = parseFloat((Math.max(0, dtf.stock_meter - meters)).toFixed(2));
    }

    this.data.stock_dtf_logs.push({
      id: `sdl-${Date.now()}`,
      stock_dtf_id: stockDtfId,
      roll_name: dtf.roll_name,
      type,
      meters,
      note,
      created_at: timestamp,
      created_by: updatedBy
    });

    if (type === 'out' && dtf.stock_meter <= dtf.min_stock) {
      this.data.notifications.push({
        id: `n-${Date.now()}`,
        message: `Stok Roll DTF ${dtf.roll_name} menipis! Sisa ${dtf.stock_meter} meter.`,
        type: 'stock_warning',
        is_read: false,
        created_at: timestamp
      });
    }

    this.save();
    return { success: true, message: `Stok DTF berhasil disesuaikan.` };
  }

  // Clear notification standard triggers
  public markAllNotificationsAsRead() {
    this.data.notifications.forEach(n => n.is_read = true);
    this.save();
  }
}
