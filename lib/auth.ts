// Utilidad para validar admin key en las rutas API

import { NextRequest } from "next/server";

export function validateAdminKey(request: NextRequest): boolean {
  const adminKey = request.headers.get("x-admin-key");
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    console.error("ADMIN_KEY no está configurado en variables de entorno");
    return false;
  }

  return adminKey === expectedKey;
}
