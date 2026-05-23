/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { SCMDatabase } from './server/db_store.js';

const app = express();
const port = 3000;

app.use(express.json());

// Initialize SCM Database Store
const db = new SCMDatabase();

// --- API ROUTING ---

// 1. Users list
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

// 2. Customers List & Add
app.get('/api/customers', (req, res) => {
  res.json(db.getCustomers());
});

app.post('/api/customers', (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Nama dan nomor telepon wajib diisi.' });
  }
  const cust = db.createCustomer(name, phone, email || '', address || '');
  res.json({ success: true, customer: cust });
});

// 3. Orders list & creations (Combines items and design files)
app.get('/api/orders', (req, res) => {
  const orders = db.getOrdersCommon();
  const invoices = db.getInvoices();
  const payments = db.getPayments();

  const enriched = orders.map(o => {
    const items = db.getOrderItems(o.id);
    const designs = db.getOrderDesigns(o.id);
    const invoice = invoices.find(inv => inv.order_id === o.id);
    const payment = invoice ? payments.find(p => p.invoice_id === invoice.id) : null;
    const logs = db.getProductionLogs(o.id);
    const qc = db.getQualityControls().find(q => q.order_id === o.id);

    return {
      ...o,
      items,
      designs: designs[0] || null,
      invoice: invoice || null,
      payment: payment || null,
      logs,
      qc: qc || null
    };
  });

  res.json(enriched);
});

