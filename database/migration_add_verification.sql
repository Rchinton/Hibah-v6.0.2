USE hibah_peternakan;

CREATE TABLE IF NOT EXISTS db_verification_field (
  id VARCHAR(80) NOT NULL,
  field_label VARCHAR(1000) NOT NULL,
  field_key VARCHAR(120) NOT NULL,
  field_type VARCHAR(32) NOT NULL,
  field_options TEXT NOT NULL,
  field_placeholder VARCHAR(255) NOT NULL DEFAULT '',
  field_description TEXT NOT NULL,
  is_required TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_db_verification_field_key (field_key),
  KEY idx_db_verification_field_order (display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS db_hibah_verification (
  id VARCHAR(80) NOT NULL,
  hibah_id VARCHAR(80) NOT NULL,
  no_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Terverifikasi',
  hibah_snapshot JSON NOT NULL,
  verification_values JSON NOT NULL,
  verified_by VARCHAR(80) NULL,
  verified_by_name VARCHAR(180) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_verification_per_hibah (hibah_id),
  KEY idx_verification_no_id (no_id),
  KEY idx_verification_updated_at (updated_at),
  CONSTRAINT fk_verification_hibah FOREIGN KEY (hibah_id) REFERENCES db_hibah (id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO app_metadata (meta_key, meta_value)
VALUES ('verification_fields_initialized', '1')
ON DUPLICATE KEY UPDATE meta_value = '1';

INSERT IGNORE INTO db_verification_field (id, field_label, field_key, field_type, field_options, field_description, is_required, display_order, is_active)
VALUES
  ('vf_kesesuaian', 'Kesesuaian data dengan dokumen', 'kesesuaian_data', 'list', 'Sesuai;Tidak sesuai;Perlu perbaikan', 'Bandingkan data pengajuan dengan dokumen pendukung.', 1, 0, 1),
  ('vf_dokumen', 'Kelengkapan dokumen', 'kelengkapan_dokumen', 'checklist', 'KTP;Proposal;Rencana Anggaran Biaya;Surat Pernyataan', 'Pilih seluruh dokumen yang sudah diterima dan diperiksa.', 0, 1, 1),
  ('vf_catatan', 'Catatan verifikator', 'catatan_verifikator', 'paragraph', '', 'Tuliskan temuan atau tindak lanjut yang diperlukan.', 0, 2, 1);