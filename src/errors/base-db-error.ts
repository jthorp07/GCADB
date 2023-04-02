export class BaseDBError {

    message: string;
    code: number;

    constructor(message: string, code: number) {
        this.message = message;
        this.code = code;
    }

    public log() {
        console.log(`  [GCADB]: A database error has occured:\n    Message: ${this.message}\n    Code: ${this.code}`);
    }

}

export default BaseDBError;