import * as Joi from 'joi';
import { ConfigRegisterAs } from './configRegisterAs';

export default ConfigRegisterAs({
  token: 'app',
  configFactory: () => ({
    name: process.env.APP_NAME || 'Message Service',
    coreCount: process.env.APP_CORE || '2',
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'dev',
    swaggerEnabled: process.env.SWAGGER_ENABLED || 'true',
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY || 'secret', // for development purposes
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || '7d',
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
  }),
  validationSchema: Joi.object().keys({
    name: Joi.string().required(),
    coreCount: Joi.number().required().min(1).max(4),
    port: Joi.number(),
    nodeEnv: Joi.string(),
    swaggerEnabled: Joi.boolean(),
    accessTokenSecretKey: Joi.string().required(),
    accessTokenExpiration: Joi.string(),
    redisHost: Joi.string(),
    redisPort: Joi.number(),
  }),
  validationOptions: {
    convert: true,
  },
});
