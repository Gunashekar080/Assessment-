const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function fetchPage(page=1, limit=15) {
  const res = await fetch(`${BASE}/api/recipes?page=${page}&limit=${limit}`);
  return res.json();
}

export async function search(params: Record<string,string>) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${BASE}/api/recipes/search?` + qs.toString());
  return res.json();
}
