export abstract class HTTPClientError extends Error {
  readonly statusCode!: number;
  readonly name!: string;

  constructor(message: object | string) {
    if (message instanceof Object) {
      super(JSON.stringify(message));
    } else {
      super(message);
    }
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// export class HTTP400Error extends HTTPClientError {
//   readonly statusCode = 400;

//   constructor(message: string | object = "Bad Request") {
//     console.log('%%%%%%%%',message);
    
//     super(message);
//   }
// }

export class HTTP400Error extends Error {
  readonly statusCode = 400;
  constructor(message = "Bad Request") {
    super(message);
    this.name = "HTTP400Error";
  }
}


export class HTTP401Error extends Error {
  readonly statusCode = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "HTTP401Error";
  }
}

export class HTTP403Error extends Error {
  readonly statusCode = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "HTTP403Error";
  }
}

export class HTTP404Error extends Error {
  statusCode: number;
  responseMessage: string;

  constructor(message = "Not Found") {
    super(message);
    this.statusCode = 404;          // MUST be 404
    this.responseMessage = message; // let the handler see it
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