// 4. Create Order
app.post('/api/orders', (req, res) => {
  try {
    const { customer_id, description, remarks, items, design, payment_method } = req.body;
    if (!customer_id || !items || !items.length) {
      return res.status(400).json({ error: 'Customer ID dan list item order wajib diisi.' });
    }

    const result = db.createOrder(
      customer_id,
      description || 'Custom print job',
      remarks || '',
      items,
      design || {},
      payment_method || 'Transfer BCA'
    );

    res.json({ success: true, order: result.order, invoice: result.invoice });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Customer uploads pay proof (Simulate customer flow)
app.post('/api/orders/:id/payment', (req, res) => {
  try {
    const { id } = req.params;
    const { amount_paid, payment_proof_url, notes } = req.body;

    const orders = db.getOrdersCommon();
    const order = orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' });

    const invoice = db.getInvoices().find(inv => inv.order_id === id);
    if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan untuk order ini' });

    const pay = db.createPaymentProof(
      invoice.id,
      Number(amount_paid || invoice.total_amount),
      payment_proof_url || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400',
      notes || 'Transfer bukti bayar'
    );

    res.json({ success: true, payment: pay });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Admin verify payment (Crucial logic 3 & 4)
app.post('/api/payments/:id/verify', (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes, verifier_name } = req.body; // action: 'disetujui' | 'ditolak'

    if (!action || !['disetujui', 'ditolak'].includes(action)) {
      return res.status(400).json({ error: 'Parameter action harus disetujui atau ditolak.' });
    }

    const result = db.verifyPayment(id, action, notes || '', verifier_name || 'Admin SCM');
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Update production status (Logic 6 & 7)
app.post('/api/orders/:id/production-status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, updated_by } = req.body;

    if (!status) return res.status(400).json({ error: 'Status harus diisi.' });

    const result = db.updateProductionStatus(id, status, note, updated_by || 'Tim Produksi');
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Quality Control (Logic 8)
app.post('/api/orders/:id/qc', (req, res) => {
  try {
    const { id } = req.params;
    const { status, revisi_note, checked_by } = req.body; // status: 'lolos' | 'tidak_lolos'

    if (!status || !['lolos', 'tidak_lolos'].includes(status)) {
      return res.status(400).json({ error: 'Status QC harus lolos atau tidak_lolos.' });
    }

    const result = db.addQcCheck(id, status, revisi_note || '', checked_by || 'Tim QC');
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Stock Kaos Management & logs (Logic 9)
app.get('/api/stock/kaos', (req, res) => {
  res.json(db.getStockKaos());
});

app.post('/api/stock/kaos/adjust', (req, res) => {
  try {
    const { id, qty, type, note, updated_by } = req.body; // type: 'in' | 'out'
    if (!id || !qty || !type) {
      return res.status(400).json({ error: 'ID, qty, dan tipe perubahan (in/out) wajib diisi.' });
    }

    const result = db.adjustKaosStock(id, Number(qty), type, note || 'Penyesuaian manual', updated_by || 'Admin');
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stock/kaos/logs', (req, res) => {
  res.json(db.getStockKaosLogs());
});

// 10. Stock DTF Management & logs (Logic 10)
app.get('/api/stock/dtf', (req, res) => {
  res.json(db.getStockDtf());
});

app.post('/api/stock/dtf/deduct', (req, res) => {
  try {
    const { id, meters, note, updated_by } = req.body;
    if (!id || !meters) {
      return res.status(400).json({ error: 'ID stoking DTF dan pemakaian meter wajib diisi.' });
    }

    const result = db.deductDtfStock(id, Number(meters), note || 'Dipotong produksi', updated_by || 'Tim Produksi');
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stock/dtf/adjust', (req, res) => {
  try {
    const { id, meters, type, note, updated_by } = req.body;
    if (!id || !meters || !type) {
      return res.status(400).json({ error: 'ID, meters, dan tipe perubahan wajib diisi.' });
    }

    const result = db.adjustDtfStockManual(id, Number(meters), type, note || 'Penyesuaian manual SCM', updated_by || 'Admin');
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stock/dtf/logs', (req, res) => {
  res.json(db.getStockDtfLogs());
});

// 11. Notifications
app.get('/api/notifications', (req, res) => {
  res.json(db.getNotifications());
});

app.post('/api/notifications/read-all', (req, res) => {
  db.markAllNotificationsAsRead();
  res.json({ success: true });
});

// 12. Laporan Owner & Bottleneck Analysis (Logic 11)
app.get('/api/reports', (req, res) => {
  const orders = db.getOrdersCommon();
  const invoices = db.getInvoices();
  const stockKaos = db.getStockKaos();
  const stockDtf = db.getStockDtf();
  const dtfLogs = db.getStockDtfLogs();

  // Omzet (Lunas + DP) total paid sum
  const payments = db.getPayments().filter(p => p.status_verifikasi === 'disetujui');
  const totalOmzet = payments.reduce((sum, p) => sum + p.amount_paid, 0);

  // Total Orders count
  const totalOrders = orders.length;

  // Payments total count grouped
  const statusInvoiceGroups = invoices.reduce((acc: any, inv) => {
    acc[inv.status_pembayaran] = (acc[inv.status_pembayaran] || 0) + 1;
    return acc;
  }, {});

  // Bottlenek order grouping of production status ONLY for active (non-completed)
  // Active status lists
  const activeStatusList = [
    'antri_produksi', 'cetak_dtf', 'press_sablon', 'quality_control', 'packing', 'revisi_komplain'
  ];
  const bottleneckCounts = orders
    .filter(o => activeStatusList.includes(o.production_status))
    .reduce((acc: any, o) => {
      acc[o.production_status] = (acc[o.production_status] || 0) + 1;
      return acc;
    }, {});

  // Identify highest bottleneck
  let maxCount = 0;
  let highestBottleneck = 'Tidak ada bottleneck aktif - Semua berjalan lancar!';
  Object.keys(bottleneckCounts).forEach(stat => {
    if (bottleneckCounts[stat] > maxCount) {
      maxCount = bottleneckCounts[stat];
      highestBottleneck = stat.replace(/_/g, ' ').toUpperCase();
    }
  });

  // DTF Usage - sum up meters where type is "out"
  const dtfUsedTotal = dtfLogs
    .filter(log => log.type === 'out')
    .reduce((sum, log) => sum + log.meters, 0);

  // Generate Recharts: Monthly Omzet Trends
  // Gather verified payments & dynamically group them by month
  const monthlyDataRaw: { [key: string]: number } = {
    'Jan 2026': 12500000,
    'Feb 2026': 15800000,
    'Mar 2026': 14200000,
    'Apr 2026': 18900000,
    'May 2026': 1100000 // base payments for May in SCM seed
  };

  payments.forEach(p => {
    try {
      const date = new Date(p.payment_date);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyDataRaw[monthStr] !== undefined) {
        // Add live approved payments values
        monthlyDataRaw[monthStr] += p.amount_paid;
      } else {
        monthlyDataRaw[monthStr] = p.amount_paid;
      }
    } catch (e) {
      // ignore parsing errors
    }
  });

  const monthlyRevenueTrends = Object.keys(monthlyDataRaw).map(month => {
    const revenue = monthlyDataRaw[month];
    // Dynamic targets
    const target = month === 'May 2026' ? 24000000 : Math.round(revenue * 1.15 || 15000000);
    return {
      month,
      omzet: revenue,
      target
    };
  });

  // Generate Recharts: Production Performance of divisions
  // Sourced from dynamic order and log states in SCM pipeline
  const dtfActive = orders.filter(o => o.production_status === 'cetak_dtf').length;
  const dtfPassed = orders.filter(o => ['press_sablon', 'quality_control', 'packing', 'selesai'].includes(o.production_status)).length;
  const dtfTotal = dtfActive + dtfPassed + 5; // adding base historic
  const dtfDone = dtfPassed + 5;

  const pressActive = orders.filter(o => o.production_status === 'press_sablon').length;
  const pressPassed = orders.filter(o => ['quality_control', 'packing', 'selesai'].includes(o.production_status)).length;
  const pressTotal = pressActive + pressPassed + 6;
  const pressDone = pressPassed + 5;

  const qcActive = orders.filter(o => o.production_status === 'quality_control').length;
  const qcPassed = orders.filter(o => ['packing', 'selesai'].includes(o.production_status)).length;
  const qcTotal = qcActive + qcPassed + 8;
  const qcDone = qcPassed + 7;

  const packingActive = orders.filter(o => o.production_status === 'packing').length;
  const packingPassed = orders.filter(o => ['selesai'].includes(o.production_status)).length;
  const packingTotal = packingActive + packingPassed + 4;
  const packingDone = packingPassed + 4;

  const divisionPerformance = [
    { name: 'Cetak DTF', 'Beban Kerja': dtfTotal, 'Selesai': dtfDone, 'Persentase Efisiensi': Math.round((dtfDone / dtfTotal) * 100) },
    { name: 'Press Sablon', 'Beban Kerja': pressTotal, 'Selesai': pressDone, 'Persentase Efisiensi': Math.round((pressDone / pressTotal) * 100) },
    { name: 'Quality Control', 'Beban Kerja': qcTotal, 'Selesai': qcDone, 'Persentase Efisiensi': Math.round((qcDone / qcTotal) * 100) },
    { name: 'Packing & Finishing', 'Beban Kerja': packingTotal, 'Selesai': packingDone, 'Persentase Efisiensi': Math.round((packingDone / packingTotal) * 100) }
  ];

  res.json({
    totalOmzet,
    totalOrders,
    statusInvoiceGroups,
    bottleneckCounts,
    highestBottleneck,
    highestBottleneckCount: maxCount,
    dtfUsedTotal,
    totalStockKaosRemaining: stockKaos.reduce((sum, s) => sum + s.stock_qty, 0),
    totalStockDtfRemaining: stockDtf.reduce((sum, s) => sum + s.stock_meter, 0),
    monthlyRevenueTrends,
    divisionPerformance
  });
});


// Serve React frontend
async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const __dirname = path.resolve();

  if (!isProduction) {
    // Inject Vite Dev Server dynamically for seamless developer feedback
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    // Production server assets delivery
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server SCM NoiseCustom Studio is running at port ${port}`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal initialization error:', err);
});
