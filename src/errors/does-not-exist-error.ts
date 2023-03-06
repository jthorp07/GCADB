class DoesNotExistError extends Error {

    constructor() {
        super(`The data you supplied does not refer to any existing data on the database!`);
        Object.setPrototypeOf(this, DoesNotExistError.prototype);
    }

}

export default DoesNotExistError