import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import DatabaseConfig from './config';

export default MongooseModule.forRootAsync({
  imports: [DatabaseConfig],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get('database').uri,
    autoIndex: true,
  }),
  inject: [ConfigService],
});
