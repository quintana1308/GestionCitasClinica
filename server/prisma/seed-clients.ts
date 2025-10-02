import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedClients() {
  console.log('🏥 Iniciando seed de clientes...');

  // Verificar que existe el rol de cliente
  const clientRole = await prisma.role.findUnique({
    where: { name: 'client' }
  });

  if (!clientRole) {
    console.error('❌ Error: No existe el rol "client". Ejecuta el seed principal primero.');
    return;
  }

  // Clientes de ejemplo
  const clients = [
    {
      email: 'sofia.rodriguez@email.com',
      password: await bcrypt.hash('Client123!', 12),
      firstName: 'Sofía',
      lastName: 'Rodríguez',
      phone: '+1234567894',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'F',
      address: 'Av. Principal 456, Ciudad',
      emergencyContact: 'Juan Rodríguez - +1234567895',
      medicalConditions: 'Ninguna',
      allergies: 'Ninguna conocida'
    },
    {
      email: 'laura.fernandez@email.com',
      password: await bcrypt.hash('Client123!', 12),
      firstName: 'Laura',
      lastName: 'Fernández',
      phone: '+1234567896',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'F',
      address: 'Calle Secundaria 789, Ciudad',
      emergencyContact: 'Carlos Fernández - +1234567897',
      medicalConditions: 'Hipertensión leve',
      allergies: 'Penicilina'
    },
    {
      email: 'carmen.torres@email.com',
      password: await bcrypt.hash('Client123!', 12),
      firstName: 'Carmen',
      lastName: 'Torres',
      phone: '+1234567898',
      dateOfBirth: new Date('1988-11-10'),
      gender: 'F',
      address: 'Plaza Central 321, Ciudad',
      emergencyContact: 'Miguel Torres - +1234567899',
      medicalConditions: 'Diabetes tipo 2',
      allergies: 'Látex'
    },
    {
      email: 'ana.martinez@email.com',
      password: await bcrypt.hash('Client123!', 12),
      firstName: 'Ana',
      lastName: 'Martínez',
      phone: '+1234567800',
      dateOfBirth: new Date('1992-04-18'),
      gender: 'F',
      address: 'Av. Norte 654, Ciudad',
      emergencyContact: 'Luis Martínez - +1234567801',
      medicalConditions: 'Ninguna',
      allergies: 'Ninguna conocida'
    },
    {
      email: 'patricia.gomez@email.com',
      password: await bcrypt.hash('Client123!', 12),
      firstName: 'Patricia',
      lastName: 'Gómez',
      phone: '+1234567802',
      dateOfBirth: new Date('1987-09-25'),
      gender: 'F',
      address: 'Calle Sur 987, Ciudad',
      emergencyContact: 'Roberto Gómez - +1234567803',
      medicalConditions: 'Asma leve',
      allergies: 'Polen'
    }
  ];

  for (const clientData of clients) {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: clientData.email }
    });

    if (existingUser) {
      console.log(`⚠️  Cliente ${clientData.email} ya existe, saltando...`);
      continue;
    }

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: clientData.email,
        password: clientData.password,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        phone: clientData.phone,
        isActive: true
      }
    });

    // Asignar rol de cliente
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: clientRole.id
      }
    });

    // Crear perfil de cliente
    await prisma.client.create({
      data: {
        userId: user.id,
        dateOfBirth: clientData.dateOfBirth,
        gender: clientData.gender,
        address: clientData.address,
        emergencyContact: clientData.emergencyContact,
        medicalConditions: clientData.medicalConditions,
        allergies: clientData.allergies,
        clientCode: `CLI${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      }
    });

    console.log(`✅ Cliente creado: ${clientData.firstName} ${clientData.lastName} (${clientData.email})`);
  }

  console.log('🎉 Seed de clientes completado exitosamente');
  console.log('👤 Clientes creados con contraseña: Client123!');
}

seedClients()
  .catch((e) => {
    console.error('❌ Error durante el seed de clientes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
