import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // Time window in milliseconds (60 minutes)
    max: 20, // Maximum number of requests per IP within the window
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: true, // Send rate limit info in the headers
});