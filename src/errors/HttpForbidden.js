export default class HttpForbidden extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, HttpForbidden);
    this.status = 403;
  }
}
