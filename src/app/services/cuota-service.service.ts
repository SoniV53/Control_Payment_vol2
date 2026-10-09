import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';
import { addMonthsSafe } from '../utils/Utils';

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

    // Obtener el número de cuota más alto ya existente (para no crear duplicados)
    const maxRes = await db.query("SELECT MAX(numero_cuota) as maxNum FROM gasto_cuota WHERE gasto_id = ?", [gasto.id]);
    const maxNumExistente = maxRes.values?.[0]?.maxNum || 0;

    // Solo crear cuotas faltantes si hay menos registros que el total indicado
    // Y empezar desde maxNumExistente + 1 para evitar duplicados de numero_cuota
    const totalEsperado = gasto.cuotas || 0;
    if (cuotasActuales.length < totalEsperado) {
      const nuevoMontoCuota = gasto.monto / totalEsperado;
      
      let fechaBase = new Date(gasto.fecha || new Date());
      if (cuotasActuales.length > 0) {
        const ultimaFecha = cuotasActuales[cuotasActuales.length - 1].fecha_pago;
        if (ultimaFecha) fechaBase = new Date(ultimaFecha);
      }

      const startFrom = Math.max(maxNumExistente + 1, cuotasActuales.length + 1);

      for (let i = startFrom; i <= totalEsperado; i++) {
        // Verificar que no exista ya esta cuota por numero_cuota
        const existeCheck = await db.query(
          "SELECT id FROM gasto_cuota WHERE gasto_id = ? AND numero_cuota = ?", [gasto.id, i]
        );
        if (existeCheck.values && existeCheck.values.length > 0) continue;

        // Usa la fecha original del gasto y suma i - 1 meses
        const fechaOriginalStr = gasto.fecha ? gasto.fecha.split('T')[0] : new Date().toISOString().split('T')[0];
        const fechaStr = addMonthsSafe(fechaOriginalStr, i - 1);
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

