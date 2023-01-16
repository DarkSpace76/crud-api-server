const enum ErrorMessage {
    ERR_USERID_INVALID = 'User id is invalid',
    ERR_USER_NOT_FOUND = 'User not found',
    ERR_BODY_INVALID_FORMAT = 'Invalid request body format',
    ERR_BODY_VALIDATION = 'Request body does not contain required fields',
    ERR_UNSUPPORTED_OPERATION = 'Unsupported operation',
    ERR_RESOURCE_NOT_FOUND = "Requested resource doesn't exist",
    ERR_UNEXPECTED_ERROR = 'Unexpected error has occured, try again later'
}

const enum StatusCode {
    C200 = 200,
    C201 = 201,
    C204 = 204,
    C400 = 400,
    C404 = 404,
    C500 = 500
}

export {
    ErrorMessage,
    StatusCode
}