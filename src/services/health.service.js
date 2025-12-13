import express from 'express';
import cfg from '../config/index.js';
import logger from './log.service.js';

export function createHealthServer(statusProvider) {
    const app = express();

    app.get('/healthz', (req, res) => {
        const ok = statusProvider ? statusProvider() : { ok: true };
        res.json(ok);
    });

    app.listen(cfg.PORT, () => {
        logger.info(`Health server listening on ${cfg.PORT}`);
    });
}
