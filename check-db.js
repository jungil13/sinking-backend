import pool from "./config/db.js";

async function checkDatabase() {
  try {
    console.log('Checking database connection and tables...\n');
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Check if we have any data in key tables
    console.log('\n📊 Checking data in key tables:');
    
    try {
      const [contributions] = await connection.query('SELECT COUNT(*) as count FROM contributions');
      console.log(`Contributions: ${contributions[0].count} records`);
    } catch (e) {
      console.log('❌ Contributions table error:', e.message);
    }
    
    try {
      const [members] = await connection.query('SELECT COUNT(*) as count FROM members');
      console.log(`Members: ${members[0].count} records`);
    } catch (e) {
      console.log('❌ Members table error:', e.message);
    }
    
    try {
      const [loans] = await connection.query('SELECT COUNT(*) as count FROM loans');
      console.log(`Loans: ${loans[0].count} records`);
    } catch (e) {
      console.log('❌ Loans table error:', e.message);
    }
    
    try {
      const [withdrawals] = await connection.query('SELECT COUNT(*) as count FROM withdrawals');
      console.log(`Withdrawals: ${withdrawals[0].count} records`);
    } catch (e) {
      console.log('❌ Withdrawals table error:', e.message);
    }
    
    connection.release();
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
