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
    const cuotasNuevas = Number(editData.cuotas) || 1;
    const montoTotalNuevo = Number(editData.monto) || 0;
    const nuevoMontoCuota = montoTotalNuevo / cuotasNuevas;

    // Obtener cuotas existentes actuales ordenadas
    const resExistentes = await db.query(
      "SELECT id, numero_cuota, estado_cuota, fecha_pago FROM gasto_cuota WHERE gasto_id = ? ORDER BY numero_cuota ASC", 
      [gasto.id]
    );
    const cuotasActuales = resExistentes.values || [];
    const cuotasPagadas = cuotasActuales.filter((c: any) => c.estado_cuota === 1).length;

    if (cuotasNuevas < cuotasPagadas) {
      throw new Error(`No puedes reducir a ${cuotasNuevas} cuotas porque ya existen ${cuotasPagadas} cuotas pagadas.`);
    }

    // 1. Si se reducen las cuotas: eliminar las que excedan la nueva cantidad
    if (cuotasNuevas < cuotasActuales.length) {
      await db.run("DELETE FROM gasto_cuota WHERE gasto_id = ? AND numero_cuota > ?", [gasto.id, cuotasNuevas]);
    }

    // 2. Si se aumentan las cuotas: generar las cuotas faltantes hasta cuotasNuevas
    const fechaOriginalGasto = gasto.fecha ? gasto.fecha.split('T')[0] : new Date().toISOString().split('T')[0];

    for (let i = 1; i <= cuotasNuevas; i++) {
      const existe = cuotasActuales.find((c: any) => c.numero_cuota === i);
      if (!existe) {
        // Calcular fecha segura sumando (i - 1) meses a la fecha original del gasto
        const fechaCuotaStr = addMonthsSafe(fechaOriginalGasto, i - 1);
        await db.run(
          "INSERT INTO gasto_cuota (gasto_id, numero_cuota, monto_cuota, fecha_pago, estado_cuota) VALUES (?,?,?,?,?)",
          [gasto.id, i, nuevoMontoCuota, fechaCuotaStr, 0]
        );
      }
    }

    // 3. Actualizar el monto de todas las cuotas
    await db.run("UPDATE gasto_cuota SET monto_cuota = ? WHERE gasto_id = ?", [nuevoMontoCuota, gasto.id]);

    // 4. Calcular la nueva fecha final (fechaEnd)
    const nuevaFechaEnd = addMonthsSafe(fechaOriginalGasto, cuotasNuevas - 1);

    // 5. Actualizar la tabla principal 'gasto'
    await db.run(
      "UPDATE gasto SET titulo = ?, monto = ?, cuotas = ?, categoria_id = ?, fechaEnd = ? WHERE id = ?",
      [editData.titulo, montoTotalNuevo, cuotasNuevas, editData.categoria_id, nuevaFechaEnd, gasto.id]
    );
  }
}

