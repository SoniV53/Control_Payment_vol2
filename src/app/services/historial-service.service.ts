import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';

@Injectable({
  providedIn: 'root'
})
export class HistorialServiceService {

  constructor(private dbService: DatabaseServiceService) { }

  // Obtiene todos los gastos registrados (historial general) con la info de su categoría
  async getHistorialCompleto(): Promise<any[]> {
    const db = await this.dbService.getDB();
    
    // Traemos todos los gastos ordenados del más reciente al más antiguo
    const res = await db.query(`
      SELECT g.*, c.nombre as cat_nombre, c.icono as cat_icono 
      FROM gasto g 
      LEFT JOIN categoria c ON g.categoria_id = c.id 
      ORDER BY g.fecha DESC
    `);
    
    return res.values || [];
  }
}