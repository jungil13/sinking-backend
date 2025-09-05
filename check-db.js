import pool from "./config/db.js";

async function checkDatabase() {
  try {
    console.log('Checking database connection and tables...\n');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\n📋 Available tables:');
    tablesResult.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Check if we have any data in key tables
    console.log('\n📊 Checking data in key tables:');
    
    try {
      const contributionsResult = await client.query('SELECT COUNT(*) as count FROM contributions');
      console.log(`Contributions: ${contributionsResult.rows[0].count} records`);
    } catch (e) {
      console.log('❌ Contributions table error:', e.message);
    }
    
    try {
      const membersResult = await client.query('SELECT COUNT(*) as count FROM members');
      console.log(`Members: ${membersResult.rows[0].count} records`);
    } catch (e) {
      console.log('❌ Members table error:', e.message);
    }
    
    try {
      const loansResult = await client.query('SELECT COUNT(*) as count FROM loans');
      console.log(`Loans: ${loansResult.rows[0].count} records`);
    } catch (e) {
      console.log('❌ Loans table error:', e.message);
    }
    
    try {
      const withdrawalsResult = await client.query('SELECT COUNT(*) as count FROM withdrawals');
      console.log(`Withdrawals: ${withdrawalsResult.rows[0].count} records`);
    } catch (e) {
      console.log('❌ Withdrawals table error:', e.message);
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
