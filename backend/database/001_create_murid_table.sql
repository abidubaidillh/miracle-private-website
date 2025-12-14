-- ================================================================
-- TABEL MURID - DESAIN DATABASE
-- Sistem Manajemen Bimbingan Belajar / Les Privat
-- ================================================================
-- Catatan: Script ini siap untuk production di Supabase PostgreSQL
-- ================================================================

-- ================================================================
-- 1. CREATE ENUM TYPE UNTUK STATUS MURID
-- ================================================================

CREATE TYPE murid_status AS ENUM (
  'AKTIF',
  'TIDAK_AKTIF'
);

-- ================================================================
-- 2. CREATE TABLE MURID
-- ================================================================

CREATE TABLE murid (
  -- =====================================================
  -- PRIMARY KEY & IDENTIFIKASI
  -- =====================================================
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- =====================================================
  -- DATA PERSONAL
  -- =====================================================
  nama VARCHAR(255) NOT NULL
    CONSTRAINT check_nama_not_empty CHECK (TRIM(nama) != ''),
  
  usia INTEGER NOT NULL
    CONSTRAINT check_usia_positive CHECK (usia > 0),
  
  no_hp VARCHAR(20) NOT NULL
    CONSTRAINT check_no_hp_not_empty CHECK (TRIM(no_hp) != ''),
  
  alamat TEXT,
  
  -- =====================================================
  -- STATUS & AUDIT
  -- =====================================================
  status murid_status NOT NULL DEFAULT 'AKTIF',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- =====================================================
  -- CONSTRAINTS
  -- =====================================================
  CONSTRAINT unique_no_hp UNIQUE (no_hp)
);

-- ================================================================
-- 3. INDEX UNTUK QUERY PERFORMANCE
-- ================================================================

-- Index pada status untuk query daftar murid aktif
CREATE INDEX idx_murid_status ON murid(status);

-- Index pada no_hp untuk pencarian cepat dan validasi duplikat
CREATE INDEX idx_murid_no_hp ON murid(no_hp);

-- Index pada created_at untuk sorting history
CREATE INDEX idx_murid_created_at ON murid(created_at DESC);

-- ================================================================
-- 4. TRIGGER UNTUK AUTO-UPDATE TIMESTAMP
-- ================================================================

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

-- ================================================================
-- 5. COMMENTS (DOKUMENTASI KOLOM)
-- ================================================================

COMMENT ON TABLE murid IS 
'Tabel data murid (siswa) dalam sistem manajemen bimbingan belajar.
Terhubung ke: jadwal, absensi, pembayaran, dan laporan keuangan.';

COMMENT ON COLUMN murid.id IS 
'UUID primary key - identifier unik untuk setiap murid';

COMMENT ON COLUMN murid.nama IS 
'Nama lengkap murid - wajib diisi dan tidak boleh kosong';

COMMENT ON COLUMN murid.usia IS 
'Usia murid dalam tahun - validasi: harus > 0';

COMMENT ON COLUMN murid.no_hp IS 
'Nomor handphone murid - bersifat UNIQUE (tidak boleh duplikat)';

COMMENT ON COLUMN murid.alamat IS 
'Alamat lengkap murid - opsional (bisa NULL)';

COMMENT ON COLUMN murid.status IS 
'Status murid: AKTIF (masih belajar) atau TIDAK_AKTIF (berhenti)
Murid TIDAK_AKTIF: tidak muncul di tagihan dan tidak bisa dapat jadwal baru';

COMMENT ON COLUMN murid.created_at IS 
'Timestamp pembuatan data murid - auto-set saat INSERT';

COMMENT ON COLUMN murid.updated_at IS 
'Timestamp update terakhir - auto-update saat ada perubahan';

COMMENT ON TYPE murid_status IS 
'ENUM status murid: AKTIF (belajar aktif) atau TIDAK_AKTIF (berhenti sementara/permanen)';

-- ================================================================
-- 6. SAMPLE DATA (OPTIONAL - untuk testing)
-- ================================================================
-- Uncomment jika ingin insert sample data:
/*
INSERT INTO murid (nama, usia, no_hp, alamat, status) VALUES
('Ahmad Rizki', 14, '081234567890', 'Jl. Merdeka No. 123, Jakarta', 'AKTIF'),
('Siti Nurhaliza', 15, '082345678901', 'Jl. Sudirman No. 456, Jakarta', 'AKTIF'),
('Budi Santoso', 13, '083456789012', 'Jl. Gatot Subroto No. 789, Jakarta', 'TIDAK_AKTIF');
*/

-- ================================================================
-- END OF SCRIPT
-- ================================================================
