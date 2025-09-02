import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: npm run migrate -- migrations/001_create_table.sql");
  process.exit(1);
}

console.log("RUNNING MIGRATION SCRIPT - using hardcoded connection config");

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "recipes"
});


(async () => {
  try {
    const sql = fs.readFileSync(path.resolve(__dirname, "..", sqlFile), "utf8");
    await pool.query(sql);
    console.log("Migration applied.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();

