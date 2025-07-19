import express from 'express';

import { corsConfig } from './middlewares/cors';
import { limiter } from './middlewares/limiter';
import { createTwitterRouter } from './routes/twitter';
import { sessionMid } from './middlewares/session';
import { ENV } from './config/env';

const app = express();
const PORT = ENV.PORT;

app.use(corsConfig);
app.use(limiter);
app.use(sessionMid);
app.use(express.json());
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use('/twitter', createTwitterRouter())

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});