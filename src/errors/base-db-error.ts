import { GCADBErrorCode } from "../enums";

export class BaseDBError {

    message: string;
    code: GCADBErrorCode;

    constructor(message: string, code: GCADBErrorCode) {
        this.message = message;
        this.code = code;
    }

    public log() {
        console.log(`  [GCADB]: A database error has occured:\n    Message: ${this.message}\n    Code: ${this.code}`);
    }

}

export default BaseDBError;