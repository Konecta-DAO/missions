import cors from 'cors';

import { ENV } from "../config/env";

const allowedOrigins = ENV.CORS_ORIGINS.split(',');

export const corsConfig = cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
})