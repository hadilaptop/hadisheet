import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---
export interface Customer {
  id: string;
  name: string;
}

export interface SheetType {
  id: string;
  name: string;
}

export interface WorkItem {
  id: string;
  customerId: string;
  date: string;
  name: string;
  sheetTypeId: string;
  length: number;
  width: number;
  price: number;
  notes: string;
}

// --- Dexie (Web) Implementation ---
class AppDexie extends Dexie {
  customers!: Table<Customer, string>;
  sheetTypes!: Table<SheetType, string>;
  workItems!: Table<WorkItem, string>;

  constructor() {
    super('WorkshopDB');
    this.version(1).stores({
      customers: 'id, name',
      sheetTypes: 'id, name',
      workItems: 'id, customerId, date, name, sheetTypeId'
    });
  }
}
const dexieDb = new AppDexie();

// --- SQLite (Native) Implementation ---
let sqliteDb: SQLiteDBConnection | null = null;
const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

// --- Hybrid Service ---
export const dbService = {
  async init() {
    if (Capacitor.isNativePlatform()) {
      try {
        const ret = await sqliteConnection.checkConnectionsConsistency();
        const isConn = (await sqliteConnection.isConnection('workshop_db', false)).result;
        
        if (ret.result && isConn) {
          sqliteDb = await sqliteConnection.retrieveConnection('workshop_db', false);
        } else {
          sqliteDb = await sqliteConnection.createConnection('workshop_db', false, 'no-encryption', 1, false);
        }
        
        await sqliteDb.open();
        
        const query = `
          CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS sheet_types (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS work_items (
            id TEXT PRIMARY KEY NOT NULL,
            customerId TEXT NOT NULL,
            date TEXT NOT NULL,
            name TEXT NOT NULL,
            sheetTypeId TEXT NOT NULL,
            length REAL,
            width REAL,
            price REAL,
            notes TEXT
          );
        `;
        await sqliteDb.execute(query);
      } catch (e) {
        console.error("SQLite Init Error", e);
      }
    } else {
      console.log('Running on Web - using Dexie');
      // Initialize with some default sheet types if empty
      const count = await dexieDb.sheetTypes.count();
      if (count === 0) {
        await dexieDb.sheetTypes.bulkAdd([
          { id: uuidv4(), name: 'سه لایه' },
          { id: uuidv4(), name: 'پنج لایه' }
        ]);
      }
    }
  },

  // --- Customers ---
  async getCustomers(): Promise<Customer[]> {
    if (Capacitor.isNativePlatform() && sqliteDb) {
      const res = await sqliteDb.query('SELECT * FROM customers ORDER BY name ASC');
      return res.values as Customer[] || [];
    }
    const customers = await dexieDb.customers.toArray();
    return customers.sort((a, b) => a.name.localeCompare(b.name));
  },

  async addCustomer(name: string, customId?: string): Promise<Customer> {
    const id = customId || uuidv4();
    const customer = { id, name };
    if (Capacitor.isNativePlatform() && sqliteDb) {
      await sqliteDb.run('INSERT INTO customers (id, name) VALUES (?, ?)', [id, name]);
    } else {
      await dexieDb.customers.add(customer);
    }
    return customer;
  },

  // --- Sheet Types ---
  async getSheetTypes(): Promise<SheetType[]> {
    if (Capacitor.isNativePlatform() && sqliteDb) {
      const res = await sqliteDb.query('SELECT * FROM sheet_types ORDER BY name ASC');
      return res.values as SheetType[] || [];
    }
    const types = await dexieDb.sheetTypes.toArray();
    return types.sort((a, b) => a.name.localeCompare(b.name));
  },

  async addSheetType(name: string, customId?: string): Promise<SheetType> {
    const id = customId || uuidv4();
    const type = { id, name };
    if (Capacitor.isNativePlatform() && sqliteDb) {
      await sqliteDb.run('INSERT INTO sheet_types (id, name) VALUES (?, ?)', [id, name]);
    } else {
      await dexieDb.sheetTypes.add(type);
    }
    return type;
  },

  async deleteSheetType(id: string): Promise<void> {
    if (Capacitor.isNativePlatform() && sqliteDb) {
      await sqliteDb.run('DELETE FROM sheet_types WHERE id = ?', [id]);
    } else {
      await dexieDb.sheetTypes.delete(id);
    }
  },

  // --- Work Items ---
  async getWorkItems(customerId?: string): Promise<WorkItem[]> {
    if (Capacitor.isNativePlatform() && sqliteDb) {
      let query = 'SELECT * FROM work_items';
      const params: any[] = [];
      if (customerId) {
        query += ' WHERE customerId = ?';
        params.push(customerId);
      }
      query += ' ORDER BY date DESC';
      const res = await sqliteDb.query(query, params);
      return res.values as WorkItem[] || [];
    }
    
    let items = await dexieDb.workItems.toArray();
    if (customerId) {
      items = items.filter(i => i.customerId === customerId);
    }
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addWorkItem(item: WorkItem | Omit<WorkItem, 'id'>): Promise<WorkItem> {
    const id = 'id' in item && item.id ? item.id : uuidv4();
    const workItem: WorkItem = { ...item, id };
    if (Capacitor.isNativePlatform() && sqliteDb) {
      await sqliteDb.run(
        'INSERT INTO work_items (id, customerId, date, name, sheetTypeId, length, width, price, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, item.customerId, item.date, item.name, item.sheetTypeId, item.length, item.width, item.price, item.notes]
      );
    } else {
      await dexieDb.workItems.add(workItem);
    }
    return workItem;
  },
  
  async deleteWorkItem(id: string): Promise<void> {
    if (Capacitor.isNativePlatform() && sqliteDb) {
      await sqliteDb.run('DELETE FROM work_items WHERE id = ?', [id]);
    } else {
      await dexieDb.workItems.delete(id);
    }
  }
};
