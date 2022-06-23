import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { healthCheckResponseMock } from './Mocks/healthCheck';
import { UserService } from '../src/Server/User/user.service';

describe('App (e2e)', () => {
  let app: INestApplication;
  const userService = {
    getUser: jest.fn((id: string) => ({})),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('should say app is healthy', async () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect(healthCheckResponseMock);
    });
  });

  // describe('User', () => {
  //   it(`/GET :userId should return expected user`, async () => {
  //     const body = {
  //     };
  //     const expected = userService.getRates(body);
  //     return requestFunction('/users/', body, expected, app);
  //   });
  // });
});
