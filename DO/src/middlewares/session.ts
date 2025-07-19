import session from "express-session"
import { ENV } from "../config/env"


export const sessionMid = session({
    secret: ENV.SEED_PHRASE || 'default_secret',
    resave: false,
    unset: 'destroy',
    saveUninitialized: false,
    store: new session.MemoryStore(), // Use in-memory store for simplicity; consider using a persistent store in production
    name: 'sessionId', // Name of the session cookie
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000, // 10 minutes
    },
})