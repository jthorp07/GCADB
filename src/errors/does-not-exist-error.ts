import { GCADBErrorCode } from "../enums";
import BaseDBError from "./base-db-error";

class DoesNotExistError extends BaseDBError {

    constructor(proc: string) {
        super(`The data supplied for procedure '${proc}' attempts to reference nonexistent data in the database`, GCADBErrorCode.DOES_NOT_EXIST_ERROR);
        Object.setPrototypeOf(this, DoesNotExistError.prototype);
    }

}

export default DoesNotExistError