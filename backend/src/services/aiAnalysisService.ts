import { openai, AI_CONFIG } from '../config/openai';
import { ClientData, OrderItem, AIAnalysis } from '../types';
import { formatCurrency } from '../data/mockData';

export class AIAnalysisService {
  async analyzeOrder(orderData: {
    cliente: ClientData;
    items: OrderItem[];
    condiciones?: string;
    totalPedido: number;
    margenPromedio: number;
    descuentoPromedio: number;
    rulesDecision: string;
    riesgos: string[];
  }): Promise<AIAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(orderData);
      
      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto analista comercial especializado en distribución de alimentos institucionales en Colombia. Respondes siempre en JSON válido con el formato exacto solicitado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
      });

      const aiResponse = completion.choices[0].message.content;
      if (!aiResponse) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      const parsedResponse = JSON.parse(aiResponse);
      
      // Validar estructura de respuesta
      this.validateAIResponse(parsedResponse);
      
      return parsedResponse;
      
    } catch (error) {
      console.error('Error en análisis de IA:', error);
      // Fallback en caso de error
      return this.getFallbackAnalysis(orderData);
    }
  }

  private buildAnalysisPrompt(orderData: any): string {
    return `
Analiza este pedido comercial desde una perspectiva estratégica:

DATOS DEL PEDIDO:
- Cliente: ${orderData.cliente.nombre} (${orderData.cliente.categoria})
- Historial: ${orderData.cliente.historial}
- Límite de crédito: ${formatCurrency(orderData.cliente.limiteCredito)}
- Valor del pedido: ${formatCurrency(orderData.totalPedido)}
- Margen promedio: ${orderData.margenPromedio.toFixed(1)}%
- Descuento promedio: ${orderData.descuentoPromedio.toFixed(1)}%
- Items: ${orderData.items.length} productos

PRODUCTOS DEL PEDIDO:
${orderData.items.map((item: OrderItem) => 
  `- ${item.producto}: ${item.cantidad} unidades a ${formatCurrency(item.precioUnitario)} (desc: ${item.descuento}%)`
).join('\n')}

CONDICIONES ESPECIALES:
${orderData.condiciones || 'Ninguna'}

ANÁLISIS AUTOMÁTICO PREVIO:
- Decisión por reglas: ${orderData.rulesDecision}
- Riesgos identificados: ${orderData.riesgos.join(', ')}

Proporciona un análisis en JSON con esta estructura exacta:
{
  "contextualInsights": [
    "Análisis del perfil del cliente y comportamiento",
    "Evaluación de la composición del pedido",
    "Consideraciones del mercado colombiano"
  ],
  "riskAssessment": "Evaluación de riesgos comerciales no detectados automáticamente",
  "negotiationSuggestions": [
    "Estrategia específica para este cliente",
    "Alternativas de productos o condiciones",
    "Oportunidades de upselling"
  ],
  "finalRecommendation": "Recomendación estratégica con justificación comercial",
  "decision": "APROBAR|AJUSTAR|RECHAZAR",
  "confidence": 85
}
    `.trim();
  }

  private validateAIResponse(response: any): void {
    const requiredFields = [
      'contextualInsights',
      'riskAssessment', 
      'negotiationSuggestions',
      'finalRecommendation',
      'decision',
      'confidence'
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    if (!['APROBAR', 'AJUSTAR', 'RECHAZAR'].includes(response.decision)) {
      throw new Error('Decisión inválida en respuesta de IA');
    }

    if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 100) {
      throw new Error('Nivel de confianza inválido');
    }
  }

  private getFallbackAnalysis(orderData: any): AIAnalysis {
    return {
      contextualInsights: [
        'Análisis automático no disponible temporalmente',
        'Se recomienda revisión manual del pedido',
        'Cliente requiere atención personalizada'
      ],
      riskAssessment: 'No se pudo completar el análisis de riesgos con IA. Se recomienda evaluación manual considerando el historial del cliente y las condiciones del mercado actual.',
      negotiationSuggestions: [
        'Revisar condiciones manualmente con el equipo comercial',
        'Considerar el historial de pagos del cliente',
        'Evaluar oportunidades de productos complementarios'
      ],
      finalRecommendation: 'Debido a la indisponibilidad temporal del análisis de IA, se recomienda proceder con la decisión basada en reglas de negocio y revisión manual del equipo comercial.',
      decision: orderData.rulesDecision,
      confidence: 50
    };
  }
}
