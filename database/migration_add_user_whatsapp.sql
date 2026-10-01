USE hibah_peternakan;

ALTER TABLE users
  ADD COLUMN contact_whatsapp VARCHAR(32) NOT NULL DEFAULT '' AFTER email;