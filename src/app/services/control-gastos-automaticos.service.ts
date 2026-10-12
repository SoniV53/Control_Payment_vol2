import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';
import { dateSearch } from '../utils/Utils';
import { GastoRecurrente } from '../core/models/gasto_recurrente.model';
import { Gasto } from '../core/models/gasto.model';

@Injectable({
  providedIn: 'root'
})
export class ControlGastosAutomaticosService {

  constructor(private dbService: DatabaseServiceService) { }

  async addGastoMensualCuota(fecha: string): Promise<string> {
    try {
      const db = await this.dbService.getDB();
      const [fechaInicioMes, fechaFinMes] = dateSearch(fecha);

      const recurrenteRes = await db.query(
        `SELECT * FROM gasto_recurrente 
          WHERE activo = 1 AND fechaInicio <= ?`,
        [fechaInicioMes]
      );

      const recurrentes: GastoRecurrente[] = recurrenteRes.values || [];

      for (const res of recurrentes) {

        const gRes = await db.query(
          `SELECT * FROM gasto 
         WHERE fecha >= ? AND fecha < ? AND recurrente_id = ?`,
          [fechaInicioMes, fechaFinMes, res.id]
        );

        let gastoId: number;

        if (!gRes.values?.length) {
          const result = await db.run(
            `INSERT INTO gasto (
                titulo,
                monto,
                descripcion,
                fecha,
                tipo,
                etiquetas,
                categoria_id,
                recurrente_id,
                estado
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              res.titulo,
              res.monto,
              res.descripcion ?? null,
              fechaInicioMes,
              'recurrente',
              res.etiquetas ?? null,
              res.categoria_id,
              res.id ?? null,
              0
            ]
          );

          gastoId = result.changes?.lastId!;
        } else {
          gastoId = gRes.values[0].id;
        }
      }

      const gastosCuotasRes = await db.query(
        `SELECT * FROM gasto 
          WHERE tipo = 'cuota' AND fechaEnd >= ? AND fecha <= ?`,
        [fechaInicioMes, fechaInicioMes]
      );

      const gastosCuotas: Gasto[] = gastosCuotasRes.values || [];

      for (let res of gastosCuotas) {
        const cuotaExiste = await db.query(
          `SELECT * FROM gasto_cuota 
            WHERE gasto_id = ? AND fecha_pago >= ? AND fecha_pago < ?`,
          [res.id, fechaInicioMes, fechaFinMes]
        );

        const numeroCuota = this.diferenciaMeses(res.fecha, fechaInicioMes) + 1;

        // Verificar también si ya existe por numero_cuota (evitar duplicado #1)
        const cuotaNumExiste = await db.query(
          `SELECT id FROM gasto_cuota WHERE gasto_id = ? AND numero_cuota = ?`,
          [res.id, numeroCuota]
        );

        if (!cuotaExiste.values?.length && !cuotaNumExiste.values?.length) {
          await db.run(
            `INSERT INTO gasto_cuota (
            gasto_id,
            numero_cuota,
            monto_cuota,
            fecha_pago,
            estado_cuota
          ) VALUES (?, ?, ?, ?, ?)`,
            [
              res.id,
              numeroCuota,
              res.monto / (res.cuotas || 1),
              fechaInicioMes,
              0
            ]
          );
        }
      }


      return 'Gastos y cuotas automáticas generadas';
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  diferenciaMeses(inicio: string, actual: string): number {
    const d1 = new Date(inicio);
    const d2 = new Date(actual);

    return (
      (d2.getFullYear() - d1.getFullYear()) * 12 +
      (d2.getMonth() - d1.getMonth())
    );
  }

  async sincronizarRecurrenteHastaFecha(recurrenteId: number, fechaHasta?: string): Promise<number> {
    try {
      const db = await this.dbService.getDB();
      const recRes = await db.query(
        `SELECT * FROM gasto_recurrente WHERE id = ?`,
        [recurrenteId]
      );
      if (!recRes.values?.length) return 0;
      const recurrente: GastoRecurrente = recRes.values[0];

      if (!recurrente.fechaInicio) return 0;

      const hoy = new Date();
      const hoyStr = hoy.toISOString().split('T')[0];
      const targetStr = fechaHasta ? (fechaHasta > hoyStr ? fechaHasta : hoyStr) : hoyStr;

      // Límite de seguridad: Fecha actual menos 15 años
      const minAnoPermitido = hoy.getFullYear() - 15;
      const minDateStr = `${minAnoPermitido}-01-01`;

      // Si fechaInicio es más antigua que 15 años atrás, acotar a minDateStr
      const fechaEfectivaInicio = recurrente.fechaInicio < minDateStr ? minDateStr : recurrente.fechaInicio;

      const [inicioYear, inicioMonth] = fechaEfectivaInicio.split('-').map(n => parseInt(n, 10));
      const [targetYear, targetMonth] = targetStr.split('-').map(n => parseInt(n, 10));

      let curYear = inicioYear;
      let curMonth = inicioMonth;

      // Límite máximo de meses (15 años = 180 meses)
      const MAX_MESES = 180;
      let mesesGenerados = 0;
      let iteraciones = 0;

      while (
        (curYear < targetYear || (curYear === targetYear && curMonth <= targetMonth)) &&
        iteraciones < MAX_MESES
      ) {
        iteraciones++;
        const curDateStr = `${curYear}-${String(curMonth).padStart(2, '0')}-01`;
        const [fechaInicioMes, fechaFinMes] = dateSearch(curDateStr);

        const gRes = await db.query(
          `SELECT id FROM gasto WHERE fecha >= ? AND fecha < ? AND recurrente_id = ?`,
          [fechaInicioMes, fechaFinMes, recurrente.id]
        );

        if (!gRes.values?.length) {
          await db.run(
            `INSERT INTO gasto (
                titulo,
                monto,
                descripcion,
                fecha,
                tipo,
                etiquetas,
                categoria_id,
                recurrente_id,
                estado
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              recurrente.titulo,
              recurrente.monto,
              recurrente.descripcion ?? null,
              fechaInicioMes,
              'recurrente',
              recurrente.etiquetas ?? null,
              recurrente.categoria_id,
              recurrente.id ?? null,
              0
            ]
          );
          mesesGenerados++;
        }

        curMonth++;
        if (curMonth > 12) {
          curMonth = 1;
          curYear++;
        }
      }

      return mesesGenerados;
    } catch (error) {
      console.error('Error sincronizando recurrente histórico:', error);
      throw error;
    }
  }
}
