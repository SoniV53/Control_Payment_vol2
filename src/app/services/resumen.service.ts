import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';

@Injectable({
  providedIn: 'root'
})
export class ResumenService {

  constructor(private dbService: DatabaseServiceService) { }

  async getResumenCompleto(): Promise<any[]> {
    const db = await this.dbService.getDB();
    let resultados = [];

    // ==========================================
    // 1. OBTENER RESUMEN DE CUOTAS
    // Padre: gasto (tipo = 'cuota') | Hijos: gasto_cuota
    // ==========================================
    const resCuotas = await db.query(`
      SELECT g.*, c.nombre as cat_nombre, c.icono as cat_icono 
      FROM gasto g 
      LEFT JOIN categoria c ON g.categoria_id = c.id 
      WHERE g.tipo = 'cuota'
    `);
    
    for (let i = 0; i < (resCuotas.values?.length || 0); i++) {
      if (!resCuotas.values) continue;
      const gasto = resCuotas?.values[i];
      const resDetalle = await db.query(`SELECT * FROM gasto_cuota WHERE gasto_id = ? ORDER BY numero_cuota ASC`, [gasto.id]);
      const detalles = resDetalle.values || [];
      
      const pagados = detalles.filter((d: any) => d.estado_cuota === 1).length;
      const totalItems = gasto.cuotas || detalles.length;

      resultados.push({
        id: `c_${gasto.id}`,
        tipo: 'cuota',
        titulo: gasto.titulo,
        categoria_id: gasto.categoria_id,
        categoria: gasto.cat_nombre || 'Sin Categoría',
        cat_icono: gasto.cat_icono || 'pricetag-outline',
        montoTotal: gasto.monto,
        pagados: pagados,
        totalItems: totalItems,
        expanded: false,
        pagosDetalle: detalles.map((d: any) => ({
          fecha: d.fecha_pago,
          estado: d.estado_cuota === 1 ? 'pagado' : 'pendiente',
          monto: d.monto_cuota,
          numero: d.numero_cuota
        }))
      });
    }

    // ==========================================
    // 2. OBTENER RESUMEN DE RECURRENTES
    // Padre: gasto_recurrente | Hijos: gasto (donde recurrente_id = padre.id)
    // ==========================================
    const resRecurrentes = await db.query(`
      SELECT r.*, c.nombre as cat_nombre, c.icono as cat_icono 
      FROM gasto_recurrente r 
      LEFT JOIN categoria c ON r.categoria_id = c.id
    `);

    for (let i = 0; i < (resRecurrentes.values?.length || 0); i++) {
      if (!resRecurrentes.values) continue;
      const recurrente = resRecurrentes.values[i];
      const resDetalle = await db.query(`SELECT * FROM gasto WHERE recurrente_id = ? ORDER BY fecha DESC`, [recurrente.id]);
      const detalles = resDetalle.values || [];
      
      const pagados = detalles.filter((d: any) => d.estado === 1).length;
      const totalItems = detalles.length;
      
      // El monto total de un recurrente es la suma de todo lo que se ha generado de él
      const montoTotalGastado = detalles.reduce((sum: number, d: any) => sum + (d.monto || 0), 0);

      resultados.push({
        id: `r_${recurrente.id}`,
        tipo: 'recurrente',
        titulo: recurrente.titulo,
        categoria_id: recurrente.categoria_id,
        categoria: recurrente.cat_nombre || 'Sin Categoría',
        cat_icono: recurrente.cat_icono || 'sync-outline',
        montoTotal: montoTotalGastado > 0 ? montoTotalGastado : recurrente.monto,
        pagados: pagados,
        totalItems: totalItems > 0 ? totalItems : 1, // Para evitar que diga 0/0 si es nuevo
        expanded: false,
        pagosDetalle: detalles.map((d: any) => ({
          fecha: d.fecha,
          estado: d.estado === 1 ? 'pagado' : 'pendiente',
          monto: d.monto,
          numero: null
        }))
      });
    }

    return resultados;
  }
}