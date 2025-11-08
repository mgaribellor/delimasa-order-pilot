const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Tipos para las respuestas del API
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

export interface AnalysisResponse {
  clientData: ClientData;
  rulesAnalysis: RulesAnalysis;
  aiAnalysis: AIAnalysis;
  finalDecision: FinalDecision;
  timestamp: string;
}

export interface AnalyzeOrderRequest {
  clienteId: string;
  items: OrderItem[];
  condiciones?: string;
}

// Función helper para manejar errores
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Servicios de API

// Obtener todos los clientes
export const getClients = async (): Promise<{ success: boolean; data: ClientData[]; count: number }> => {
  const response = await fetch(`${API_BASE_URL}/clients`);
  return handleResponse(response);
};

// Obtener cliente por ID
export const getClientById = async (id: string): Promise<{ success: boolean; data: ClientData }> => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`);
  return handleResponse(response);
};

// Obtener todos los productos
export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(response);
};

// Buscar productos
export const searchProducts = async (query: string) => {
  const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  return handleResponse(response);
};

// Análisis de pedido con IA (función principal)
export const analyzeOrderWithAI = async (orderData: AnalyzeOrderRequest): Promise<AnalysisResponse> => {
  const response = await fetch(`${API_BASE_URL}/orders/analyze-with-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  return handleResponse(response);
};

// Análisis de pedido solo con reglas (sin IA)
export const analyzeOrderRulesOnly = async (orderData: AnalyzeOrderRequest) => {
  const response = await fetch(`${API_BASE_URL}/orders/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  return handleResponse(response);
};

// Health check del API
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};
