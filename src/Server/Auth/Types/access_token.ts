export interface IAccessToken {
  access_token: string;
}

export interface IAccessTokenValidate {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
