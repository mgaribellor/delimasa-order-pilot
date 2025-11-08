# uber_architecture_aws.py
# Diagrama de arquitectura estilo Uber en AWS usando "diagrams"
# Genera: uber_architecture_aws.png

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import Route53, CloudFront, APIGateway, VPCRouter, ELB
from diagrams.aws.security import WAF, Cognito, SecretsManager, Shield
from diagrams.aws.compute import ECS, Lambda, EKS
from diagrams.aws.integration import SQS, SNS, Eventbridge, StepFunctions
from diagrams.aws.database import RDS, Dynamodb, Elasticache
from diagrams.aws.analytics import KinesisDataStreams, Glue, Athena, Quicksight
from diagrams.aws.management import Cloudwatch
from diagrams.aws.storage import S3
from diagrams.aws.mobile import APIGateway as APIGWMobile # (alias visual)
from diagrams.aws.network import NATGateway, InternetGateway
from diagrams.aws.devtools import Codepipeline, XRay
from diagrams.aws.ml import Personalize
from diagrams.aws.iot import IotCore
from diagrams.aws.general import InternetAlt1
from diagrams.aws.security import CertificateManager
from diagrams.aws.migration import Dms
from diagrams.aws.blockchain import ManagedBlockchain
from diagrams.aws.location import LocationService

# Nota: algunos imports son decorativos para variedad visual; ajusta a tu stack real.

with Diagram("uber_architecture_aws", show=False, filename="uber_architecture_aws", direction="LR"):
    # Usuarios/Clientes
    pasajero = InternetAlt1("App Pasajero (iOS/Android)")
    conductor = InternetAlt1("App Conductor (iOS/Android)")

    # Borde público
    r53 = Route53("DNS")
    cert = CertificateManager("TLS certs")
    waf = WAF("WAF")
    shield = Shield("Shield Advanced")
    cdn = CloudFront("CDN + Static (S3)")
    api_edge = APIGateway("API Gateway (REST/WebSocket)")

    # Autenticación
    auth = Cognito("Cognito (AuthN/AuthZ)")

    # Región y VPC
    with Cluster("VPC (Multi-AZ)"):
        igw = InternetGateway("IGW")

        with Cluster("Subredes Públicas"):
            alb = ELB("ALB (WebSocket/HTTP)")
            nat = NATGateway("NAT GW")

        with Cluster("Subredes Privadas - Capa de Servicios"):
            ecs = ECS("ECS/Fargate Cluster")
            svc_ride = ECS("Ride API\n(REST)")
            svc_matching = ECS("Matching Service\n(assign)")
            svc_pay = ECS("Payments Worker")
            svc_notify = Lambda("Notifications\n(SES/FCM/APNs)")
            svc_ws = ECS("Realtime Gateway\n(WebSocket)")
            cache = Elasticache("ElastiCache (Redis)")

            # Mensajería/eventos
            q_match = SQS("Queue: ride-requests")
            q_driver = SQS("Queue: driver-updates")
            bus = Eventbridge("EventBridge\n(domain events)")
            state = StepFunctions("Orchestrations\n(cancellation/refunds)")
            streams = KinesisDataStreams("Telemetry stream")

        with Cluster("Subredes Privadas - Datos"):
            aurora = RDS("Aurora MySQL\n(trx)")
            ddb = Dynamodb("DynamoDB\n(sesiones/estado)")
            s3dl = S3("S3 Data Lake")
            secrets = SecretsManager("Secrets")

    # Servicios adicionales
    loc = LocationService("Amazon Location Service\n(geocoding/routing)")
    iot = IotCore("IoT (opcional)\nlocation pings")
    search = Personalize("Recomendador\n(ETA/Price tuning)")  # decorativo
    # Observabilidad
    cwatch = Cloudwatch("CloudWatch")
    xray = XRay("X-Ray")

    # Analítica / BI
    glue = Glue("Glue ETL")
    athena = Athena("Athena SQL")
    quicksight = Quicksight("QuickSight Dashboards")

    # Pasarela de pagos externa (tercero)
    payments = InternetAlt1("Proveedor de Pagos\n(externo)")

    # Estático del frontend
    static_site = S3("S3 (Web/App assets)")

    # Rutas de cliente -> borde
    pasajero >> Edge(label="HTTPS/HTTP2") >> r53 >> waf >> cdn
    conductor >> Edge(label="HTTPS/HTTP2") >> r53
    cdn >> Edge(label="static assets") >> static_site
    [pasajero, conductor] >> Edge(label="REST/WebSocket") >> api_edge
    api_edge >> Edge(label="Auth flows") >> auth

    # Borde -> ALB/API interno
    api_edge >> Edge(label="Private Link/VPC Link") >> alb
    alb >> Edge(label="HTTP") >> [svc_ws, svc_ride]

    # Autenticación hacia servicios
    auth >> Edge(style="dashed", label="JWT/OIDC") >> [svc_ride, svc_ws]

    # Telemetría de ubicación en tiempo real
    [pasajero, conductor] >> Edge(label="location pings") >> svc_ws
    svc_ws >> Edge(label="pub/sub") >> cache
    svc_ws >> Edge(label="driver/passenger updates") >> q_driver

    # Solicitudes de viaje
    svc_ride >> Edge(label="create ride") >> q_match
    q_match >> svc_matching
    svc_matching >> Edge(label="driver assignment") >> ddb
    svc_matching >> Edge(label="events") >> bus
    svc_matching >> Edge(label="notify") >> svc_notify

    # Motor de tarifas/ETA
    svc_ride >> Edge(label="geocode/ETA") >> loc
    svc_matching >> Edge(label="routing/ETA") >> loc

    # Persistencia transaccional
    [svc_ride, svc_matching, svc_pay] >> Edge(label="JDBC/ORM") >> aurora
    [svc_ride, svc_matching] >> Edge(label="state/session") >> ddb
    svc_ride >> Edge(label="caching") >> cache

    # Pagos
    svc_pay >> Edge(label="charge/refund") >> payments
    state >> Edge(label="invoke worker") >> svc_pay

    # Notificaciones
    svc_notify >> Edge(label="push/email/SMS") >> SNS("SNS")
    # (SNS fan-out a APNs/FCM/SES—resumido)

    # Ingesta de telemetría para analytics
    [svc_ws, svc_ride, svc_matching] >> streams >> s3dl
    bus >> Edge(label="archive") >> s3dl

    # Analytics/BI
    s3dl >> glue >> athena >> quicksight

    # Observabilidad
    for svc in [svc_ride, svc_matching, svc_pay, svc_ws, svc_notify]:
        svc >> Edge(label="metrics/logs") >> cwatch
        svc >> Edge(label="traces") >> xray

    # Seguridad y secretos
    [svc_ride, svc_matching, svc_pay] >> secrets

    # CDN también protege estáticos
    waf >> cert
    cert >> [cdn, alb]
