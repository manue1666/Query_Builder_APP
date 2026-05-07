# Query Builder AI - Frontend

Una aplicación web moderna construida con **React**, **TypeScript** y **Vite** que permite a los usuarios crear, gestionar y generar consultas SQL automáticamente mediante inteligencia artificial.

## 🎯 Características

- ✅ Autenticación segura con JWT
- ✅ Gestión completa de bases de datos (CRUD)
- ✅ Generador de SQL automático con IA (Groq)
- ✅ Historial de consultas persistente
- ✅ Dark Mode elegante
- ✅ Interfaz responsiva y moderna
- ✅ Sin dependencias externas innecesarias

---

## 📋 Requisitos Previos

- **Node.js** v16+ 
- **npm** o **yarn**
- Backend API en `http://localhost:5112` (Query Builder API - .NET Core)

---

## 🚀 Instalación y Ejecución

### 1. **Clonar el repositorio**
```bash
cd QueryBuilderAPP
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### 4. **Compilar para producción**
```bash
npm run build
```

### 5. **Previsualizar build**
```bash
npm run preview
```

---

## 📁 Estructura del Proyecto

```
src/
├── pages/                    # Páginas principales
│   ├── AuthPage.tsx         # Login y Registro
│   └── DashboardPage.tsx    # Panel principal con generador
│
├── components/              # Componentes reutilizables (futuro)
│
├── services/                # Servicios API
│   ├── api.ts              # Configuración axios
│   ├── authService.ts      # Autenticación
│   ├── databaseService.ts  # Gestión de BDs
│   └── queryService.ts     # Generación de queries
│
├── context/                 # Context API
│   └── AuthContext.tsx     # Estado global de autenticación
│
├── types/                   # Tipos TypeScript
│   └── models.ts           # Interfaces de datos
│
├── App.tsx                  # Router principal
├── main.tsx                 # Punto de entrada
└── index.css                # Estilos globales
```

---

## 🏗️ Arquitectura

### Estado Global (Context API)
```
AuthContext
├── user: User | null
├── token: string | null
├── login(): Promise
├── register(): Promise
├── logout(): void
└── isLoading: boolean
```

### Servicios (API Client)
- **api.ts**: Instancia axios con interceptores JWT
- **authService.ts**: Login y registro
- **databaseService.ts**: CRUD de bases de datos
- **queryService.ts**: Generación y gestión de queries

---

## 🔌 Endpoints API Utilizados

### 📌 Autenticación

#### **POST** `/api/auth/login`
Inicia sesión con email y contraseña.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "user@example.com",
      "createdAt": "2026-05-06T10:30:00Z"
    }
  }
}
```

**Usado en:** `AuthPage.tsx` → `handleSubmit()`

---

#### **POST** `/api/auth/register`
Registra un nuevo usuario.

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "createdAt": "2026-05-06T10:30:00Z"
    }
  }
}
```

**Usado en:** `AuthPage.tsx` → `handleSubmit()`

---

### 📊 Bases de Datos

#### **POST** `/api/database/create`
Crea una nueva base de datos.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "Mi Base de Datos",
  "description": "BD para gestión de usuarios",
  "sqlSchema": "CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255));"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Database created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "Mi Base de Datos",
    "description": "BD para gestión de usuarios",
    "sqlSchema": "CREATE TABLE users...",
    "createdAt": "2026-05-06T10:30:00Z"
  }
}
```

**Usado en:** `DashboardPage.tsx` → `handleCreateDatabase()`

---

#### **GET** `/api/database/all`
Obtiene todas las bases de datos del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Databases retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "ESCUELA",
      "description": "Base de datos para una escuela",
      "sqlSchema": "CREATE DATABASE escuela;",
      "createdAt": "2026-05-02T04:51:40Z"
    },
    {
      "id": 2,
      "userId": 1,
      "name": "ESCUELA 2",
      "description": "Base de datos para otra escuela",
      "sqlSchema": "CREATE DATABASE escuela2;",
      "createdAt": "2026-05-06T03:34:48Z"
    }
  ]
}
```

**Usado en:** `DashboardPage.tsx` → `loadDatabases()`

---

#### **GET** `/api/database/{id}`
Obtiene una base de datos específica por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Database retrieved successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "ESCUELA",
    "description": "Base de datos para una escuela",
    "sqlSchema": "CREATE DATABASE escuela;",
    "createdAt": "2026-05-02T04:51:40Z"
  }
}
```

