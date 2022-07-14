import { ConfigModule, registerAs } from '@nestjs/config';

export default ConfigModule.forFeature(
  registerAs('database', () => ({
    uri:
      process.env.NODE_ENV === 'test'
        ? process.env.DB_TEST_URI
        : process.env.DB_URI,
  })),
);
