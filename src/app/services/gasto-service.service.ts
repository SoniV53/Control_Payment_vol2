import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';
import { Gasto } from '../core/models/gasto.model';
import { Capacitor } from '@capacitor/core';
import { GastoCuota } from '../core/models/gasto-cuota.model';
import { Presupuesto } from '../core/models/presupuesto.model';
import { CatalogoTipoGasto, dateSearch, formatDate, getMesActual, getMesAnterior, validarCuotasConRango } from '../utils/Utils';
import { Categoria } from '../core/models/categoria.model';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { GastoRecurrente } from '../core/models/gasto_recurrente.model';

@Injectable({
  providedIn: 'root'
})
export class GastoServiceService {

  constructor(private dbService: DatabaseServiceService) { }


  async addGasto(g: Gasto, fecha: string, recurrente: boolean, numCuota?: number): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        if (!recurrente && g.tipo === 'cuota') {
          const ok = validarCuotasConRango(g.fecha, g.fechaEnd || '', g.cuotas || 0);

          if (!ok) {
            reject('Rango de fechas no valida');
          }
        }

        const db = await this.dbService.getDB();
        let idRecurrente = null;

        if (recurrente) {
          idRecurrente = await this.addGastoRecurrente({
            titulo: g.titulo,
            monto: g.monto,
            fechaInicio: g.fecha,
            frecuencia: 'mensual',
            proxima_fecha: '',
            categoria_id: g.categoria_id,
            descripcion: g.descripcion,
            activo: 1
          });

          g.tipo = 'recurrente'
          g.recurrente_id = idRecurrente;
        }

        let monto = g.monto;
        if (!recurrente && g.tipo === 'cuota') {
          monto = monto * (g.cuotas || 1);
        }