**Usado en:** `DashboardPage.tsx` → `handleStartEditDatabase()`

---

#### **PUT** `/api/database/{id}`
Actualiza una base de datos existente.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "ESCUELA ACTUALIZADA",
  "description": "Descripción actualizada",
  "sqlSchema": "CREATE TABLE nuevaTabla (...);"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Database updated successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "ESCUELA ACTUALIZADA",
    "description": "Descripción actualizada",
    "sqlSchema": "CREATE TABLE nuevaTabla (...);",
    "createdAt": "2026-05-02T04:51:40Z"
  }
}
```

**Usado en:** `DashboardPage.tsx` → `handleEditDatabase()`

---

#### **DELETE** `/api/database/{id}`
Elimina una base de datos y todas sus queries asociadas.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Database deleted successfully"
}
```

**Usado en:** `DashboardPage.tsx` → `handleDeleteDatabase()`

---

### 🔍 Consultas (Queries)

#### **POST** `/api/query/generate`
Genera una consulta SQL automáticamente usando IA (Groq).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "databaseId": 1,
  "description": "Dame todos los usuarios con más de 5 pedidos y muestra su email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Query successfully generated",
  "data": {
    "id": 42,
    "databaseId": 1,
    "description": "Dame todos los usuarios con más de 5 pedidos y muestra su email",
    "generatedSql": "SELECT u.email, COUNT(p.id) as total_pedidos FROM users u LEFT JOIN pedidos p ON u.id = p.user_id GROUP BY u.id, u.email HAVING COUNT(p.id) > 5;",
    "createdAt": "2026-05-06T10:45:30Z"
  }
}
```

**Usado en:** `DashboardPage.tsx` → `handleGenerateQuery()`

---

#### **GET** `/api/query/all/{databaseId}`
Obtiene todas las queries generadas para una base de datos.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Queries retrieved successfully",
  "data": [
    {
      "id": 40,
      "databaseId": 1,
      "description": "Usuarios activos",
      "generatedSql": "SELECT * FROM users WHERE estado = 'activo';",
      "createdAt": "2026-05-05T15:30:00Z"
    },
    {
      "id": 42,
      "databaseId": 1,
      "description": "Dame todos los usuarios con más de 5 pedidos",
      "generatedSql": "SELECT u.email, COUNT(p.id)...",
      "createdAt": "2026-05-06T10:45:30Z"
    }
  ]
}
```

**Usado en:** `DashboardPage.tsx` → `loadQueries()`

---

#### **GET** `/api/query/{id}`
Obtiene una query específica por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Query retrieved successfully",
  "data": {
    "id": 42,
    "databaseId": 1,
    "description": "Dame todos los usuarios con más de 5 pedidos",
    "generatedSql": "SELECT u.email, COUNT(p.id)...",
    "createdAt": "2026-05-06T10:45:30Z"
  }
}
```

**Usado en:** Futuro - detalles de query individual

---

#### **DELETE** `/api/query/{id}`
Elimina una query específica.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Query deleted successfully"
}
```

**Usado en:** `DashboardPage.tsx` → `handleDeleteQuery()`

---

## 🔐 Autenticación

### Sistema JWT
1. Usuario inicia sesión → Backend retorna **JWT Token**
2. Token se guarda en `localStorage`
3. **Interceptor axios** agrega token automáticamente a cada request:
```
Authorization: Bearer {token}
```
4. Si servidor retorna 401, token se elimina

### Flujo de Autenticación

