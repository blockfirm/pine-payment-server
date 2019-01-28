export default class HttpConflict extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, HttpConflict);
    this.status = 409;
  }
}
