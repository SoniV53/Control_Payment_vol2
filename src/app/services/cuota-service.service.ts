import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';

@Injectable({
  providedIn: 'root'
})
export class CuotaServiceService {

  constructor(private dbService: DatabaseServiceService) { }

  async getCuotasConProgreso(): Promise<any[]> {
    const db = await this.dbService.getDB();
    const res = await db.query(`SELECT g.*, c.nombre as cat_nombre, c.icono as cat_icono,
      (SELECT COUNT(*) FROM gasto_cuota WHERE gasto_id = g.id AND estado_cuota = 1) as pagadas 
      FROM gasto g LEFT JOIN categoria c ON g.categoria_id = c.id WHERE g.tipo = 'cuota'`);
    return res.values || [];
  }

  async obtenerOCrearDetalleCuotas(gasto: any): Promise<any[]> {
    const db = await this.dbService.getDB();
    let res = await db.query("SELECT * FROM gasto_cuota WHERE gasto_id = ? ORDER BY numero_cuota ASC", [gasto.id]);
    let cuotasActuales = res.values || [];

    // Validar si faltan cuotas por generar según el total indicado en el gasto
    if (cuotasActuales.length < gasto.cuotas) {
      const nuevoMontoCuota = gasto.monto / gasto.cuotas;
      
      let fechaBase = new Date(gasto.fecha || new Date());
      if (cuotasActuales.length > 0) {
        const ultimaFecha = cuotasActuales[cuotasActuales.length - 1].fecha_pago;
        if (ultimaFecha) fechaBase = new Date(ultimaFecha);
      }

      for (let i = cuotasActuales.length + 1; i <= gasto.cuotas; i++) {
        fechaBase.setMonth(fechaBase.getMonth() + 1);
        const fechaStr = fechaBase.toISOString().split('T')[0];
        
        await db.run(
          "INSERT INTO gasto_cuota (gasto_id, numero_cuota, monto_cuota, fecha_pago, estado_cuota) VALUES (?,?,?,?,?)", 
          [gasto.id, i, nuevoMontoCuota, fechaStr, 0]
        );
      }

      // Consultar de nuevo para devolver la lista completa
      res = await db.query("SELECT * FROM gasto_cuota WHERE gasto_id = ? ORDER BY numero_cuota ASC", [gasto.id]);
      cuotasActuales = res.values || [];
    }
    return cuotasActuales;
  }

  async toggleEstadoCuota(cuotaId: number, estado: number): Promise<void> {
    const db = await this.dbService.getDB();
    await db.run("UPDATE gasto_cuota SET estado_cuota = ? WHERE id = ?", [estado, cuotaId]);
  }

  async eliminarGastoCuotaCompleto(gastoId: number): Promise<void> {
    const db = await this.dbService.getDB();
    await db.run("DELETE FROM gasto_cuota WHERE gasto_id = ?", [gastoId]);
    await db.run("DELETE FROM gasto WHERE id = ?", [gastoId]);
  }

  async actualizarGastoYCuotas(gasto: any, editData: any): Promise<void> {
    const db = await this.dbService.getDB();
    const nuevoMontoCuota = editData.monto / editData.cuotas;

    // Recalcular hijos (eliminar los que sobran o agregar los que faltan)
    if (editData.cuotas < gasto.cuotas) {
        await db.run("DELETE FROM gasto_cuota WHERE gasto_id = ? AND numero_cuota > ?", [gasto.id, editData.cuotas]);
    } else if (editData.cuotas > gasto.cuotas) {
        const resUltima = await db.query("SELECT fecha_pago FROM gasto_cuota WHERE gasto_id = ? ORDER BY numero_cuota DESC LIMIT 1", [gasto.id]);
        let fechaBase = new Date();
        if(resUltima.values && resUltima.values.length > 0) {
          fechaBase = new Date(resUltima.values[0].fecha_pago);
        }

        for(let i = gasto.cuotas + 1; i <= editData.cuotas; i++) {
          fechaBase.setMonth(fechaBase.getMonth() + 1);
          const fechaStr = fechaBase.toISOString().split('T')[0];
          await db.run("INSERT INTO gasto_cuota (gasto_id, numero_cuota, monto_cuota, fecha_pago) VALUES (?,?,?,?)", 
          [gasto.id, i, nuevoMontoCuota, fechaStr]);
        }
    }
    
    // Actualizar datos del gasto principal y ajustar monto de todas las cuotas hijas
    await db.run("UPDATE gasto_cuota SET monto_cuota = ? WHERE gasto_id = ?", [nuevoMontoCuota, gasto.id]);
    await db.run("UPDATE gasto SET titulo = ?, monto = ?, cuotas = ?, categoria_id = ? WHERE id = ?", 
                  [editData.titulo, editData.monto, editData.cuotas, editData.categoria_id, gasto.id]);
  }
}