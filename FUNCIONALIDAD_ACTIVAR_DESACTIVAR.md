# Funcionalidad de Activar/Desactivar Clientes y Tratamientos

## ✅ Implementación Completada

Se ha implementado la funcionalidad completa de activar/desactivar tanto para **Clientes** como para **Tratamientos**, con validaciones para prevenir el uso de registros inactivos en otras partes del sistema.

---

## 🎯 Funcionalidades Implementadas

### **1. Activar/Desactivar Tratamientos** 🔄

#### **Características:**
- ✅ Botón de toggle en cada tarjeta de tratamiento
- ✅ Cambio visual inmediato (opacidad reducida cuando está inactivo)
- ✅ Notificación toast de éxito/error
- ✅ **Validación:** No se puede desactivar si tiene citas programadas
- ✅ **Restricción:** Botón "Agendar" deshabilitado en tratamientos inactivos
- ✅ Indicador visual claro de estado (verde/gris)

#### **Ubicación:**
- Página: **Tratamientos** (`/dashboard/treatments`)
- Botón: En la esquina superior derecha de cada tarjeta
- Estados: "Activo" (verde) / "Inactivo" (gris)

#### **Validaciones Backend:**
```typescript
// No se puede desactivar si tiene citas programadas
if (!isActive && existingTreatment.appointments.length > 0) {
  throw new AppError('No se puede desactivar un tratamiento con citas programadas', 400);
}
```

---

### **2. Activar/Desactivar Clientes** 🔄

#### **Características:**
- ✅ Botón de toggle en cada tarjeta de cliente
- ✅ Cambio visual inmediato
- ✅ Notificación toast de éxito/error
- ✅ **Restricción:** Solo clientes activos aparecen en el selector de agendar citas
- ✅ Indicador visual claro de estado (verde/gris)

#### **Ubicación:**
- Página: **Clientes** (`/dashboard/clients`)
- Botón: En la esquina superior derecha de cada tarjeta
- Estados: "Activo" (verde) / "Inactivo" (gris)

#### **Validaciones Backend:**
```typescript
// Solo clientes activos en el selector
const response = await clientService.getClients({
  isActive: true,  // Solo activos
  limit: 50
});
```

---

## 🔒 Restricciones Implementadas

### **Tratamientos Inactivos:**

1. **No se pueden usar para agendar citas**
   - Botón "Agendar" deshabilitado
   - Tooltip: "No se puede agendar un tratamiento inactivo"
   - Color gris en el botón

2. **No se pueden desactivar si tienen citas programadas**
   - Validación en backend
   - Mensaje de error claro
   - Previene inconsistencias en el sistema

3. **Indicador visual**
   - Opacidad reducida (75%) en toda la tarjeta
   - Punto gris en lugar de verde
   - Texto "Inactivo" visible

### **Clientes Inactivos:**

1. **No aparecen en el selector de agendar citas**
   - Filtro automático: `isActive: true`
   - Solo clientes activos disponibles
   - Previene agendar citas con clientes inactivos

2. **Indicador visual**
   - Badge "Inactivo" en gris
   - Claramente diferenciado de "Activo" (verde)

---

## 🎨 Interfaz de Usuario

### **Botones de Toggle:**

**Tratamientos:**
```tsx
<button
  onClick={() => handleToggleStatus(treatment.id, treatment.isActive)}
  className={`text-xs px-2 py-1 rounded ${
    treatment.isActive 
      ? 'text-red-600 hover:bg-red-50'    // Activo: botón rojo para desactivar
      : 'text-green-600 hover:bg-green-50' // Inactivo: botón verde para activar
  }`}
>
  {treatment.isActive ? 'Desactivar' : 'Activar'}
</button>
```

**Clientes:**
```tsx
<button
  onClick={() => handleToggleStatus(client.id, client.user.isActive)}
  className={`text-xs px-2 py-1 rounded ${
    client.user.isActive 
      ? 'text-red-600 hover:bg-red-50' 
      : 'text-green-600 hover:bg-green-50'
  }`}
>
  {client.user.isActive ? 'Desactivar' : 'Activar'}
</button>
```

### **Botón Agendar (Tratamientos):**
```tsx
<button 
  onClick={() => handleOpenScheduleModal(treatment)}
  disabled={!treatment.isActive}
  className={`flex-1 text-sm py-2 ${
    treatment.isActive
      ? 'btn-primary'                           // Activo: azul
      : 'bg-gray-300 text-gray-500 cursor-not-allowed' // Inactivo: gris deshabilitado
  }`}
>
  <CalendarIcon className="h-4 w-4 mr-1" />
  Agendar
</button>
```

