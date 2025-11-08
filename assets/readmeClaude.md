@startuml
title Diagrama de Secuencia - Aplicación de Transporte (Tipo Uber)

actor Pasajero
actor Conductor
participant "App Móvil\nPasajero" as AppP
participant "Servidor\nBackend" as Server
participant "Servicio de\nGeolocalización" as Geo
participant "Servicio de\nPagos" as Pagos
participant "App Móvil\nConductor" as AppC
database "Base de Datos" as DB

== Solicitud de Viaje ==

Pasajero -> AppP: Abre la aplicación
activate AppP
AppP -> Server: Autenticar usuario
activate Server
Server -> DB: Verificar credenciales
activate DB
DB --> Server: Usuario válido
deactivate DB
Server --> AppP: Autenticación exitosa
deactivate Server

AppP -> Geo: Obtener ubicación actual
activate Geo
Geo --> AppP: Coordenadas GPS
deactivate Geo

Pasajero -> AppP: Ingresa destino
AppP -> Server: Calcular ruta y precio estimado
activate Server
Server -> Geo: Calcular distancia y tiempo
activate Geo
Geo --> Server: Datos de ruta
deactivate Geo
Server --> AppP: Precio estimado y tiempo
deactivate Server

Pasajero -> AppP: Confirmar solicitud de viaje
AppP -> Server: Crear solicitud de viaje
activate Server
Server -> DB: Guardar solicitud
activate DB
DB --> Server: Solicitud guardada
deactivate DB

== Búsqueda y Asignación de Conductor ==

Server -> Server: Buscar conductores disponibles\nen área cercana

loop Para cada conductor cercano
    Server -> AppC: Notificar nueva solicitud
    activate AppC
    alt Conductor acepta
        Conductor -> AppC: Aceptar viaje
        AppC -> Server: Confirmar aceptación
        Server -> DB: Asignar conductor al viaje
        activate DB
        DB --> Server: Viaje asignado
        deactivate DB
        Server --> AppP: Conductor asignado
        Server --> AppC: Viaje confirmado
        note right: Se detiene la búsqueda
    else Conductor rechaza o timeout
        AppC --> Server: Rechazar o sin respuesta
        note right: Continuar con siguiente conductor
    end
end

deactivate AppC

== Conductor en Camino ==

AppP -> Pasajero: Mostrar info del conductor\n(nombre, foto, vehículo, ubicación)

loop Conductor se dirige al punto de recogida
    AppC -> Server: Actualizar ubicación GPS
    activate Server
    Server --> AppP: Actualizar ubicación en mapa
    deactivate Server
    AppP -> Pasajero: Mostrar conductor en tiempo real
end

Conductor -> AppC: He llegado al punto de recogida
AppC -> Server: Notificar llegada
activate Server
Server --> AppP: Conductor ha llegado
deactivate Server
AppP -> Pasajero: Notificación: "Tu conductor ha llegado"

== Durante el Viaje ==

Pasajero -> AppP: Confirmar que abordó el vehículo
AppP -> Server: Iniciar viaje
activate Server
Server -> DB: Actualizar estado del viaje
activate DB
DB --> Server: Estado actualizado
deactivate DB
Server --> AppC: Viaje iniciado
deactivate Server

loop Durante el trayecto
    AppC -> Server: Actualizar ubicación GPS
    activate Server
    Server --> AppP: Actualizar ruta y ETA
    deactivate Server
    AppP -> Pasajero: Mostrar progreso del viaje
end

== Finalización del Viaje ==

Conductor -> AppC: Finalizar viaje
AppC -> Server: Marcar viaje como completado
activate Server
Server -> Geo: Calcular distancia final recorrida
activate Geo
Geo --> Server: Distancia y tiempo real
deactivate Geo

Server -> Server: Calcular tarifa final
Server -> DB: Guardar detalles del viaje
activate DB
DB --> Server: Viaje guardado
deactivate DB

Server --> AppC: Viaje finalizado
Server --> AppP: Viaje completado - Tarifa final
deactivate Server

== Proceso de Pago ==

AppP -> Pasajero: Mostrar tarifa final
Pasajero -> AppP: Confirmar pago
AppP -> Server: Procesar pago
activate Server
Server -> Pagos: Cobrar tarifa al pasajero
activate Pagos
Pagos -> Pagos: Procesar transacción
Pagos --> Server: Pago exitoso
deactivate Pagos

Server -> DB: Registrar transacción
activate DB
DB --> Server: Transacción guardada
deactivate DB

Server --> AppP: Pago confirmado
Server --> AppC: Pago recibido
deactivate Server

== Calificación ==

AppP -> Pasajero: Solicitar calificación del conductor
Pasajero -> AppP: Calificar conductor (1-5 estrellas) + comentario
AppP -> Server: Enviar calificación
activate Server
Server -> DB: Guardar calificación
activate DB
DB --> Server: Calificación guardada
deactivate DB
Server --> AppP: Gracias por tu calificación
deactivate Server

AppC -> Conductor: Solicitar calificación del pasajero
Conductor -> AppC: Calificar pasajero (1-5 estrellas)
AppC -> Server: Enviar calificación
activate Server
Server -> DB: Guardar calificación
activate DB
DB --> Server: Calificación guardada
deactivate DB
Server --> AppC: Calificación registrada
deactivate Server

AppP -> Pasajero: Mostrar recibo y resumen del viaje
deactivate AppP

@enduml
