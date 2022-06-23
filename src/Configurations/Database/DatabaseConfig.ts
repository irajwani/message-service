import { ConfigModule, registerAs } from '@nestjs/config';

export default ConfigModule.forFeature(
  registerAs('database', () => ({
    uri: process.env.DB_URI || 'mongodb://localhost:27017',
  })),
);
