const { randomUUID } = require("node:crypto")

exports.createUser = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing body."
                })
            }
        }

        const body = JSON.parse(event.body)

        if (!body.name) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Name is required."
                })
            }
        }

        return {
            statusCode: 201,
            body: JSON.stringify({
                id: randomUUID(),
                name: body.name
            })
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error."
            })
        }
    }
};
