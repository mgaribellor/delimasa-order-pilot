import { Request, Response } from 'express';
import { MOCK_PRODUCTS } from '../data/mockData';

export class ProductsController {
  // GET /api/products
  getAllProducts(req: Request, res: Response): void {
    try {
      const products = MOCK_PRODUCTS.filter(product => product.disponible);
      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }

  // GET /api/products/search?q={query}
  searchProducts(req: Request, res: Response): void {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({ 
          error: 'Parámetro de búsqueda requerido' 
        });
        return;
      }

      const query = q.toLowerCase();
      const filteredProducts = MOCK_PRODUCTS.filter(product => 
        product.disponible && 
        product.nombre.toLowerCase().includes(query)
      );

      res.json({
        success: true,
        data: filteredProducts,
        count: filteredProducts.length,
        query: q
      });
    } catch (error) {
      console.error('Error buscando productos:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }

  // GET /api/products/:id
  getProductById(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const product = MOCK_PRODUCTS.find(p => p.id === id);

      if (!product) {
        res.status(404).json({ 
          error: 'Producto no encontrado' 
        });
        return;
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }
}
