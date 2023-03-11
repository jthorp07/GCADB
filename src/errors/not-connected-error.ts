import BaseDBError from "./base-db-error";

class NotConnectedError extends BaseDBError {

    constructor(proc: string) {
        super(`ConnectionPool not connected when calling procedure '${proc}'`, -99);
        Object.setPrototypeOf(this, NotConnectedError.prototype);
    }

}

export default NotConnectedError