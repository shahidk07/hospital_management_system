import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data in correct order to avoid foreign key errors
  await prisma.auditLog.deleteMany({}).catch(() => {});
  await prisma.notification.deleteMany({}).catch(() => {});
  await prisma.payment.deleteMany({}).catch(() => {});
  await prisma.invoice.deleteMany({}).catch(() => {});
  await prisma.medicalRecord.deleteMany({}).catch(() => {});
  await prisma.prescription.deleteMany({}).catch(() => {});
  await prisma.consultation.deleteMany({}).catch(() => {});
  await prisma.appointment.deleteMany({}).catch(() => {});
  await prisma.doctorProfile.deleteMany({}).catch(() => {});
  await prisma.patientProfile.deleteMany({}).catch(() => {});
  await prisma.refreshToken.deleteMany({}).catch(() => {});
  await prisma.user.deleteMany({}).catch(() => {});
  await prisma.department.deleteMany({}).catch(() => {});

  // 2. Create Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123', SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });
  console.log('Seeded Admin User: admin@hospital.com / Admin@123');

  // 3. Create Departments
  const depts = [
    { name: 'General Medicine', description: 'Primary healthcare and diagnostics' },
    { name: 'Cardiology', description: 'Heart and cardiovascular healthcare' },
    { name: 'Orthopedics', description: 'Musculoskeletal system care' },
    { name: 'Pediatrics', description: 'Child and adolescent healthcare' },
    { name: 'Dermatology', description: 'Skin, hair, and nail treatments' },
    { name: 'Neurology', description: 'Brain and nervous system diagnostics' }
  ];

  const departmentMap = {};
  for (const d of depts) {
    const dept = await prisma.department.create({
      data: d
    });
    departmentMap[dept.name] = dept.id;
    console.log(`Seeded Department: ${dept.name}`);
  }

  // 4. Create Doctor Users & Profiles
  const doctorPasswordHash = await bcrypt.hash('Doctor@123', SALT_ROUNDS);

  const doctorsData = [
    {
      email: 'jane.smith@hospital.com',
      firstName: 'Jane',
      lastName: 'Smith',
      specialization: 'Cardiology',
      deptName: 'Cardiology',
      phone: '+919876543211',
      licenseNumber: 'MED-11111'
    },
    {
      email: 'robert.kumar@hospital.com',
      firstName: 'Robert',
      lastName: 'Kumar',
      specialization: 'General Medicine',
      deptName: 'General Medicine',
      phone: '+919876543212',
      licenseNumber: 'MED-22222'
    },
    {
      email: 'priya.sharma@hospital.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      specialization: 'Pediatrics',
      deptName: 'Pediatrics',
      phone: '+919876543213',
      licenseNumber: 'MED-33333'
    }
  ];

  for (const doc of doctorsData) {
    const user = await prisma.user.create({
      data: {
        email: doc.email,
        passwordHash: doctorPasswordHash,
        role: 'DOCTOR'
      }
    });

    const profile = await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        specialization: doc.specialization,
        departmentId: departmentMap[doc.deptName],
        phone: doc.phone,
        licenseNumber: doc.licenseNumber
      }
    });

    console.log(`Seeded Doctor: Dr. ${doc.firstName} ${doc.lastName} (${doc.email} / Doctor@123)`);
  }

  // 5. Create Sample Patients
  const patientPasswordHash = await bcrypt.hash('Patient@123', SALT_ROUNDS);
  const patientsData = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'Male',
      phone: '+919876543214',
      address: '123 Main St',
      bloodGroup: 'O+',
      allergies: 'Penicillin'
    },
    {
      email: 'sarah.wilson@example.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      dateOfBirth: new Date('1995-10-20'),
      gender: 'Female',
      phone: '+919876543215',
      address: '456 Oak Ave',
      bloodGroup: 'A-',
      allergies: 'None'
    }
  ];

  for (const pat of patientsData) {
    const user = await prisma.user.create({
      data: {
        email: pat.email,
        passwordHash: patientPasswordHash,
        role: 'PATIENT'
      }
    });

    const profile = await prisma.patientProfile.create({
      data: {
        userId: user.id,
        firstName: pat.firstName,
        lastName: pat.lastName,
        dateOfBirth: pat.dateOfBirth,
        gender: pat.gender,
        phone: pat.phone,
        address: pat.address,
        bloodGroup: pat.bloodGroup,
        allergies: pat.allergies
      }
    });

    console.log(`Seeded Patient: ${pat.firstName} ${pat.lastName} (${pat.email} / Patient@123)`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
