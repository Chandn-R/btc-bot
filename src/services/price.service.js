import WebSocket from 'ws';
import EventEmitter from 'events';
import cfg from '../config/index.js';
import logger from './log.service.js';

class PriceService extends EventEmitter {
    connect() {
        const stream = `${cfg.BINANCE_WS}/${cfg.PAIRS.map((p) => p + '@aggTrade').join('/')}`;
        logger.info(`Connecting to ${stream}`);
        this.ws = new WebSocket(stream);
        this.reconnectAttempts = 0;

        this.ws.on('open', () => {
            this.reconnectAttempts = 0;
            logger.info('WebSocket connected');
        });

        this.ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                const price = parseFloat(msg.p);
                const pair = (msg.s || '').toLowerCase();
                if (pair && price) {
                    this.lastMessageTime = Date.now();
                    this.emit('price', { pair, price });
                }
            } catch (err) {
                logger.error('WS message error: ' + err.message);
            }
        });

        this.ws.on('close', (code) => {
            logger.warn(`WS closed: ${code}`);
            this.scheduleReconnect();
        });

        this.ws.on('error', (err) => {
            logger.error('WS error: ' + err.message);
            this.ws.terminate();
            this.scheduleReconnect(); // handled by close usually, but safe
        });
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(30000, 1000 * Math.pow(1.5, this.reconnectAttempts));
        logger.info(`Reconnecting in ${delay}ms`);
        setTimeout(() => this.connect(), delay);
    }

    health() {
        const isOpen = this.ws && this.ws.readyState === WebSocket.OPEN;
        // Consider stale if no message for > 60 seconds
        const isStale = this.lastMessageTime && Date.now() - this.lastMessageTime > 60000;
        return {
            status: isOpen && !isStale ? 'connected' : 'degraded',
            readyState: this.ws ? this.ws.readyState : -1,
            lastMessageAgoMs: this.lastMessageTime ? Date.now() - this.lastMessageTime : null
        };
    }
}

export default new PriceService();
