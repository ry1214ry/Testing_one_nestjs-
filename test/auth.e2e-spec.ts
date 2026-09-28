import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';

describe('Authentication flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const email = `e2e-${randomUUID()}@example.com`;
  const password = 'Str0ngPass123';

  let registered: { accessToken: string; refreshToken: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM refresh_tokens rt USING users u WHERE rt."userId" = u.id AND u.email = $1`,
      [email],
    );
    await dataSource.query(`DELETE FROM users WHERE email = $1`, [email]);
    await app.close();
  });

  it('register: creates an account and returns an access + refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('USER');
    registered = res.body;
  });

  it('register: rejects a duplicate email with 409', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(409);

    expect(res.body.message).toBe('Email is already registered');
  });

  it('register: rejects unknown extra fields (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, extraField: 'x' })
      .expect(400);

    expect(res.body.message).toContainEqual(
      expect.stringContaining('extraField'),
    );
  });

  it('login: returns a fresh token pair with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  it('login: returns a generic error for a wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'WrongPass123' })
      .expect(401);

    expect(res.body.message).toBe('Invalid email or password');
  });

  it('login: returns the same generic error for an unknown email', async () => {
    const existing = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'WrongPass123' })
      .expect(401);

    const unknown = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: `ghost-${randomUUID()}@example.com`, password: 'WrongPass123' })
      .expect(401);

    expect(unknown.body.message).toBe(existing.body.message);
  });

  it('users/me: returns the current user from a valid access token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${registered.accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(email);
    expect(res.body.role).toBe('USER');
  });

  it('users/me: rejects requests without an access token', async () => {
    await request(app.getHttpServer()).get('/api/users/me').expect(401);
  });

  it('users: rejects a USER role on an admin-only route with 403', async () => {
    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${registered.accessToken}`)
      .expect(403);
  });

  it('refresh: rotates the refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: registered.refreshToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(registered.refreshToken);
    registered = res.body;
  });

  it('refresh: rejects reuse of an already rotated refresh token', async () => {
    const oldRefreshToken = registered.refreshToken;

    const rotated = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(401);

    registered = rotated.body;
  });

  it('refresh: rejects an arbitrary invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'not-a-real-token' })
      .expect(401);
  });

  it('logout: revokes the presented refresh token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .send({ refreshToken: registered.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: registered.refreshToken })
      .expect(401);
  });
});