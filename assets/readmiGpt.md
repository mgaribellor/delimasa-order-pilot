    @startuml
title Flujo principal de solicitud de viaje (tipo Uber)

actor Pasajero
participant "App Pasajero" as AppP
participant "API Backend" as API
participant "Servicio Geoloc" as Geo
participant "Servicio Matching" as Match
participant "App Conductor" as AppC
actor Conductor
participant "Servicio Pagos" as Pay
participant "Notificaciones" as Notif

== Solicitud y estimación ==
Pasajero -> AppP: Ingresar origen/destino
AppP -> Geo: Obtener ETA y tarifas estimadas
Geo --> AppP: ETA, tarifa_base, tarifa_dinamica?
AppP -> Pasajero: Mostrar estimación y tiempo de espera
Pasajero -> AppP: Confirmar solicitud

== Creación y difusión del viaje ==
AppP -> API: POST /rides (origen, destino, método_pago)
API -> Geo: Buscar conductores cercanos
Geo --> API: Lista de conductores (con distancias)
API -> Match: Crear solicitud de emparejamiento
loop Difusión a conductores cercanos
  Match -> AppC: Push "Nueva solicitud de viaje"
  AppC -> Conductor: Mostrar detalles y aceptar/rechazar
  alt Conductor acepta
    AppC -> Match: Aceptar
    Match -> API: Conductor asignado
    break
  else Conductor rechaza/timeout
    AppC -> Match: Rechazar
  end
end

== Confirmación al pasajero ==
API -> AppP: Conductor asignado (nombre, vehículo, ETA)
AppP -> Pasajero: Mostrar datos del conductor y llegada
API -> Notif: Enviar notificación al pasajero y conductor
Notif --> AppP: Push ETA conductor
Notif --> AppC: Push detalles del pasajero

== Recogida y trayecto ==
AppC -> API: Conductor en ruta
API -> AppP: Actualizar mapa en tiempo real
AppC -> API: Conductor llegó al punto de recogida
AppP -> API: Pasajero abordó (opcional, confirmado por conductor)
API -> AppC: Iniciar viaje
API -> AppP: Iniciar viaje (tracking)
... Actualizaciones periódicas de ubicación ...
AppC -> API: Telemetría (lat, lon, velocidad) [loop cada N s]
API -> AppP: Progreso del viaje [loop cada N s]

== Finalización y cobro ==
AppC -> API: Finalizar viaje (kilómetros, tiempo, ruta)
API -> Pay: Calcular tarifa y cobrar (método_pago)
Pay --> API: Cobro aprobado (id_transacción)
API -> AppP: Recibo y calificación del conductor
API -> AppC: Calificación del pasajero y resumen

== Alternativas ==
alt Ningún conductor acepta
  Match -> API: Sin conductores disponibles
  API -> AppP: Notificar indisponibilidad / sugerir reintentar
end

alt Pasajero cancela antes de asignación
  AppP -> API: DELETE /rides/{id}
  API -> Match: Cancelar difusión
  API -> AppP: Confirmar cancelación (sin cargo)
end

alt Pasajero cancela después de asignación
  AppP -> API: DELETE /rides/{id}
  API -> Pay: Cargo por cancelación (si aplica)
  Pay --> API: Resultado
  API -> AppP: Confirmar cancelación y detalle de cargo
  API -> AppC: Notificar cancelación
end

alt Pago fallido
  Pay --> API: Rechazado
  API -> AppP: Solicitar método alterno
  AppP -> API: Actualizar método y reintentar
  API -> Pay: Reintento de cobro
end

@enduml
