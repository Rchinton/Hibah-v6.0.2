USE hibah_peternakan;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(80) NOT NULL,
  name VARCHAR(180) NOT NULL,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(180) NOT NULL,
  contact_whatsapp VARCHAR(32) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  status VARCHAR(32) NOT NULL DEFAULT 'Aktif',
  photo MEDIUMTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status)
) ENGINE=InnoDB;

INSERT INTO app_metadata (meta_key, meta_value)
VALUES ('users_initialized', '0')
ON DUPLICATE KEY UPDATE meta_key = VALUES(meta_key);