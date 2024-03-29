export enum GCADBErrorCode {

    // User or frontend error codes
    NULL_ARG_ERROR=1,
    DOES_NOT_EXIST_ERROR=2,
    ALREADY_EXIST_ERROR=3,
    DATA_CONSTRAINT_ERROR=4,
    NULL_ARG_CONDITIONAL_ERROR=5,

    // Driver or database error codes
    TRANSACTION_ERROR=-95,
    NOT_CONENCTED_ERROR=-96,
    UNKNOWN_ERROR=-99
}