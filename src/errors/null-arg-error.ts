class NullArgError extends Error {

    constructor(args: string[], proc: string) {

        let argString = args.join("\n  ");

        super(`Stored procedure '${proc}' expects the following inputs to be NOT NULL:\n  ${argString}`);
        Object.setPrototypeOf(this, NullArgError.prototype);
    }

}

export default NullArgError
