import { parse } from "fast-csv"

interface User {
    name: string
    password: string
}

export async function csvConverter(data: string) {
    const users: User[] | Error = await new Promise((resolve, reject) => {
        const array: User[] = []

        const stream = parse({ headers: ["name", "password"], renameHeaders: true })
            .on("data", (user) => array.push(user))
            .on("error", (err) => reject(new Error("Failed to convert CSV file.")))
            .on("end", () => resolve(array))

        stream.write(data)
        stream.end()    
    })

    if (users instanceof Error) {
        throw users
    }

    return users
}