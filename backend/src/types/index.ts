export interface OrderItem {
  id: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface ClientData {
  id: string;
  nombre: string;
  historial: string;
  limiteCredito: number;
  descuentoMaximo: number;
  categoria: 'Premium' | 'Regular' | 'Nuevo';
  margenMinimo: number;
}

export interface AnalyzeOrderRequest {
  clienteId: string;
  items: OrderItem[];
  condiciones?: string;
}

export interface RulesAnalysis {
  margenPromedio: number;
  descuentoPromedio: number;
  descuentoExceso: number;
  totalPedido: number;
  riesgos: string[];
  decision: 'APROBAR' | 'AJUSTAR' | 'RECHAZAR';
  nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO';
  motivoPrincipal: string;
  justificacion: string[];
  itemsAnalysis: Array<OrderItem & {
    margen: number;
    costo: number;
  }>;
}

export interface AIAnalysis {
  contextualInsights: string[];
  riskAssessment: string;
  negotiationSuggestions: string[];
  finalRecommendation: string;
  decision: 'APROBAR' | 'AJUSTAR' | 'RECHAZAR';
  confidence: number;
}

export interface FinalDecision {
  decision: 'APROBAR' | 'AJUSTAR' | 'RECHAZAR';
  confidence: number;
  reasoning: string;
  actionItems: string[];
}

export interface AnalyzeOrderResponse {
  clientData: ClientData;
  rulesAnalysis: RulesAnalysis;
  aiAnalysis: AIAnalysis;
  finalDecision: FinalDecision;
  timestamp: string;
}
