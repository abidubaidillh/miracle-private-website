# RELASI TABEL MURID - STRUKTUR FULL SYSTEM

## 🔗 DIAGRAM RELASI

```
┌─────────────────────────────────────────────────────────────────┐
│                          TABEL MURID                            │
│  (Core: ID, Nama, Usia, No HP, Alamat, Status, Timestamps)    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌──────────────┐
   │ JADWAL  │   │ ABSENSI │   │ PEMBAYARAN   │
   └─────────┘   └─────────┘   └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
            ┌────────────────────────┐
            │ LAPORAN KEUANGAN       │
            │ (aggregasi pembayaran) │
            └────────────────────────┘
```

---

## 📊 SPESIFIKASI TABEL PENDUKUNG

### 1. TABEL JADWAL
**Purpose**: Menyimpan jadwal les untuk setiap murid

```sql
CREATE TABLE jadwal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  murid_id UUID NOT NULL,
  hari VARCHAR(20) NOT NULL, -- Senin, Selasa, dst
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  mata_pelajaran VARCHAR(100) NOT NULL,
  guru_id UUID, -- FK ke guru (jika ada)
  status VARCHAR(20) DEFAULT 'AKTIF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- FOREIGN KEY
  FOREIGN KEY (murid_id) REFERENCES murid(id) ON DELETE RESTRICT
);

-- INDEXES
CREATE INDEX idx_jadwal_murid_id ON jadwal(murid_id);
CREATE INDEX idx_jadwal_hari ON jadwal(hari);

-- TRIGGER untuk auto-validate murid aktif
CREATE OR REPLACE FUNCTION validate_murid_aktif()
RETURNS TRIGGER AS $$
BEGIN
  -- Check apakah murid berstatus AKTIF
  IF (SELECT status FROM murid WHERE id = NEW.murid_id) != 'AKTIF'::murid_status THEN
    RAISE EXCEPTION 'Murid dengan status TIDAK_AKTIF tidak dapat dijadwalkan.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_murid_aktif
BEFORE INSERT OR UPDATE ON jadwal
FOR EACH ROW
EXECUTE FUNCTION validate_murid_aktif();
```

**Constraint**: 
- ✓ Murid TIDAK_AKTIF → tidak bisa buat jadwal baru
- ✓ ON DELETE RESTRICT → tidak bisa hapus murid jika punya jadwal

---

### 2. TABEL ABSENSI
**Purpose**: Mencatat kehadiran/absensi murid di setiap jadwal

```sql
CREATE TABLE absensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  murid_id UUID NOT NULL,
  jadwal_id UUID NOT NULL,
  tanggal DATE NOT NULL,
  status_kehadiran VARCHAR(20) NOT NULL, -- HADIR, IZIN, SAKIT, ALPA
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- FOREIGN KEYS
  FOREIGN KEY (murid_id) REFERENCES murid(id) ON DELETE RESTRICT,
  FOREIGN KEY (jadwal_id) REFERENCES jadwal(id) ON DELETE CASCADE,
  
  -- CONSTRAINTS
  CONSTRAINT unique_absensi_per_hari UNIQUE (murid_id, jadwal_id, tanggal)
);

-- INDEXES
CREATE INDEX idx_absensi_murid_id ON absensi(murid_id);
CREATE INDEX idx_absensi_jadwal_id ON absensi(jadwal_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);

CREATE ENUM absensi_status AS ('HADIR', 'IZIN', 'SAKIT', 'ALPA');
```

**Constraint**:
- ✓ ON DELETE RESTRICT → tidak bisa hapus murid jika punya data absensi
- ✓ Unique (murid_id, jadwal_id, tanggal) → 1 absensi per hari

---

### 3. TABEL PEMBAYARAN
**Purpose**: Mencatat pembayaran les (bulanan, per session, dst)

```sql
CREATE TABLE pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  murid_id UUID NOT NULL,
  jumlah_pembayaran DECIMAL(10,2) NOT NULL,
  tanggal_pembayaran DATE NOT NULL,
  bulan_periode VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  metode_pembayaran VARCHAR(50) NOT NULL, -- CASH, TRANSFER, CARD
  status_pembayaran VARCHAR(20) DEFAULT 'LUNAS', -- LUNAS, PENDING, TERMIN
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- FOREIGN KEY
  FOREIGN KEY (murid_id) REFERENCES murid(id) ON DELETE RESTRICT
);

-- INDEXES
CREATE INDEX idx_pembayaran_murid_id ON pembayaran(murid_id);
CREATE INDEX idx_pembayaran_tanggal_pembayaran ON pembayaran(tanggal_pembayaran DESC);
CREATE INDEX idx_pembayaran_bulan_periode ON pembayaran(bulan_periode);

-- CHECK CONSTRAINT
ALTER TABLE pembayaran 
  ADD CONSTRAINT check_jumlah_positive CHECK (jumlah_pembayaran > 0);
```

**Constraint**:
- ✓ ON DELETE RESTRICT → tidak bisa hapus murid jika punya pembayaran
- ✓ jumlah_pembayaran > 0

---

### 4. TABEL LAPORAN KEUANGAN (OPTIONAL - AGGREGATION)
**Purpose**: Summarized report untuk accounting/keuangan

