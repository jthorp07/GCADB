import BaseDBError from "./base-db-error";

class AlreadyExistsError extends BaseDBError {

    constructor(proc: string) {
        super(`The data supplied for procedure '${proc}' would result in a duplicate in the database`, 3);
        Object.setPrototypeOf(this, AlreadyExistsError.prototype);
    }

}

export default AlreadyExistsError