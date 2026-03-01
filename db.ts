
import { Dexie, type Table } from 'dexie';
import { Product, Sale, StaffMember, PendingOrder } from './types';

export class BistroGestDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  staff!: Table<StaffMember>;
  pendingOrders!: Table<PendingOrder>;
  metadata!: Table<{ key: string, value: any }>;

  constructor() {
    super('BistroGestDB');
    // Fix: Access the inherited 'version' method from the Dexie base class to define the schema.
    // Casting this to any as a workaround for type recognition issues in the current environment.
    (this as any).version(1).stores({
      products: 'id, name, category',
      sales: 'id, timestamp, orderNumber',
      staff: 'id, username',
      pendingOrders: 'id, timestamp',
      metadata: 'key'
    });
  }

  // Helper pour sauvegarder les états globaux (settings, crates, etc.)
  async saveMetadata(key: string, value: any) {
    return this.metadata.put({ key, value });
  }

  // Helper pour charger les états globaux
  async getMetadata<T>(key: string): Promise<T | undefined> {
    const entry = await this.metadata.get(key);
    return entry?.value as T;
  }
}

export const db = new BistroGestDB();
