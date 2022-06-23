import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../Types/request-with-user';
import { LogTypes } from '../../Server/Log/Types/log';
import { LogService } from '../../Server/Log/log.service';
import { CreateLogDto } from '../../Server/Log/Validation/create-log.dto';

@Injectable()
class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logService: LogService) {}
  private readonly logger = new Logger('Custom HTTP Logger');

  use(request: RequestWithUser, response: Response, next: NextFunction) {
    response.on('finish', async () => {
      const { method, originalUrl } = request;
      const userAgent = request.get('user-agent');
      const { statusCode, statusMessage } = response;

      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage} from client: ${userAgent}`;

      // If there is no req.user, should ideally use user ID for custom unknown user which exists in db.users
      const log: CreateLogDto = {
        user: request.user ? request.user._id : 'unauthorized user',
        text: this.logService.generateTextBasedOnServerResponse(
          originalUrl,
          statusCode,
        ),
        action: `${method} ${originalUrl}`,
        type: LogTypes.SUCCESS,
      };

      if (statusCode >= 500) {
        log.type = LogTypes.ERROR;
        this.logger.error(message);
        await this.logService.createLog(log);
        return;
      }

      if (statusCode >= 400) {
        log.type = LogTypes.WARNING;
        this.logger.warn(message);
        await this.logService.createLog(log);
        return;
      }

      this.logger.log(message);
      await this.logService.createLog(log);
      return;
    });

    next();
  }
}

export default LoggerMiddleware;
