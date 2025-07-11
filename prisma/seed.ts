// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const permCreateUser = await prisma.permission.upsert({
    where: { name: 'users:create' },
    update: {},
    create: { name: 'users:create', description: 'Allows creating new users' },
  });

  const permCreateDoctor = await prisma.permission.upsert({
    where: { name: 'doctors:create' },
    update: {},
    create: { name: 'doctors:create', description: 'Allows creating new doctor records' },
  });

  const permCreatePatient = await prisma.permission.upsert({
    where: { name: 'patients:create' },
    update: {},
    create: { name: 'patients:create', description: 'Allows creating new patient records' },
  });

  console.log('Created Permissions...');

  const roleAdmin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrator with all permissions' },
  });

  const roleDoctor = await prisma.role.upsert({
    where: { name: 'DOCTOR' },
    update: {},
    create: { name: 'DOCTOR', description: 'Doctor with clinical permissions' },
  });

  const rolePatient = await prisma.role.upsert({
    where: { name: 'PATIENT' },
    update: {},
    create: { name: 'PATIENT', description: 'Patient with access to own records' },
  });

  console.log('Created Roles...');

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: roleAdmin.id, permissionId: permCreateUser.id } },
    update: {},
    create: { roleId: roleAdmin.id, permissionId: permCreateUser.id },
  });
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: roleAdmin.id, permissionId: permCreateDoctor.id } },
    update: {},
    create: { roleId: roleAdmin.id, permissionId: permCreateDoctor.id },
  });
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: roleAdmin.id, permissionId: permCreatePatient.id } },
    update: {},
    create: { roleId: roleAdmin.id, permissionId: permCreatePatient.id },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: roleDoctor.id, permissionId: permCreatePatient.id } },
    update: {},
    create: { roleId: roleDoctor.id, permissionId: permCreatePatient.id },
  });

  console.log('Assigned Permissions to Roles...');

  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@denti-code.com' },
    update: {},
    create: {
      email: 'admin@denti-code.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: password,
    },
  });

  const doctor1 = await prisma.user.upsert({
    where: { email: 'susan.storm@denti-code.com' },
    update: {},
    create: {
      email: 'susan.storm@denti-code.com',
      firstName: 'Susan',
      lastName: 'Storm',
      passwordHash: password,
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: 'peter.parker@denti-code.com' },
    update: {},
    create: {
      email: 'peter.parker@denti-code.com',
      firstName: 'Peter',
      lastName: 'Parker',
      passwordHash: password,
    },
  });

  const patient1 = await prisma.user.upsert({ where: { email: 'patient1@example.com' }, update: {}, create: { email: 'patient1@example.com', firstName: 'John', lastName: 'Doe', passwordHash: password } });
  const patient2 = await prisma.user.upsert({ where: { email: 'patient2@example.com' }, update: {}, create: { email: 'patient2@example.com', firstName: 'Jane', lastName: 'Smith', passwordHash: password } });
  const patient3 = await prisma.user.upsert({ where: { email: 'patient3@example.com' }, update: {}, create: { email: 'patient3@example.com', firstName: 'Alice', lastName: 'Johnson', passwordHash: password } });
  const patient4 = await prisma.user.upsert({ where: { email: 'patient4@example.com' }, update: {}, create: { email: 'patient4@example.com', firstName: 'Bob', lastName: 'Williams', passwordHash: password } });
  const patient5 = await prisma.user.upsert({ where: { email: 'patient5@example.com' }, update: {}, create: { email: 'patient5@example.com', firstName: 'Charlie', lastName: 'Brown', passwordHash: password } });

  console.log('Created Users...');

  await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: roleAdmin.id } }, update: {}, create: { userId: admin.id, roleId: roleAdmin.id } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: doctor1.id, roleId: roleDoctor.id } }, update: {}, create: { userId: doctor1.id, roleId: roleDoctor.id } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: doctor2.id, roleId: roleDoctor.id } }, update: {}, create: { userId: doctor2.id, roleId: roleDoctor.id } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: patient1.id, roleId: rolePatient.id } }, update: {}, create: { userId: patient1.id, roleId: rolePatient.id } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: patient2.id, roleId: rolePatient.id } }, update: {}, create: { userId: patient2.id, roleId: rolePatient.id } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: patient3.id, roleId: rolePatient.id } }, update: {}, create: { userId: patient3.id, roleId: rolePatient.id } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: patient4.id, roleId: rolePatient.id } }, update: {}, create: { userId: patient4.id, roleId: rolePatient.id } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: patient5.id, roleId: rolePatient.id } }, update: {}, create: { userId: patient5.id, roleId: rolePatient.id } });

  console.log('Assigned Roles to Users...');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
