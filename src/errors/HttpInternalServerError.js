export default class HttpInternalServerError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, HttpInternalServerError);
    this.status = 500;
  }
}
