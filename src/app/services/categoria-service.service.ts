import { Injectable } from '@angular/core';
import { DatabaseServiceService } from '../core/database/database-service.service';
import { Categoria } from '../core/models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaServiceService {

  constructor(private dbService: DatabaseServiceService) { }

  async addCategoria(c: Categoria): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `INSERT INTO categoria (
          nombre,
          icono,
          activo
        ) VALUES (?, ?, ?)`,
          [
            c.nombre,
            c.icono,
            c.activo ?? 1
          ]
        );

        const result = await db.query(`SELECT last_insert_rowid() as id`);

        const id = result.values?.[0]?.id;

        resolve(id);
      } catch (error) {
        console.error('Error insertando categoría:', error);
        reject(error);
      }
    });
  }

  async updateCategoria(c: Categoria): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `UPDATE categoria SET
          nombre = ?,
          icono = ?,
          activo = ?
        WHERE id = ?`,
          [
            c.nombre,
            c.icono,
            c.activo ?? 1,
            c.id
          ]
        );

        resolve();
      } catch (error) {
        console.error('Error actualizando categoría:', error);
        reject(error);
      }
    });
  }


  async getCategoriasActivas(): Promise<Categoria[]> {
    return new Promise<Categoria[]>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT * FROM categoria WHERE activo = 1 ORDER BY nombre ASC`
        );

        resolve(result.values ?? []);
      } catch (error) {
        console.error('Error obteniendo categorías:', error);
        reject(error);
      }
    });
  }

  async getCategorias(): Promise<Categoria[]> {
    return new Promise<Categoria[]>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(`SELECT * FROM categoria ORDER BY nombre ASC`);

        resolve(result.values ?? []);
      } catch (error) {
        console.error('Error obteniendo categorías:', error);
        reject(error);
      }
    });
  }

  async getCategoriaById(id: number): Promise<Categoria | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        const result = await db.query(
          `SELECT * FROM categoria WHERE id = ?`,
          [id]
        );

        if (result.values && result.values.length > 0) {
          resolve(result.values[0]);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Error obteniendo categoría por id:', error);
        reject(error);
      }
    });
  }

  async deleteCategoria(id: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(
          `UPDATE categoria SET activo = 0 WHERE id = ?`,
          [id]
        );

        resolve();
      } catch (error) {
        console.error('Error desactivando categoría:', error);
        reject(error);
      }
    });
  }

  async deleteCategoriaFisico(id: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const db = await this.dbService.getDB();

        await db.run(`DELETE FROM categoria WHERE id = ?`, [id]);

        resolve();
      } catch (error) {
        console.error('Error eliminando categoría:', error);
        reject(error);
      }
    });
  }


}
