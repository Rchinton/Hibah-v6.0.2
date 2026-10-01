USE hibah_peternakan;

ALTER TABLE db_field
  ADD COLUMN field_placeholder VARCHAR(255) NOT NULL DEFAULT '' AFTER field_options,
  ADD COLUMN field_description TEXT NOT NULL AFTER field_placeholder;