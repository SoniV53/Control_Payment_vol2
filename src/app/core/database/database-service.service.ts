import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLTABLES } from './sql-lite-table';

@Injectable({
  providedIn: 'root'
})
export class DatabaseServiceService {
  public db!: SQLiteDBConnection;
  private isReady = false;
  private sqlite = new SQLiteConnection(CapacitorSQLite);

  async initDB() {
    if (this.isReady) return;

    const consistency = await this.sqlite.checkConnectionsConsistency();
    const isConn = (await this.sqlite.isConnection('gastos_db', false)).result;

    if (consistency.result && isConn) {
      this.db = await this.sqlite.retrieveConnection('gastos_db', false);
    } else {
      this.db = await this.sqlite.createConnection(
        'gastos_db',
        false,
        'no-encryption',
        1,
        false
      );
    }

    await this.db.open();

    try {
      SQLTABLES.forEach(async (tableSql) => {
        await this.db.execute(tableSql);
      });
      console.log('SQL ejecutado correctamente');
    } catch (e) {
      console.error('ERROR EN SQL:', e);
    }

    this.isReady = true;
    console.log('DB lista');
  }



  async getDB(): Promise<SQLiteDBConnection> {
    if (!this.isReady) {
      await this.initDB();
    }
    return this.db;
  }

}