```sql
CREATE MATERIALIZED VIEW laporan_keuangan_bulanan AS
SELECT 
  DATE_TRUNC('month', p.tanggal_pembayaran)::date AS periode,
  m.id AS murid_id,
  m.nama AS nama_murid,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status_kehadiran = 'HADIR') AS total_hadir,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status_kehadiran = 'ALPA') AS total_alpa,
  SUM(p.jumlah_pembayaran) AS total_pembayaran,
  COUNT(DISTINCT p.id) AS jumlah_transaksi
FROM murid m
LEFT JOIN absensi a ON m.id = a.murid_id
LEFT JOIN pembayaran p ON m.id = p.murid_id
WHERE m.status = 'AKTIF'
GROUP BY periode, m.id, m.nama;

-- INDEX untuk view
CREATE INDEX idx_laporan_keuangan_periode 
ON laporan_keuangan_bulanan(periode DESC);

-- Refresh view setiap hari pukul 00:00
-- (Implementasi via pgAgent atau aplikasi scheduler)
```

---

## 🔄 WORKFLOW DATA MURID

### Skenario 1: Murid Baru Daftar
```
1. User buat murid baru
   INSERT INTO murid(nama, usia, no_hp, alamat) 
   → status = 'AKTIF' (default)

2. Sistem buat jadwal les
   INSERT INTO jadwal(murid_id, hari, jam_mulai, ...)
   → Trigger validate: murid harus AKTIF ✓

3. Record absensi mulai dicatat
   INSERT INTO absensi(murid_id, jadwal_id, tanggal, status_kehadiran)
   → Start tracking kehadiran
```

### Skenario 2: Murid Berhenti Les (Soft Delete)
```
1. User ingin deactivate murid
   UPDATE murid SET status = 'TIDAK_AKTIF' WHERE id = ...
   
2. Sistem otomatis:
   - Tidak muncul di daftar tagihan baru ✓
   - Tidak bisa dapat jadwal baru ✓
   - Data lama tetap tersimpan (audit trail) ✓

3. Jika perlu reaktif:
   UPDATE murid SET status = 'AKTIF' WHERE id = ...
   → Murid bisa dapat jadwal lagi
```

### Skenario 3: Laporan Keuangan Bulanan
```
1. Admin request laporan bulan ini
   SELECT * FROM laporan_keuangan_bulanan 
   WHERE periode = '2025-12-01'

2. Sistem return:
   - Total murid aktif
   - Total pembayaran terkumpul
   - Breakdown per murid
   - Attendance rate
```

---

## 🛡️ DATA INTEGRITY RULES

| Rule | Implementasi | Enforced |
|------|--------------|----------|
| Murid tidak bisa dihapus | ON DELETE RESTRICT | ✓ DB Level |
| Murid TIDAK_AKTIF no jadwal | Trigger validation | ✓ DB Level |
| no_hp unique | UNIQUE constraint | ✓ DB Level |
| usia > 0 | CHECK constraint | ✓ DB Level |
| Murid active di filter | WHERE status='AKTIF' | ✓ App Level |
| Soft delete, bukan hard | UPDATE status | ✓ App Logic |

---

## 📦 DEPLOYMENT ORDER

1. **Phase 1 - CORE**
   - [ ] Tabel `murid` + ENUM + triggers + indexes
   - Status: READY (current deliverable)

2. **Phase 2 - TRANSACTIONS**
   - [ ] Tabel `jadwal` + FK + validation trigger
   - [ ] Tabel `absensi` + FK + unique constraint
   - [ ] Tabel `pembayaran` + FK + check constraint

3. **Phase 3 - REPORTING**
   - [ ] Materialized view `laporan_keuangan_bulanan`
   - [ ] Refresh schedule (pgAgent/cron)

4. **Phase 4 - APPLICATION**
   - [ ] Backend API (CRUD murid, jadwal, absensi, pembayaran)
   - [ ] Frontend UI (Dashboard, input forms)
   - [ ] Authentication & authorization

---

## 🔌 SAMPLE API USAGE

```javascript
// Backend/Express examples using Supabase client

// 1. GET semua murid aktif
async function getMuridAktif() {
  const { data, error } = await supabase
    .from('murid')
    .select('id, nama, usia, no_hp, status')
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false });
  return data;
}

// 2. CREATE murid baru
async function createMurid(muridData) {
  const { data, error } = await supabase
    .from('murid')
    .insert([muridData])
    .select();
  return data[0];
}

// 3. UPDATE murid (deactivate)
async function deactivateMurid(muridId) {
  const { data, error } = await supabase
    .from('murid')
    .update({ status: 'TIDAK_AKTIF' })
    .eq('id', muridId)
    .select();
  return data[0];
}

// 4. GET murid dengan jadwal & absensi (JOIN)
async function getMuridDetail(muridId) {
  const { data: murid, error: e1 } = await supabase
    .from('murid')
    .select('*')
    .eq('id', muridId);
  
  const { data: jadwal, error: e2 } = await supabase
    .from('jadwal')
    .select('*')
    .eq('murid_id', muridId);
  
  const { data: absensi, error: e3 } = await supabase
    .from('absensi')
    .select('*')
    .eq('murid_id', muridId);
  
  return { murid: murid[0], jadwal, absensi };
}

// 5. GET laporan keuangan
async function getLaporanKeuangan(periode) {
  const { data, error } = await supabase
    .from('laporan_keuangan_bulanan')
    .select('*')
    .eq('periode', `${periode}-01`);
  return data;
}
```

---

**Dokumentasi versi: 1.0**
**Last updated: December 2025**
