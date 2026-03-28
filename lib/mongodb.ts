import { getMongoClientPromise } from './mongodb-client';

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'ai_mentor';

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  const client = await getMongoClientPromise();
  return client.db(dbName);
}
