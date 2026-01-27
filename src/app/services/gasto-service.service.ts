import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';
import { Gasto } from '../core/models/gasto.model';

@Injectable({
  providedIn: 'root'
})
export class GastoServiceService {

  constructor(private dbService: DatabaseServiceService) { }

  async addGasto(g: Gasto): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = this.dbService.getDB();

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
      estado_cuota
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            g.titulo,
            g.monto,
            g.descripcion ?? null,
            g.cuotas ?? 0,
            g.fecha,
            g.tipo,
            g.etiquetas ?? null,
            g.categoria_id,
            g.estado_cuota ?? 0
          ]
        );



      }
      catch (error) {
        reject(error);
        console.log('Error:', error);
      }
      resolve();
    });
  }


  async updateGasto(g: Gasto) {
    const db = this.dbService.getDB();

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
      estado_cuota = ?
     WHERE id = ?`,
      [
        g.titulo,
        g.monto,
        g.descripcion ?? null,
        g.cuotas ?? 0,
        g.fecha,
        g.tipo,
        g.etiquetas ?? null,
        g.categoria_id,
        g.estado_cuota ?? 0,
        g.id
      ]
    );
  }

  async deleteGasto(id: number) {
    const db = this.dbService.getDB();
    await db.run(`DELETE FROM gasto WHERE id = ?`, [id]);
  }

  async deleteGastoCompleto(id: number) {
    const db = this.dbService.getDB();

    await db.run(`DELETE FROM gasto_cuota WHERE gasto_id = ?`, [id]);
    await db.run(`DELETE FROM gasto WHERE id = ?`, [id]);
  }

  async getAllGastos() {
    const db = this.dbService.getDB();
    const res = await db.query(`SELECT * FROM gasto ORDER BY fecha DESC`);
    return res.values ?? [];
  }

  async getGastosPorMes(mes: string, anio: string) {
    const db = this.dbService.getDB();

    const res = await db.query(
      `SELECT * FROM gasto
     WHERE strftime('%m', fecha) = ?
     AND strftime('%Y', fecha) = ?
     ORDER BY fecha DESC`,
      [mes.padStart(2, '0'), anio]
    );

    return res.values ?? [];
  }

  async getGastosPorCategoria(categoriaId: number) {
    const db = this.dbService.getDB();

    const res = await db.query(
      `SELECT * FROM gasto WHERE categoria_id = ?`,
      [categoriaId]
    );

    return res.values ?? [];
  }


}
