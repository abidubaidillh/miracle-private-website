# TEST CASES & VALIDATION - TABEL MURID

## 🧪 UNIT TESTS (SQL LEVEL)

### Test Suite 1: CONSTRAINT VALIDATION

#### Test 1.1: Insert valid murid
```sql
-- ✅ Should succeed
INSERT INTO murid (nama, usia, no_hp, alamat)
VALUES ('Ahmad Rizki', 14, '081234567890', 'Jl. Merdeka No. 123')
RETURNING id, nama, status, created_at;

-- Expected: 1 row inserted, status = 'AKTIF'
```

#### Test 1.2: Insert without nama
```sql
-- ❌ Should FAIL - nama NOT NULL
INSERT INTO murid (usia, no_hp)
VALUES (14, '081234567890');

-- Expected error: "violates not-null constraint"
```

#### Test 1.3: Insert with empty nama
```sql
-- ❌ Should FAIL - CHECK nama NOT EMPTY
INSERT INTO murid (nama, usia, no_hp)
VALUES ('   ', 14, '081234567890');

-- Expected error: "check constraint violated"
```

#### Test 1.4: Insert with negative usia
```sql
-- ❌ Should FAIL - CHECK usia > 0
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Budi Santoso', -5, '081234567890');

-- Expected error: "check constraint violated"
```

#### Test 1.5: Insert with usia = 0
```sql
-- ❌ Should FAIL - CHECK usia > 0
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Siti Nurhaliza', 0, '081234567890');

-- Expected error: "check constraint violated"
```

#### Test 1.6: Insert duplicate no_hp
```sql
-- ❌ Should FAIL - no_hp UNIQUE
INSERT INTO murid (nama, usia, no_hp) 
VALUES ('User 1', 14, '081234567890');
INSERT INTO murid (nama, usia, no_hp) 
VALUES ('User 2', 15, '081234567890');

-- Expected error: "duplicate key value violates unique constraint"
```

#### Test 1.7: Insert with empty no_hp
```sql
-- ❌ Should FAIL - CHECK no_hp NOT EMPTY
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Test User', 14, '   ');

-- Expected error: "check constraint violated"
```

#### Test 1.8: Insert without no_hp
```sql
-- ❌ Should FAIL - no_hp NOT NULL
INSERT INTO murid (nama, usia)
VALUES ('Test User', 14);

-- Expected error: "violates not-null constraint"
```

#### Test 1.9: Insert with NULL alamat (optional)
```sql
-- ✅ Should succeed
INSERT INTO murid (nama, usia, no_hp, alamat)
VALUES ('No Address', 14, '081234567890', NULL)
RETURNING id, nama, alamat;

-- Expected: 1 row, alamat = NULL
```

#### Test 1.10: Insert with all fields
```sql
-- ✅ Should succeed
INSERT INTO murid (nama, usia, no_hp, alamat, status)
VALUES ('Complete Data', 16, '089876543210', 'Jl. Test', 'AKTIF')
RETURNING id, nama, usia, no_hp, alamat, status;

-- Expected: 1 row, all fields populated
```

---

### Test Suite 2: ENUM VALIDATION

#### Test 2.1: Insert with valid status AKTIF
```sql
-- ✅ Should succeed
INSERT INTO murid (nama, usia, no_hp, status)
VALUES ('Active Student', 14, '081234567891', 'AKTIF')
RETURNING status;

-- Expected: status = 'AKTIF'
```

#### Test 2.2: Insert with valid status TIDAK_AKTIF
```sql
-- ✅ Should succeed
INSERT INTO murid (nama, usia, no_hp, status)
VALUES ('Inactive Student', 14, '081234567892', 'TIDAK_AKTIF')
RETURNING status;

-- Expected: status = 'TIDAK_AKTIF'
```

#### Test 2.3: Insert with invalid status
```sql
-- ❌ Should FAIL - invalid ENUM value
INSERT INTO murid (nama, usia, no_hp, status)
VALUES ('Invalid Status', 14, '081234567893', 'SUSPENDED');

-- Expected error: "invalid input value for enum"
```

#### Test 2.4: Insert without status (default)
```sql
-- ✅ Should succeed with default
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Default Status', 14, '081234567894')
RETURNING status;

-- Expected: status = 'AKTIF' (default)
```

---

### Test Suite 3: DEFAULT & AUTO VALUES

#### Test 3.1: Verify default status
```sql
-- ✅ Test default
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Test Default', 14, '081234567895')
RETURNING id, status;

-- Expected: status = 'AKTIF'
```

