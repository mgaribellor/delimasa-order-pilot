import { Request, Response } from 'express';
import { RulesAnalysisService } from '../services/rulesAnalysisService';
import { AIAnalysisService } from '../services/aiAnalysisService';
import { CombinedAnalysisService } from '../services/combinedAnalysisService';
import { MOCK_CLIENTS } from '../data/mockData';
import { AnalyzeOrderRequest, AnalyzeOrderResponse } from '../types';

export class AnalysisController {
  private rulesService: RulesAnalysisService;
  private aiService: AIAnalysisService;
  private combinedService: CombinedAnalysisService;

  constructor() {
    this.rulesService = new RulesAnalysisService();
    this.aiService = new AIAnalysisService();
    this.combinedService = new CombinedAnalysisService();
  }

  async analyzeOrderWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, items, condiciones }: AnalyzeOrderRequest = req.body;

      // Validaciones básicas
      if (!clienteId || !items || items.length === 0) {
        res.status(400).json({ 
          error: 'Datos incompletos. Se requiere clienteId e items.' 
        });
        return;
      }

      // Obtener datos del cliente
      const clientData = MOCK_CLIENTS[clienteId];
      if (!clientData) {
        res.status(404).json({ 
          error: 'Cliente no encontrado' 
        });
        return;
      }

      // Validar items
      const invalidItems = items.filter(item => 
        !item.producto || 
        item.cantidad <= 0 || 
        item.precioUnitario <= 0 ||
        item.descuento < 0 ||
        item.descuento > 100
      );

      if (invalidItems.length > 0) {
        res.status(400).json({ 
          error: 'Items inválidos detectados. Verificar producto, cantidad, precio y descuento.' 
        });
        return;
      }

      // 1. Análisis tradicional (reglas de negocio)
      const rulesAnalysis = this.rulesService.analyzeOrder(clientData, items);

      // 2. Preparar datos para análisis de IA
      const orderData = {
        cliente: clientData,
        items,
        condiciones,
        totalPedido: rulesAnalysis.totalPedido,
        margenPromedio: rulesAnalysis.margenPromedio,
        descuentoPromedio: rulesAnalysis.descuentoPromedio,
        rulesDecision: rulesAnalysis.decision,
        riesgos: rulesAnalysis.riesgos
      };

      // 3. Análisis con IA
      const aiAnalysis = await this.aiService.analyzeOrder(orderData);

      // 4. Combinar análisis
      const finalDecision = this.combinedService.combineAnalysis(rulesAnalysis, aiAnalysis);

      // 5. Preparar respuesta
      const response: AnalyzeOrderResponse = {
        clientData,
        rulesAnalysis,
        aiAnalysis,
        finalDecision,
        timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error) {
      console.error('Error en análisis:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  // Endpoint para análisis solo con reglas (sin IA)
  async analyzeOrderRulesOnly(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, items }: AnalyzeOrderRequest = req.body;

      if (!clienteId || !items || items.length === 0) {
        res.status(400).json({ 
          error: 'Datos incompletos' 
        });
        return;
      }

      const clientData = MOCK_CLIENTS[clienteId];
      if (!clientData) {
        res.status(404).json({ 
          error: 'Cliente no encontrado' 
        });
        return;
      }

      const rulesAnalysis = this.rulesService.analyzeOrder(clientData, items);

      res.json({
        clientData,
        rulesAnalysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error en análisis de reglas:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }
}
