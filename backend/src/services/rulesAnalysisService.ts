import { ClientData, OrderItem, RulesAnalysis } from '../types';
import { formatCurrency } from '../data/mockData';

export class RulesAnalysisService {
  analyzeOrder(clientData: ClientData, items: OrderItem[]): RulesAnalysis {
    // Cálculos básicos
    const totalPedido = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Análisis de items con márgenes
    const itemsAnalysis = items.map((item) => {
      const costo = item.precioUnitario * 0.6; // Asumimos 60% del precio como costo
      const precioConDescuento = item.precioUnitario * (1 - item.descuento / 100);
      const margen = ((precioConDescuento - costo) / precioConDescuento) * 100;
      return { ...item, margen, costo };
    });

    const margenPromedio = itemsAnalysis.reduce((sum, item) => sum + item.margen, 0) / itemsAnalysis.length;
    const descuentoPromedio = items.reduce((sum, item) => sum + item.descuento, 0) / items.length;

    // Validaciones y riesgos
    const riesgos: string[] = [];
    let decision: 'APROBAR' | 'AJUSTAR' | 'RECHAZAR' = 'APROBAR';
    let nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' = 'BAJO';
    let motivoPrincipal = '';
    let justificacion: string[] = [];

    // Validar descuentos
    const descuentoExceso = Math.max(0, descuentoPromedio - clientData.descuentoMaximo);
    if (descuentoExceso > 5) {
      riesgos.push('Descuentos excesivos aplicados');
      decision = 'RECHAZAR';
      motivoPrincipal = 'Los descuentos aplicados exceden significativamente el límite permitido';
    } else if (descuentoExceso > 0 && descuentoExceso <= 5) {
      riesgos.push('Descuentos ligeramente por encima del límite');
      if (decision === 'APROBAR') decision = 'AJUSTAR';
    }

    // Validar margen
    if (margenPromedio < clientData.margenMinimo - 2) {
      riesgos.push('Margen de ganancia muy bajo');
      decision = 'RECHAZAR';
      if (!motivoPrincipal) motivoPrincipal = 'El margen de ganancia está por debajo del mínimo aceptable';
    } else if (margenPromedio < clientData.margenMinimo) {
      riesgos.push('Margen de ganancia cercano al límite');
      if (decision === 'APROBAR') decision = 'AJUSTAR';
    }

    // Validar límite de crédito
    const excesoCreditoFactor = totalPedido / clientData.limiteCredito;
    if (excesoCreditoFactor > 1.1) {
      riesgos.push('Valor del pedido excede significativamente el límite de crédito');
      decision = 'RECHAZAR';
      if (!motivoPrincipal) motivoPrincipal = 'El valor total supera el límite de crédito disponible';
    } else if (excesoCreditoFactor > 1) {
      riesgos.push('Valor del pedido cercano al límite de crédito');
      if (decision === 'APROBAR') decision = 'AJUSTAR';
    }

    // Nivel de riesgo
    if (riesgos.length >= 3 || decision === 'RECHAZAR') {
      nivelRiesgo = 'ALTO';
    } else if (riesgos.length >= 1 || decision === 'AJUSTAR') {
      nivelRiesgo = 'MEDIO';
    }

    // Justificación
    if (decision === 'APROBAR') {
      motivoPrincipal = 'El pedido cumple con todas las políticas comerciales establecidas';
      justificacion = [
        `✓ Descuento promedio (${descuentoPromedio.toFixed(1)}%) está dentro del límite permitido (${clientData.descuentoMaximo}%)`,
        `✓ Margen de ganancia promedio (${margenPromedio.toFixed(1)}%) supera el mínimo requerido (${clientData.margenMinimo}%)`,
        `✓ Valor total (${formatCurrency(totalPedido)}) está dentro del límite de crédito (${formatCurrency(clientData.limiteCredito)})`,
        `✓ Cliente ${clientData.categoria} con buen historial de pagos`,
      ];
    } else if (decision === 'AJUSTAR') {
      if (!motivoPrincipal) motivoPrincipal = 'El pedido requiere ajustes menores para cumplir políticas';
      justificacion = [
        descuentoExceso > 0
          ? `⚠ Descuento promedio (${descuentoPromedio.toFixed(1)}%) excede el límite en ${descuentoExceso.toFixed(1)}%`
          : `✓ Descuento promedio (${descuentoPromedio.toFixed(1)}%) aceptable`,
        margenPromedio < clientData.margenMinimo
          ? `⚠ Margen de ganancia (${margenPromedio.toFixed(1)}%) ligeramente por debajo del mínimo (${clientData.margenMinimo}%)`
          : `✓ Margen de ganancia (${margenPromedio.toFixed(1)}%) aceptable`,
        excesoCreditoFactor > 1
          ? `⚠ Valor del pedido cercano al límite de crédito`
          : `✓ Valor del pedido dentro del límite de crédito`,
        'Se recomienda negociar términos o reducir descuentos',
      ];
    } else {
      justificacion = [
        descuentoExceso > 5
          ? `✗ Descuento promedio (${descuentoPromedio.toFixed(1)}%) excede el límite en ${descuentoExceso.toFixed(1)}%`
          : `✓ Descuentos dentro del rango`,
        margenPromedio < clientData.margenMinimo - 2
          ? `✗ Margen de ganancia (${margenPromedio.toFixed(1)}%) significativamente por debajo del mínimo (${clientData.margenMinimo}%)`
          : margenPromedio < clientData.margenMinimo
          ? `⚠ Margen de ganancia bajo`
          : `✓ Margen aceptable`,
        excesoCreditoFactor > 1.1
          ? `✗ Valor del pedido (${formatCurrency(totalPedido)}) excede el límite de crédito en ${((excesoCreditoFactor - 1) * 100).toFixed(0)}%`
          : `✓ Dentro del límite de crédito`,
        'No se recomienda procesar este pedido sin modificaciones sustanciales',
      ];
    }

    return {
      margenPromedio,
      descuentoPromedio,
      descuentoExceso,
      totalPedido,
      riesgos,
      decision,
      nivelRiesgo,
      motivoPrincipal,
      justificacion,
      itemsAnalysis,
    };
  }
}
