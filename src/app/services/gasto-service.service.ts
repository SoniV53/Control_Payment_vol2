import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';
import { Gasto } from '../core/models/gasto.model';
import { Capacitor } from '@capacitor/core';
import { GastoCuota } from '../core/models/gasto-cuota.model';
import { Presupuesto } from '../core/models/presupuesto.model';
import { formatDate } from '../utils/Utils';

@Injectable({
  providedIn: 'root'
})
export class GastoServiceService {

  constructor(private dbService: DatabaseServiceService) { }

  async addGasto(g: Gasto): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `INSERT INTO gasto (
          titulo,
          monto,
          descripcion,
          cuotas,
          fecha,
          tipo,
          etiquetas,
          categoria_id,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            g.titulo,
            g.monto,
            g.descripcion ?? null,
            g.cuotas ?? 0,
            g.fecha,
            g.tipo,
            g.etiquetas ?? null,
            g.categoria_id ?? null,
            g.estado ?? 0
          ]
        );

        const result = await db.query(`SELECT last_insert_rowid() as id`);
        const id = result.values?.[0]?.id;

        resolve(id);

      } catch (error) {
        console.error('Error insertando gasto:', error);
        reject(error);
      }
    });
  }

  async updateGasto(g: Gasto): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `UPDATE gasto SET
          titulo = ?,
          monto = ?,
          descripcion = ?,
          cuotas = ?,
          fecha = ?,
          tipo = ?,
          etiquetas = ?,
          categoria_id = ?,
          estado = ?
        WHERE id = ?`,
          [
            g.titulo,
            g.monto,
            g.descripcion ?? null,
            g.cuotas ?? 0,
            g.fecha,
            g.tipo,
            g.etiquetas ?? null,
            g.categoria_id ?? null,
            g.estado ?? 0,
            g.id
          ]
        );

        resolve();

      } catch (error) {
        console.error('Error actualizando gasto:', error);
        reject(error);
      }
    });
  }

  async deleteGasto(id: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(`DELETE FROM gasto WHERE id = ?`, [id]);

        resolve();

      } catch (error) {
        console.error('Error eliminando gasto:', error);
        reject(error);
      }
    });
  }

  async getTotalGastos(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT SUM(monto) as total FROM gasto WHERE estado = 1`
        );

        resolve(result.values?.[0]?.total ?? 0);

      } catch (error) {
        console.error('Error obteniendo total:', error);
        reject(error);
      }
    });
  }

  async getTotalPorCategoria(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(`
        SELECT 
          c.nombre,
          c.icono,
          SUM(g.monto) as total
        FROM gasto g
        LEFT JOIN categoria c ON g.categoria_id = c.id
        WHERE g.estado = 1
        GROUP BY g.categoria_id
      `);

        resolve(result.values ?? []);

      } catch (error) {
        console.error('Error totales por categoría:', error);
        reject(error);
      }
    });
  }



  async getGastos(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(`
        SELECT 
          g.*, 
          c.nombre as categoria_nombre,
          c.icono as categoria_icono
        FROM gasto g
        LEFT JOIN categoria c ON g.categoria_id = c.id
        ORDER BY g.fecha DESC
      `);

        resolve(result.values ?? []);

      } catch (error) {
        console.error('Error obteniendo gastos:', error);
        reject(error);
      }
    });
  }


  async getGastoById(id: number): Promise<Gasto | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT * FROM gasto WHERE id = ?`,
          [id]
        );

        resolve(result.values?.[0] ?? null);

      } catch (error) {
        console.error('Error obteniendo gasto:', error);
        reject(error);
      }
    });
  }

  ///Cuota Servicios
  async addGastoCuota(c: GastoCuota): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `INSERT INTO gasto_cuota (
          gasto_id,
          numero_cuota,
          monto_cuota,
          fecha_pago,
          estado_cuota
        ) VALUES (?, ?, ?, ?, ?)`,
          [
            c.gasto_id,
            c.numero_cuota,
            c.monto_cuota,
            c.fecha_pago ?? null,
            c.estado_cuota ?? 0
          ]
        );

        const result = await db.query(`SELECT last_insert_rowid() as id`);
        resolve(result.values?.[0]?.id);

      } catch (error) {
        console.error('Error insertando cuota:', error);
        reject(error);
      }
    });
  }

  async getCuotasByGasto(gastoId: number): Promise<GastoCuota[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT * FROM gasto_cuota 
         WHERE gasto_id = ?
         ORDER BY numero_cuota ASC`,
          [gastoId]
        );

        resolve(result.values ?? []);

      } catch (error) {
        console.error('Error obteniendo cuotas:', error);
        reject(error);
      }
    });
  }

  async getCuotaById(id: number): Promise<GastoCuota | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT * FROM gasto_cuota WHERE id = ?`,
          [id]
        );

        resolve(result.values?.[0] ?? null);

      } catch (error) {
        console.error('Error obteniendo cuota:', error);
        reject(error);
      }
    });
  }


  async updateCuota(c: GastoCuota): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `UPDATE gasto_cuota SET
          numero_cuota = ?,
          monto_cuota = ?,
          fecha_pago = ?,
          estado_cuota = ?
        WHERE id = ?`,
          [
            c.numero_cuota,
            c.monto_cuota,
            c.fecha_pago ?? null,
            c.estado_cuota ?? 0,
            c.id
          ]
        );

        resolve();

      } catch (error) {
        console.error('Error actualizando cuota:', error);
        reject(error);
      }
    });
  }

  async pagarCuota(id: number, fechaPago: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `UPDATE gasto_cuota 
         SET estado_cuota = 1, fecha_pago = ?
         WHERE id = ?`,
          [fechaPago, id]
        );

        resolve();

      } catch (error) {
        console.error('Error pagando cuota:', error);
        reject(error);
      }
    });
  }


  async deleteCuotasByGasto(gastoId: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(`DELETE FROM gasto_cuota WHERE gasto_id = ?`, [gastoId]);

        resolve();

      } catch (error) {
        console.error('Error eliminando cuotas:', error);
        reject(error);
      }
    });
  }

  async getResumenCuotas(gastoId: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(`
        SELECT 
          COUNT(*) as total_cuotas,
          SUM(CASE WHEN estado_cuota = 1 THEN monto_cuota ELSE 0 END) as total_pagado,
          SUM(CASE WHEN estado_cuota = 0 THEN monto_cuota ELSE 0 END) as pendiente
        FROM gasto_cuota
        WHERE gasto_id = ?
      `, [gastoId]);

        resolve(result.values?.[0]);

      } catch (error) {
        console.error('Error resumen cuotas:', error);
        reject(error);
      }
    });
  }

  //Presupuesto
  async addPresupuesto(p: Presupuesto): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `INSERT INTO presupuesto (
          monto,
          fecha
        ) VALUES (?, ?)`,
          [
            p.monto,
            p.fecha
          ]
        );

        const result = await db.query(`SELECT last_insert_rowid() as id`);
        resolve(result.values?.[0]?.id);

      } catch (error) {
        console.error('Error insertando presupuesto:', error);
        reject(error);
      }
    });
  }

  async getPresupuestoByMes(fecha: string): Promise<Presupuesto[] | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT monto FROM presupuesto`,
        );

        const result2 = await db.query(
          `SELECT * FROM presupuesto WHERE fecha = ?`,
          [fecha]
        );

        console.log(result2)

        resolve(result.values ?? null);

      } catch (error) {
        console.error('Error presupuesto por mes:', error);
        reject(error);
      }
    });
  }

  async updatePresupuesto(p: Presupuesto): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `UPDATE presupuesto SET
          monto = ?,
          fecha = ?
        WHERE id = ?`,
          [
            p.monto,
            p.fecha,
            p.id
          ]
        );

        resolve();

      } catch (error) {
        console.error('Error actualizando presupuesto:', error);
        reject(error);
      }
    });
  }




  private getMesActual(today: Date): string {
    return formatDate(today);
  }

  private getMesAnterior(today: Date): string {
    const fecha = new Date(today); // copia
    fecha.setMonth(fecha.getMonth() - 1);

    return formatDate(fecha);
  }



  async generarPresupuestoMensualSiNoExiste(today: Date): Promise<void> {
    try {
      const db = await this.dbService.getDB();

      const mesActual = this.getMesActual(today);
      const mesAnterior = this.getMesAnterior(today);

      const check = await db.query(
        `SELECT COUNT(*) as total FROM presupuesto WHERE fecha = ?`,
        [mesActual]
      );

      if (check.values?.[0]?.total > 0) {
        console.log('Presupuesto ya existe para este mes');
        return;
      }

      const anteriores = await db.query(
        `SELECT fecha, monto FROM presupuesto WHERE fecha = ?`,
        [mesAnterior]
      );

      if (!anteriores.values || anteriores.values.length === 0) {
        console.log('No hay presupuestos anteriores para copiar');
        await db.run(
          `INSERT INTO presupuesto (monto, fecha)
         VALUES (?, ?)`,
          ['0.0', mesActual]
        );
        return;
      }

      for (const p of anteriores.values) {
        await db.run(
          `INSERT INTO presupuesto (monto, fecha)
         VALUES (?, ?)`,
          [p.monto, mesActual]
        );
      }

      console.log('Presupuestos generados automáticamente para', mesActual);

    } catch (error) {
      console.error('Error generando presupuestos mensuales:', error);
    }
  }


}