#### Test 3.2: Verify UUID generation
```sql
-- ✅ Test UUID auto-generation
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Test UUID', 14, '081234567896')
RETURNING id;

-- Expected: id = valid UUID (v4)
-- Check: SELECT length(id::text) FROM murid WHERE id = last_id → 36
```

#### Test 3.3: Verify timestamp auto-insert
```sql
-- ✅ Test created_at auto-set
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Test Timestamp', 14, '081234567897')
RETURNING created_at, updated_at;

-- Expected: Both = current timestamp (equal)
```

---

### Test Suite 4: TRIGGER - AUTO UPDATE

#### Test 4.1: Verify updated_at changes on UPDATE
```sql
-- ✅ Insert record
INSERT INTO murid (nama, usia, no_hp)
VALUES ('Trigger Test', 14, '081234567898')
RETURNING id, created_at, updated_at;

-- Sleep 2 seconds, then UPDATE
UPDATE murid 
SET nama = 'Trigger Test Updated'
WHERE no_hp = '081234567898'
RETURNING id, nama, created_at, updated_at;

-- Expected:
-- ├─ created_at = UNCHANGED
-- ├─ updated_at = DIFFERENT (newer)
-- └─ Difference = ~2 seconds
```

#### Test 4.2: Multiple updates
```sql
-- Insert
INSERT INTO murid (nama, usia, no_hp) 
VALUES ('Multi Update', 14, '081234567899')
RETURNING id, updated_at as update_1;

-- Update 1
UPDATE murid SET nama = 'Update 1' WHERE no_hp = '081234567899'
RETURNING updated_at as update_2;

-- Sleep & Update 2
UPDATE murid SET usia = 15 WHERE no_hp = '081234567899'
RETURNING updated_at as update_3;

-- Expected:
-- ├─ update_1 < update_2 < update_3
-- └─ Each timestamp incremented
```

---

### Test Suite 5: INDEX PERFORMANCE

#### Test 5.1: Index on status (filter query)
```sql
-- Setup: Insert 100+ murid with mixed status
-- Query 1: Without index (hypothetical)
-- Query 2: With index
SELECT * FROM murid WHERE status = 'AKTIF';

-- Expected: FAST (uses idx_murid_status)
-- Run: EXPLAIN ANALYZE SELECT ... (check Index Scan)
```

#### Test 5.2: Index on no_hp (unique lookup)
```sql
-- Query: Lookup by unique phone
SELECT * FROM murid WHERE no_hp = '081234567890';

-- Expected: INSTANT (uses idx_murid_no_hp, 1 row)
-- Run: EXPLAIN ANALYZE SELECT ...
```

#### Test 5.3: Index on created_at (sorting)
```sql
-- Query: Get latest 10 murid
SELECT * FROM murid 
ORDER BY created_at DESC 
LIMIT 10;

-- Expected: FAST (uses idx_murid_created_at DESC)
-- Run: EXPLAIN ANALYZE SELECT ... → check "Limit" in plan
```

---

## 🧪 BUSINESS LOGIC TESTS

### Test Suite 6: STATUS BUSINESS RULES

#### Test 6.1: Murid TIDAK_AKTIF tidak di-query untuk tagihan
```sql
-- Setup: Insert mix of AKTIF & TIDAK_AKTIF
INSERT INTO murid (nama, usia, no_hp, status) VALUES
('Aktif 1', 14, '081111111111', 'AKTIF'),
('Tidak Aktif 1', 14, '081111111112', 'TIDAK_AKTIF'),
('Aktif 2', 15, '081111111113', 'AKTIF');

-- Query: List for billing
SELECT COUNT(*) as jumlah_tagihan FROM murid WHERE status = 'AKTIF';

-- Expected: 2 (hanya AKTIF yang di-count)
```

#### Test 6.2: Deactivate student (soft delete)
```sql
-- Get murid ID
SELECT id FROM murid WHERE no_hp = '081111111111';

-- Soft delete
UPDATE murid SET status = 'TIDAK_AKTIF' WHERE id = '...';

-- Verify: not in active list anymore
SELECT * FROM murid WHERE id = '...' AND status = 'AKTIF';

-- Expected: 0 rows (not found in active list)
```

#### Test 6.3: Reactivate student
```sql
-- Reactivate
UPDATE murid SET status = 'AKTIF' WHERE id = '...';

-- Verify: back in active list
SELECT * FROM murid WHERE id = '...' AND status = 'AKTIF';

-- Expected: 1 row (found again)
```

---

### Test Suite 7: DATA INTEGRITY

#### Test 7.1: No duplicate phone numbers
```sql
-- Count distinct phone numbers
SELECT COUNT(DISTINCT no_hp) as distinct_phones,
       COUNT(*) as total_murid
FROM murid;

-- Expected: Both equal (no duplicates)
```

