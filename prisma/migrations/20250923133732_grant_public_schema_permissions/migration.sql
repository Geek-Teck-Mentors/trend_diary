-- 'anon' roleが存在しない場合に作成する(anonはSupabaseの固有のrole)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END
$$;

-- 権限を付与
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE public.articles TO anon;
GRANT USAGE ON SEQUENCE articles_article_id_seq TO anon;
