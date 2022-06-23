const ERRORS = {
  INTERNAL_SERVER: {
    code: -1,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Internal Server Error',
  },
  INVALID_CREDENTIALS: {
    code: 1,
    error: 'INVALID_CREDENTIALS_ERROR',
    message: 'Incorrect email/password',
  },
  INSUFFICIENT_PERMISSION: {
    code: 2,
    error: 'INSUFFICIENT_PERMISSION_ERROR',
    message:
      'You are not authorized. Please use a valid set of credentials or a valid jwt.',
  },
  USER_DOES_NOT_EXIST: {
    code: 3,
    error: 'USER_DOES_NOT_EXIST',
    message: 'No user with that username and password combination exists.',
  },
  USER_EXISTS: {
    code: 4,
    error: 'USER_EXISTS_ERROR',
    message: 'User with this username already exists',
  },
  MISSING_TOKEN_HEADER: {
    code: 5,
    error: 'MISSING_TOKEN_HEADER_ERROR',
    message:
      "This endpoint is a protected resource. Please specify a 'token' in headers",
  },
  ROOM_NOT_FOUND: {
    code: 6,
    error: 'ROOM_NOT_FOUND_ERROR',
    message: 'Chat Room with that ID does not exist.',
  },
  ROOM_MEMBER_EXISTS: {
    code: 7,
    error: 'ROOM_MEMBER_EXISTS_ERROR',
    message: 'User is already part of this chat room',
  },
  NOT_ROOM_MEMBER: {
    code: 8,
    error: 'NOT_ROOM_MEMBER_ERROR',
    message: 'User is not a part of this chat room',
  },
  BLOCKED_USER: {
    code: 9,
    error: 'BLOCKED_USER_ERROR',
    message: 'This user has blocked you. You can not send them a message.',
  },
  NO_MESSAGES: {
    code: 10,
    error: 'NO_MESSAGES_ERROR',
    message: 'This user has not sent any messages to any chat room.',
  },
};

export { ERRORS };
