import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const formatZodErrors = (zodError) => {
  const formatted = {};
  zodError.errors.forEach((err) => {
    const path = err.path.join(".");
    formatted[path] = err.message;
  });
  return formatted;
};

export const handleApiError = (error) => {
  console.error(`[API Error] ${error.name}:`, error.message);
  if (error.stack) console.error(error.stack);

  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message, 
        details: error.details,
        code: error.name.toUpperCase() 
      },
      { status: error.statusCode }
    );
  }

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    return NextResponse.json(
      { 
        error: "Validation failed", 
        details: Object.values(error.errors).reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {}),
        code: "VALIDATION_ERROR"
      },
      { status: 400 }
    );
  }

  // Default to 500
  return NextResponse.json(
    { 
      error: "Internal server error", 
      code: "INTERNAL_ERROR" 
    },
    { status: 500 }
  );
};
