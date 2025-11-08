from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, ECS
from diagrams.aws.database import RDS, Dynamodb, ElastiCache
from diagrams.aws.network import ELB, CloudFront, Route53, APIGateway
from diagrams.aws.storage import S3
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.analytics import Kinesis
from diagrams.aws.security import Cognito
from diagrams.aws.ml import SagemakerModel
from diagrams.onprem.client import Users
from diagrams.onprem.queue import Celery

# Configuración del diagrama
graph_attr = {
    "fontsize": "20",
    "bgcolor": "white",
    "pad": "0.5",
}

with Diagram("Arquitectura App de Transporte - AWS", 
             filename="/home/claude/arquitectura_uber_aws", 
             show=False,
             direction="TB",
             graph_attr=graph_attr):
    
    # Usuarios
    pasajeros = Users("Pasajeros\n(App Móvil)")
    conductores = Users("Conductores\n(App Móvil)")
    
    # DNS y CDN
    dns = Route53("Route 53\n(DNS)")
    cdn = CloudFront("CloudFront\n(CDN)")
    
    # Capa de entrada
    with Cluster("Capa de API"):
        api_gateway = APIGateway("API Gateway")
        alb = ELB("Application\nLoad Balancer")
    
    # Autenticación
    auth = Cognito("Cognito\n(Auth)")
    
    # Capa de aplicación
    with Cluster("Servicios Backend"):
        with Cluster("Gestión de Usuarios"):
            user_service = ECS("User Service\n(ECS Fargate)")
        
        with Cluster("Gestión de Viajes"):
            ride_service = ECS("Ride Service\n(ECS Fargate)")
            matching_lambda = Lambda("Matching\nEngine")
        
        with Cluster("Geolocalización"):
            location_service = ECS("Location Service\n(ECS Fargate)")
        
        with Cluster("Pagos"):
            payment_service = ECS("Payment Service\n(ECS Fargate)")
        
        with Cluster("Notificaciones"):
            notification_lambda = Lambda("Notification\nService")
    
    # Streaming en tiempo real
    with Cluster("Tracking en Tiempo Real"):
        kinesis = Kinesis("Kinesis\nData Streams")
        location_processor = Lambda("Location\nProcessor")
    
    # Colas y eventos
    with Cluster("Mensajería"):
        sqs = SQS("SQS\n(Colas)")
        sns = SNS("SNS\n(Push)")
        eventbridge = Eventbridge("EventBridge\n(Event Bus)")
    
    # Capa de datos
    with Cluster("Almacenamiento"):
        # Bases de datos
        with Cluster("Bases de Datos"):
            rds = RDS("RDS PostgreSQL\n(Usuarios, Viajes)")
            dynamodb = Dynamodb("DynamoDB\n(Ubicaciones\nTiempo Real)")
        
        # Cache
        cache = ElastiCache("ElastiCache\nRedis")
        
        # Storage
        s3 = S3("S3\n(Documentos,\nFotos)")
    
    # Machine Learning
    with Cluster("ML y Analytics"):
        ml_model = SagemakerModel("SageMaker\n(Predicción\nPrecios/Demanda)")
    
    # Flujo principal de pasajeros
    pasajeros >> Edge(label="HTTPS") >> dns >> cdn >> api_gateway
    
    # Flujo principal de conductores
    conductores >> Edge(label="HTTPS") >> dns >> api_gateway
    
    # Autenticación
    api_gateway >> Edge(label="Auth") >> auth
    
    # API Gateway a servicios
    api_gateway >> alb
    alb >> user_service
    alb >> ride_service
    alb >> location_service
    alb >> payment_service
    
    # Servicios a bases de datos
    user_service >> rds
    ride_service >> rds
    payment_service >> rds
    
    # Servicios a cache
    user_service >> cache
    ride_service >> cache
    location_service >> cache
    
    # Tracking en tiempo real
    location_service >> Edge(label="Stream") >> kinesis
    kinesis >> location_processor
    location_processor >> dynamodb
    
    # Matching de conductores
    ride_service >> Edge(label="Nueva solicitud") >> sqs
    sqs >> matching_lambda
    matching_lambda >> dynamodb
    matching_lambda >> rds
    
    # Sistema de notificaciones
    matching_lambda >> Edge(label="Viaje asignado") >> eventbridge
    ride_service >> Edge(label="Eventos") >> eventbridge
    eventbridge >> notification_lambda
    notification_lambda >> sns
    sns >> Edge(label="Push") >> pasajeros
    sns >> Edge(label="Push") >> conductores
    
    # Storage
    user_service >> Edge(label="Fotos perfil") >> s3
    ride_service >> Edge(label="Recibos") >> s3
    
    # Machine Learning
    ride_service >> Edge(label="Datos históricos") >> ml_model
    ml_model >> Edge(label="Predicciones") >> ride_service
    
    # Cache bidireccional
    cache >> location_service
    cache >> ride_service

print("✅ Diagrama generado exitosamente!")
