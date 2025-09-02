import express from "express";
import cors from "cors";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { pool } from "./db.js";

// Ensure .env is loaded correctly even if you run outside backend/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

function parseOp(
  val?: string
): { op: "<=" | ">=" | "=" | "<" | ">"; num: number } | null {
  if (!val) return null;
  const m = val.match(/^(<=|>=|=|<|>)(\s*\d+(\.\d+)?)$/);
  if (!m) return null;
  return { op: m[1] as any, num: Number(m[2]) };
}

// 📌 Get paginated recipes
app.get("/api/recipes", async (req, res) => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.max(Number(req.query.limit ?? 10), 1);
  const offset = (page - 1) * limit;

  const client = await pool.connect();
  try {
    const { rows: countRows } = await client.query(
      "SELECT COUNT(*)::int AS total FROM recipes"
    );
    const total = countRows[0].total as number;

    const { rows } = await client.query(
      `SELECT id, title, cuisine, rating, prep_time, cook_time, total_time,
              description, nutrients, serves
         FROM recipes
        ORDER BY rating DESC NULLS LAST, id ASC
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ page, limit, total, data: rows });
  } finally {
    client.release();
  }
});

// 📌 Search endpoint with filters
app.get("/api/recipes/search", async (req, res) => {
  const where: string[] = [];
  const params: any[] = [];

  if (req.query.title) {
    params.push(`%${String(req.query.title)}%`);
    where.push(`title ILIKE $${params.length}`);
  }
  if (req.query.cuisine) {
    params.push(String(req.query.cuisine));
    where.push(`cuisine = $${params.length}`);
  }
  const ratingOp = parseOp(String(req.query.rating ?? ""));
  if (ratingOp) {
    params.push(ratingOp.num);
    where.push(`rating ${ratingOp.op} $${params.length}`);
  }
  const ttOp = parseOp(String(req.query.total_time ?? ""));
  if (ttOp) {
    params.push(ttOp.num);
    where.push(`total_time ${ttOp.op} $${params.length}`);
  }
  const calOp = parseOp(String(req.query.calories ?? ""));
  if (calOp) {
    const calExpr =
      "NULLIF(regexp_replace(nutrients->>'calories','[^0-9.]','','g'),'')::numeric";
    params.push(calOp.num);
    where.push(`${calExpr} ${calOp.op} $${params.length}`);
  }

  const sql = `SELECT id, title, cuisine, rating, prep_time, cook_time, total_time,
            description, nutrients, serves
       FROM recipes
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY rating DESC NULLS LAST, id ASC`;

  const { rows } = await pool.query(sql, params);
  res.json({ data: rows });
});

// Start API
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () =>
  console.log(`✅ API running on http://localhost:${port}`)
);
