class ApiError extends Error { //ApiError is a customized version of JavaScript's built-in Error class. and ApiError is child class of class error 
  constructor(
    statusCode,
    message = "Something went wrong!!",
    errors = [],
    stack = ""
  ) {
    super(message); //basically initializes the parent class Error with your message.
    this.statusCode = statusCode;
    this.data = null;
    this.success = false; // this tell API that This response represents a failure.
    this.errors = errors;///This stores additional error information. like extra messages
    this.message = message; //  this and super(message ) also initializes the error message

    if (stack) {
      this.stack = stack;//A stack trace tells you where the error occurred in your code.
    } else {
      Error.captureStackTrace(this, this.constructor);//This tells JavaScript to create a stack trace for this particular error object. So you get useful debugging information about where the error originated.
    }
  }
}

export { ApiError };
