# VISUAL REFERENCE - TABEL MURID

## 🎨 TABLE SCHEMA DIAGRAM

```
╔═══════════════════════════════════════════════════════════════════╗
║                        TABLE: murid                              ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  🔑 id                  UUID          [PRIMARY KEY]              ║
║     └─ Auto: gen_random_uuid()                                   ║
║                                                                   ║
║  📝 nama                VARCHAR(255)  [NOT NULL, CHECK ≠ '']    ║
║     └─ Nama lengkap murid                                        ║
║                                                                   ║
║  🎂 usia                INTEGER       [NOT NULL, CHECK > 0]     ║
║     └─ Umur dalam tahun (validasi positif)                      ║
║                                                                   ║
║  📱 no_hp               VARCHAR(20)   [NOT NULL, UNIQUE,        ║
║     └─ Nomor HP unik                   CHECK ≠ '']              ║
║                                                                   ║
║  🏠 alamat              TEXT          [NULLABLE]                 ║
║     └─ Alamat lengkap (opsional)                                ║
║                                                                   ║
║  ✅ status              ENUM          [DEFAULT: AKTIF]           ║
║     └─ AKTIF | TIDAK_AKTIF                                      ║
║                                                                   ║
║  📅 created_at          TIMESTAMP TZ  [DEFAULT: now()]          ║
║     └─ Auto-insert, tidak berubah                               ║
║                                                                   ║
║  🔄 updated_at          TIMESTAMP TZ  [DEFAULT: now(),          ║
║     └─ Auto-update via trigger        AUTO via trigger]         ║
║                                                                   ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 📑 INDEXES VISUALIZATION

```
┌─────────────────────────────────────────────────────────────┐
│ INDEXES UNTUK PERFORMANCE                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1️⃣  idx_murid_status                                         │
│    ├─ Kolom: status                                         │
│    ├─ Use case: WHERE status = 'AKTIF'                     │
│    ├─ Query type: Filter daftar tagihan, pembuat jadwal     │
│    └─ Selectivity: ~80% row                                 │
│                                                              │
│ 2️⃣  idx_murid_no_hp                                          │
│    ├─ Kolom: no_hp                                          │
│    ├─ Use case: WHERE no_hp = '081234567890'               │
│    ├─ Query type: Lookup by phone number                    │
│    └─ Selectivity: 1 row (UNIQUE)                           │
│                                                              │
│ 3️⃣  idx_murid_created_at DESC                               │
│    ├─ Kolom: created_at (descending)                        │
│    ├─ Use case: ORDER BY created_at DESC                   │
│    ├─ Query type: Newest murid first                        │
│    └─ Selectivity: Scan partial rows                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CONSTRAINTS MATRIX

```
╔════════════════════════════════════════════════════════════════╗
║ CONSTRAINT                    TYPE           LEVEL    ENFORCED ║
╠════════════════════════════════════════════════════════════════╣
║ id PRIMARY KEY               Structural      DB       ✓✓✓     ║
║ no_hp UNIQUE                 Structural      DB       ✓✓✓     ║
║ nama NOT NULL                Structural      DB       ✓✓✓     ║
║ nama NOT EMPTY               CHECK           DB       ✓✓✓     ║
║ usia NOT NULL                Structural      DB       ✓✓✓     ║
║ usia > 0                      CHECK           DB       ✓✓✓     ║
║ no_hp NOT NULL               Structural      DB       ✓✓✓     ║
║ no_hp NOT EMPTY              CHECK           DB       ✓✓✓     ║
║ status DEFAULT 'AKTIF'       Default         DB       ✓✓✓     ║
║ status ENUM type             Domain          DB       ✓✓✓     ║
║ created_at DEFAULT now()     Default         DB       ✓✓✓     ║
║ updated_at auto-trigger      Trigger         DB       ✓✓✓     ║
║ Murid AKTIF for jadwal       Trigger         DB       ✓✓✓     ║
║ No hard delete if FK exist   FK Constraint   DB       ✓✓✓     ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🔄 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│                   (input murid form)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                       │
│           (validate & prepare data)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE CLIENT LIBRARY                        │
│         (supabase.from('murid').insert/select/update)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 POSTGRESQL DATABASE                         │
│  ┌─────────────────────────────────────────────────┐       │
│  │  TABLE: murid                                   │       │
│  │  ├─ Constraints (CHECK, UNIQUE, FK)            │       │
│  │  ├─ Indexes (status, no_hp, created_at)        │       │
│  │  └─ Triggers (updated_at auto-update)          │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 STATUS ENUM DECISION TREE

```
┌─ CREATE MURID
│  └─ status = 'AKTIF' (default)
│
├─ MURID AKTIF
│  ├─ ✓ Tampil di daftar tagihan
│  ├─ ✓ Bisa dapat jadwal baru
│  ├─ ✓ Bisa dicatat absensi
│  └─ ✓ Bisa dicatat pembayaran
│
└─ UBAH STATUS → 'TIDAK_AKTIF'
   ├─ ✗ Tidak tampil di daftar tagihan
   ├─ ✗ Tidak bisa dapat jadwal baru
   ├─ ✓ Absensi lama tetap tersimpan
   ├─ ✓ Pembayaran lama tetap tersimpan
   ├─ ✓ Data bisa dilihat (audit trail)
   └─ ✓ Bisa di-reaktif → 'AKTIF' lagi
