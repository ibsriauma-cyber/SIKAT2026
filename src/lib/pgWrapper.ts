import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pgPool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    port: 5432,
});

export const pool = {
    getConnection: async () => {
        const client = await pgPool.connect();
        return {
            query: async (sql: string, params: any[] = []) => {
                let index = 1;
                let pgSql = sql.replace(/\?/g, () => `$${index++}`);
                if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
                    pgSql += ' RETURNING *';
                }
                const res = await client.query(pgSql, params);
                let insertId = 0;
                if (res.rows && res.rows.length > 0) {
                    insertId = res.rows[0].id || 0;
                }
                return [res.rows, res.fields, { insertId, affectedRows: res.rowCount }];
            },
            release: () => client.release(),
            beginTransaction: async () => await client.query('BEGIN'),
            commit: async () => await client.query('COMMIT'),
            rollback: async () => await client.query('ROLLBACK')
        };
    },
    query: async (sql: string, params: any[] = []) => {
        let index = 1;
        // Convert ? to $1, $2, etc. (Naive replacement, works for our use cases)
        let pgSql = sql.replace(/\?/g, () => `$${index++}`);
        
        // Append RETURNING id for insert statements if not present (only if the table has an id)
        // A safer way is to check if it's an INSERT and if so, append RETURNING *
        if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
            pgSql += ' RETURNING *';
        }

        // MySQL compatibility: map JSON/boolean strings back to proper types if needed
        const res = await pgPool.query(pgSql, params);
        
        let insertId = 0;
        if (res.rows && res.rows.length > 0) {
            insertId = res.rows[0].id || 0;
        }

        // mysql2 returns [rows, fields] format
        return [res.rows, res.fields, { insertId, affectedRows: res.rowCount }];
    }
};
