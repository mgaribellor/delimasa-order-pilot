import { Router } from 'express';
import { AnalysisController } from '../controllers/analysisController';
import { ClientsController } from '../controllers/clientsController';
import { ProductsController } from '../controllers/productsController';

const router = Router();

// Instanciar controladores
const analysisController = new AnalysisController();
const clientsController = new ClientsController();
const productsController = new ProductsController();

// Rutas de análisis
router.post('/orders/analyze-with-ai', (req, res) => analysisController.analyzeOrderWithAI(req, res));
router.post('/orders/analyze', (req, res) => analysisController.analyzeOrderRulesOnly(req, res));

// Rutas de clientes
router.get('/clients', (req, res) => clientsController.getAllClients(req, res));
router.get('/clients/:id', (req, res) => clientsController.getClientById(req, res));

// Rutas de productos
router.get('/products', (req, res) => productsController.getAllProducts(req, res));
router.get('/products/search', (req, res) => productsController.searchProducts(req, res));
router.get('/products/:id', (req, res) => productsController.getProductById(req, res));

// Ruta de salud del API
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DeliMasa Backend API',
    version: '1.0.0'
  });
});

export default router;
