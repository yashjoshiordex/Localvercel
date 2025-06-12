// app/utils/custom-error.ts

import { ICustomError } from "../types/custom-error";

export class CustomError extends Error implements ICustomError {
    statusCode: number;
    errorType?: string;
    details?: string;  // <-- new optional property

    constructor(message: string, statusCode = 500, errorType?: string, details?: string) {
        super(message);
        this.name = "CustomError";
        this.statusCode = statusCode;
        this.errorType = errorType;
        this.details = details;   // assign the 4th arg

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }
    }
}
