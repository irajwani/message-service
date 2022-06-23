import { HttpException, HttpStatus } from '@nestjs/common';
import { ERRORS } from './messages';

export class InternalServerException extends HttpException {
  constructor() {
    super(ERRORS.INTERNAL_SERVER, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(ERRORS.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);
  }
}

export class InsufficientPermissionException extends HttpException {
  constructor() {
    super(ERRORS.INSUFFICIENT_PERMISSION, HttpStatus.FORBIDDEN);
  }
}

export class MissingTokenHeaderException extends HttpException {
  constructor() {
    super(ERRORS.MISSING_TOKEN_HEADER, HttpStatus.UNAUTHORIZED);
  }
}

export class UserDoesNotExistException extends HttpException {
  constructor() {
    super(ERRORS.USER_DOES_NOT_EXIST, HttpStatus.NOT_FOUND);
  }
}

export class UserExistsException extends HttpException {
  constructor() {
    super(ERRORS.USER_EXISTS, HttpStatus.BAD_REQUEST);
  }
}

export class RoomNotFoundException extends HttpException {
  constructor() {
    super(ERRORS.ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class RoomMemberExistsException extends HttpException {
  constructor() {
    super(ERRORS.ROOM_MEMBER_EXISTS, HttpStatus.BAD_REQUEST);
  }
}

export class UserNotRoomMemberException extends HttpException {
  constructor() {
    super(ERRORS.NOT_ROOM_MEMBER, HttpStatus.BAD_REQUEST);
  }
}

export class BlockedUserException extends HttpException {
  constructor() {
    super(ERRORS.BLOCKED_USER, HttpStatus.BAD_REQUEST);
  }
}

export class NoMessagesException extends HttpException {
  constructor() {
    super(ERRORS.NO_MESSAGES, HttpStatus.NOT_FOUND);
  }
}

export enum MongooseErrorCodes {
  UniquePropViolation = '11000',
}
