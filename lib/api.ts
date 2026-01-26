// Cliente API para el frontend - reemplaza localStorage

import type { Event, Settings, CreateEventRequest, UpdateEventRequest, UpdateSettingsRequest } from "./types";

const API_BASE = "/api";

// ADMIN_KEY debe estar disponible en el cliente
// Se pasa desde el frontend en cada request
function getAdminKey(): string {
  // En el cliente, esto debe venir de una variable de entorno pública
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  }
  return "";
}

// Headers comunes
function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-key": getAdminKey(),
  };
}

// Settings
export async function getSettings(): Promise<Settings> {
  const response = await fetch(`${API_BASE}/settings`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error al obtener settings: ${response.statusText}`);
  }

  return response.json();
}

export async function updateSettings(settings: UpdateSettingsRequest): Promise<Settings> {
  const response = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Error al actualizar settings");
  }

  return response.json();
}

// Events
export async function getEvents(from?: string, to?: string): Promise<Event[]> {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const url = `${API_BASE}/events${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error al obtener events: ${response.statusText}`);
  }

  return response.json();
}

export async function createEvent(event: CreateEventRequest): Promise<Event> {
  const response = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Error al crear event");
  }

  return response.json();
}

export async function updateEvent(id: string, event: UpdateEventRequest): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Error al actualizar event");
  }

  return response.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Error al eliminar event");
  }
}
