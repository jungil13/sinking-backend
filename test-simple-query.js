import pool from "./config/db.js";

async function testSimpleQuery() {
  try {
    console.log('Testing simple database queries...\n');
    
    const connection = await pool.getConnection();
    
    // Test 1: Basic contributions query
    console.log('1. Testing basic contributions query...');
    try {
      const [contributions] = await connection.query('SELECT COUNT(*) as count FROM contributions');
      console.log('✅ Contributions count:', contributions[0].count);
    } catch (e) {
      console.log('❌ Contributions query failed:', e.message);
    }
    
    // Test 2: Basic withdrawals query
    console.log('\n2. Testing basic withdrawals query...');
    try {
      const [withdrawals] = await connection.query('SELECT COUNT(*) as count FROM withdrawals');
      console.log('✅ Withdrawals count:', withdrawals[0].count);
    } catch (e) {
      console.log('❌ Withdrawals query failed:', e.message);
    }
    
    // Test 3: Basic loans query
    console.log('\n3. Testing basic loans query...');
    try {
      const [loans] = await connection.query('SELECT COUNT(*) as count FROM loans');
      console.log('✅ Loans count:', loans[0].count);
    } catch (e) {
      console.log('❌ Loans query failed:', e.message);
    }
    
    // Test 4: Union query (the problematic one)
    console.log('\n4. Testing union query...');
    try {
      const query = `
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) as totalContributions,
          COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as totalWithdrawals
        FROM (
          SELECT amount, status, createdAt FROM contributions
          UNION ALL
          SELECT amount, status, createdAt FROM withdrawals
        ) as combined
      `;
      
      console.log('Query:', query);
      const [result] = await connection.query(query);
      console.log('✅ Union query result:', result[0]);
    } catch (e) {
      console.log('❌ Union query failed:', e.message);
      console.log('Error details:', e);
    }
    
    // Test 5: Date filtered query
    console.log('\n5. Testing date filtered query...');
    try {
      const dateFilter = 'WHERE MONTH(createdAt) = MONTH(CURRENT_DATE()) AND YEAR(createdAt) = YEAR(CURRENT_DATE())';
      const query = `
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) as totalContributions
        FROM (
          SELECT amount, status, createdAt FROM contributions
          UNION ALL
          SELECT amount, status, createdAt FROM withdrawals
        ) as combined
        ${dateFilter}
      `;
      
      console.log('Date filtered query:', query);
      const [result] = await connection.query(query);
      console.log('✅ Date filtered query result:', result[0]);
    } catch (e) {
      console.log('❌ Date filtered query failed:', e.message);
      console.log('Error details:', e);
    }
    
    connection.release();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testSimpleQuery();
