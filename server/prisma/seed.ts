import { PrismaClient, AppointmentStatus, PaymentMethod, PaymentStatus, ExpenseStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateClientCode } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrador del sistema',
      permissions: {
        all: true,
        users: ['create', 'read', 'update', 'delete'],
        appointments: ['create', 'read', 'update', 'delete'],
        treatments: ['create', 'read', 'update', 'delete'],
        supplies: ['create', 'read', 'update', 'delete'],
        payments: ['create', 'read', 'update', 'delete'],
        reports: ['read']
      }
    }
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Empleado de la clínica',
      permissions: {
        appointments: ['create', 'read', 'update'],
        clients: ['create', 'read', 'update'],
        treatments: ['read'],
        supplies: ['read', 'update'],
        payments: ['create', 'read']
      }
    }
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'client' },
    update: {},
    create: {
      name: 'client',
      description: 'Cliente de la clínica',
      permissions: {
        appointments: ['read', 'update'],
        profile: ['read', 'update'],
        payments: ['read']
      }
    }
  });

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clinica.com' },
    update: {},
    create: {
      email: 'admin@clinica.com',
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      phone: '+1234567890',
      isActive: true
    }
  });

  // Asignar rol de admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  // Crear tratamientos de ejemplo
  const treatments = [
    {
      name: 'Limpieza Facial Profunda',
      description: 'Limpieza facial completa con extracción de comedones y mascarilla hidratante',
      duration: 60,
      price: 75.00,
      category: 'facial'
    },
    {
      name: 'Tratamiento Anti-edad',
      description: 'Tratamiento con ácido hialurónico para reducir líneas de expresión',
      duration: 90,
      price: 150.00,
      category: 'facial'
    },
    {
      name: 'Depilación Láser',
      description: 'Sesión de depilación láser para diferentes zonas del cuerpo',
      duration: 45,
      price: 120.00,
      category: 'laser'
    },
    {
      name: 'Masaje Corporal Relajante',
      description: 'Masaje corporal completo con aceites esenciales',
      duration: 60,
      price: 80.00,
      category: 'corporal'
    },
    {
      name: 'Peeling Químico',
      description: 'Peeling químico suave para renovación celular',
      duration: 45,
      price: 95.00,
      category: 'facial'
    }
  ];

  for (const treatment of treatments) {
    const existing = await prisma.treatment.findFirst({
      where: { name: treatment.name }
    });
    
    if (!existing) {
      await prisma.treatment.create({
        data: treatment
      });
    }
  }

  // Crear insumos de ejemplo
  const supplies = [
    {
      name: 'Ácido Hialurónico',
      description: 'Ácido hialurónico para tratamientos faciales',
      category: 'medicamento',
      unit: 'ml',
      stock: 50,
      minStock: 10,
      unitCost: 25.00,
      supplier: 'Laboratorios Estética'
    },
    {
      name: 'Mascarillas Hidratantes',
      description: 'Mascarillas faciales hidratantes desechables',
      category: 'consumible',
      unit: 'unidad',
      stock: 100,
      minStock: 20,
      unitCost: 2.50,
      supplier: 'Suministros Bella'
    },
    {
      name: 'Aceite de Masaje',
      description: 'Aceite esencial para masajes corporales',
      category: 'consumible',
      unit: 'ml',
      stock: 200,
      minStock: 50,
      unitCost: 0.15,
      supplier: 'Aromas Naturales'
    },
    {
      name: 'Guantes Desechables',
      description: 'Guantes de nitrilo desechables',
      category: 'consumible',
      unit: 'unidad',
      stock: 500,
      minStock: 100,
      unitCost: 0.05,
      supplier: 'Suministros Médicos'
    }
  ];

  for (const supply of supplies) {
    const existing = await prisma.supply.findFirst({
      where: { name: supply.name }
    });
    
    if (!existing) {
      await prisma.supply.create({
        data: supply
      });
    }
  }

  // Crear configuración del sistema
  const systemConfigs = [
    {
      key: 'clinic_name',
      value: { name: 'Clínica Estética Bella' },
      description: 'Nombre de la clínica'
    },
    {
      key: 'clinic_info',
      value: {
        phone: '+1234567890',
        email: 'info@clinica.com',
        address: 'Calle Principal 123, Ciudad',
        website: 'www.clinicabella.com'
      },
      description: 'Información de contacto de la clínica'
    },
    {
      key: 'business_hours',
      value: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { closed: true }
      },
      description: 'Horarios de atención de la clínica'
    },
    {
      key: 'appointment_settings',
      value: {
        defaultDuration: 60,
        bufferTime: 15,
        maxAdvanceBooking: 90,
        cancellationPolicy: 24
      },
      description: 'Configuración de citas'
    }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    });
  }

  // Crear empleados de ejemplo
  const employees = [
    {
      email: 'dra.martinez@clinica.com',
      password: await bcrypt.hash('Doctor123!', 12),
      firstName: 'María',
      lastName: 'Martínez',
      phone: '+1234567891',
      position: 'doctor',
      specialties: 'Dermatología, Medicina Estética'
    },
    {
      email: 'enf.garcia@clinica.com',
      password: await bcrypt.hash('Nurse123!', 12),
      firstName: 'Ana',
      lastName: 'García',
      phone: '+1234567892',
      position: 'nurse',
      specialties: 'Enfermería Estética'
    },
    {
      email: 'recep.lopez@clinica.com',
      password: await bcrypt.hash('Recep123!', 12),
      firstName: 'Carlos',
      lastName: 'López',
      phone: '+1234567893',
      position: 'receptionist',
      specialties: null
    }
  ];

  for (const emp of employees) {
    const existingUser = await prisma.user.findUnique({
      where: { email: emp.email }
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email: emp.email,
          password: emp.password,
          firstName: emp.firstName,
          lastName: emp.lastName,
          phone: emp.phone,
          isActive: true
        }
      });

      // Asignar rol de empleado
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: employeeRole.id
        }
      });

      // Crear registro de empleado
      await prisma.employee.create({
        data: {
          userId: newUser.id,
          position: emp.position,
          specialties: emp.specialties,
          hireDate: new Date(),
          salary: emp.position === 'doctor' ? 5000 : emp.position === 'nurse' ? 3000 : 2500,
          isActive: true
        }
      });
    }
  }

  // Crear clientes de ejemplo
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
      emergencyContact: 'Juan Rodríguez - +1234567895'
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
      emergencyContact: 'Pedro Fernández - +1234567897'
    },
    {
      email: 'carmen.torres@email.com',
      password: await bcrypt.hash('Client123!', 12),
      firstName: 'Carmen',
      lastName: 'Torres',
      phone: '+1234567898',
      dateOfBirth: new Date('1978-11-08'),
      gender: 'F',
      address: 'Plaza Central 321, Ciudad',
      emergencyContact: 'Miguel Torres - +1234567899'
    }
  ];

  for (const client of clients) {
    const existingUser = await prisma.user.findUnique({
      where: { email: client.email }
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email: client.email,
          password: client.password,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          isActive: true
        }
      });

      // Asignar rol de cliente
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: clientRole.id
        }
      });

      // Crear registro de cliente
      await prisma.client.create({
        data: {
          userId: newUser.id,
          dateOfBirth: client.dateOfBirth,
          gender: client.gender,
          address: client.address,
          emergencyContact: client.emergencyContact,
          clientCode: generateClientCode()
        }
      });
    }
  }

  // Crear citas de ejemplo
  const allClients = await prisma.client.findMany();
  const allEmployees = await prisma.employee.findMany();
  const allTreatments = await prisma.treatment.findMany();

  if (allClients.length > 0 && allEmployees.length > 0 && allTreatments.length > 0) {
    const appointments = [
      {
        clientId: allClients[0].id,
        employeeId: allEmployees[0]?.id,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T11:00:00'),
        status: AppointmentStatus.COMPLETED,
        notes: 'Primera sesión de limpieza facial. Cliente muy satisfecha.',
        totalAmount: 75.00
      },
      {
        clientId: allClients[1].id,
        employeeId: allEmployees[0]?.id,
        date: new Date('2024-01-20'),
        startTime: new Date('2024-01-20T14:00:00'),
        endTime: new Date('2024-01-20T15:30:00'),
        status: AppointmentStatus.COMPLETED,
        notes: 'Tratamiento anti-edad aplicado correctamente.',
        totalAmount: 150.00
      },
      {
        clientId: allClients[2].id,
        employeeId: allEmployees[1]?.id,
        date: new Date('2024-01-25'),
        startTime: new Date('2024-01-25T16:00:00'),
        endTime: new Date('2024-01-25T17:00:00'),
        status: AppointmentStatus.SCHEDULED,
        notes: 'Cita programada para masaje relajante.',
        totalAmount: 80.00
      },
      {
        clientId: allClients[0].id,
        employeeId: allEmployees[0]?.id,
        date: new Date('2024-02-01'),
        startTime: new Date('2024-02-01T11:00:00'),
        endTime: new Date('2024-02-01T11:45:00'),
        status: AppointmentStatus.CONFIRMED,
        notes: 'Segunda sesión de depilación láser.',
        totalAmount: 120.00
      }
    ];

    for (const apt of appointments) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          clientId: apt.clientId,
          date: apt.date,
          startTime: apt.startTime
        }
      });

      if (!existingAppointment) {
        const newAppointment = await prisma.appointment.create({
          data: apt
        });

        // Asignar tratamiento aleatorio a la cita
        const randomTreatment = allTreatments[Math.floor(Math.random() * allTreatments.length)];
        await prisma.appointmentTreatment.create({
          data: {
            appointmentId: newAppointment.id,
            treatmentId: randomTreatment.id,
            quantity: 1,
            price: randomTreatment.price,
            notes: `Tratamiento: ${randomTreatment.name}`
          }
        });
      }
    }
  }

  // Crear pagos de ejemplo
  if (allClients.length > 0) {
    const payments = [
      {
        clientId: allClients[0].id,
        amount: 75.00,
        method: PaymentMethod.CARD,
        status: PaymentStatus.PAID,
        description: 'Pago por limpieza facial',
        paidDate: new Date('2024-01-15T11:30:00')
      },
      {
        clientId: allClients[1].id,
        amount: 150.00,
        method: PaymentMethod.CASH,
        status: PaymentStatus.PAID,
        description: 'Pago por tratamiento anti-edad',
        paidDate: new Date('2024-01-20T15:45:00')
      },
      {
        clientId: allClients[2].id,
        amount: 80.00,
        method: PaymentMethod.TRANSFER,
        status: PaymentStatus.PENDING,
        description: 'Pago pendiente por masaje',
        dueDate: new Date('2024-01-25T17:00:00')
      }
    ];

    for (const payment of payments) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          clientId: payment.clientId,
          amount: payment.amount,
          description: payment.description
        }
      });

      if (!existingPayment) {
        await prisma.payment.create({
          data: payment
        });
      }
    }
  }

  // Crear gastos de ejemplo
  const expenses = [
    {
      description: 'Compra de ácido hialurónico',
      amount: 1250.00,
      category: 'insumos',
      date: new Date('2024-01-10'),
      status: ExpenseStatus.PAID,
      createdBy: adminUser.id
    },
    {
      description: 'Mantenimiento equipo láser',
      amount: 500.00,
      category: 'servicios',
      date: new Date('2024-01-12'),
      status: ExpenseStatus.PAID,
      createdBy: adminUser.id
    },
    {
      description: 'Compra de mascarillas hidratantes',
      amount: 250.00,
      category: 'insumos',
      date: new Date('2024-01-15'),
      status: ExpenseStatus.APPROVED,
      createdBy: adminUser.id
    }
  ];

  for (const expense of expenses) {
    const existingExpense = await prisma.expense.findFirst({
      where: {
        description: expense.description,
        amount: expense.amount
      }
    });

    if (!existingExpense) {
      await prisma.expense.create({
        data: expense
      });
    }
  }

  // Crear movimientos de inventario
  const supplyMovements = [
    {
      supplyId: (await prisma.supply.findFirst({ where: { name: 'Ácido Hialurónico' } }))?.id,
      type: MovementType.IN,
      quantity: 50,
      unitCost: 25.00,
      reason: 'Compra inicial',
      createdBy: adminUser.id
    },
    {
      supplyId: (await prisma.supply.findFirst({ where: { name: 'Mascarillas Hidratantes' } }))?.id,
      type: MovementType.OUT,
      quantity: 5,
      reason: 'Uso en tratamientos',
      createdBy: adminUser.id
    }
  ];

  for (const movement of supplyMovements) {
    if (movement.supplyId) {
      await prisma.supplyMovement.create({
        data: {
          supplyId: movement.supplyId,
          type: movement.type,
          quantity: movement.quantity,
          unitCost: movement.unitCost,
          reason: movement.reason,
          createdBy: movement.createdBy
        }
      });
    }
  }

  console.log('✅ Seed completado exitosamente');
  console.log('📧 Usuario admin creado: admin@clinica.com');
  console.log('🔑 Contraseña: Admin123!');
  console.log('👥 Empleados creados:');
  console.log('   - dra.martinez@clinica.com / Doctor123!');
  console.log('   - enf.garcia@clinica.com / Nurse123!');
  console.log('   - recep.lopez@clinica.com / Recep123!');
  console.log('👤 Clientes creados:');
  console.log('   - sofia.rodriguez@email.com / Client123!');
  console.log('   - laura.fernandez@email.com / Client123!');
  console.log('   - carmen.torres@email.com / Client123!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