```

---

## 🚨 VALIDATION RULES

```
INPUT VALIDATION
├─ nama
│  ├─ Required: ✓
│  ├─ Type: VARCHAR (max 255 chars)
│  ├─ Trim & check NOT empty: ✓
│  └─ Pattern: Allow all (no format check)
│
├─ usia
│  ├─ Required: ✓
│  ├─ Type: INTEGER
│  ├─ Range: > 0 (database CHECK)
│  └─ Max: No limit (assume 1-120)
│
├─ no_hp
│  ├─ Required: ✓
│  ├─ Type: VARCHAR (max 20 chars)
│  ├─ Trim & check NOT empty: ✓
│  ├─ Unique: ✓ (UNIQUE constraint)
│  └─ Pattern: Delegated to app layer
│
├─ alamat
│  ├─ Required: ✗ (NULLABLE)
│  ├─ Type: TEXT
│  └─ Max: Unlimited
│
└─ status
   ├─ Required: ✓
   ├─ Type: ENUM (2 values only)
   ├─ Values: 'AKTIF' | 'TIDAK_AKTIF'
   └─ Default: 'AKTIF'
```

---

## 🔗 RELATIONSHIP MAP

```
                    ┌─────────────┐
                    │   MURID     │
                    │  (inti data)│
                    └────────┬────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌─────────────┐   ┌──────────────┐
            │   JADWAL    │   │  ABSENSI     │
            │  (les schedule) │ (attendance)│
            └────────┬────┘   └──────┬───────┘
                     │               │
                     └───────┬───────┘
                             ▼
                    ┌──────────────────┐
                    │  PEMBAYARAN      │
                    │ (payment records)│
                    └──────────┬───────┘
                               ▼
                    ┌──────────────────────┐
                    │ LAPORAN KEUANGAN     │
                    │ (aggregated reports) │
                    └──────────────────────┘

RELATIONSHIP TYPE: ONE-TO-MANY
- 1 murid : N jadwal
- 1 murid : N absensi
- 1 murid : N pembayaran

DELETE PROTECTION: ON DELETE RESTRICT
- Tidak bisa delete murid jika punya related data
- Enforce via Foreign Key Constraint
- Strategy: Soft delete (status = 'TIDAK_AKTIF')
```

---

## ⏱️ TIMESTAMP BEHAVIOR

```
┌─ INSERT murid
│  ├─ created_at = NOW() [auto-set]
│  └─ updated_at = NOW() [auto-set]
│
├─ SELECT murid
│  └─ created_at & updated_at tetap sama (jika belum edit)
│
├─ UPDATE murid (e.g., ubah nama)
│  ├─ created_at = [tidak berubah] ✓
│  └─ updated_at = NOW() [auto-update via trigger] ✓
│
└─ UPDATE murid lagi (e.g., ubah status)
   ├─ created_at = [masih sama] ✓
   └─ updated_at = NOW() [update ulang] ✓

TRIGGER BEHAVIOR:
- Setiap kali UPDATE, trigger automatically set updated_at = NOW()
- Tidak perlu application logic, murni database-level
- Immutable created_at untuk audit trail
```

---

## 📈 SCALABILITY CONSIDERATIONS

```
CURRENT SETUP:
├─ 1 TABLE (murid)
├─ 8 COLUMNS
├─ 1 ENUM TYPE
├─ 3 INDEXES
├─ 3 CHECK CONSTRAINTS
├─ 1 UNIQUE CONSTRAINT
└─ 1 AUTO-UPDATE TRIGGER

ESTIMATED CAPACITY:
├─ Single murid record: ~200 bytes
├─ With 10,000 murid: ~2 MB
├─ With 100,000 murid: ~20 MB
└─ Scaling: No issues with current design

OPTIMIZATION OPTIONS (future):
├─ Partitioning: By status (AKTIF/TIDAK_AKTIF)
├─ Archiving: Move old TIDAK_AKTIF to archive table
├─ Caching: Redis for active murid list
└─ Read replicas: For heavy read workloads
```

---

## 🎯 USAGE PATTERNS

```
PATTERN 1: Get all active students
   SELECT * FROM murid WHERE status = 'AKTIF'
   └─ Uses: idx_murid_status (FAST)

PATTERN 2: Find student by phone
   SELECT * FROM murid WHERE no_hp = '081234567890'
   └─ Uses: idx_murid_no_hp (VERY FAST, UNIQUE)

PATTERN 3: Get newest students
   SELECT * FROM murid ORDER BY created_at DESC LIMIT 10
   └─ Uses: idx_murid_created_at DESC (FAST)

PATTERN 4: Check phone uniqueness
   SELECT COUNT(*) FROM murid WHERE no_hp = '...'
   └─ Uses: idx_murid_no_hp (INSTANT)

PATTERN 5: Update student info
   UPDATE murid SET nama = '...' WHERE id = '...'
   └─ Auto: updated_at updated via trigger (AUTOMATIC)

PATTERN 6: Soft delete student
   UPDATE murid SET status = 'TIDAK_AKTIF' WHERE id = '...'
   └─ Uses: No index needed (small dataset expected)
```

---

**Last updated: December 2025**
**Status: READY FOR DEPLOYMENT** ✅
