// Centralizamos las llamadas de persistencia (middleware local de Vite)

export async function saveToLocalAPI(endpoint: string, data: unknown) {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to save ${endpoint}`);
    }
  } catch (err) {
    console.log(`Guardado de ${endpoint} omitido en producción o falló:`, err);
  }
}

export async function fetchFromLocalAPI(endpoint: string) {
  try {
    const response = await fetch(`/api/${endpoint}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
  }
  return null;
}
