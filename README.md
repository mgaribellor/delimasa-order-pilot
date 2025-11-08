# DeliMasa - Motor de Revisión Comercial

Sistema completo de análisis automático de pedidos institucionales con integración de IA para DeliMasa.

## 🏗️ Arquitectura del Proyecto

```
delimasa-order-pilot/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Node.js + Express + OpenAI
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md         # Este archivo
```

## 🚀 Características Principales

### Frontend (React)
- ✅ **Interfaz Moderna**: React 18 + TypeScript + Vite
- ✅ **UI Profesional**: shadcn/ui + Tailwind CSS
- ✅ **Gestión de Estado**: TanStack Query
- ✅ **Formularios**: React Hook Form + Zod
- ✅ **Routing**: React Router DOM

### Backend (Node.js)
- ✅ **API RESTful**: Express + TypeScript
- ✅ **Análisis Híbrido**: Reglas de negocio + ChatGPT
- ✅ **Seguridad**: Helmet + CORS + Rate Limiting
- ✅ **Datos Mock**: Sin base de datos, datos hardcodeados
- ✅ **Documentación**: README completo + ejemplos

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- Clave API de OpenAI

### 1. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu OPENAI_API_KEY

# Ejecutar en desarrollo
npm run dev
```

### 2. Configurar Frontend

```bash
cd frontend

# Instalar dependencias (si no están instaladas)
npm install

# Ejecutar en desarrollo
npm run dev
```

### 3. Verificar Configuración

- **Backend**: http://localhost:3000/api/health
- **Frontend**: http://localhost:8080

## 🔧 Configuración de Variables de Entorno

### Backend (.env)
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
```

## 🎯 Funcionalidades

### 1. Análisis de Pedidos con IA
- **Endpoint**: `POST /api/orders/analyze-with-ai`
- **Características**:
  - Análisis cuantitativo (reglas de negocio)
  - Análisis cualitativo (ChatGPT)
  - Decisión combinada inteligente
  - Sugerencias de negociación

### 2. Gestión de Clientes
- **Endpoints**: `GET /api/clients`, `GET /api/clients/:id`
- **Datos Mock**:
  - Supermercados DelSur (Premium)
  - Restaurantes Gourmet SAS (Regular)
  - Distribuidora NorteCol (Nuevo)

### 3. Catálogo de Productos
- **Endpoints**: `GET /api/products`, `GET /api/products/search`
- **Productos**: Arroz, aceite, azúcar, harina, etc.

## 🤖 Integración con ChatGPT

### Prompt Especializado
El sistema utiliza un prompt diseñado específicamente para análisis comercial:

```
Eres un experto analista comercial especializado en distribución 
de alimentos institucionales en Colombia...

DATOS DEL PEDIDO:
- Cliente: Supermercados DelSur (Premium)
- Valor del pedido: $1,445,000 COP
- Margen promedio: 18.5%
- Descuento promedio: 12.5%

Proporciona análisis contextual, evaluación de riesgos, 
sugerencias de negociación y recomendación final...
```

### Análisis Híbrido
1. **Reglas de Negocio**: Validaciones automáticas
2. **IA Contextual**: Análisis cualitativo con ChatGPT
3. **Decisión Combinada**: Matriz de decisión inteligente

## 📊 Ejemplos de Uso

### Pedido que se APRUEBA
```json
{
  "clienteId": "clienteA",
  "items": [
    {
      "producto": "Arroz Premium 50kg",
      "cantidad": 10,
      "precioUnitario": 125000,
      "descuento": 15
    }
  ]
}
```

**Resultado**: ✅ APROBAR (Confianza: 92%)

### Pedido que se RECHAZA
```json
{
  "clienteId": "clienteC",
  "items": [
    {
      "producto": "Arroz Premium 50kg",
      "cantidad": 100,
      "precioUnitario": 125000,
      "descuento": 25
    }
  ]
}
```

**Resultado**: ❌ RECHAZAR (Descuentos excesivos)

## 🔒 Seguridad

- **Rate Limiting**: 100 requests/15min general, 10/min para IA
- **CORS**: Configurado para frontend específico
- **Helmet**: Headers de seguridad
- **Validación**: Inputs estrictamente validados
- **Error Handling**: Sin exposición de información sensible

## 🧪 Testing

### Probar Backend
```bash
cd backend

# Usar archivo de pruebas HTTP
# Abrir test-api.http en VS Code con REST Client
```

### Probar Frontend
```bash
cd frontend
npm run dev
# Navegar a http://localhost:8080
```

## 📈 Monitoreo y Logs

El sistema incluye logging detallado:
- Requests entrantes
- Errores de IA
- Rate limiting
- Performance metrics

## 🚀 Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Servir carpeta dist/
```

## 🛠️ Scripts Disponibles

### Backend
- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar versión compilada
- `npm run lint` - Verificar código

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

## 🐛 Troubleshooting

### Error: OPENAI_API_KEY no configurada
```bash
# Backend/.env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Error: CORS
```bash
# Verificar que el frontend esté en puerto 8080
# O actualizar FRONTEND_URL en backend/.env
```

### Error: Puertos en uso
```bash
# Cambiar puertos en archivos de configuración
# Backend: PORT=3001 en .env
# Frontend: puerto en vite.config.ts
```

## 📋 Próximos Pasos

### Mejoras Sugeridas
1. **Base de Datos**: Migrar de datos mock a PostgreSQL
2. **Autenticación**: JWT + roles de usuario
3. **Dashboard**: Métricas y reportes
4. **Notificaciones**: Tiempo real con WebSockets
5. **Testing**: Unit tests + integration tests

### Escalabilidad
1. **Docker**: Containerización completa
2. **CI/CD**: Pipeline de deployment
3. **Monitoring**: APM + logging centralizado
4. **Cache**: Redis para optimización

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature
3. Commit cambios
4. Push al branch
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**DeliMasa v1.0.0** - Motor de Revisión Comercial con IA  
Desarrollado con ❤️ para optimizar procesos comerciales
