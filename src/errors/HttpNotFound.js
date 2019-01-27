export default class HttpNotFound extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, HttpNotFound);
    this.status = 404;
  }
}