```
AuthPage (login/register)
    ↓
AuthContext.login() o register()
    ↓
api.post('/auth/login' o '/auth/register')
    ↓
Response con token
    ↓
localStorage.setItem('token', token)
    ↓
AuthContext actualiza estado
    ↓
Navegación a /dashboard
```

---

## 🎨 Componentes y Páginas

### **AuthPage.tsx**
Página de autenticación (Login y Registro)

**Props:** Ninguno (usa Context)

**Estados:**
- `isLogin`: Alterna entre login/registro
- `form`: email, password, name
- `error`: Mensajes de error
- `isLoading`: Estado de carga

**Funciones:**
- `handleInputChange()`: Actualiza formulario
- `handleSubmit()`: Login o registro
- `toggleMode()`: Cambia entre login/registro

**Estilos:** Dark Mode con gradientes cyan/blue

---

### **DashboardPage.tsx**
Panel principal con generador de queries

**Funcionalidades:**
1. ✅ Selector de bases de datos
2. ✅ Crear, editar, eliminar BDs
3. ✅ Generar queries con descripción
4. ✅ Historial de últimas 15 queries
5. ✅ Copiar query al portapapeles

**Layout:** 2/3 generador + 1/3 historial

**Validaciones:**
- Nombre BD: mín 3 caracteres
- Descripción: mín 10 caracteres
- SQL Schema: mín 20 caracteres
- Query: mín 10 caracteres

---

## 🔧 Configuración

### **api.ts**
Configuración de axios con interceptores:

```typescript
const API_URL = 'http://localhost:5112';

// Interceptor request: agrega token JWT
// Interceptor response: devuelve respuesta con estructura { success, message, data }
```

### **tailwind.config.js**
Configuración de Tailwind CSS con colores personalizados (si aplica)

---

## 📦 Dependencias Principales

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "typescript": "^5.x"
}
```

### Herramientas de Desarrollo
- **Vite**: Build tool rápido
- **Tailwind CSS**: Framework de estilos
- **TypeScript**: Tipado estático

---

## 🚨 Manejo de Errores

### Error 401 (No Autenticado)
- Token inválido o expirado
- **Acción:** Elimina token y redirige a login

### Error 400 (Validación)
- Datos incompletos o inválidos
- **Acción:** Muestra mensaje de error

### Error 500 (Servidor)
- Error interno del servidor
- **Acción:** Muestra "Error al conectar con el servidor"

---

## 🎯 Flujo de Usuario

```
1. Usuario accede → AuthPage
   ├─ Opción: Login
   └─ Opción: Registro

2. Login exitoso → DashboardPage
   ├─ Token guardado en localStorage
   └─ Estado global actualizado

3. En Dashboard:
   ├─ Crear/Editar/Eliminar BDs
   ├─ Seleccionar BD
   ├─ Generar query con descripción
   ├─ Ver historial
   ├─ Copiar query
   └─ Logout → Vuelve a AuthPage
```

---

## 📱 Responsividad

- **Mobile**: Stack vertical, full width
- **Tablet**: Grid 2 columnas
- **Desktop**: Grid 3 columnas (2/3 + 1/3)

---

## 🌙 Dark Mode

Todo el proyecto implementado en Dark Mode elegante:
- **Fondo:** Gradiente `from-gray-950 to-gray-900`
- **Cards:** `bg-gray-900` con bordes `border-gray-800`
- **Acentos:** Cyan (`#06B6D4`) y Blue (`#3B82F6`)
- **Texto:** Blanco y gris 300-500

---

## 🔄 Variables de Entorno (Futuro)

Crear `.env` en la raíz:
```
VITE_API_URL=http://localhost:5112
VITE_JWT_STORAGE_KEY=token
```

---

## 📞 Soporte y Contacto

Backend API: Query Builder API (.NET Core 8)
Documentación Backend: Ver `QueryBuilderAPI/README.md`

---

## 📄 Licencia

Proyecto educativo - Mayo 2026

---

**Última actualización:** Mayo 6, 2026