        await db.run(
          `INSERT INTO gasto (
          titulo,
          monto,
          descripcion,
          cuotas,
          fecha,
          fechaEnd,
          tipo,
          etiquetas,
          categoria_id,
          recurrente_id,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            g.titulo,
            monto,
            g.descripcion ?? null,
            g.cuotas ?? 0,
            dateSearch(g.fecha)[0],
            g.fechaEnd ? dateSearch(g.fechaEnd || '')[0] : null,
            g.tipo,
            g.etiquetas ?? null,
            g.categoria_id ?? null,
            g.recurrente_id ?? null,
            g.estado ?? 0
          ]
        );

        const result = await db.query(`SELECT last_insert_rowid() as id`);
        const id = result.values?.[0]?.id;

        // if (!recurrente && g.tipo === 'cuota') {
        //   //const data = await this.getNumeroCuota(fecha);
        //   //console.log("COMO BIENE:",data)
        //   const date = new Date(dateSearch(g.fecha)[0]);
        //   const fechaCu = new Date(date);
        //   fechaCu.setMonth(fechaCu.getMonth() + (numCuota || 1));


        //   const c: GastoCuota = {
        //     gasto_id: id,
        //     monto_cuota: g.monto,
        //     numero_cuota: numCuota || 1,
        //     estado_cuota: 0,
        //     fecha_pago: formatDate(fechaCu)
        //   }
        //   await db.run(
        //     `INSERT INTO gasto_cuota (
        //   gasto_id,
        //   numero_cuota,
        //   monto_cuota,
        //   fecha_pago,
        //   estado_cuota
        // ) VALUES (?, ?, ?, ?, ?)`,
        //     [
        //       c.gasto_id,
        //       c.numero_cuota,
        //       c.monto_cuota,
        //       c.fecha_pago ?? null,
        //       c.estado_cuota ?? 0
        //     ]
        //   );
        // }

        resolve(id);
      } catch (error) {
        console.error('Error insertando gasto:', error);
        reject(error);
      }
    });
  }


  async addGastoRecurrente(g: GastoRecurrente): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `INSERT INTO gasto_recurrente (
          titulo,
          monto,
          descripcion,
          etiquetas,
          fechaInicio,
          categoria_id,
          activo,
          frecuencia,
          proxima_fecha
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            g.titulo,
            g.monto,
            g.descripcion ?? null,
            g.etiquetas ?? null,
            g.fechaInicio,
            g.categoria_id ?? null,
            g.activo ?? 1,
            g.frecuencia,
            g.proxima_fecha
          ]
        );

        const result = await db.query(`SELECT last_insert_rowid() as id`);
        resolve(result.values?.[0]?.id);

      } catch (error) {
        console.error('Error insertando gasto recurrente:', error);
        reject(error);
      }
    });
  }

  async getGastosRecurrentes(): Promise<GastoRecurrente[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        // const result = await db.query(
        //   `SELECT * FROM gasto_recurrente WHERE activo = 1`
        // );

        // let recurrentes: GastoRecurrente[] = result.values || []
        // for (let g of recurrentes) {
        //   const gasto = await db.query(
        //     `SELECT * FROM gasto WHERE recurrente_id = ?`, [g.id]
        //   );

        //   g.cantidad = gasto.values?.length
        // }

        const result = await db.query(`
          SELECT 
            gr.*,
            COUNT(g.id) AS cantidad
          FROM gasto_recurrente gr
          LEFT JOIN gasto g 
            ON g.recurrente_id = gr.id
          WHERE gr.activo = 1
          GROUP BY gr.id
        `);

        resolve(result.values ?? []);

      } catch (error) {
        console.error('Error obteniendo recurrentes:', error);
        reject(error);
      }
    });
  }

  async getGastosRecurrentesById(id: string): Promise<GastoRecurrente[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT * FROM gasto_recurrente WHERE id = ?`, [id]
        );

        resolve(result.values ?? []);

      } catch (error) {
        console.error('Error obteniendo recurrentes:', error);
        reject(error);
      }
    });
  }

  async getNumeroCuota(fecha: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const date = dateSearch(fecha);

        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT 
            id,
            titulo,
            fecha,
            (
              (strftime('%Y', ?) - strftime('%Y', fecha)) * 12 +
              (strftime('%m', ?) - strftime('%m', fecha)) + 1
            ) AS numero_cuota
          FROM gasto
          WHERE activo = 1
          AND date(fecha) <= date(?);`, [date[0]]
        );

        resolve(result.values ?? []);

      } catch (error) {
        console.error('Error obteniendo recurrentes:', error);
        reject(error);
      }
    });
  }

  async updateGastoRecurrente(g: GastoRecurrente): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `UPDATE gasto_recurrente SET
          titulo = ?,
          monto = ?,
          descripcion = ?,
          etiquetas = ?,
          fechaInicio = ?,
          categoria_id = ?,
          activo = ?,
          frecuencia = ?,
          proxima_fecha = ?
        WHERE id = ?`,
          [
            g.titulo,
            g.monto,
            g.descripcion ?? null,
            g.etiquetas ?? null,
            g.fechaInicio,
            g.categoria_id ?? null,
            g.activo ?? 1,
            g.frecuencia,
            g.proxima_fecha,
            g.id
          ]
        );

        resolve();

      } catch (error) {
        console.error('Error actualizando recurrente:', error);
        reject(error);
      }
    });
  }

  async desactivarGastoRecurrente(id: number,isCheck:boolean): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();
        const activar = isCheck ? 0 : 1;
        await db.run(
          `UPDATE gasto_recurrente SET activo = ? WHERE id = ?`,
          [activar,id]
        );

        resolve();

      } catch (error) {
        console.error('Error desactivando recurrente:', error);
        reject(error);
      }
    });
  }

  async updateGasto(g: Gasto, newRecurrente: boolean): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();
        if (g.tipo === CatalogoTipoGasto.CUOTA) {
          if (g.gastoCuota) {
            await db.run(
              `UPDATE gasto_cuota SET
                monto_cuota = ?,
                estado_cuota = ?
              WHERE id = ?`,
              [
                g.gastoCuota.monto_cuota,
                g.gastoCuota.estado_cuota ?? 0,
                g.gastoCuota.id
              ]
            );
          }

        } else {
          newRecurrente = g.tipo === CatalogoTipoGasto.NORMAL ? newRecurrente : false;

          let idRecurrente = g.recurrente_id;

          if (newRecurrente) {
            idRecurrente = await this.addGastoRecurrente({
              titulo: g.titulo,
              monto: g.monto,
              fechaInicio: g.fecha,
              frecuencia: 'mensual',
              proxima_fecha: '',
              categoria_id: g.categoria_id,
              descripcion: g.descripcion,
              activo: 1
            });

            g.tipo = 'recurrente'
            g.recurrente_id = idRecurrente;
          }

          await db.run(
            `UPDATE gasto SET
              titulo = ?,
              monto = ?,
              descripcion = ?,
              tipo = ?,
              categoria_id = ?,
              recurrente_id = ?,
              estado = ?
            WHERE id = ?`,
            [
              g.titulo,
              g.monto,
              g.descripcion ?? null,
              g.tipo,
              g.categoria_id ?? null,
              g.recurrente_id ?? null,
              g.estado ?? 0,
              g.id
            ]
          );
        }




        resolve();
      } catch (error) {
        console.error('Error actualizando gasto:', error);
        reject(error);
      }
    });
  }

  async updateEstadoGasto(g: Gasto): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();
        if (g?.tipo === CatalogoTipoGasto.CUOTA && g.gastoCuota) {
          await db.run(
            `UPDATE gasto_cuota SET
              estado_cuota = ?
            WHERE id = ?`,
            [
              g.gastoCuota.estado_cuota ?? 0,
              g.gastoCuota.id
            ]
          );

        } else {
          await db.run(
            `UPDATE gasto SET 
              estado = ?
            WHERE id = ?`,
            [
              g.estado ?? 0,
              g.id
            ]
          );
        }
        resolve();

      } catch (error) {
        console.error('Error actualizando gasto:', error);
        reject(error);
      }
    });
  }

  async eliminarEstadoGasto(g: Gasto): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();
        if (g?.tipo === CatalogoTipoGasto.NORMAL) {
          await db.run(`DELETE FROM gasto WHERE id = ?`, [g.id]);
        } else if (g?.tipo === CatalogoTipoGasto.RECURRENTE) {
          await db.run(
            `UPDATE gasto SET 
              estado = 2
            WHERE id = ?`,
            [g.id]
          );
        } else if (g.gastoCuota) {
          await db.run(
            `UPDATE gasto_cuota SET
              estado_cuota = 2
            WHERE id = ?`,
            [
              g.gastoCuota.id
            ]
          );
        }
        resolve();

      } catch (error) {
        console.error('Error actualizando gasto:', error);
        reject(error);
      }
    });
  }

  async deleteGasto(id: number, tipo: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        if (tipo === 'normal') {
          await db.run(`DELETE FROM gasto WHERE id = ?`, [id]);
        } else {
          await db.run(
            `UPDATE gasto SET 
              estado = 2
            WHERE id = ?`,
            [id]
          );
        }

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

  async getTotalPorCategoria(fecha: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();
        const date = dateSearch(fecha);

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


  async getGastos(fecha: string): Promise<Categoria[]> {
    return new Promise<Categoria[]>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();
        const [fechaInicio, fechaFin] = dateSearch(fecha);

        //Categorias
        const categoriasRes = await db.query(
          `SELECT * FROM categoria WHERE activo = 1 ORDER BY nombre ASC`
        );
        const categorias: Categoria[] = (categoriasRes.values || []).map(res => ({
          id: res.id,
          icono: res.icono,
          nombre: res.nombre,
          totalMonto: 0,
          dataGasto: []
        }));

        if (!categorias.length) resolve([]);;

        //Gastos normales y recurrentes
        const gastosRes = await db.query(
          `SELECT * FROM gasto
       WHERE fecha >= ? AND fecha < ?
       AND (tipo = "normal" OR tipo = "recurrente") AND estado != 2`,
          [fechaInicio, fechaFin]
        );
        const gastos: Gasto[] = gastosRes.values || [];

        //Gastos por Cuotas fecha
        const cuotasRes = await db.query(
          `SELECT * FROM gasto_cuota
       WHERE fecha_pago >= ? AND fecha_pago < ?`,
          [fechaInicio, fechaFin]
        );
        const cuotas = cuotasRes.values || [];

        const idsCuotas = [...new Set(cuotas.map(c => c.gasto_id))];
        let gastosCuotasMap = new Map<number, Gasto>();

        if (idsCuotas.length) {
          const placeholders = idsCuotas.map(() => '?').join(',');
          const gastosCuotaRes = await db.query(
            `SELECT * FROM gasto WHERE id IN (${placeholders}) AND estado != 2`,
            idsCuotas
          );
          gastosCuotaRes.values?.forEach(g => gastosCuotasMap.set(g.id, g));
        }

        gastos.forEach(g => {
          const categoria = categorias.find(c => c.id === g.categoria_id);
          if (categoria && categoria.dataGasto) categoria.dataGasto.push(g);
        });

        cuotas.forEach(cuota => {
          const gastoBase = gastosCuotasMap.get(cuota.gasto_id);
          if (!gastoBase) return;

          const categoria = categorias.find(c => c.id === gastoBase.categoria_id);
          if (categoria && categoria.dataGasto) {
            categoria.dataGasto.push({
              ...gastoBase,
              gastoCuota: cuota
            });
          }


        });

        resolve(categorias);
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

        const date = dateSearch(fecha);
        console.log(date)

        const result = await db.query(
          `SELECT monto FROM presupuesto`
        );

        const result2 = await db.query(
          `SELECT * FROM presupuesto WHERE fecha >= ? AND fecha <  ?;`, [date[0], date[1]]
        );

        resolve(result2.values ?? []);

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

  async generarPresupuestoMensualSiNoExiste(today: string): Promise<void> {
    try {
      const db = await this.dbService.getDB();

      const mesActual = dateSearch(today)[0];
      const mesAnterior = dateSearch(today)[2];

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
