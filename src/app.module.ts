import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import ConfigurationModule from './Configurations/Config/config.module';
import DatabaseModule from './Configurations/Database/DatabaseModule';
import { HealthModule } from './Server/Health/health.module';
import { AuthModule, ChatModule, RoomModule, UserModule } from './Server';
import LoggerMiddleware from './Common/Middleware/logger.middleware';
import { AuthController } from './Server/Auth/auth.controller';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UserModule,
    RoomModule,
    ChatModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
