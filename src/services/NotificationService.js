import Queue from 'bull';
import axios from 'axios';
import logger from '../logger';

export default class NotificationService {
  constructor(config, database) {
    this.INCOMING_PAYMENT = 'incomingPayment';
    this.CHANNEL_OPENED = 'channelOpened';

    this.config = config;
    this.database = database;
    this.logger = logger.child({ scope: 'NotificationService' });

    this._queue = new Queue('notifications', {
      redis: config.redis
    });

    this._processJobs();
  }

  notify(userId, type, context) {
    const query = {
      where: { userId }
    };

    this.logger.info(`Sending notification to user (${userId}): ${type}`, {
      pineId: userId,
      notificationType: type
    });

    return this.database.deviceToken.findAll(query).then((deviceTokens) => {
      deviceTokens.forEach((deviceToken) => {
        if (!deviceToken.ios) {
          return;
        }

        this._queue.add({ deviceToken, type, context }, this.config.notifications.queue);
      });
    });
  }

  _processJobs() {
    this._queue.process((job) => {
      const { deviceToken, type, context } = job.data;
      return this._sendWithWebhook(deviceToken.ios, type, context).then(this._handleUnsubscribe.bind(this));
    });
  }

  _sendWithWebhook(deviceToken, type, context) {
    const { webhook, apiKey } = this.config.notifications;

    const options = {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    };

    return axios.post(webhook, { deviceToken, type, context }, options)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        this.logger.error(`Error when calling notification service: ${error.message}`);
        throw error;
      });
  }

  _handleUnsubscribe(results) {
    if (!results || !Array.isArray(results.failed)) {
      return;
    }

    results.failed.forEach((result) => {
      if (!result || !result.device || !result.status) {
        return;
      }

      const status = parseInt(result.status);
      const reason = result.response && result.response.reason;

      if (status >= 400 && status < 500) {
        this.logger.info(`Unsubscribing device token from notifications (${reason}): ${result.device}`, {
          unsubscribeReason: reason,
          deviceToken: result.device
        });

        return this.database.deviceToken.destroy({ where: { ios: result.device } }).catch((error) => {
          this.logger.error(`Error when unsubscribing device token: ${error.message}`, {
            deviceToken: result.device
          });
        });
      }
    });
  }
}
