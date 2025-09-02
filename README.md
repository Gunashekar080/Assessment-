# Recipes Assessment Project

This project implements the Recipes API and UI assessment.

## Prerequisites (macOS)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be running)
- Node.js 20+ and npm (install via Homebrew: `brew install node`)
- Git (install via Homebrew: `brew install git`)
- VS Code (for editing)

## Project Structure

```
recipes-assessment/
  backend/        # Express + Postgres API
  frontend/       # React + Vite UI
  data/           # Place your recipes.json file here
  docker-compose.yml
  .env
```

## Setup

### 1. Clone / unzip
Unzip this project into `~/recipes-assessment`.

Put your recipes JSON file into:
```
~/recipes-assessment/data/recipes.json
```

### 2. Start Postgres (Docker)
```bash
cd ~/recipes-assessment
docker compose up -d
```

### 3. Backend
```bash
cd backend
npm install

# Run DB migration
npm run migrate

# Ingest recipes JSON (NaN -> NULL handling included)
npm run ingest

# Start API
npm run dev
```
API available at: [http://localhost:4000](http://localhost:4000)

### 4. Frontend
Open a new terminal:
```bash
cd ~/recipes-assessment/frontend
npm install
npm run dev
```
UI available at: [http://localhost:5173](http://localhost:5173)

### 5. Test API
```bash
# Paginated recipes (page=1, limit=10, sorted by rating desc)
curl "http://localhost:4000/api/recipes?page=1&limit=10"

# Search examples
curl "http://localhost:4000/api/recipes/search?calories=<=400&title=pie&rating=>=4.5"
curl "http://localhost:4000/api/recipes/search?cuisine=Southern%20Recipes&total_time=<=120"
```

## UI Features

- Table columns: Title (truncated), Cuisine, Rating (stars), Total Time, Serves
- Pagination with page size options (15–50)
- Filters: title (contains), cuisine, rating (e.g. ">=4.5"), total time, calories
- Row click opens a drawer with:
  - Title + Cuisine
  - Description
  - Total Time (expandable to show Prep/Cook)
  - Nutrition mini-table (calories, carbs, cholesterol, fiber, protein, saturated fat, sodium, sugar, fat)
- Graceful empty states ("No results found")

## Environment Variables

`.env` file:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/recipes
PORT=4000
VITE_API_BASE_URL=http://localhost:4000
```


