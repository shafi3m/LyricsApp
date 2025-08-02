import { Client, Databases, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Replace with your endpoint
  .setProject("688b3e100020f098f155"); // Replace with your project ID

export const databases = new Databases(client);
export const account = new Account(client);

export const DATABASE_ID = "688b3e5e001644ccb86c";
export const POEMS_COLLECTION_ID = "688b3ec100188773c2d1";
export const CATEGORIES_COLLECTION_ID = "688b45be001284146aef";

export default client;
