module.exports = class UserError extends Error {
    constructor(message, type_response) {
        super(message)
        this.name = "UserError"
        this.type_response = type_response
        this.status = 200
    }
}