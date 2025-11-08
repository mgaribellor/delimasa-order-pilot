#!/bin/bash

echo "🚀 Configurando DeliMasa Backend..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js versión $NODE_VERSION detectada. Se recomienda >= 18.0.0"
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "⚙️  Creando archivo .env..."
    cp .env.example .env
    echo "🔑 IMPORTANTE: Edita el archivo .env y agrega tu OPENAI_API_KEY"
    echo "   Ejemplo: OPENAI_API_KEY=sk-tu-clave-aqui"
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error compilando TypeScript"
    exit 1
fi

echo ""
echo "✅ ¡Backend configurado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env y agrega tu OPENAI_API_KEY"
echo "2. Ejecuta: npm run dev"
echo "3. El API estará disponible en: http://localhost:3000"
echo ""
echo "🔗 Endpoints principales:"
echo "   • Health: http://localhost:3000/api/health"
echo "   • Análisis con IA: POST http://localhost:3000/api/orders/analyze-with-ai"
echo "   • Clientes: http://localhost:3000/api/clients"
echo ""
