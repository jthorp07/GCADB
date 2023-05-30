import { GCADBErrorCode } from "../enums";
import BaseDBError from "./base-db-error";

class NullArgError extends BaseDBError {

    constructor(args: string[], proc: string) {

        let argString = args.join(", ");

        super(`Stored procedure '${proc}' expects the following inputs to be NOT NULL: ${argString}`, GCADBErrorCode.NULL_ARG_ERROR);
        Object.setPrototypeOf(this, NullArgError.prototype);
    }

}

export default NullArgError
