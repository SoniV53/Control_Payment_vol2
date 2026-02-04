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

        if (!cuotaExiste.values?.length) {
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
              res.monto / (res.cuotas || 0),
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


}
