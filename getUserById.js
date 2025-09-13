exports.getUserById = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            id: event.pathParameters.id,
            name: "Username"
        })
    }
}