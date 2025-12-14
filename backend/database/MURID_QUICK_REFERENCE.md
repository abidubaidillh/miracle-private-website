# QUICK REFERENCE - TABEL MURID

## 📌 DEPLOYMENT INSTANT

Salin dan jalankan di Supabase SQL Editor:

```sql
-- 1. Create ENUM
CREATE TYPE murid_status AS ENUM ('AKTIF', 'TIDAK_AKTIF');

-- 2. Create TABLE
CREATE TABLE murid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL CHECK (TRIM(nama) != ''),
  usia INTEGER NOT NULL CHECK (usia > 0),
  no_hp VARCHAR(20) NOT NULL UNIQUE CHECK (TRIM(no_hp) != ''),
  alamat TEXT,
  status murid_status NOT NULL DEFAULT 'AKTIF',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create Indexes
CREATE INDEX idx_murid_status ON murid(status);
CREATE INDEX idx_murid_no_hp ON murid(no_hp);
CREATE INDEX idx_murid_created_at ON murid(created_at DESC);

-- 4. Create Trigger for updated_at
CREATE OR REPLACE FUNCTION update_murid_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_murid_updated_at
BEFORE UPDATE ON murid
FOR EACH ROW
EXECUTE FUNCTION update_murid_updated_at();
```

---

## 🎯 KOLOM REFERENCE

| Kolom | Type | Required | Unique | Info |
|-------|------|----------|--------|------|
| id | UUID | ✓ | ✓ | Auto-generated |
| nama | VARCHAR(255) | ✓ | ✗ | Not empty |
| usia | INTEGER | ✓ | ✗ | > 0 |
| no_hp | VARCHAR(20) | ✓ | ✓ | Not empty |
| alamat | TEXT | ✗ | ✗ | Nullable |
| status | ENUM | ✓ | ✗ | AKTIF\|TIDAK_AKTIF |
| created_at | TIMESTAMP TZ | ✓ | ✗ | Auto |
| updated_at | TIMESTAMP TZ | ✓ | ✗ | Auto-update |

---

## 🔌 INTEGRATION POINTS

```
Frontend (Next.js)
    ↓
Backend (Node.js Express)
    ↓
Supabase (PostgreSQL)
    ↓
Tabel MURID ← FK dari jadwal, absensi, pembayaran
```

---

## ✅ VERIFICATION QUERIES

```sql
-- Check tabel ada
SELECT to_regclass('public.murid');

-- Check ENUM values
SELECT enum_range(NULL::murid_status);

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename='murid';

-- Insert test
INSERT INTO murid(nama, usia, no_hp, alamat) 
VALUES('Test User', 15, '081234567890', 'Jl Test')
RETURNING *;

-- Query test
SELECT id, nama, status FROM murid WHERE status='AKTIF';
```

---

## 🚫 CONSTRAINTS (ENFORCED)

- ✓ UUID Primary Key
- ✓ nama NOT NULL dan tidak kosong
- ✓ usia > 0
- ✓ no_hp UNIQUE dan NOT NULL
- ✓ status ENUM (AKTIF/TIDAK_AKTIF)
- ✓ no_hp tidak boleh duplikat
- ✗ Soft delete (via status, bukan hard delete)

---

## 📌 BUSINESS LOGIC (APP LEVEL)

```javascript
// Backend: Filter murid aktif
const getMuridAktif = async () => {
  const { data } = await supabase
    .from('murid')
    .select('*')
    .eq('status', 'AKTIF')
    .order('created_at', { ascending: false });
  return data;
};

// Backend: Soft delete murid
const deactivateMurid = async (muridId) => {
  const { data } = await supabase
    .from('murid')
    .update({ status: 'TIDAK_AKTIF' })
    .eq('id', muridId)
    .select();
  return data;
};

// Backend: Create murid
const createMurid = async (muridData) => {
  const { data, error } = await supabase
    .from('murid')
    .insert([muridData])
    .select();
  return { data, error };
};
```

---

## 📋 CHECKLIST SEBELUM PRODUCTION

- [ ] SQL script sudah dijalankan di Supabase
- [ ] Tabel `murid` sudah ada
- [ ] ENUM `murid_status` sudah ada
- [ ] 3 indexes sudah dibuat
- [ ] Trigger `trigger_murid_updated_at` sudah berfungsi
- [ ] Backend dapat INSERT/SELECT murid
- [ ] Frontend dapat load data murid
- [ ] Test dengan sample data (minimal 5 murid)
- [ ] Verifikasi no_hp unique constraint
- [ ] Verifikasi updated_at auto-update saat edit

---

**Status: READY FOR PRODUCTION ✓**
