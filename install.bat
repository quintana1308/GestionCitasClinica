@echo off
echo ========================================
echo   INSTALADOR AUTOMATICO - GESTION CITAS
echo ========================================
echo.

echo [1/5] Instalando dependencias del proyecto principal...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias principales
    pause
    exit /b 1
)

echo.
echo [2/5] Instalando dependencias del servidor...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del servidor
    pause
    exit /b 1
)

echo.
echo [3/5] Instalando dependencias del cliente...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del cliente
    pause
    exit /b 1
)

echo.
echo [4/5] Configurando archivos de entorno...
cd ..

REM Copiar archivos .env.example a .env si no existen
if not exist "server\.env" (
    copy "server\.env.example" "server\.env"
    echo - Archivo server/.env creado desde .env.example
) else (
    echo - Archivo server/.env ya existe
)

if not exist "client\.env" (
    copy "client\.env.example" "client\.env"
    echo - Archivo client/.env creado desde .env.example
) else (
    echo - Archivo client/.env ya existe
)

echo.
echo [5/5] Generando cliente de Prisma...
cd server
call npx prisma generate
if %errorlevel% neq 0 (
    echo ADVERTENCIA: Error al generar cliente de Prisma
    echo Esto es normal si la base de datos no está configurada aún
)

cd ..

echo.
echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo.
echo PROXIMOS PASOS:
echo 1. Configurar XAMPP y crear la base de datos 'gestion_citas_db'
echo 2. Importar el archivo db/gestion_citas_db.sql
echo 3. Editar los archivos .env con tus configuraciones
echo 4. Ejecutar: npm run dev
echo.
echo Para más detalles, consulta el archivo README.md
echo.
pause
