# GestionCitasClinica

Sistema de gestión de citas para clínicas estéticas, desarrollado con React (TypeScript) en el frontend y Node.js con Express y Prisma en el backend.

## Características Principales

- **Gestión de Pacientes**: Registro, edición y consulta de información de pacientes
- **Sistema de Citas**: Programación, reprogramación y cancelación de citas
- **Gestión de Servicios**: Catálogo de servicios con precios y duración
- **Dashboard Administrativo**: Estadísticas y métricas del negocio
- **Sistema de Notificaciones**: Recordatorios automáticos por email
- **Gestión de Usuarios**: Control de acceso con diferentes roles
- **Reportes**: Generación de reportes de citas y facturación
- **Interfaz Responsiva**: Diseño adaptable para dispositivos móviles

## Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **React Query** para manejo de estado del servidor
- **React Hook Form** para formularios
- **Axios** para peticiones HTTP
- **Recharts** para gráficos y estadísticas

### Backend
- **Node.js** con Express
- **TypeScript** para tipado estático
- **Prisma** como ORM
- **MariaDB/MySQL** como base de datos
- **JWT** para autenticación
- **Nodemailer** para envío de emails
- **Bcrypt** para encriptación de contraseñas

## Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene incluido con Node.js)
- **MariaDB** o **MySQL** - [Descargar XAMPP](https://www.apachefriends.org/es/index.html) (recomendado)
- **Git** - [Descargar aquí](https://git-scm.com/)

## Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
git clone [URL_DE_TU_REPOSITORIO]
cd GestionCitasClinica
```
### Paso 2: Instalar Dependencias

**Opción A: Instalación Automática (Recomendada)**
```bash
npm run install:all
```
**Opción B: Instalación Manual**
```bash
# 1. Instalar dependencias del proyecto principal
npm install

# 2. Instalar dependencias del servidor
cd server
npm install

# 3. Instalar dependencias del cliente
cd ../client
npm install

# 4. Volver al directorio raíz
cd ..
```
### Paso 3: Configurar la Base de Datos

#### Opción A: Usando XAMPP (Recomendado)
1. **Descargar e instalar XAMPP** desde https://www.apachefriends.org/
2. **Iniciar XAMPP Control Panel**
3. **Activar los servicios**:
   - Hacer clic en "Start" para **Apache**
   - Hacer clic en "Start" para **MySQL**
4. **Crear la base de datos**:
   - Abrir navegador y ir a: http://localhost/phpmyadmin
   - Hacer clic en "Nueva" en el panel izquierdo
   - Nombre de la base de datos: `gestion_citas_db`
   - Hacer clic en "Crear"
5. **Importar los datos**:
   - Seleccionar la base de datos `gestion_citas_db`
   - Ir a la pestaña "Importar"
   - Hacer clic en "Seleccionar archivo"
   - Navegar hasta la carpeta del proyecto y seleccionar `db/gestion_citas_db.sql`
   - Hacer clic en "Continuar"

#### Opción B: Usando MySQL desde línea de comandos
```bash
# Conectar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE gestion_citas_db;

# Usar la base de datos
USE gestion_citas_db;

# Importar el archivo SQL
SOURCE db/gestion_citas_db.sql;

# Salir de MySQL
EXIT;
```
### Paso 4: Configurar Variables de Entorno

#### 4.1 Configurar el Servidor
```bash
# Ir al directorio del servidor
cd server

# Copiar el archivo de ejemplo
copy .env.example .env
```
**Editar el archivo `server/.env`** con un editor de texto y configurar:

```env
# Base de datos (ajustar según tu configuración)
DATABASE_URL="mysql://root:@localhost:3306/gestion_citas_db"

# JWT (generar un secreto seguro)
JWT_SECRET="mi_secreto_jwt_super_seguro_2024"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=5000
NODE_ENV="development"

# Email (configurar con tu cuenta de Gmail)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu_email@gmail.com"
EMAIL_PASS="tu_password_de_aplicacion_gmail"
EMAIL_FROM="Clínica Estética <noreply@clinica.com>"

# Archivos
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880

# URLs
CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:5000"

# Configuración de la clínica (personalizar)
CLINIC_NAME="Clínica Estética Bella"
CLINIC_PHONE="+1234567890"
CLINIC_EMAIL="info@clinica.com"
CLINIC_ADDRESS="Calle Principal 123, Ciudad"
```
#### 4.2 Configurar el Cliente
```bash
# Ir al directorio del cliente
cd ../client

# Copiar el archivo de ejemplo
copy .env.example .env
```
**El archivo `client/.env` debería quedar así:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_APP_NAME="Clínica Estética Bella"
REACT_APP_VERSION=1.0.0
```
### Paso 5: Configurar Prisma
```bash
# Ir al directorio del servidor
cd server

# Generar el cliente de Prisma
npx prisma generate

# Aplicar migraciones (si es necesario)
npx prisma db push
```
### Paso 6: Poblar la Base de Datos (Opcional)
```bash
# Desde el directorio server
npm run db:seed
```
Esto creará usuarios de prueba y datos iniciales.

### Paso 7: Ejecutar el Proyecto

#### Para Desarrollo
```bash
# Desde el directorio raíz del proyecto
cd ..
npm run dev
```
Esto iniciará automáticamente:
- **Cliente React**: http://localhost:3000
- **Servidor API**: http://localhost:5000

#### Para Producción
```bash
# Construir el cliente
npm run build

# Iniciar el servidor
npm start
```

## 🔐 Usuarios por Defecto

Después de ejecutar el seed (`npm run db:seed`), tendrás estos usuarios disponibles:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@clinica.com | admin123 |
| Recepcionista | recepcion@clinica.com | recepcion123 |

## 📁 Estructura del Proyecto

```
GestionCitasClinica/
├── client/                 # Frontend React
│   ├── public/            # Archivos públicos
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Servicios API
│   │   ├── types/        # Tipos TypeScript
│   │   └── utils/        # Utilidades
│   ├── package.json
│   ├── .env.example
│   └── .env              # Variables de entorno (no subir a git)
├── server/               # Backend Node.js
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── middleware/   # Middlewares
│   │   ├── routes/       # Rutas API
│   │   ├── services/     # Lógica de negocio
│   │   └── utils/        # Utilidades
│   ├── prisma/          # Esquemas y migraciones
│   │   ├── schema.prisma # Esquema de la base de datos
│   │   ├── seed.ts      # Datos iniciales
│   │   └── seed-clients.ts
│   ├── package.json
│   ├── .env.example
│   └── .env             # Variables de entorno (no subir a git)
├── db/                  # Scripts de base de datos
│   └── gestion_citas_db.sql
├── package.json         # Scripts principales del proyecto
├── .gitignore          # Archivos a ignorar en git
└── README.md           # Este archivo
```

## 📝 Scripts Disponibles

### Proyecto Principal (desde la raíz)
```bash
npm run dev          # Ejecutar cliente y servidor en desarrollo
npm run build        # Construir cliente para producción
npm start           # Iniciar servidor de producción
npm run install:all # Instalar todas las dependencias
```

### Scripts del Servidor (desde /server)
```bash
npm run dev         # Ejecutar servidor en desarrollo con nodemon
npm run build       # Compilar TypeScript a JavaScript
npm start          # Ejecutar servidor compilado
npm run db:generate # Generar cliente de Prisma
npm run db:migrate  # Ejecutar migraciones de base de datos
npm run db:studio   # Abrir Prisma Studio (interfaz visual de BD)
npm run db:seed     # Poblar base de datos con datos iniciales
```

### Scripts del Cliente (desde /client)
```bash
npm start          # Ejecutar cliente en desarrollo
npm run build      # Construir cliente para producción
npm test          # Ejecutar pruebas
npm run eject     # Exponer configuración de Create React App
```

## 🐛 Solución de Problemas Comunes

### ❌ Error: "Cannot connect to database"
**Solución:**
1. Verificar que XAMPP esté ejecutándose (Apache y MySQL activos)
2. Comprobar que la base de datos `gestion_citas_db` existe
3. Verificar las credenciales en `server/.env`:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/gestion_citas_db"
   ```

### ❌ Error: "Port 3000 is already in use"
**Solución:**
1. Cerrar otras aplicaciones que usen el puerto 3000
2. O cambiar el puerto en `client/.env`:
   ```env
   PORT=3001
   ```

### ❌ Error: "Port 5000 is already in use"
**Solución:**
1. Cambiar el puerto en `server/.env`:
   ```env
   PORT=5001
   ```
2. Actualizar también `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_SERVER_URL=http://localhost:5001
   ```

### ❌ Error: "Prisma Client is not generated"
**Solución:**
```bash
cd server
npx prisma generate
```

### ❌ Error: "Module not found"
**Solución:**
```bash
# Reinstalar dependencias
npm run install:all
```

### ❌ Error de Email (Nodemailer)
**Solución:**
1. Usar una contraseña de aplicación de Gmail (no tu contraseña normal)
2. Habilitar "Acceso de aplicaciones menos seguras" en Gmail
3. Configurar correctamente `server/.env`:
   ```env
   EMAIL_USER="tu_email@gmail.com"
   EMAIL_PASS="tu_password_de_aplicacion"
   ```

## 🔄 Actualizar el Proyecto

Cuando clones el proyecto en otra PC:

1. **Clonar el repositorio**
2. **Instalar dependencias**: `npm run install:all`
3. **Configurar base de datos** (pasos 3-4 de la instalación)
4. **Configurar variables de entorno** (copiar y editar archivos .env)
5. **Ejecutar**: `npm run dev`

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes algún problema o pregunta:
1. Revisar la sección de "Solución de Problemas"
2. Abrir un issue en el repositorio
3. Contactar al desarrollador

---

**¡Importante!** Recuerda nunca subir los archivos `.env` al repositorio, ya que contienen información sensible como contraseñas y claves secretas.

Desarrollado con ❤️ para la gestión eficiente de clínicas estéticas.
