const TEST_ENV = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  SECRET_KEY: process.env.SECRET_KEY ?? 'test_secret_key',
};

export default TEST_ENV;
