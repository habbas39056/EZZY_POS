const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'adwiselabs_saas'
  });

  const schemaPath = path.join(process.cwd(), 'server', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  
  // Extract tables and columns from schema.sql
  const tableRegex = /CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/g;
  let match;
  const expectedSchema = {};
  
  while ((match = tableRegex.exec(schemaSql)) !== null) {
    const tableName = match[1];
    const columnsStr = match[2];
    const columnLines = columnsStr.split(',\n').map(l => l.trim()).filter(l => l && !l.startsWith('PRIMARY KEY') && !l.startsWith('FOREIGN KEY'));
    
    const columns = [];
    for (let line of columnLines) {
      line = line.replace(/,\s*$/, ''); // remove trailing commas
      const parts = line.split(/\s+/);
      if (parts.length >= 2 && parts[0].toUpperCase() !== 'UNIQUE') {
        columns.push({ name: parts[0], definition: line });
      }
    }
    expectedSchema[tableName] = columns;
  }

  // Check actual tables in DB
  const [tables] = await pool.query('SHOW TABLES');
  const dbTables = tables.map(t => Object.values(t)[0]);

  let missingTables = [];
  let missingColumns = {};

  for (const [tableName, expectedCols] of Object.entries(expectedSchema)) {
    if (!dbTables.includes(tableName)) {
      missingTables.push(tableName);
      continue;
    }

    const [dbCols] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
    const dbColNames = dbCols.map(c => c.Field);
    
    for (const expectedCol of expectedCols) {
      if (!dbColNames.includes(expectedCol.name)) {
        if (!missingColumns[tableName]) missingColumns[tableName] = [];
        missingColumns[tableName].push(expectedCol);
      }
    }
  }

  console.log(JSON.stringify({ missingTables, missingColumns }, null, 2));

  // Auto-fix missing columns
  for (const [tableName, cols] of Object.entries(missingColumns)) {
    for (const col of cols) {
      try {
        await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${col.definition}`);
        console.log(`Auto-added column ${col.name} to ${tableName}`);
      } catch (e) {
        console.error(`Failed to add column ${col.name} to ${tableName}:`, e.message);
      }
    }
  }

  process.exit(0);
}

checkSchema().catch(console.error);
