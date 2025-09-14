import { MongoClient } from "mongodb"
 
export async function mongoConnection() {
    const url = process.env.MONGO_DB_CONN_STR

    console.log(url)

    if (!url) {
        throw new Error("Connection String Env Variable.")
    }

    const client = new MongoClient(url)
    const connection = await client.connect()

    const dbName = process.env.MONGO_DB_NAME

    console.log(dbName)

    if (!dbName) {
        throw new Error("Db Name Env Variable.")
    }

    return connection.db(process.env.MONGO_DB_NAME)
}