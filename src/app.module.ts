import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import ConfigurationModule from './Configurations/Config/config.module';
import DatabaseModule from './Configurations/Database/DatabaseModule';
import { HealthModule } from './Server/Health/health.module';
import { AuthModule, ChatModule, UserModule } from './Server';
import LoggerMiddleware from './Common/Middleware/logger.middleware';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UserModule,
    ChatModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
