# DeliMasa Backend API

Backend para el Motor de Revisión Comercial de DeliMasa - Sistema de análisis automático de pedidos institucionales con integración de IA.

## 🚀 Características

- ✅ **Análisis Híbrido**: Combina reglas de negocio + ChatGPT
- ✅ **API RESTful**: Endpoints completos para gestión comercial
- ✅ **Rate Limiting**: Protección contra abuso
- ✅ **Datos Mock**: Sin base de datos, datos hardcodeados
- ✅ **TypeScript**: Tipado fuerte y desarrollo seguro
- ✅ **Manejo de Errores**: Sistema robusto de errores

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Clave API de OpenAI

## 🛠️ Instalación

```bash
# Instalar dependencias
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY
```

## ⚙️ Variables de Entorno

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Uso

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Linting
npm run lint
```

## 📡 Endpoints

### Análisis de Pedidos

#### `POST /api/orders/analyze-with-ai`
Análisis completo con IA (ChatGPT) + reglas de negocio.

**Request:**
```json
{
  "clienteId": "clienteA",
  "items": [
    {
      "id": "1",
      "producto": "Arroz Premium 50kg",
      "cantidad": 10,
      "precioUnitario": 125000,
      "descuento": 15,
      "subtotal": 1062500
    }
  ],
  "condiciones": "Entrega en 3 días"
}
```

**Response:**
```json
{
  "clientData": { ... },
  "rulesAnalysis": {
    "decision": "APROBAR",
    "margenPromedio": 18.5,
    "totalPedido": 1062500,
    "riesgos": []
  },
  "aiAnalysis": {
    "decision": "APROBAR",
    "confidence": 85,
    "contextualInsights": ["..."],
    "negotiationSuggestions": ["..."]
  },
  "finalDecision": {
    "decision": "APROBAR",
    "confidence": 90,
    "reasoning": "...",
    "actionItems": ["..."]
  }
}
```

#### `POST /api/orders/analyze`
Análisis solo con reglas de negocio (sin IA).

### Clientes

#### `GET /api/clients`
Lista todos los clientes disponibles.

#### `GET /api/clients/:id`
Obtiene detalles de un cliente específico.

### Productos

#### `GET /api/products`
Lista todos los productos disponibles.

#### `GET /api/products/search?q={query}`
Busca productos por nombre.

### Sistema

#### `GET /api/health`
Health check del API.

#### `GET /`
Información general del API.

## 🧠 Integración con ChatGPT

El sistema utiliza **GPT-4o-mini** para análisis contextual:

- **Prompt Especializado**: Diseñado para análisis comercial
- **Fallback Robusto**: Sistema de respaldo si falla OpenAI
- **Rate Limiting**: Límite específico para análisis con IA
- **Validación**: Verificación de respuestas de IA

### Ejemplo de Análisis de IA

```json
{
  "contextualInsights": [
    "Cliente Premium con excelente historial de pagos",
    "Composición del pedido indica crecimiento del negocio",
    "Oportunidad para productos complementarios"
  ],
  "riskAssessment": "Riesgo bajo. Cliente confiable con pedido dentro de parámetros normales.",
  "negotiationSuggestions": [
    "Ofrecer descuento por volumen en próximos pedidos",
    "Proponer productos de mayor margen",
    "Considerar términos de pago extendidos"
  ],
  "finalRecommendation": "Aprobar inmediatamente. Excelente oportunidad comercial.",
  "decision": "APROBAR",
  "confidence": 92
}
```

## 📊 Datos Mock

### Clientes Disponibles
- **clienteA**: Supermercados DelSur (Premium)
- **clienteB**: Restaurantes Gourmet SAS (Regular)  
- **clienteC**: Distribuidora NorteCol (Nuevo)

### Productos Disponibles
- Arroz Premium 50kg
- Aceite de Girasol 20L
- Azúcar Refinada 50kg
- Harina de Trigo 50kg
- Y más...

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Configurado para frontend específico
- **Rate Limiting**: 100 requests/15min general, 10/min para IA
- **Validación**: Validación estricta de inputs
- **Error Handling**: No exposición de información sensible

## 🚦 Rate Limits

- **General**: 100 requests por 15 minutos
- **Análisis con IA**: 10 requests por minuto
- **Headers**: Información de límites en respuestas

## 🔧 Desarrollo

### Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (OpenAI, etc.)
│   ├── controllers/     # Controladores de rutas
│   ├── data/           # Datos mock
│   ├── middleware/     # Middlewares personalizados
│   ├── routes/         # Definición de rutas
│   ├── services/       # Lógica de negocio
│   ├── types/          # Tipos TypeScript
│   └── index.ts        # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Ejecutar versión compilada
- `npm run lint` - Verificar código con ESLint

## 🐛 Troubleshooting

### Error: OPENAI_API_KEY no configurada
```bash
# Asegúrate de tener el archivo .env con:
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Error: Puerto en uso
```bash
# Cambiar puerto en .env:
PORT=3001
```

### Error: CORS
```bash
# Verificar FRONTEND_URL en .env:
FRONTEND_URL=http://localhost:8080
```

## 📈 Monitoreo

El API incluye logging detallado:
- Requests entrantes
- Errores de IA
- Rate limiting
- Performance metrics

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**DeliMasa Backend API v1.0.0** - Motor de Revisión Comercial con IA
