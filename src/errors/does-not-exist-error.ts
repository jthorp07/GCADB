import BaseDBError from "./base-db-error";

class DoesNotExistError extends BaseDBError {

    constructor() {
        super(`The data you supplied does not refer to any existing data on the database!`, 2);
        Object.setPrototypeOf(this, DoesNotExistError.prototype);
    }

}

export default DoesNotExistError