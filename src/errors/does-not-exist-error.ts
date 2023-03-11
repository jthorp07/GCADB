import BaseDBError from "./base-db-error";

class DoesNotExistError extends BaseDBError {

    constructor(proc: string) {
        super(`The data supplied for procedure '${proc}' attempts to reference nonexistent data in the database`, 2);
        Object.setPrototypeOf(this, DoesNotExistError.prototype);
    }

}

export default DoesNotExistError