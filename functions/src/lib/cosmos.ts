// Azure Cosmos DB Client & Data Access Helper (§87, §112)
import { CosmosClient, Container } from '@azure/cosmos';
import { COSMOS_CONTAINERS } from './cosmos-containers';

let cosmosClientInstance: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient | null {
  if (cosmosClientInstance) return cosmosClientInstance;

  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;

  if (!endpoint || !key || key.includes('mock')) {
    return null; // Local mock mode
  }

  try {
    cosmosClientInstance = new CosmosClient({ endpoint, key });
    return cosmosClientInstance;
  } catch (err) {
    console.warn('[CosmosDB] Client initialization fallback to mock mode:', err);
    return null;
  }
}

export function getContainer(containerName: string): Container | null {
  const client = getCosmosClient();
  if (!client) return null;
  const dbName = process.env.COSMOS_DB_DATABASE || 'mccdb';
  return client.database(dbName).container(containerName);
}

// In-Memory Data Store Fallback for Local Dev & Integration Testing
class MemoryStore {
  private data: Record<string, Map<string, unknown>> = {};

  constructor() {
    Object.keys(COSMOS_CONTAINERS).forEach((c) => {
      this.data[c] = new Map();
    });
  }

  async getAll<T>(containerName: string): Promise<T[]> {
    const map = this.data[containerName] || new Map();
    return Array.from(map.values()) as T[];
  }

  async getById<T>(containerName: string, id: string): Promise<T | null> {
    const map = this.data[containerName];
    if (!map) return null;
    return (map.get(id) as T) || null;
  }

  async save<T extends { id: string }>(containerName: string, item: T): Promise<T> {
    if (!this.data[containerName]) {
      this.data[containerName] = new Map();
    }
    this.data[containerName].set(item.id, item);
    return item;
  }

  async delete(containerName: string, id: string): Promise<boolean> {
    const map = this.data[containerName];
    if (!map) return false;
    return map.delete(id);
  }

  async query<T>(containerName: string, filterFn: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll<T>(containerName);
    return all.filter(filterFn);
  }
}

export const memoryStore = new MemoryStore();
