// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module'; // Import your main AppModule
import { PrismaService } from './../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Use validation pipe for e2e tests
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
  });
  
  // Clean up the database before each test
  beforeEach(async () => {
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: 'e2e-test@example.com',
    password: 'password123',
    firstName: 'E2E',
    lastName: 'Test',
  };

  it('/auth/register (POST) - should create a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.email).toEqual(testUser.email);
        expect(res.body.passwordHash).toBeUndefined(); // Ensure hash is not returned
      });
  });
  
  it('/auth/register (POST) - should fail if email is already taken', async () => {
    // First, register the user
    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    // Then, try to register with the same email again
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409); // Conflict
  });

  describe('Login and Profile Access', () => {
    let accessToken: string;

    // Register and log in the user before tests in this block
    beforeEach(async () => {
        await request(app.getHttpServer()).post('/auth/register').send(testUser);
        
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);
            
        accessToken = loginResponse.body.access_token;
        expect(accessToken).toBeDefined();
    });

    it('/auth/login (POST) - should log in a user and return an access token', () => {
      // This test is effectively handled by the beforeEach block,
      // but we can assert the token exists.
      expect(accessToken).toBeDefined();
    });

    it('/auth/profile (GET) - should access profile with a valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.email).toEqual(testUser.email);
        });
    });

    it('/auth/profile (GET) - should fail without a token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401); // Unauthorized
    });
  });
});