import { ConfigModule } from '@nestjs/config';

import AppConfig from './app.config';

export default ConfigModule.forRoot({
  isGlobal: true,
  load: [AppConfig],
});
