# DESAIN TABEL MURID - DOKUMENTASI LENGKAP

## 📋 RINGKASAN EKSEKUTIF

Tabel `murid` adalah tabel inti dalam sistem manajemen bimbingan belajar. Dirancang dengan prinsip:
- ✅ Integritas data (constraints & validasi)
- ✅ Performance (indexes strategis)
- ✅ Auditability (created_at & updated_at)
- ✅ Soft delete (status-based, bukan hard delete)

---

## 🏗️ STRUKTUR TABEL

### Definisi Kolom

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identifier unik, auto-generated |
| `nama` | VARCHAR(255) | NOT NULL, CHECK nama ≠ '' | Nama lengkap murid, tidak boleh kosong |
| `usia` | INTEGER | NOT NULL, CHECK usia > 0 | Umur murid dalam tahun, harus positif |
| `no_hp` | VARCHAR(20) | NOT NULL, UNIQUE, CHECK ≠ '' | Nomor HP, unik per murid |
| `alamat` | TEXT | NULLABLE | Alamat lengkap, opsional |
| `status` | murid_status ENUM | NOT NULL, DEFAULT 'AKTIF' | Status aktif/tidak aktif |
| `created_at` | TIMESTAMP TZ | DEFAULT now() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP TZ | DEFAULT now() | Waktu update terakhir, auto-trigger |

---

## 🔐 CONSTRAINTS & VALIDASI

### 1. **PRIMARY KEY (id)**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
- Menggunakan UUID untuk distributed system readiness
- Auto-generate saat INSERT
- Tidak pernah berubah (immutable)

### 2. **UNIQUE CONSTRAINT (no_hp)**
```sql
CONSTRAINT unique_no_hp UNIQUE (no_hp)
```
- Nomor HP harus unik → tidak ada 2 murid dengan HP sama
- Enforce di database level (tidak hanya aplikasi)
- Berguna untuk identifikasi cepat via telepon

### 3. **CHECK CONSTRAINTS**
```sql
-- Nama tidak boleh kosong/whitespace
CONSTRAINT check_nama_not_empty CHECK (TRIM(nama) != '')

-- Usia harus positif
CONSTRAINT check_usia_positive CHECK (usia > 0)

-- No HP tidak boleh kosong/whitespace
CONSTRAINT check_no_hp_not_empty CHECK (TRIM(no_hp) != '')
```

### 4. **ENUM TYPE (Status)**
```sql
CREATE TYPE murid_status AS ENUM ('AKTIF', 'TIDAK_AKTIF')
```
- Membatasi nilai status hanya ke 2 pilihan
- Lebih efisien storage daripada VARCHAR
- Enforce di database level

---

## 📑 INDEX & PERFORMANCE

### Index yang dibuat:

1. **idx_murid_status**
   ```sql
   CREATE INDEX idx_murid_status ON murid(status)
   ```
   - **Tujuan**: Query untuk daftar murid aktif (filter WHERE status = 'AKTIF')
   - **Use case**: Tagihan bulanan, pembuatan jadwal, laporan
   - **Est. row selectivity**: ~80% murid aktif, 20% tidak aktif

2. **idx_murid_no_hp**
   ```sql
   CREATE INDEX idx_murid_no_hp ON murid(no_hp)
   ```
   - **Tujuan**: Pencarian murid by nomor HP
   - **Use case**: Lookup cepat saat input pembayaran, komunikasi
   - **Est. uniqueness**: Unique (1 baris)

3. **idx_murid_created_at**
   ```sql
   CREATE INDEX idx_murid_created_at ON murid(created_at DESC)
   ```
   - **Tujuan**: Sorting history murid (newest first)
   - **Use case**: Dashboard, laporan period-based
   - **Descending**: Untuk query "murid baru" lebih cepat

---

## 🔄 AUTO-UPDATE TRIGGER

```sql
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

**Fungsi**: Setiap kali ada UPDATE, kolom `updated_at` otomatis update ke waktu sekarang.
**Keuntungan**: Tracking perubahan data tanpa perlu logic aplikasi.

---

## 📊 RELASI KE TABEL LAIN (DESKRIPTIF)

Tabel `murid` menjadi referensi untuk:

```
murid
├─→ jadwal (FK: jadwal.murid_id)
│   └─ Jadwal les untuk setiap murid
│
├─→ absensi (FK: absensi.murid_id)
│   └─ Record kehadiran/absensi murid
│
└─→ pembayaran (FK: pembayaran.murid_id)
    └─ History pembayaran les murid
```

**Catatan**: Foreign key constraint akan didefine di tabel child (jadwal, absensi, pembayaran).

---

## 🛑 BUSINESS RULES IMPLEMENTATION

### Rule 1: "Murid TIDAK_AKTIF tidak muncul di tagihan"
**Implementation via Aplikasi**:
```sql
-- Query di aplikasi harus filter:
SELECT * FROM murid WHERE status = 'AKTIF'
```

### Rule 2: "Murid TIDAK_AKTIF tidak bisa dapat jadwal baru"
**Implementation via Trigger di jadwal table**:
```sql
CREATE TRIGGER check_murid_aktif_for_jadwal
BEFORE INSERT ON jadwal
FOR EACH ROW
EXECUTE FUNCTION validate_murid_aktif();
```

### Rule 3: "Murid tidak boleh dihapus jika punya pembayaran/absensi"
**Implementation via Constraint di FK**:
```sql
-- Di tabel jadwal:
FOREIGN KEY (murid_id) REFERENCES murid(id) ON DELETE RESTRICT

