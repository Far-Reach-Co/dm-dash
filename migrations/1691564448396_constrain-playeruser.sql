-- Up Migration
ALTER TABLE public."PlayerUser"
ADD CONSTRAINT chk_player_user_diff CHECK (player_id <> user_id);
-- Down Migration
ALTER TABLE public."PlayerUser"
DROP CONSTRAINT chk_player_user_diff;