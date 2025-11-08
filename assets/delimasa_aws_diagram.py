from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, ECS, Fargate
from diagrams.aws.database import RDS, Dynamodb, ElasticacheForRedis
from diagrams.aws.network import CloudFront, Route53, APIGateway, VpnGateway, ELB
from diagrams.aws.storage import S3, S3Glacier
from diagrams.aws.integration import SQS, SNS, Eventbridge, StepFunctions
from diagrams.aws.security import Cognito, WAF, SecretsManager
from diagrams.aws.management import Cloudwatch, CloudwatchAlarm, Cloudtrail, SystemsManager
from diagrams.aws.analytics import Kinesis
from diagrams.aws.ml import Textract, Comprehend, SagemakerModel, Lex
from diagrams.aws.devtools import XRay
from diagrams.onprem.client import Users, Client
from diagrams.onprem.network import Internet
from diagrams.generic.blank import Blank

# Configuración del diagrama
graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "spline",
    "nodesep": "0.8",
    "ranksep": "1.2"
}

with Diagram(
    "Arquitectura AWS - Sistema de Gestión de Pedidos DeliMasa",
    filename="/home/claude/delimasa_aws_arquitectura",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
    outformat="png"
):
    
    # ============ USUARIOS Y CLIENTES ============
    with Cluster("Usuarios del Sistema"):
        clientes = Users("Clientes\nInstitucionales")
        empleados = Users("Atención al Cliente\nVendedores")
        internet = Internet("Internet")
    
    # ============ CAPA DE PRESENTACIÓN ============
    with Cluster("Capa de Presentación", graph_attr={"bgcolor": "#E3F2FD"}):
        dns = Route53("Route 53\nDNS")
        
        with Cluster("CDN y Contenido Estático"):
            cdn = CloudFront("CloudFront\nCDN")
            
            with Cluster("S3 Frontend"):
                s3_web = S3("Portal Web\nClientes")
                s3_dashboard = S3("Dashboard\nAtención")
    
    # ============ SEGURIDAD Y AUTENTICACIÓN ============
    with Cluster("Seguridad y Autenticación", graph_attr={"bgcolor": "#FFF3E0"}):
        waf = WAF("WAF\nFirewall")
        
        with Cluster("Cognito User Pools"):
            cognito_clientes = Cognito("Pool\nClientes")
            cognito_empleados = Cognito("Pool\nEmpleados")
        
        secrets = SecretsManager("Secrets Manager\nAPI Keys")
    
    # ============ CAPA DE API ============
    with Cluster("Capa de API Gateway", graph_attr={"bgcolor": "#E8F5E9"}):
        api_gateway = APIGateway("API Gateway\nREST API")
    
    # ============ CAPA DE APLICACIÓN - LAMBDA FUNCTIONS ============
    with Cluster("Microservicios Lambda", graph_attr={"bgcolor": "#F3E5F5"}):
        with Cluster("Gestión de Pedidos"):
            lambda_registro = Lambda("Registro de\nPedidos")
            lambda_validacion_inv = Lambda("Validación de\nInventario")
            lambda_validacion_cred = Lambda("Validación de\nCrédito")
        
        with Cluster("Facturación"):
            lambda_facturas = Lambda("Generación de\nFacturas")
        
        with Cluster("Notificaciones y Tracking"):
            lambda_notificaciones = Lambda("Gestión de\nNotificaciones")
            lambda_tracking = Lambda("Consultas de\nTracking")
            lambda_incidencias = Lambda("Gestión de\nIncidencias")
    
    # ============ SERVICIOS ECS/FARGATE ============
    with Cluster("Servicios de Larga Duración (ECS/Fargate)", graph_attr={"bgcolor": "#FCE4EC"}):
        with Cluster("ECS Cluster"):
            ecs_ocr = Fargate("Procesamiento\nOCR")
            ecs_crm = Fargate("Sistema CRM\nAtención")
            ecs_reportes = Fargate("Motor de\nReportes")
        
        alb = ELB("Application\nLoad Balancer")
    
    # ============ ORQUESTACIÓN Y FLUJOS ============
    with Cluster("Orquestación de Flujos", graph_attr={"bgcolor": "#FFF9C4"}):
        step_functions = StepFunctions("Step Functions\nFlujo de Pedidos")
        eventbridge = Eventbridge("EventBridge\nEvent Bus")
    
    # ============ INTEGRACIÓN Y MENSAJERÍA ============
    with Cluster("Integración y Mensajería", graph_attr={"bgcolor": "#E0F2F1"}):
        with Cluster("SQS Queues"):
            sqs_pedidos = SQS("Cola de\nPedidos")
            sqs_notificaciones = SQS("Cola de\nNotificaciones")
            sqs_facturacion = SQS("Cola de\nFacturación")
        
        with Cluster("SNS Topics"):
            sns_alertas = SNS("Alertas a\nAtención")
            sns_estados = SNS("Estados de\nPedidos")
            sns_inventario = SNS("Alertas de\nInventario")
    
    # ============ SERVICIOS DE IA/ML ============
    with Cluster("Servicios de IA y Machine Learning", graph_attr={"bgcolor": "#E1BEE7"}):
        with Cluster("Procesamiento de Documentos"):
            textract = Textract("Textract\nOCR")
            comprehend = Comprehend("Comprehend\nNLP")
        
        with Cluster("Modelos ML"):
            sagemaker = SagemakerModel("SageMaker\nPredicciones")
        
        chatbot = Lex("Lex\nChatbot")
        
        note_ml = Blank("Modelos:\n- Predicción demanda\n- Validación crédito\n- Detección fraude\n- Optimización rutas")
    
    # ============ CAPA DE DATOS ============
    with Cluster("Capa de Datos", graph_attr={"bgcolor": "#BBDEFB"}):
        with Cluster("Base de Datos Transaccional"):
            rds = RDS("RDS PostgreSQL\nPedidos, Clientes\nProductos, Inventario")
            rds_replica = RDS("Read Replica\nConsultas")
        
        with Cluster("Base de Datos NoSQL"):
            dynamodb_tracking = Dynamodb("DynamoDB\nTracking Tiempo Real")
            dynamodb_sesiones = Dynamodb("DynamoDB\nSesiones Atención")
            dynamodb_cache = Dynamodb("DynamoDB\nCache Consultas")
        
        cache = ElasticacheForRedis("ElastiCache\nRedis")
    
    # ============ ALMACENAMIENTO ============
    with Cluster("Almacenamiento de Objetos", graph_attr={"bgcolor": "#C5E1A5"}):
        with Cluster("S3 Buckets"):
            s3_facturas = S3("Facturas\nPDF/XML")
            s3_documentos = S3("Documentos\nPedidos")
            s3_imagenes = S3("Imágenes\nProductos")
            s3_logs = S3("Logs de\nAuditoría")
        
        glacier = S3Glacier("S3 Glacier\nArchivo\nHistórico")
    
    # ============ MONITOREO Y OBSERVABILIDAD ============
    with Cluster("Monitoreo y Observabilidad", graph_attr={"bgcolor": "#FFE0B2"}):
        cloudwatch = Cloudwatch("CloudWatch\nLogs y Métricas")
        cloudwatch_alarm = CloudwatchAlarm("CloudWatch\nAlarmas")
        xray = XRay("X-Ray\nTracing")
        cloudtrail = Cloudtrail("CloudTrail\nAuditoría AWS")
    
    # ============ INTEGRACIONES EXTERNAS ============
    with Cluster("Integraciones Externas", graph_attr={"bgcolor": "#FFCCBC"}):
        with Cluster("Conexión On-Premise"):
            vpn = VpnGateway("VPN Gateway\nDirect Connect")
            legacy_erp = Client("ERP\nLegacy")
            legacy_bodega = Client("Sistema\nBodega")
        
        with Cluster("APIs Externas"):
            api_dian = Internet("DIAN\nFacturación\nElectrónica")
            api_pagos = Internet("Pasarelas\nde Pago")
            api_sms = Internet("Proveedores\nSMS/WhatsApp")
            api_courier = Internet("Servicios\nCourier")
            api_geo = Internet("Geolocalización\nTracking")
    
    # ============ BACKUP Y RECUPERACIÓN ============
    with Cluster("Backup y Recuperación", graph_attr={"bgcolor": "#D1C4E9"}):
        backup = SystemsManager("AWS Backup\nEstrategia\nCentralizada")
    
    # ============================================
    # CONEXIONES PRINCIPALES
    # ============================================
    
    # Flujo de usuarios
    clientes >> Edge(label="HTTPS") >> internet
    empleados >> Edge(label="HTTPS") >> internet
    internet >> dns
    dns >> cdn
    
    # CDN a contenido estático
    cdn >> s3_web
    cdn >> s3_dashboard
    
    # Flujo a través de seguridad
    cdn >> waf
    waf >> api_gateway
    
    # Autenticación
    api_gateway >> Edge(label="Auth") >> cognito_clientes
    api_gateway >> Edge(label="Auth") >> cognito_empleados
    
    # API Gateway a Lambda Functions
    api_gateway >> lambda_registro
    api_gateway >> lambda_tracking
    api_gateway >> lambda_incidencias
    
    # Lambda Functions - Flujo de pedidos
    lambda_registro >> lambda_validacion_inv
    lambda_registro >> lambda_validacion_cred
    lambda_validacion_inv >> Edge(label="Valida") >> rds
    lambda_validacion_cred >> Edge(label="Consulta") >> rds
    
    # Step Functions orquestación
    lambda_registro >> Edge(label="Inicia") >> step_functions
    step_functions >> lambda_validacion_inv
    step_functions >> lambda_validacion_cred
    step_functions >> lambda_facturas
    step_functions >> lambda_notificaciones
    
    # Colas SQS
    lambda_registro >> sqs_pedidos
    lambda_facturas >> sqs_facturacion
    lambda_notificaciones >> sqs_notificaciones
    
    # EventBridge
    step_functions >> eventbridge
    eventbridge >> sns_alertas
    eventbridge >> sns_estados
    
    # SNS Notificaciones
    sns_alertas >> lambda_notificaciones
    sns_estados >> lambda_notificaciones
    sns_inventario >> lambda_notificaciones
    
    # Servicios ECS
    api_gateway >> alb
    alb >> ecs_crm
    alb >> ecs_reportes
    
    # OCR y procesamiento
    ecs_ocr >> textract
    textract >> s3_documentos
    ecs_crm >> comprehend
    ecs_crm >> chatbot
    
    # Machine Learning
    lambda_validacion_cred >> sagemaker
    lambda_registro >> sagemaker
    sagemaker >> rds_replica
    
    # Bases de datos
    lambda_registro >> rds
    lambda_facturas >> rds
    lambda_tracking >> dynamodb_tracking
    ecs_crm >> dynamodb_sesiones
    api_gateway >> cache
    
    # Almacenamiento S3
    lambda_facturas >> s3_facturas
    lambda_registro >> s3_documentos
    ecs_ocr >> s3_imagenes
    
    # Archivado
    s3_facturas >> Edge(label="Lifecycle") >> glacier
    s3_logs >> Edge(label="Archive") >> glacier
    
    # Conexiones externas
    vpn >> legacy_erp
    vpn >> legacy_bodega
    lambda_registro >> Edge(style="dashed") >> vpn
    lambda_validacion_inv >> Edge(style="dashed") >> vpn
    
    # APIs externas
    lambda_facturas >> Edge(label="SOAP/REST") >> api_dian
    lambda_registro >> api_pagos
    lambda_notificaciones >> api_sms
    lambda_tracking >> api_courier
    lambda_tracking >> api_geo
    
    # Monitoreo
    lambda_registro >> cloudwatch
    lambda_facturas >> cloudwatch
    ecs_crm >> cloudwatch
    api_gateway >> xray
    step_functions >> xray
    cloudwatch >> cloudwatch_alarm
    
    # Secrets
    lambda_facturas >> Edge(label="Credentials") >> secrets
    lambda_notificaciones >> Edge(label="API Keys") >> secrets
    
    # Backup
    rds >> backup
    dynamodb_tracking >> backup
    s3_facturas >> backup
    
    # Auditoría
    api_gateway >> cloudtrail
    rds >> cloudtrail
    s3_facturas >> cloudtrail

print("✅ Diagrama de arquitectura AWS generado exitosamente!")
print("📊 El diagrama incluye:")
print("   - Capa de presentación (CloudFront, S3, Route53)")
print("   - Microservicios Lambda (7 funciones)")
print("   - Servicios ECS/Fargate (OCR, CRM, Reportes)")
print("   - Bases de datos (RDS PostgreSQL, DynamoDB)")
print("   - Servicios de IA/ML (Textract, Comprehend, SageMaker, Lex)")
print("   - Integración y mensajería (SQS, SNS, EventBridge, Step Functions)")
print("   - Seguridad (Cognito, WAF, Secrets Manager)")
print("   - Monitoreo (CloudWatch, X-Ray, CloudTrail)")
print("   - Integraciones externas (VPN, APIs)")
print("   - Backup y recuperación (AWS Backup, Glacier)")
