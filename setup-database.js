import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fundease",
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Read the PostgreSQL schema file
    const schemaPath = path.join(process.cwd(), 'database_schema_postgresql.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Schema file loaded successfully');
    
    // Connect to database
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Execute the schema
    console.log('🔧 Executing schema...');
    await client.query(schemaSQL);
    
    console.log('✅ Database schema executed successfully!');
    console.log('🎉 All tables created successfully');
    
    // Test the connection by listing tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();