---

## 📊 Flujos de Trabajo

### **Flujo 1: Desactivar Tratamiento**

1. Usuario hace clic en "Desactivar" en un tratamiento
2. **Sistema verifica:** ¿Tiene citas programadas?
   - ❌ **SÍ:** Muestra error "No se puede desactivar un tratamiento con citas programadas"
   - ✅ **NO:** Continúa
3. Tratamiento se marca como inactivo
4. Notificación: "Tratamiento desactivado exitosamente"
5. Tarjeta se muestra con opacidad reducida
6. Botón "Agendar" se deshabilita
7. Botón cambia a "Activar" (verde)

### **Flujo 2: Activar Tratamiento**

1. Usuario hace clic en "Activar" en un tratamiento inactivo
2. Tratamiento se marca como activo
3. Notificación: "Tratamiento activado exitosamente"
4. Tarjeta vuelve a opacidad normal
5. Botón "Agendar" se habilita
6. Botón cambia a "Desactivar" (rojo)

### **Flujo 3: Intentar Agendar con Tratamiento Inactivo**

1. Usuario ve tratamiento inactivo
2. Botón "Agendar" está deshabilitado (gris)
3. Hover muestra tooltip: "No se puede agendar un tratamiento inactivo"
4. Click no hace nada (botón deshabilitado)
5. Usuario debe activar el tratamiento primero

### **Flujo 4: Desactivar Cliente**

1. Usuario hace clic en "Desactivar" en un cliente
2. Cliente se marca como inactivo
3. Notificación: "Cliente desactivado exitosamente"
4. Badge cambia a "Inactivo" (gris)
5. **Cliente NO aparece en selector de agendar citas**

### **Flujo 5: Intentar Agendar con Cliente Inactivo**

1. Usuario abre modal de agendar cita
2. Busca cliente inactivo
3. **Cliente NO aparece en los resultados**
4. Solo clientes activos son visibles
5. Previene agendar citas con clientes inactivos

---

## 🧪 Cómo Probar

### **Probar Tratamientos:**

#### **1. Desactivar tratamiento sin citas:**
```
1. Ir a Tratamientos
2. Buscar tratamiento sin citas programadas
3. Clic en "Desactivar"
4. Verificar:
   ✅ Notificación de éxito
   ✅ Tarjeta con opacidad reducida
   ✅ Estado cambia a "Inactivo"
   ✅ Botón "Agendar" deshabilitado (gris)
   ✅ Botón cambia a "Activar" (verde)
```

#### **2. Intentar desactivar tratamiento con citas:**
```
1. Ir a Tratamientos
2. Buscar tratamiento con citas programadas
3. Clic en "Desactivar"
4. Verificar:
   ❌ Error: "No se puede desactivar un tratamiento con citas programadas"
   ✅ Tratamiento permanece activo
```

#### **3. Activar tratamiento:**
```
1. Ir a Tratamientos
2. Buscar tratamiento inactivo
3. Clic en "Activar"
4. Verificar:
   ✅ Notificación de éxito
   ✅ Tarjeta con opacidad normal
   ✅ Estado cambia a "Activo"
   ✅ Botón "Agendar" habilitado (azul)
   ✅ Botón cambia a "Desactivar" (rojo)
```

#### **4. Intentar agendar con tratamiento inactivo:**
```
1. Ir a Tratamientos
2. Buscar tratamiento inactivo
3. Intentar clic en "Agendar"
4. Verificar:
   ✅ Botón deshabilitado (no hace nada)
   ✅ Tooltip: "No se puede agendar un tratamiento inactivo"
   ✅ Cursor: not-allowed
```

### **Probar Clientes:**

#### **1. Desactivar cliente:**
```
1. Ir a Clientes
2. Seleccionar un cliente
3. Clic en "Desactivar"
4. Verificar:
   ✅ Notificación de éxito
   ✅ Badge cambia a "Inactivo" (gris)
   ✅ Botón cambia a "Activar" (verde)
```

#### **2. Verificar que cliente inactivo no aparece en agendar:**
```
1. Desactivar un cliente (ej: "Juan Pérez")
2. Ir a Tratamientos
3. Clic en "Agendar" en cualquier tratamiento
4. Buscar "Juan Pérez" en el selector
5. Verificar:
   ✅ Cliente NO aparece en la lista
   ✅ Solo clientes activos visibles
```

