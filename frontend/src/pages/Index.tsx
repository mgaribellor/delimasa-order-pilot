import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Plus, Trash2, UtensilsCrossed, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

interface ClientData {
  nombre: string;
  historial: string;
  limiteCredito: number;
  descuentoMaximo: number;
  categoria: string;
  margenMinimo: number;
}

const CLIENTS: Record<string, ClientData> = {
  clienteA: {
    nombre: "Supermercados DelSur",
    historial: "Cliente Premium - 50 pedidos en el último año",
    limiteCredito: 50000000,
    descuentoMaximo: 20,
    categoria: "Premium",
    margenMinimo: 12,
  },
  clienteB: {
    nombre: "Restaurantes Gourmet SAS",
    historial: "Cliente Regular - 25 pedidos en el último año",
    limiteCredito: 30000000,
    descuentoMaximo: 15,
    categoria: "Regular",
    margenMinimo: 15,
  },
  clienteC: {
    nombre: "Distribuidora NorteCol",
    historial: "Cliente Nuevo - Primer pedido",
    limiteCredito: 10000000,
    descuentoMaximo: 10,
    categoria: "Nuevo",
    margenMinimo: 18,
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [conditions, setConditions] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const addItem = () => {
    const newItem: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      producto: "",
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      subtotal: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field !== "subtotal") {
            const subtotal =
              updated.cantidad *
              updated.precioUnitario *
              (1 - updated.descuento / 100);
            return { ...updated, subtotal };
          }
          return updated;
        }
        return item;
      })
    );
  };

  const totalPedido = items.reduce((sum, item) => sum + item.subtotal, 0);

  const analyzeOrder = () => {
    if (!selectedClient) {
      toast.error("Por favor selecciona un cliente");
      return;
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un item al pedido");
      return;
    }
    if (items.some((item) => !item.producto || item.precioUnitario <= 0)) {
      toast.error("Completa todos los campos del pedido");
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const clientData = CLIENTS[selectedClient];
      
      // Cálculos
      const itemsAnalysis = items.map((item) => {
        const costo = item.precioUnitario * 0.6;
        const precioConDescuento = item.precioUnitario * (1 - item.descuento / 100);
        const margen = ((precioConDescuento - costo) / precioConDescuento) * 100;
        return { ...item, margen, costo };
      });

      const margenPromedio =
        itemsAnalysis.reduce((sum, item) => sum + item.margen, 0) / itemsAnalysis.length;
      
      const descuentoPromedio =
        items.reduce((sum, item) => sum + item.descuento, 0) / items.length;

      // Validaciones
      const riesgos: string[] = [];
      let decision: "APROBAR" | "AJUSTAR" | "RECHAZAR" = "APROBAR";
      let nivelRiesgo: "BAJO" | "MEDIO" | "ALTO" = "BAJO";
      let motivoPrincipal = "";
      let justificacion: string[] = [];

      // Validar descuentos
      const descuentoExceso = descuentoPromedio - clientData.descuentoMaximo;
      if (descuentoExceso > 5) {
        riesgos.push("Descuentos excesivos aplicados");
        decision = "RECHAZAR";
        motivoPrincipal = "Los descuentos aplicados exceden significativamente el límite permitido";
      } else if (descuentoExceso > 0 && descuentoExceso <= 5) {
        riesgos.push("Descuentos ligeramente por encima del límite");
        if (decision === "APROBAR") decision = "AJUSTAR";
      }

      // Validar margen
      if (margenPromedio < clientData.margenMinimo - 2) {
        riesgos.push("Margen de ganancia muy bajo");
        decision = "RECHAZAR";
        if (!motivoPrincipal) motivoPrincipal = "El margen de ganancia está por debajo del mínimo aceptable";
      } else if (margenPromedio < clientData.margenMinimo) {
        riesgos.push("Margen de ganancia cercano al límite");
        if (decision === "APROBAR") decision = "AJUSTAR";
      }

      // Validar límite de crédito
      const excesoCreditoFactor = totalPedido / clientData.limiteCredito;
      if (excesoCreditoFactor > 1.1) {
        riesgos.push("Valor del pedido excede significativamente el límite de crédito");
        decision = "RECHAZAR";
        if (!motivoPrincipal) motivoPrincipal = "El valor total supera el límite de crédito disponible";
      } else if (excesoCreditoFactor > 1) {
        riesgos.push("Valor del pedido cercano al límite de crédito");
        if (decision === "APROBAR") decision = "AJUSTAR";
      }

      // Nivel de riesgo
      if (riesgos.length >= 3 || decision === "RECHAZAR") {
        nivelRiesgo = "ALTO";
      } else if (riesgos.length >= 1 || decision === "AJUSTAR") {
        nivelRiesgo = "MEDIO";
      }

      // Justificación
      if (decision === "APROBAR") {
        motivoPrincipal = "El pedido cumple con todas las políticas comerciales establecidas";
        justificacion = [
          `✓ Descuento promedio (${descuentoPromedio.toFixed(1)}%) está dentro del límite permitido (${clientData.descuentoMaximo}%)`,
          `✓ Margen de ganancia promedio (${margenPromedio.toFixed(1)}%) supera el mínimo requerido (${clientData.margenMinimo}%)`,
          `✓ Valor total (${formatCurrency(totalPedido)}) está dentro del límite de crédito (${formatCurrency(clientData.limiteCredito)})`,
          `✓ Cliente ${clientData.categoria} con buen historial de pagos`,
        ];
      } else if (decision === "AJUSTAR") {
        if (!motivoPrincipal) motivoPrincipal = "El pedido requiere ajustes menores para cumplir políticas";
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
          "Se recomienda negociar términos o reducir descuentos",
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
          "No se recomienda procesar este pedido sin modificaciones sustanciales",
        ];
      }

      const result = {
        clientData,
        itemsAnalysis,
        margenPromedio,
        descuentoPromedio,
        descuentoExceso: Math.max(0, descuentoExceso),
        totalPedido,
        riesgos,
        decision,
        nivelRiesgo,
        motivoPrincipal,
        justificacion,
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);
      toast.success("Análisis completado");
    }, 2000);
  };

  const resetForm = () => {
    setSelectedClient("");
    setItems([]);
    setConditions("");
    setAnalysisResult(null);
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "APROBAR":
        return <CheckCircle className="h-6 w-6" />;
      case "AJUSTAR":
        return <AlertTriangle className="h-6 w-6" />;
      case "RECHAZAR":
        return <XCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "APROBAR":
        return "bg-success text-success-foreground";
      case "AJUSTAR":
        return "bg-warning text-warning-foreground";
      case "RECHAZAR":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "BAJO":
        return "bg-success text-success-foreground";
      case "MEDIO":
        return "bg-warning text-warning-foreground";
      case "ALTO":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">DeliMasa</h1>
              <p className="text-sm text-muted-foreground">Motor de Revisión Comercial - Canal Institucional</p>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground">Sistema de análisis automático de pedidos</p>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {!analysisResult ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>Selecciona el cliente institucional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client" className="bg-background">
                      <SelectValue placeholder="Seleccionar Cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="clienteA">Cliente Institucional A (Supermercados DelSur)</SelectItem>
                      <SelectItem value="clienteB">Cliente Institucional B (Restaurantes Gourmet SAS)</SelectItem>
                      <SelectItem value="clienteC">Cliente Institucional C (Distribuidora NorteCol)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items del Pedido</CardTitle>
                <CardDescription>Agrega los productos al pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2 text-left text-sm font-medium text-muted-foreground">Producto</th>
                          <th className="pb-2 text-left text-sm font-medium text-muted-foreground">Cantidad</th>
                          <th className="pb-2 text-left text-sm font-medium text-muted-foreground">Precio Unitario</th>
                          <th className="pb-2 text-left text-sm font-medium text-muted-foreground">% Descuento</th>
                          <th className="pb-2 text-left text-sm font-medium text-muted-foreground">Subtotal</th>
                          <th className="pb-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2">
                              <Input
                                value={item.producto}
                                onChange={(e) => updateItem(item.id, "producto", e.target.value)}
                                placeholder="Nombre del producto"
                                className="max-w-[200px]"
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => updateItem(item.id, "cantidad", parseInt(e.target.value) || 0)}
                                className="max-w-[100px]"
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="number"
                                min="0"
                                value={item.precioUnitario}
                                onChange={(e) => updateItem(item.id, "precioUnitario", parseFloat(e.target.value) || 0)}
                                placeholder="$0"
                                className="max-w-[120px]"
                              />
                            </td>
                            <td className="py-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.descuento}
                                onChange={(e) => updateItem(item.id, "descuento", parseFloat(e.target.value) || 0)}
                                className="max-w-[100px]"
                              />
                            </td>
                            <td className="py-2 font-medium">{formatCurrency(item.subtotal)}</td>
                            <td className="py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="text-danger hover:bg-danger/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No hay items en el pedido. Agrega el primer item.
                  </div>
                )}

                <Button onClick={addItem} variant="outline" className="w-full border-success text-success hover:bg-success/10">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Item al Pedido
                </Button>

                {items.length > 0 && (
                  <div className="flex justify-end border-t pt-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Valor Total del Pedido</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPedido)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Condiciones de Entrega</CardTitle>
                <CardDescription>Describe las condiciones especiales del pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Ej: Entrega en 3 días, descuento por volumen, margen mínimo 15%"
                  rows={4}
                  className="bg-background"
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={analyzeOrder}
                disabled={isAnalyzing}
                size="lg"
                className="bg-success text-success-foreground hover:bg-success/90 min-w-[300px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analizando pedido...
                  </>
                ) : (
                  "Enviar a Revisión Automática"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{analysisResult.clientData.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad de Items</p>
                    <p className="font-medium">{items.length} productos</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-lg font-bold">{formatCurrency(analysisResult.totalPedido)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Condiciones</p>
                    <p className="font-medium">{conditions || "Sin condiciones especiales"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información Enriquecida del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Historial</p>
                    <p className="font-medium">{analysisResult.clientData.historial}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <Badge variant="secondary">{analysisResult.clientData.categoria}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Límite de Crédito</p>
                    <p className="font-medium">{formatCurrency(analysisResult.clientData.limiteCredito)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descuento Máximo Permitido</p>
                    <p className="font-medium">{analysisResult.clientData.descuentoMaximo}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis y Cálculos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Margen de Ganancia Promedio</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover">
                            <p className="max-w-xs">
                              Calculado como: ((Precio - Descuento - Costo) / Precio) × 100
                              <br />
                              Costo asumido: 60% del precio unitario
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-lg font-bold">{analysisResult.margenPromedio.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descuentos Totales Aplicados</p>
                    <p className="text-lg font-bold">{analysisResult.descuentoPromedio.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Validación de Descuentos:</p>
                  {analysisResult.descuentoExceso === 0 ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <p>Descuentos dentro del límite permitido</p>
                    </div>
                  ) : analysisResult.descuentoExceso <= 5 ? (
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-5 w-5" />
                      <p>Descuentos exceden el límite en {analysisResult.descuentoExceso.toFixed(1)}%</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-danger">
                      <XCircle className="h-5 w-5" />
                      <p>Descuentos muy elevados, requiere ajuste</p>
                    </div>
                  )}
                </div>

                {analysisResult.riesgos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Riesgos Identificados:</p>
                    <ul className="space-y-1">
                      {analysisResult.riesgos.map((riesgo: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-danger">•</span>
                          <span>{riesgo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Recomendación Estructurada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4 py-4">
                  <Badge className={`${getDecisionColor(analysisResult.decision)} px-6 py-3 text-lg font-bold`}>
                    <span className="mr-2">{getDecisionIcon(analysisResult.decision)}</span>
                    {analysisResult.decision}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Motivo Principal</p>
                  <p className="text-lg font-medium">{analysisResult.motivoPrincipal}</p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Nivel de Riesgo:</p>
                  <Badge className={getRiskColor(analysisResult.nivelRiesgo)}>
                    {analysisResult.nivelRiesgo}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Justificación Detallada:</p>
                  <ul className="space-y-2">
                    {analysisResult.justificacion.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground italic">
                    La decisión final queda a cargo del asesor comercial
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button onClick={resetForm} size="lg" className="min-w-[250px]">
                Revisar Otro Pedido
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
