import { Request, Response } from 'express';
import { MOCK_CLIENTS } from '../data/mockData';

export class ClientsController {
  // GET /api/clients
  getAllClients(req: Request, res: Response): void {
    try {
      const clients = Object.values(MOCK_CLIENTS);
      res.json({
        success: true,
        data: clients,
        count: clients.length
      });
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }

  // GET /api/clients/:id
  getClientById(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const client = MOCK_CLIENTS[id];

      if (!client) {
        res.status(404).json({ 
          error: 'Cliente no encontrado' 
        });
        return;
      }

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }
}
