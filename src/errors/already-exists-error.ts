import { GCADBErrorCode } from "../enums";
import BaseDBError from "./base-db-error";

class AlreadyExistsError extends BaseDBError {

    constructor(proc: string) {
        super(`The data supplied for procedure '${proc}' would result in a duplicate in the database`, GCADBErrorCode.ALREADY_EXIST_ERROR);
        Object.setPrototypeOf(this, AlreadyExistsError.prototype);
    }

}

export default AlreadyExistsError