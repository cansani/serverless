import { randomUUID } from "node:crypto";
import { dynamo } from "../lib/dynamo/dynamo-connection";
import { QueryCommand, PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../interfaces/user-interface";

interface RequestCreateUser {
    name: string,
    password: string
}

export async function create({ name, password }: RequestCreateUser) {
    await dynamo.send(new PutCommand({
        TableName: "users",
        Item: {
            user_id: randomUUID(),
            name,
            password
        }
    }))
}

export async function findUniqueByName(name: string) {
    const { Items } = await dynamo.send(new QueryCommand({
        TableName: "users",
        KeyConditionExpression: "#name = :nameValue",
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":nameValue": name
        }
    }))

    if (!Items || Items.length > 1) {
        return null
    }

    const user = Items[0]

    return user
}

export async function findUniqueById(id: string): Promise<User | null> {
    const { Items } = await dynamo.send(new QueryCommand({
        TableName: "users",
        IndexName: "user_id_gsi",
        KeyConditionExpression: "user_id = :uuid",
        ExpressionAttributeValues: {
            ":uuid": id
        }
    }))

    const notFoundUser = !Items || Items.length === 0

    if (notFoundUser) {
        return null
    }

    const foundUser = Items[0] as User

    const { Item } = await dynamo.send(new GetCommand({
        TableName: "users",
        Key: {
            name: foundUser.name,
            user_id: foundUser.user_id
        }
    }))

    if (!Item) {
        return null
    }

    return Item as User
}

export async function findMany() {
    const { Items } = await dynamo.send(new ScanCommand({
        TableName: "users",
        Limit: 20
    }))

    if (!Items || Items.length === 0) {
        return null
    }

    return Items
}

export async function remove(name: string, user_id: string) {
    const { $metadata } = await dynamo.send(new DeleteCommand({
        TableName: "users",
        Key: {
            name,
            user_id
        }
    }))

    if ($metadata.httpStatusCode !== 200) {
        return false
    }

    return true
}

export async function update({ name, user_id }: Partial<User>, updateExpressions: string[], expressionsAttValues: Record<string, any>) {
    const updatedUser = await dynamo.send(new UpdateCommand({
        TableName: "users",
        Key: {
            name: name,
            user_id: user_id
        },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeValues: expressionsAttValues,
        ReturnValues: "ALL_NEW"
    }))

    if (!updatedUser) {
        return null
    }

    return updatedUser
}
