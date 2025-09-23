ALTER DATABASE postgres SET client_encoding to 'UTF8';
ALTER DATABASE postgres SET TimeZone to 'Asia/Tokyo';
ALTER DATABASE postgres SET datestyle to 'ISO, YMD';
ALTER DATABASE postgres SET idle_in_transaction_session_timeout to '10min';
CREATE ROLE anon; -- Supabase固有のRoleを作成
