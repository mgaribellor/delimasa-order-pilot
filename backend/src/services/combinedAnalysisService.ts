import { RulesAnalysis, AIAnalysis, FinalDecision } from '../types';

export class CombinedAnalysisService {
  combineAnalysis(rulesAnalysis: RulesAnalysis, aiAnalysis: AIAnalysis): FinalDecision {
    // Matriz de decisión combinada
    const decisionMatrix: Record<string, { decision: 'APROBAR' | 'AJUSTAR' | 'RECHAZAR'; confidence: number }> = {
      'APROBAR-APROBAR': { decision: 'APROBAR', confidence: 95 },
      'APROBAR-AJUSTAR': { decision: 'AJUSTAR', confidence: 80 },
      'APROBAR-RECHAZAR': { decision: 'AJUSTAR', confidence: 70 },
      'AJUSTAR-APROBAR': { decision: 'AJUSTAR', confidence: 85 },
      'AJUSTAR-AJUSTAR': { decision: 'AJUSTAR', confidence: 90 },
      'AJUSTAR-RECHAZAR': { decision: 'RECHAZAR', confidence: 85 },
      'RECHAZAR-APROBAR': { decision: 'AJUSTAR', confidence: 60 },
      'RECHAZAR-AJUSTAR': { decision: 'RECHAZAR', confidence: 80 },
      'RECHAZAR-RECHAZAR': { decision: 'RECHAZAR', confidence: 95 }
    };

    const key = `${rulesAnalysis.decision}-${aiAnalysis.decision}`;
    const result = decisionMatrix[key] || { decision: 'AJUSTAR', confidence: 50 };

    // Ajustar confianza basada en la confianza de IA
    const adjustedConfidence = Math.min(result.confidence, aiAnalysis.confidence);

    return {
      decision: result.decision,
      confidence: adjustedConfidence,
      reasoning: this.buildCombinedReasoning(rulesAnalysis, aiAnalysis, result.decision),
      actionItems: this.generateActionItems(rulesAnalysis, aiAnalysis, result.decision)
    };
  }

  private buildCombinedReasoning(
    rules: RulesAnalysis, 
    ai: AIAnalysis, 
    finalDecision: 'APROBAR' | 'AJUSTAR' | 'RECHAZAR'
  ): string {
    const decisionText = this.getDecisionExplanation(rules.decision, ai.decision, finalDecision);
    
    return `
ANÁLISIS COMBINADO DE REGLAS COMERCIALES Y EVALUACIÓN DE IA

REGLAS DE NEGOCIO: ${rules.decision}
• Margen promedio: ${rules.margenPromedio.toFixed(1)}%
• Descuento promedio: ${rules.descuentoPromedio.toFixed(1)}%
• Riesgos detectados: ${rules.riesgos.length}
• Motivo: ${rules.motivoPrincipal}

EVALUACIÓN DE IA: ${ai.decision} (Confianza: ${ai.confidence}%)
• ${ai.finalRecommendation}

DECISIÓN FINAL: ${finalDecision}
${decisionText}

La recomendación combina el análisis cuantitativo de reglas de negocio con la evaluación contextual de inteligencia artificial para proporcionar una decisión más robusta y fundamentada.
    `.trim();
  }

  private getDecisionExplanation(
    rulesDecision: string, 
    aiDecision: string, 
    finalDecision: string
  ): string {
    if (rulesDecision === aiDecision && rulesDecision === finalDecision) {
      return 'Ambos análisis coinciden, proporcionando alta confianza en la decisión.';
    }
    
    if (finalDecision === 'AJUSTAR') {
      return 'Se recomienda ajustar el pedido para equilibrar los riesgos identificados por las reglas de negocio con las oportunidades comerciales detectadas por IA.';
    }
    
    if (finalDecision === 'APROBAR') {
      return 'A pesar de algunas diferencias en el análisis, el contexto comercial y los indicadores cuantitativos permiten aprobar el pedido.';
    }
    
    return 'Los riesgos identificados tanto por reglas de negocio como por análisis contextual sugieren rechazar o modificar significativamente el pedido.';
  }

  private generateActionItems(
    rules: RulesAnalysis, 
    ai: AIAnalysis, 
    finalDecision: 'APROBAR' | 'AJUSTAR' | 'RECHAZAR'
  ): string[] {
    const actionItems: string[] = [];

    // Acciones basadas en la decisión final
    switch (finalDecision) {
      case 'APROBAR':
        actionItems.push('✅ Proceder con la aprobación del pedido');
        actionItems.push('📋 Documentar la decisión en el sistema');
        actionItems.push('📞 Notificar al cliente sobre la aprobación');
        if (rules.riesgos.length > 0) {
          actionItems.push('⚠️ Monitorear de cerca este pedido debido a riesgos menores identificados');
        }
        break;

      case 'AJUSTAR':
        actionItems.push('🔄 Negociar ajustes con el cliente');
        if (rules.descuentoExceso > 0) {
          actionItems.push(`💰 Reducir descuentos en ${rules.descuentoExceso.toFixed(1)}%`);
        }
        if (rules.margenPromedio < rules.itemsAnalysis[0]?.margen || 0) {
          actionItems.push('📈 Revisar precios para mejorar márgenes');
        }
        actionItems.push('🤝 Aplicar sugerencias de negociación de IA');
        break;

      case 'RECHAZAR':
        actionItems.push('❌ Rechazar el pedido en su forma actual');
        actionItems.push('📧 Comunicar al cliente los motivos del rechazo');
        actionItems.push('💡 Proponer alternativas basadas en sugerencias de IA');
        actionItems.push('🔄 Invitar al cliente a reenviar con modificaciones');
        break;
    }

    // Agregar sugerencias específicas de IA
    if (ai.negotiationSuggestions.length > 0) {
      actionItems.push('🎯 Implementar estrategias de negociación sugeridas por IA');
    }

    return actionItems;
  }
}
