export class UnauthenticatedError extends Error {
  constructor(message = 'User not authenticated.') {
    super(message);
    this.name = 'UnauthenticatedError';
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'User does not have permission for this action.') {
    super(message);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class BadRequestError extends Error {
  constructor(message = 'Bad request.') {
    super(message);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found.') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// You can add more specific error types as needed, e.g.:
export class DatabaseError extends Error {
  constructor(message = 'Database operation failed.') {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ZodValidationError extends Error {
  public details: any;
  constructor(errorDetails: any, message = 'Input validation failed.') {
    super(message);
    this.name = 'ZodValidationError';
    this.details = errorDetails;
    Object.setPrototypeOf(this, ZodValidationError.prototype);
  }
}

// export class ExternalServiceError extends Error { ... }
