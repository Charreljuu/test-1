const API_BASE =
  import.meta.env.VITE_API_URL ?? "https://cities-api.2835773971.workers.dev";

export async function searchCities(q) {
  const url = `${API_BASE}/api/cities?q=${encodeURIComponent(q)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`);
  }
  const data = await response.json();
  return data.results ?? [];
}
