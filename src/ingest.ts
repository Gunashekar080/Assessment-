import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import { validateRecipe } from "./validators.js";  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ingest(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const recipes = JSON.parse(raw);

  let inserted = 0;

  for (const r of recipes) {
    try {
      const recipe = validateRecipe(r);

      await pool.query(
        `INSERT INTO recipes
         (title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          recipe.title,
          recipe.cuisine,
          recipe.rating,
          recipe.prep_time,
          recipe.cook_time,
          recipe.total_time,
          recipe.description,
          recipe.nutrients,
          recipe.serves,
        ]
      );

      inserted++;
    } catch (e) {
      console.error("⚠️ Invalid recipe skipped:", e);
    }
  }

  console.log(`✅ Inserted ${inserted} records`);
  await pool.end();
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: npm run ingest -- <recipes.json>");
  process.exit(1);
}

ingest(path.resolve(__dirname, "..", filePath));
