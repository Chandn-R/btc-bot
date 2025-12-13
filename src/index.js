import app from './app.js';
import logger from './services/log.service.js';

app.start().catch((err) => {
    logger.error('Fatal Error: ' + err.message);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    logger.error('uncaughtException: ' + err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection: ' + JSON.stringify(reason));
});