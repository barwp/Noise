/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'owner' | 'produksi';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string; // Client will not receive this
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export type ProductionStatus =
  | 'menunggu_verifikasi_pembayaran'
  | 'siap_diproses'
  | 'antri_produksi'
  | 'cetak_dtf'
  | 'press_sablon'
  | 'quality_control'
  | 'packing'
  | 'siap_diambil'
  | 'siap_kirim'
  | 'selesai'
  | 'revisi_komplain';

export interface Order {
  id: string;
  customer_id: string;
  customer_name?: string; // Joined dynamically
  customer_phone?: string; // Joined dynamically
  invoice_id: string;
  order_date: string;
  total_amount: number;
  description: string;
  production_status: ProductionStatus;
  remarks: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  jenis_kaos: string;
  warna: string;
  size: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderDesign {
  id: string;
  order_id: string;
  design_file_name: string;
  design_file_url: string;
  print_size: string; // e.g. "A3", "A4", "A5", "1 Meter", "2 Meter"
  notes: string;
}

export type PaymentStatus = 'belum_bayar' | 'dp' | 'lunas' | 'ditolak';

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  total_amount: number;
  status_pembayaran: PaymentStatus;
  payment_method: string;
  due_date: string;
  created_at: string;
}

export type VerificationStatus = 'menunggu_verifikasi' | 'disetujui' | 'ditolak';

export interface Payment {
  id: string;
  invoice_id: string;
  amount_paid: number;
  payment_date: string;
  payment_proof_url: string;
  status_verifikasi: VerificationStatus;
  notes: string;
  verified_by?: string;
  verified_at?: string;
}

export interface StockKaos {
  id: string;
  jenis_kaos: string;
  warna: string;
  size: string;
  stock_qty: number;
  min_stock: number;
}

export interface StockKaosLog {
  id: string;
  stock_kaos_id: string;
  jenis_kaos: string; // Joined or cached
  warna: string; // Joined or cached
  size: string; // Joined or cached
  type: 'in' | 'out';
  qty: number;
  note: string;
  created_at: string;
  created_by: string;
}

export interface StockDtf {
  id: string;
  roll_name: string;
  stock_meter: number;
  min_stock: number;
  price_per_meter: number;
}

export interface StockDtfLog {
  id: string;
  stock_dtf_id: string;
  roll_name: string; // Joined or cached
  type: 'in' | 'out';
  meters: number;
  note: string;
  created_at: string;
  created_by: string;
}

export interface ProductionLog {
  id: string;
  order_id: string;
  previous_status: ProductionStatus | 'none';
  new_status: ProductionStatus;
  note: string;
  updated_by: string;
  created_at: string;
}

export interface QualityControl {
  id: string;
  order_id: string;
  qc_status: 'lolos' | 'tidak_lolos';
  revisi_note: string;
  checked_by: string;
  checked_at: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'stock_warning' | 'new_payment' | 'qc_rejection';
  is_read: boolean;
  created_at: string;
}
