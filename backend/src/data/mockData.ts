import { ClientData } from '../types';

export const MOCK_CLIENTS: Record<string, ClientData> = {
  clienteA: {
    id: 'clienteA',
    nombre: 'Supermercados DelSur',
    historial: 'Cliente Premium - 50 pedidos en el último año',
    limiteCredito: 50000000,
    descuentoMaximo: 20,
    categoria: 'Premium',
    margenMinimo: 12,
  },
  clienteB: {
    id: 'clienteB',
    nombre: 'Restaurantes Gourmet SAS',
    historial: 'Cliente Regular - 25 pedidos en el último año',
    limiteCredito: 30000000,
    descuentoMaximo: 15,
    categoria: 'Regular',
    margenMinimo: 15,
  },
  clienteC: {
    id: 'clienteC',
    nombre: 'Distribuidora NorteCol',
    historial: 'Cliente Nuevo - Primer pedido',
    limiteCredito: 10000000,
    descuentoMaximo: 10,
    categoria: 'Nuevo',
    margenMinimo: 18,
  },
};

export const MOCK_PRODUCTS = [
  { id: '1', nombre: 'Arroz Premium 50kg', precioBase: 125000, categoria: 'Granos', disponible: true },
  { id: '2', nombre: 'Aceite de Girasol 20L', precioBase: 85000, categoria: 'Aceites', disponible: true },
  { id: '3', nombre: 'Azúcar Refinada 50kg', precioBase: 95000, categoria: 'Endulzantes', disponible: true },
  { id: '4', nombre: 'Harina de Trigo 50kg', precioBase: 75000, categoria: 'Harinas', disponible: true },
  { id: '5', nombre: 'Sal Marina 25kg', precioBase: 35000, categoria: 'Condimentos', disponible: true },
  { id: '6', nombre: 'Pasta Espagueti 20kg', precioBase: 65000, categoria: 'Pastas', disponible: true },
  { id: '7', nombre: 'Lentejas 25kg', precioBase: 95000, categoria: 'Legumbres', disponible: true },
  { id: '8', nombre: 'Café Molido 10kg', precioBase: 180000, categoria: 'Bebidas', disponible: true },
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
