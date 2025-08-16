import { registerAs } from "@nestjs/config";

export default registerAs('config', () => ({
    JWT_SECRET: process.env.JWT_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    NODE_ENV: process.env.NODE_ENV || 'development',
}));