#### **3. Activar cliente:**
```
1. Ir a Clientes
2. Buscar cliente inactivo
3. Clic en "Activar"
4. Verificar:
   ✅ Notificación de éxito
   ✅ Badge cambia a "Activo" (verde)
   ✅ Botón cambia a "Desactivar" (rojo)
```

#### **4. Verificar que cliente activo aparece en agendar:**
```
1. Activar un cliente
2. Ir a Tratamientos
3. Clic en "Agendar"
4. Buscar el cliente
5. Verificar:
   ✅ Cliente aparece en la lista
   ✅ Se puede seleccionar
```

---

## 🎨 Indicadores Visuales

### **Estados de Tratamiento:**

| Estado | Opacidad | Punto | Texto | Botón Toggle | Botón Agendar |
|--------|----------|-------|-------|--------------|---------------|
| Activo | 100% | 🟢 Verde | "Activo" | "Desactivar" (rojo) | Habilitado (azul) |
| Inactivo | 75% | ⚪ Gris | "Inactivo" | "Activar" (verde) | Deshabilitado (gris) |

### **Estados de Cliente:**

| Estado | Badge | Botón Toggle |
|--------|-------|--------------|
| Activo | 🟢 Verde "Activo" | "Desactivar" (rojo) |
| Inactivo | ⚪ Gris "Inactivo" | "Activar" (verde) |

---

## 📝 Notificaciones

### **Tratamientos:**
- ✅ "Tratamiento activado exitosamente"
- ✅ "Tratamiento desactivado exitosamente"
- ❌ "No se puede desactivar un tratamiento con citas programadas"
- ❌ "Error al actualizar el estado del tratamiento"

### **Clientes:**
- ✅ "Cliente activado exitosamente"
- ✅ "Cliente desactivado exitosamente"
- ❌ "Error al actualizar el estado del cliente"

---

## 🔐 Seguridad y Validaciones

### **Backend (Tratamientos):**
```typescript
// Verificar citas programadas antes de desactivar
const existingTreatment = await prisma.treatment.findUnique({
  where: { id },
  include: {
    appointments: {
      where: {
        appointment: {
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
      }
    }
  }
});

if (!isActive && existingTreatment.appointments.length > 0) {
  throw new AppError('No se puede desactivar un tratamiento con citas programadas', 400);
}
```

### **Backend (Clientes):**
```typescript
// Solo clientes activos en consultas de agendar
const where: any = {
  user: { isActive: true }
};
```

### **Frontend:**
- Botones deshabilitados cuando no aplica
- Tooltips informativos
- Validación visual inmediata
- Confirmaciones antes de acciones críticas

---

## 📊 Archivos Modificados

```
client/src/components/dashboard/
├── Treatments.tsx              ← Botón toggle + validación agendar
└── Clients.tsx                 ← Mejorado botón toggle + notificaciones

client/src/components/
└── ScheduleAppointmentModal.tsx ← Filtro isActive: true

server/src/controllers/
└── clientController.ts          ← Filtro isActive en búsqueda
```

---

## ✨ Beneficios

1. **Control Total:** Gestiona qué tratamientos y clientes están disponibles
2. **Prevención de Errores:** No se pueden usar registros inactivos
3. **Integridad de Datos:** Validaciones en backend y frontend
4. **UX Mejorada:** Indicadores visuales claros
5. **Auditoría:** Todas las acciones se registran en logs
6. **Flexibilidad:** Fácil activar/desactivar sin eliminar datos

---

## 🎯 Casos de Uso

### **Caso 1: Tratamiento Temporalmente No Disponible**
```
Escenario: Máquina láser en mantenimiento
Acción: Desactivar "Depilación Láser"
Resultado: No se pueden agendar nuevas citas de láser
Beneficio: Evita agendar citas que no se pueden cumplir
```

### **Caso 2: Cliente Suspendido**
```
Escenario: Cliente con pagos pendientes
Acción: Desactivar cliente
Resultado: No aparece en selector de agendar
Beneficio: Previene nuevas citas hasta resolver situación
```

### **Caso 3: Tratamiento Descontinuado**
```
Escenario: Ya no se ofrece cierto tratamiento
Acción: Desactivar tratamiento
Resultado: No disponible para nuevas citas
Beneficio: Mantiene historial sin permitir uso futuro
```

---

**Estado:** ✅ Completado y Verificado
**Fecha:** 2025-10-07
**Versión:** 1.1.0
