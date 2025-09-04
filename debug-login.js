import pool from "./config/db.js";
import bcrypt from "bcrypt";

async function debugLogin() {
  try {
    console.log('Debugging login process...');
    
    const username = 'admin';
    const password = 'admin123';
    
    // Step 1: Check users table
    console.log('\n1. Checking users table...');
    const [userRows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    console.log(`Users found: ${userRows.length}`);
    if (userRows.length > 0) {
      console.log('User found in users table:', userRows[0].username, userRows[0].role);
    }
    
    // Step 2: Check admins table
    console.log('\n2. Checking admins table...');
    const [adminRows] = await pool.query("SELECT * FROM admins WHERE username = ?", [username]);
    console.log(`Admins found: ${adminRows.length}`);
    if (adminRows.length > 0) {
      console.log('Admin found in admins table:', adminRows[0].username, adminRows[0].role);
      
      // Step 3: Test password verification
      console.log('\n3. Testing password verification...');
      const storedPassword = adminRows[0].password;
      console.log('Stored password hash:', storedPassword);
      
      const isValid = await bcrypt.compare(password, storedPassword);
      console.log(`Password verification: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
      
      if (isValid) {
        console.log('\n4. Login should work!');
        console.log('Admin ID:', adminRows[0].adminID);
        console.log('Username:', adminRows[0].username);
        console.log('Role:', adminRows[0].role);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await pool.end();
  }
}

debugLogin();
