USE hibah_peternakan;

ALTER TABLE db_field
  MODIFY COLUMN field_label VARCHAR(1000) NOT NULL;

ALTER TABLE db_verification_field
  MODIFY COLUMN field_label VARCHAR(1000) NOT NULL;