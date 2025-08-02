import { Client, Databases, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);

export const DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
export const POEMS_COLLECTION_ID = import.meta.env.VITE_POEMS_COLLECTION_ID;
export const CATEGORIES_COLLECTION_ID = import.meta.env
  .VITE_CATEGORIES_COLLECTION_ID;

export { databases, account };
export default client;
