import axios from 'axios';
import cfg from '../config/index.js';
import logger from './log.service.js';

class AlertService {
    constructor() {
        this.base = `https://api.telegram.org/bot${cfg.TELEGRAM_BOT_TOKEN}`;
    }

    async send(text) {
        try {
            await axios.get(`${this.base}/sendMessage`, {
                params: { chat_id: cfg.TELEGRAM_CHAT_ID, text }
            });
            logger.info(`Sent notification: ${text}`);
        } catch (err) {
            logger.error(`Failed to send notification: ${err.message}`);
        }
    }
}

export default new AlertService();