-- Di tabel absensi:
FOREIGN KEY (murid_id) REFERENCES murid(id) ON DELETE RESTRICT

-- Di tabel pembayaran:
FOREIGN KEY (murid_id) REFERENCES murid(id) ON DELETE RESTRICT
```
**Effect**: Hard delete akan error jika murid masih ada reference.
**Better approach**: Ubah `status` ke 'TIDAK_AKTIF' (soft delete).

---

## 📝 ASUMSI DESAIN

1. **UUID untuk Primary Key**
   - ✅ Mendukung distributed system / multi-server
   - ✅ Tidak expose auto-increment number (security)
   - ⚠️ Performa: 16 bytes (vs 8 bytes INT), tapi trade-off worth it

2. **VARCHAR(20) untuk no_hp**
   - ✅ Cukup untuk format: +62 812 3456 7890 (15 char)
   - ✅ Support format internasional dengan extension
   - ⚠️ No validation format (delegated ke aplikasi)

3. **Tidak ada kolom email**
   - Asumsi: Sistem primary contact via telepon
   - Bisa ditambah di tabel `users` jika ada auth login

4. **Tidak ada kolom parent/wali**
   - Asumsi: Struktur sederhana di v1
   - Bisa refactor ke tabel terpisah jika kebutuhan kompleks

5. **Soft Delete via status, bukan hard delete**
   - ✅ Mempertahankan data history (audit trail)
   - ✅ Tidak corrupted relasi ke tabel lain
   - ✅ Mudah reactive (ubah status TIDAK_AKTIF → AKTIF)

6. **TIMESTAMP WITH TIME ZONE**
   - ✅ Support timezone-aware application
   - ✅ Konsisten untuk multi-region deployment
   - ✅ Database default: UTC

7. **Validasi usia > 0 di database**
   - ✅ Prevent invalid data di source
   - ✅ Backup untuk validasi aplikasi
   - ⚠️ Tidak ada check max usia (assumed bisa 100+ tahun)

---

## 🚀 DEPLOYMENT DI SUPABASE

### Step-by-step:

1. **Buka Supabase Dashboard** → SQL Editor
2. **Paste semua isi file `001_create_murid_table.sql`**
3. **Execute** → Tunggu hingga "Success"
4. **Verify**:
   ```sql
   -- Cek tabel ada
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'murid';
   
   -- Cek ENUM type ada
   SELECT * FROM pg_type 
   WHERE typname = 'murid_status';
   
   -- Cek indexes
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'murid';
   ```

### Permissions (untuk Aplikasi Backend):
```sql
-- Grant read/insert/update ke service_role
GRANT SELECT, INSERT, UPDATE ON murid TO authenticated;
GRANT SELECT, INSERT, UPDATE ON murid TO service_role;
```

---

## 🔍 QUERY EXAMPLES

### 1. Insert murid baru
```sql
INSERT INTO murid (nama, usia, no_hp, alamat)
VALUES ('Andi Wijaya', 14, '081234567890', 'Jl. Merdeka No. 1')
RETURNING id, nama, created_at;
```

### 2. Update status murid
```sql
UPDATE murid
SET status = 'TIDAK_AKTIF'
WHERE id = 'uuid-murid-id'
RETURNING id, nama, status, updated_at;
```

### 3. List murid aktif with pagination
```sql
SELECT id, nama, usia, no_hp, status, created_at
FROM murid
WHERE status = 'AKTIF'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### 4. Check duplikat no_hp
```sql
SELECT COUNT(*), no_hp
FROM murid
GROUP BY no_hp
HAVING COUNT(*) > 1;
```

### 5. Murid dan jadwal mereka (JOIN ke jadwal table)
```sql
SELECT m.id, m.nama, j.hari, j.jam_mulai
FROM murid m
LEFT JOIN jadwal j ON m.id = j.murid_id
WHERE m.status = 'AKTIF'
ORDER BY m.nama;
```

---

## ⚠️ CATATAN PENTING

1. **Belum ada validasi format nomor HP**
   - Rekomendasi: Tambah validasi di aplikasi layer (regex)
   - Atau: Trigger validation di database

2. **Belum ada kolom untuk foto/bukti identitas**
   - Pertimbangan: Bisa use Supabase Storage

3. **Belum ada soft-delete timestamp**
   - Jika perlu audit: Tambah `deleted_at` kolom

4. **Belum ada kolom password/email**
   - Pertimbangan: Buat tabel `users` terpisah → JOIN dengan murid

5. **Usia bisa jadi inconsistent jika tidak di-update**
   - Better: Store `tanggal_lahir` dan compute usia di aplikasi

---

## 📚 NEXT STEPS

Setelah tabel `murid` jadi, implementasi:
1. ✅ Tabel `jadwal` (referensi: murid.id)
2. ✅ Tabel `absensi` (referensi: murid.id)
3. ✅ Tabel `pembayaran` (referensi: murid.id)
4. ✅ Tabel `laporan_keuangan` (aggregasi pembayaran)
5. ✅ API endpoints (backend: auth routes, murid CRUD)

---

**Dokumentasi versi: 1.0**
**Last updated: December 2025**
