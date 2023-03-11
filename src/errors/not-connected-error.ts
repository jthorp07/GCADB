import BaseDBError from "./base-db-error";

class NotConnectedError extends BaseDBError {

    constructor() {
        super(`ConnectionPool not connected`, -99);
        Object.setPrototypeOf(this, NotConnectedError.prototype);
    }

}

export default NotConnectedError