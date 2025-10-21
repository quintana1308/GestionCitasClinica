# Propuesta: Sistema Completo de Historial Médico y Seguimiento

## 🎯 Objetivos

1. **Historial detallado** de cada cita y tratamiento realizado
2. **Sistema de seguimiento** para retoques y tratamientos posteriores
3. **Gestión de fotos** antes/después con galería organizada
4. **Trazabilidad completa** del progreso del cliente

---

## 🗄️ Mejoras al Esquema de Base de Datos

### 1. **Nuevo Modelo: AppointmentRecord** (Registro de Cita)
```prisma
// Registro detallado de cada cita completada
model AppointmentRecord {
  id            String   @id @default(cuid())
  appointmentId String   @unique
  clientId      String
  employeeId    String
  date          DateTime
  
  // Detalles del tratamiento
  treatmentsPerformed Json     // Array de tratamientos con detalles específicos
  results         String?      // Resultados obtenidos
  observations    String?      // Observaciones del profesional
  complications   String?      // Complicaciones o efectos secundarios
  clientSatisfaction Int?      // Escala 1-5 de satisfacción
  
  // Seguimiento
  requiresFollowUp Boolean @default(false)
  followUpDate     DateTime?
  followUpNotes    String?
  
  // Archivos
  photos          Photo[]
  documents       Document[]
  
  // Auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relaciones
  appointment Appointment @relation(fields: [appointmentId], references: [id])
  client      Client      @relation(fields: [clientId], references: [id])
  employee    Employee    @relation(fields: [employeeId], references: [id])
  
  @@map("appointment_records")
}
```

### 2. **Nuevo Modelo: Photo** (Fotos del Tratamiento)
```prisma
model Photo {
  id        String   @id @default(cuid())
  recordId  String
  filename  String   // Nombre del archivo
  originalName String // Nombre original
  path      String   // Ruta del archivo
  size      Int      // Tamaño en bytes
  mimeType  String   // Tipo MIME
  
  // Metadatos
  type      PhotoType // BEFORE, AFTER, DURING, RESULT
  bodyArea  String?   // Área del cuerpo fotografiada
  angle     String?   // Ángulo de la foto (frontal, lateral, etc.)
  notes     String?   // Notas sobre la foto
  
  // Timestamps
  takenAt   DateTime @default(now())
  createdAt DateTime @default(now())
  
  // Relaciones
  record AppointmentRecord @relation(fields: [recordId], references: [id], onDelete: Cascade)
  
  @@map("photos")
}

enum PhotoType {
  BEFORE    // Antes del tratamiento
  DURING    // Durante el tratamiento
  AFTER     // Inmediatamente después
  RESULT    // Resultado final
  FOLLOWUP  // Foto de seguimiento
}
```

### 3. **Nuevo Modelo: Document** (Documentos Adjuntos)
```prisma
model Document {
  id        String   @id @default(cuid())
  recordId  String?
  clientId  String?  // Para documentos generales del cliente
  filename  String
  originalName String
  path      String
  size      Int
  mimeType  String
  
  // Metadatos
  type        DocumentType
  description String?
  
  // Timestamps
  createdAt DateTime @default(now())
  uploadedBy String  // ID del usuario que subió
  
  // Relaciones
  record AppointmentRecord? @relation(fields: [recordId], references: [id], onDelete: Cascade)
  client Client?           @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@map("documents")
}

enum DocumentType {
  CONSENT_FORM      // Consentimiento informado
  MEDICAL_REPORT    // Reporte médico
  PRESCRIPTION      // Prescripción
  INSURANCE         // Documentos de seguro
  IDENTIFICATION    // Identificación
  OTHER            // Otros documentos
}
```

