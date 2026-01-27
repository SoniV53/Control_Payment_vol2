import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseServiceService {
  public db: SQLiteDBConnection = null as any;
  private isReady = false;

  constructor() { }


  async initDB() {
    if (this.isReady) return;
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    this.db = await sqlite.createConnection('gastos_db', false, 'no-encryption', 1,false);
    await this.db.open();

    const sql = await fetch('/assets/init-db.sql').then(r => r.text());
    await this.db.execute(sql);

     this.isReady = true;
  }

  getDB() {
    return this.db;
  }
}
