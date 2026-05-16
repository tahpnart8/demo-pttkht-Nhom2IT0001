const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database successfully!');

        // 1. Run Schema
        console.log('Running schema.sql...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('Schema created successfully!');

        // 2. Run Seed
        console.log('Running seed.sql...');
        const seedPath = path.join(__dirname, '../database/seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedSql);
        console.log('Seed data inserted successfully!');

    } catch (err) {
        console.error('Database initialization error:', err);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

initDB();
