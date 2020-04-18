import sinon from 'sinon';

const createLoggerMock = () => ({
  info: sinon.spy(),
  warn: sinon.spy(),
  error: sinon.spy()
});

const createWinstonLoggerMock = () => ({
  ...createLoggerMock(),
  child: () => createLoggerMock()
});

export default {
  createLogger: () => createWinstonLoggerMock(),
  format: {
    combine: sinon.spy(),
    timestamp: sinon.spy(),
    json: sinon.spy(),
    colorize: sinon.spy(),
    align: sinon.spy(),
    printf: sinon.spy()
  },
  transports: {
    Console: function () {}
  }
};
