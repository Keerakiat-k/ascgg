const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importData() {
  const filePath = 'C:/Users/keerakiat.k/Desktop/ascg_g/Website_and_Email Hosting.xlsx';
  const workbook = xlsx.readFile(filePath);
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    for (const sheetName of workbook.SheetNames) {
      // Ignore empty sheets or completely irrelevant sheets if needed
      if (sheetName.trim().length === 0) continue;

      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      // Clean up the domain name (remove numbering like '10.', '11.')
      let cleanDomain = sheetName.replace(/^\d+\./, '').trim();

      // Convert raw JSON data to a readable string format to put in 'note'
      const noteContent = JSON.stringify(data, null, 2);

      // Insert into database
      await pool.query(
        `INSERT INTO hostings (domain_name, note) VALUES (?, ?)`,
        [cleanDomain, noteContent]
      );
      console.log(`Imported sheet: ${sheetName} -> ${cleanDomain}`);
    }
    
    console.log('Import completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
}

importData();
