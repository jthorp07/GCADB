class NotConnectedError extends Error {

    constructor() {
        super(`ConnectionPool not connected`);
        Object.setPrototypeOf(this, NotConnectedError.prototype);
    }

}

export default NotConnectedError