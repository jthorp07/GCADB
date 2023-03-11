import BaseDBError from "./base-db-error";

class DataConstraintError extends BaseDBError {

    constructor(args: string[], constraints: string[], proc: string) {

        let msg = '';
        for (let i = 0; i < args.length; i++) {
            msg = `${msg}\n[${args[i]}]: ${constraints[i]}`;
        }
        super(`Some of the supplied data does not conform with the constraints on procedure ${proc}:${msg}`, 4);
        Object.setPrototypeOf(this, DataConstraintError.prototype);
    }

}

export default DataConstraintError