### 4. **Nuevo Modelo: FollowUpPlan** (Plan de Seguimiento)
```prisma
model FollowUpPlan {
  id          String   @id @default(cuid())
  clientId    String
  recordId    String   // Registro que originó el seguimiento
  treatmentId String   // Tratamiento que requiere seguimiento
  
  // Detalles del seguimiento
  title       String   // Ej: "Retoque Botox zona frontal"
  description String?
  priority    FollowUpPriority @default(MEDIUM)
  status      FollowUpStatus   @default(PENDING)
  
  // Fechas
  scheduledDate DateTime
  completedDate DateTime?
  
  // Configuración
  reminderDays Int @default(7) // Días antes para recordatorio
  isRecurring  Boolean @default(false)
  recurringInterval Int? // Días entre repeticiones
  
  // Relaciones
  client      Client           @relation(fields: [clientId], references: [id])
  record      AppointmentRecord @relation(fields: [recordId], references: [id])
  treatment   Treatment        @relation(fields: [treatmentId], references: [id])
  
  // Auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  
  @@map("follow_up_plans")
}

enum FollowUpPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum FollowUpStatus {
  PENDING     // Pendiente
  SCHEDULED   // Programado
  COMPLETED   // Completado
  CANCELLED   // Cancelado
  OVERDUE     // Vencido
}
```

### 5. **Actualización del Modelo Client**
```prisma
// Agregar a Client existente:
model Client {
  // ... campos existentes ...
  
  // Nuevas relaciones
  appointmentRecords AppointmentRecord[]
  documents         Document[]
  followUpPlans     FollowUpPlan[]
  
  // ... resto del modelo ...
}
```

### 6. **Actualización del Modelo Appointment**
```prisma
// Agregar a Appointment existente:
model Appointment {
  // ... campos existentes ...
  
  // Nueva relación
  record AppointmentRecord?
  
  // ... resto del modelo ...
}
```

---

## 🚀 Funcionalidades del Sistema

### **1. Registro Automático de Citas**
- Al completar una cita, se crea automáticamente un `AppointmentRecord`
- Se registran todos los tratamientos realizados con detalles específicos
- El profesional puede agregar observaciones y resultados

### **2. Gestión de Fotos**
- **Subida múltiple** de fotos con drag & drop
- **Categorización automática**: Antes, Durante, Después, Resultado
- **Metadatos**: Área del cuerpo, ángulo, notas
- **Galería organizada** por fecha y tratamiento
- **Comparativas** antes/después automáticas

### **3. Sistema de Seguimiento**
- **Creación automática** de planes de seguimiento
- **Recordatorios** configurables
- **Estados** de seguimiento (Pendiente, Programado, Completado)
- **Prioridades** (Baja, Media, Alta, Urgente)

### **4. Historial Completo**
- **Timeline** visual del cliente
- **Evolución** de tratamientos
- **Fotos comparativas** a lo largo del tiempo
- **Documentos** organizados por fecha

---

## 📱 Propuesta de Interfaz

### **1. Pestaña "Historial Médico" en Cliente**
```
┌─────────────────────────────────────────────┐
│ 📋 Historial Médico - María García         │
├─────────────────────────────────────────────┤
│ 📊 Resumen                                  │
│ • Total de citas: 12                       │
│ • Tratamientos realizados: 8               │
│ • Próximo seguimiento: 15/Nov/2024         │
│                                             │
│ 📅 Timeline de Tratamientos                 │
│ ┌─ 2024-10-15 - Botox Frontal ──────────┐  │
│ │ ✅ Completado | 📸 4 fotos | 📄 2 docs │  │
│ │ Resultado: Excelente                   │  │
│ │ Próximo retoque: 2025-04-15           │  │
│ └────────────────────────────────────────┘  │
│                                             │
│ ┌─ 2024-09-20 - Limpieza Facial ────────┐  │
│ │ ✅ Completado | 📸 2 fotos             │  │
│ │ Satisfacción: ⭐⭐⭐⭐⭐                │  │
│ └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### **2. Modal "Completar Cita"**
```
┌─────────────────────────────────────────────┐
│ ✅ Completar Cita - Botox Frontal           │
├─────────────────────────────────────────────┤
│ 📝 Detalles del Tratamiento                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Tratamientos realizados:                │ │
│ │ ☑️ Botox zona frontal (20 unidades)    │ │
│ │ ☑️ Limpieza previa                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 📋 Resultados y Observaciones               │
│ ┌─────────────────────────────────────────┐ │
│ │ [Textarea para observaciones]           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 📸 Fotos del Tratamiento                    │
│ ┌─────────────────────────────────────────┐ │
│ │ [Zona de drag & drop para fotos]        │ │
│ │ Antes: [📸] [📸]  Después: [📸] [📸]   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 🔄 Seguimiento                              │
│ ☑️ Requiere retoque en 6 meses             │
│ Fecha sugerida: [15/04/2025]               │
│                                             │
│ [Cancelar] [Completar Cita] ←─────────────  │
└─────────────────────────────────────────────┘
```

### **3. Galería de Fotos**
```
┌─────────────────────────────────────────────┐
│ 📸 Galería - Botox Frontal                  │
├─────────────────────────────────────────────┤
│ 🔍 Filtros: [Todas] [Antes] [Después]      │
│                                             │
│ 📅 15 Oct 2024 - Sesión Inicial            │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐   │
│ │ ANTES │ │ ANTES │ │DESPUÉS│ │DESPUÉS│   │
│ │ [IMG] │ │ [IMG] │ │ [IMG] │ │ [IMG] │   │
│ │Frontal│ │Lateral│ │Frontal│ │Lateral│   │
│ └───────┘ └───────┘ └───────┘ └───────┘   │
│                                             │
│ 📅 20 Sep 2024 - Limpieza Facial           │
│ ┌───────┐ ┌───────┐                       │
│ │ ANTES │ │DESPUÉS│                       │
│ │ [IMG] │ │ [IMG] │                       │
│ └───────┘ └───────┘                       │
└─────────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### **Backend (Node.js/Express)**
1. **Controladores nuevos**:
   - `appointmentRecordController.ts`
   - `photoController.ts`
   - `followUpController.ts`

