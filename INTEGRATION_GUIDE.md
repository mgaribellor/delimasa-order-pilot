# Guía de Integración Frontend-Backend

## ✅ Integración Completada

El frontend React ahora está completamente conectado con el backend Node.js que incluye integración con ChatGPT.

## 🔄 Cambios Realizados

### Frontend
1. **Nuevo servicio API** (`src/lib/api.ts`)
2. **Componente actualizado** (`src/pages/Index.tsx`)
3. **Configuración de proxy** (`vite.config.ts`)
4. **Variables de entorno** (`.env`)

### Funcionalidades Implementadas
- ✅ **Carga dinámica de clientes** desde el API
- ✅ **Análisis híbrido** con reglas de negocio + ChatGPT
- ✅ **UI enriquecida** para mostrar insights de IA
- ✅ **Manejo de errores** robusto
- ✅ **Estados de carga** apropiados

## 🚀 Cómo Usar

### 1. Asegúrate que el Backend esté Ejecutándose
```bash
cd backend
npm run dev
# Debe mostrar: "Servidor DeliMasa iniciado en puerto 3000"
```

### 2. Ejecutar el Frontend
```bash
cd frontend
npm run dev
# Debe abrir en: http://localhost:8080
```

### 3. Probar la Integración

#### Crear un Pedido de Prueba:
1. **Seleccionar Cliente**: Elige cualquier cliente de la lista
2. **Agregar Items**: 
   - Producto: "Arroz Premium 50kg"
   - Cantidad: 10
   - Precio: 125000
   - Descuento: 15%
3. **Condiciones**: "Entrega en 3 días"
4. **Enviar a Revisión Automática**

#### Resultado Esperado:
- ✅ **Análisis de Reglas**: Cálculos automáticos
- ✅ **Análisis de IA**: Insights contextuales de ChatGPT
- ✅ **Decisión Combinada**: Recomendación híbrida

## 🎯 Nuevas Funcionalidades

### Análisis con IA
El botón "Enviar a Revisión Automática" ahora:

1. **Ejecuta reglas de negocio** (márgenes, descuentos, límites)
2. **Consulta ChatGPT** con prompt especializado
3. **Combina ambos análisis** para decisión final
4. **Muestra insights contextuales** y sugerencias

### UI Mejorada
- **Insights Contextuales**: Análisis cualitativo del pedido
- **Evaluación de Riesgos**: Perspectiva de IA sobre riesgos
- **Sugerencias de Negociación**: Estrategias específicas
- **Decisión Combinada**: Análisis híbrido con confianza

## 🔧 Configuración

### Variables de Entorno

#### Backend (.env)
```bash
OPENAI_API_KEY=sk-tu-clave-de-openai-aqui
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

#### Frontend (.env)
```bash
VITE_API_URL=/api
```

### Proxy Configuration
El frontend usa proxy para conectarse al backend:
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
  },
}
```

## 📊 Ejemplo de Respuesta del API

```json
{
  "clientData": {
    "id": "clienteA",
    "nombre": "Supermercados DelSur",
    "categoria": "Premium"
  },
  "rulesAnalysis": {
    "decision": "APROBAR",
    "margenPromedio": 18.5,
    "totalPedido": 1062500,
    "riesgos": []
  },
  "aiAnalysis": {
    "decision": "APROBAR",
    "confidence": 92,
    "contextualInsights": [
      "Cliente Premium con excelente historial de pagos",
      "Composición del pedido indica crecimiento sostenido",
      "Oportunidad para productos complementarios"
    ],
    "negotiationSuggestions": [
      "Ofrecer descuento por volumen en próximos pedidos",
      "Proponer productos de mayor margen",
      "Considerar términos de pago extendidos"
    ],
    "finalRecommendation": "Aprobar inmediatamente. Excelente oportunidad comercial con cliente confiable."
  },
  "finalDecision": {
    "decision": "APROBAR",
    "confidence": 95,
    "reasoning": "Análisis combinado indica alta viabilidad...",
    "actionItems": [
      "✅ Proceder con la aprobación del pedido",
      "📋 Documentar la decisión en el sistema",
      "📞 Notificar al cliente sobre la aprobación"
    ]
  }
}
```

## 🐛 Troubleshooting

### Error: "Error cargando clientes"
- ✅ Verificar que el backend esté ejecutándose
- ✅ Comprobar la URL del API en `.env`
- ✅ Revisar la consola del navegador para más detalles

### Error: "Error en el análisis"
- ✅ Verificar que `OPENAI_API_KEY` esté configurada
- ✅ Comprobar que todos los campos del pedido estén completos
- ✅ Revisar logs del backend para errores de OpenAI

### Error: "Cannot connect to backend"
- ✅ Verificar que el backend esté en puerto 3000
- ✅ Comprobar configuración de proxy en `vite.config.ts`
- ✅ Reiniciar el servidor de desarrollo del frontend

## 🎉 Funcionalidades Destacadas

### 1. **Análisis Inteligente**
- Prompt especializado para análisis comercial
- Evaluación contextual de riesgos
- Sugerencias de negociación personalizadas

### 2. **UI Enriquecida**
- Iconos contextuales (💡 🤝 🧠)
- Badges de confianza
- Comparación lado a lado de análisis

### 3. **Robustez**
- Manejo de errores graceful
- Fallback si falla OpenAI
- Estados de carga apropiados

## 📈 Próximos Pasos

1. **Probar diferentes escenarios** de pedidos
2. **Ajustar prompts** según necesidades específicas
3. **Implementar caché** para optimizar costos de OpenAI
4. **Añadir métricas** de uso y performance

---

**¡La integración está completa y lista para usar!** 🚀
