// app/types/custom-error.ts

export interface ICustomError extends Error {
  statusCode: number;
  errorType?: string;
}
