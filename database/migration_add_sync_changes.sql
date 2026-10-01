USE hibah_peternakan;

CREATE TABLE IF NOT EXISTS app_sync_changes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  collection_name VARCHAR(40) NOT NULL,
  entity_id VARCHAR(80) NOT NULL,
  operation VARCHAR(12) NOT NULL,
  payload JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sync_collection_id (collection_name, id)
) ENGINE=InnoDB;