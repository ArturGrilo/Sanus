// src/lib/api.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"; // fallback em dev

export async function fetchServicos() {
  try {
    const response = await fetch(`${BASE_URL}/servicos`);
    if (!response.ok) throw new Error("Erro ao buscar serviços.");
    return await response.json();
  } catch (error) {
    console.error("Erro no fetchServicos:", error);
    return [];
  }
}