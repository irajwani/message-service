import { ConfigModule } from '@nestjs/config';

import AppConfig from './appConfig';

export default ConfigModule.forRoot({
  isGlobal: true,
  load: [AppConfig],
});
