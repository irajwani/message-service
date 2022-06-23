import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { RoomService } from './room.service';
import { RequestWithUser } from '../../Common/Types/request-with-user';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly roomService: RoomService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const roomId = req.params.id;

        const room = await this.roomService.getRoomById(roomId);

        if (room.createdBy === req.user._id) {
          resolve(true);
        }

        resolve(false);
      } catch (e) {}
    });
  }
}
