export default class HttpBadRequest extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, HttpBadRequest);
    this.status = 400;
  }
}
