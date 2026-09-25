import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DB_HOST = process.env.HOSTINGER_HOST || process.env.DB_HOST || '194.59.164.39';
const DB_USER = process.env.HOSTINGER_USER || process.env.DB_USER || 'u988740981_maibsriau';
const DB_PASSWORD = process.env.HOSTINGER_PASSWORD || process.env.DB_PASSWORD || 'MAIBSRiau2026';
const DB_NAME = process.env.HOSTINGER_DB_NAME || process.env.DB_NAME || 'u988740981_datamaibsriau';
const DB_PORT = parseInt(process.env.HOSTINGER_PORT || process.env.DB_PORT || '3306', 10);

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    idleTimeout: 30000,
    maxIdle: 10,
    keepAliveInitialDelay: 10000
});

export { pool };