#### Test 7.2: All records have valid usia
```sql
-- Check for invalid usia
SELECT id, nama, usia FROM murid WHERE usia <= 0;

-- Expected: 0 rows (all positive)
```

#### Test 7.3: All records have non-empty nama
```sql
-- Check for empty names
SELECT id, nama FROM murid WHERE TRIM(nama) = '';

-- Expected: 0 rows (all populated)
```

---

## 🔌 INTEGRATION TESTS

### Test Suite 8: FOREIGN KEY READY

#### Test 8.1: Prepare for jadwal FK
```sql
-- Verify murid IDs are usable as FK
SELECT COUNT(DISTINCT id) FROM murid;

-- Expected: All IDs unique, ready for FK reference
```

#### Test 8.2: Verify UUID format
```sql
-- Check all IDs are valid UUID
SELECT id FROM murid 
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Expected: 0 rows (all valid UUIDs)
```

---

## 📋 SAMPLE DATA FOR TESTING

### Insert test data:
```sql
-- ✅ Insert 5 sample murid
INSERT INTO murid (nama, usia, no_hp, alamat, status) VALUES
('Ahmad Rizki', 14, '081234567890', 'Jl. Merdeka No. 123, Jakarta', 'AKTIF'),
('Siti Nurhaliza', 15, '082345678901', 'Jl. Sudirman No. 456, Jakarta', 'AKTIF'),
('Budi Santoso', 13, '083456789012', 'Jl. Gatot Subroto No. 789, Jakarta', 'TIDAK_AKTIF'),
('Dewi Lestari', 16, '084567890123', 'Jl. Ahmad Yani No. 012, Jakarta', 'AKTIF'),
('Randi Pratama', 14, '085678901234', 'Jl. Diponegoro No. 345, Bandung', 'AKTIF');

-- Verify insert
SELECT COUNT(*) FROM murid;  -- Expected: 5
```

---

## ✅ TEST EXECUTION CHECKLIST

- [ ] Run Test Suite 1 (Constraints) → All pass
- [ ] Run Test Suite 2 (ENUM) → All pass
- [ ] Run Test Suite 3 (Defaults) → All pass
- [ ] Run Test Suite 4 (Trigger) → All pass
- [ ] Run Test Suite 5 (Indexes) → All pass
- [ ] Run Test Suite 6 (Business Logic) → All pass
- [ ] Run Test Suite 7 (Data Integrity) → All pass
- [ ] Run Test Suite 8 (FK Ready) → All pass
- [ ] Insert sample data → Success
- [ ] Verify sample data → 5 rows
- [ ] Clean up test data (optional)

---

## 🚀 QUICK TEST SCRIPT

Jalankan semua test ini sekaligus:

```sql
-- =====================================================
-- QUICK VALIDATION SCRIPT FOR MURID TABLE
-- =====================================================

-- 1. Check tabel ada
SELECT to_regclass('public.murid') as table_status;

-- 2. Check ENUM type ada
SELECT enum_range(NULL::murid_status) as status_options;

-- 3. Check jumlah indexes
SELECT COUNT(*) as jumlah_indexes 
FROM pg_indexes WHERE tablename = 'murid';

-- 4. Check constraints
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'murid';

-- 5. Test INSERT valid data
INSERT INTO murid (nama, usia, no_hp) 
VALUES ('Test User', 14, '089999999999')
RETURNING id, nama, status, created_at, updated_at;

-- 6. Test UPDATE trigger
UPDATE murid 
SET nama = 'Test User Updated'
WHERE no_hp = '089999999999'
RETURNING updated_at;

-- 7. Test UNIQUE constraint
-- This should FAIL (expected):
-- INSERT INTO murid (nama, usia, no_hp) 
-- VALUES ('Duplicate Test', 15, '089999999999');

-- 8. Clean up test data
DELETE FROM murid WHERE no_hp = '089999999999';

-- 9. Final verification
SELECT COUNT(*) as total_murid FROM murid;
```

---

## 📊 EXPECTED TEST RESULTS

| Test | Expected Result | Status |
|------|-----------------|--------|
| Valid insert | ✅ 1 row | |
| Missing nama | ❌ Error | |
| Empty nama | ❌ Error | |
| Negative usia | ❌ Error | |
| Duplicate no_hp | ❌ Error | |
| Default status | ✅ AKTIF | |
| Auto UUID | ✅ Valid UUID | |
| Auto timestamp | ✅ Now | |
| Trigger update | ✅ New time | |
| Index exists | ✅ 3 indexes | |
| Soft delete | ✅ Updated | |

---

**Last updated: December 2025**
**Status: TESTING GUIDE READY** ✅
