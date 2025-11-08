import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Plus, Trash2, UtensilsCrossed, Info, CheckCircle, AlertTriangle, XCircle, Brain, Lightbulb, Target } from "lucide-react";
import { toast } from "sonner";
import { getClients, analyzeOrderWithAI, type OrderItem, type ClientData, type AnalysisResponse } from "@/lib/api";

// Los tipos ahora se importan desde el archivo de API

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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

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

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await getClients();
        setClients(response.data);
      } catch (error) {
        console.error('Error cargando clientes:', error);
        toast.error('Error cargando clientes');
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const totalPedido = items.reduce((sum, item) => sum + item.subtotal, 0);

  const analyzeOrder = async () => {
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
    
    try {
      const orderData = {
        clienteId: selectedClient,
        items,
        condiciones: conditions || undefined
      };

      const result = await analyzeOrderWithAI(orderData);
      setAnalysisResult(result);
      toast.success("Análisis con IA completado");
    } catch (error) {
      console.error('Error en análisis:', error);
      toast.error('Error en el análisis. Intenta de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
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
                  <Select value={selectedClient} onValueChange={setSelectedClient} disabled={isLoadingClients}>
                    <SelectTrigger id="client" className="bg-background">
                      <SelectValue placeholder={isLoadingClients ? "Cargando clientes..." : "Seleccionar Cliente"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nombre} ({client.categoria})
                        </SelectItem>
                      ))}
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
                    <p className="text-lg font-bold">{formatCurrency(analysisResult.rulesAnalysis.totalPedido)}</p>
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
                    <p className="text-lg font-bold">{analysisResult.rulesAnalysis.margenPromedio.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descuentos Totales Aplicados</p>
                    <p className="text-lg font-bold">{analysisResult.rulesAnalysis.descuentoPromedio.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Validación de Descuentos:</p>
                  {analysisResult.rulesAnalysis.descuentoExceso === 0 ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <p>Descuentos dentro del límite permitido</p>
                    </div>
                  ) : analysisResult.rulesAnalysis.descuentoExceso <= 5 ? (
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-5 w-5" />
                      <p>Descuentos exceden el límite en {analysisResult.rulesAnalysis.descuentoExceso.toFixed(1)}%</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-danger">
                      <XCircle className="h-5 w-5" />
                      <p>Descuentos muy elevados, requiere ajuste</p>
                    </div>
                  )}
                </div>

                {analysisResult.rulesAnalysis.riesgos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Riesgos Identificados:</p>
                    <ul className="space-y-1">
                      {analysisResult.rulesAnalysis.riesgos.map((riesgo: string, index: number) => (
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Análisis Inteligente con IA
                </CardTitle>
                <CardDescription>Insights contextuales generados por ChatGPT</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Insights Contextuales
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.aiAnalysis.contextualInsights.map((insight, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-500">💡</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Evaluación de Riesgos</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.aiAnalysis.riskAssessment}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Sugerencias de Negociación
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.aiAnalysis.negotiationSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-500">🤝</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Recomendación de IA</h4>
                  <p className="text-sm">{analysisResult.aiAnalysis.finalRecommendation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      IA: {analysisResult.aiAnalysis.decision}
                    </Badge>
                    <Badge variant="outline">
                      Confianza: {analysisResult.aiAnalysis.confidence}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Decisión Final Combinada</CardTitle>
                <CardDescription>Análisis híbrido: Reglas de negocio + Inteligencia artificial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4 py-4">
                  <Badge className={`${getDecisionColor(analysisResult.finalDecision.decision)} px-6 py-3 text-lg font-bold`}>
                    <span className="mr-2">{getDecisionIcon(analysisResult.finalDecision.decision)}</span>
                    {analysisResult.finalDecision.decision}
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2">
                    Confianza: {analysisResult.finalDecision.confidence}%
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Razonamiento</p>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{analysisResult.finalDecision.reasoning}</pre>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Acciones Recomendadas:</p>
                  <ul className="space-y-2">
                    {analysisResult.finalDecision.actionItems.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Análisis de Reglas:</p>
                      <Badge className={getDecisionColor(analysisResult.rulesAnalysis.decision)}>
                        {analysisResult.rulesAnalysis.decision}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Análisis de IA:</p>
                      <Badge className={getDecisionColor(analysisResult.aiAnalysis.decision)}>
                        {analysisResult.aiAnalysis.decision}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground italic">
                    La decisión final combina análisis cuantitativo y contextual para una recomendación más robusta
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