2. **Servicios de archivos**:
   - Subida de fotos con `multer`
   - Redimensionamiento con `sharp`
   - Almacenamiento organizado por cliente/fecha

3. **Endpoints API**:
   ```
   POST /api/appointments/:id/complete
   GET  /api/clients/:id/medical-history
   POST /api/photos/upload
   GET  /api/photos/:clientId
   POST /api/follow-up/create
   GET  /api/follow-up/pending
   ```

### **Frontend (React/TypeScript)**
1. **Componentes nuevos**:
   - `MedicalHistoryTab.tsx`
   - `CompleteAppointmentModal.tsx`
   - `PhotoGallery.tsx`
   - `FollowUpManager.tsx`

2. **Funcionalidades**:
   - Drag & drop para fotos
   - Timeline interactivo
   - Comparador de fotos
   - Calendario de seguimientos

---

## 📊 Beneficios del Sistema

### **Para la Clínica**
- ✅ **Trazabilidad completa** de tratamientos
- ✅ **Evidencia visual** del progreso
- ✅ **Seguimiento automatizado** de clientes
- ✅ **Mejor comunicación** con clientes
- ✅ **Documentación legal** completa

### **Para los Clientes**
- ✅ **Historial visual** de su evolución
- ✅ **Recordatorios** de retoques
- ✅ **Transparencia** en resultados
- ✅ **Confianza** en el profesionalismo

---

## 🚀 Plan de Implementación

### **Fase 1: Base de Datos** (1-2 días)
1. Crear nuevos modelos en Prisma
2. Ejecutar migraciones
3. Actualizar seed con datos de prueba

### **Fase 2: Backend** (2-3 días)
1. Implementar controladores
2. Crear endpoints API
3. Configurar subida de archivos

### **Fase 3: Frontend** (3-4 días)
1. Crear componentes de interfaz
2. Implementar funcionalidades
3. Integrar con API

### **Fase 4: Testing y Refinamiento** (1-2 días)
1. Pruebas de funcionalidad
2. Ajustes de UX
3. Documentación

---

## 💡 Características Adicionales Opcionales

### **Inteligencia Artificial**
- **Análisis de fotos** para detectar cambios
- **Sugerencias automáticas** de seguimiento
- **Alertas** de posibles complicaciones

### **Comunicación con Cliente**
- **Envío automático** de fotos por email
- **Portal del cliente** con acceso a su historial
- **Notificaciones** de recordatorios

### **Reportes Avanzados**
- **Estadísticas** de satisfacción
- **Análisis** de efectividad por tratamiento
- **Reportes** de seguimiento

---

¿Te parece bien esta propuesta? ¿Hay algún aspecto específico que te gustaría que desarrolle más o modifique?
