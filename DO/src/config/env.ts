import { env, loadEnvFile } from 'node:process';
import path from 'node:path';
import * as fs from 'node:fs';

// 1. Loading the .env to get the current environment if passed as parameters when running node
let mode = env.NODE_ENV;

// 2. Validation that the environment has been defined, otherwise search for the .env manually
if (!mode) {
    const baseEnvPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(baseEnvPath)) {
        loadEnvFile(baseEnvPath);
        mode = env.NODE_ENV || 'development';
    } else {
        console.warn('⚠️ Archivo .env no encontrado, usando modo por defecto: desarrollo');
        mode = 'development';
    }
}

// 3. Loading the current environment's .env file
const envFilePath = path.resolve(__dirname, `../../.env.${mode}`);
if (fs.existsSync(envFilePath)) {
    loadEnvFile(envFilePath);
} else {
    console.warn(`⚠️ Archivo .env.${mode} no encontrado`);
}

const {
    SEED_PHRASE,
    DO_ADDRESS,
    FRONT_ADDRESS,
    TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET,
    API_KEY,
    CORS_ORIGINS,
    MAILGUN_DOMAIN,
    EMAIL,
    MAILGUN_API_KEY,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    NODE_ENV,
    PORT,
} = env;

// 4. Exporting constants
export const ENV = {
    SEED_PHRASE: SEED_PHRASE ?? "",
    DO_ADDRESS: DO_ADDRESS ?? "",
    FRONT_ADDRESS: FRONT_ADDRESS ?? "",
    TWITTER_CLIENT_ID: TWITTER_CLIENT_ID ?? "",
    TWITTER_CLIENT_SECRET: TWITTER_CLIENT_SECRET ?? "",
    API_KEY: API_KEY ?? "",
    CORS_ORIGINS: CORS_ORIGINS ?? "",
    MAILGUN_DOMAIN: MAILGUN_DOMAIN ?? "",
    EMAIL: EMAIL ?? "",
    MAILGUN_API_KEY: MAILGUN_API_KEY ?? "",
    DISCORD_CLIENT_ID: DISCORD_CLIENT_ID ?? "",
    DISCORD_CLIENT_SECRET: DISCORD_CLIENT_SECRET ?? "",
    REDDIT_CLIENT_ID: REDDIT_CLIENT_ID ?? "",
    REDDIT_CLIENT_SECRET: REDDIT_CLIENT_SECRET ?? "",
    NODE_ENV: NODE_ENV ?? mode,
    PORT: PORT && !isNaN(Number(PORT)) ? Number(PORT) : 3000
};
