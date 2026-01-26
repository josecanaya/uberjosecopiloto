// API route para actualizar settings.json en Git usando GitHub API

import { NextRequest, NextResponse } from "next/server";

// Buscar variables de entorno con diferentes nombres posibles
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.TOKEN_DE_GITHUB;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || process.env.PROPIETARIO_DEL_REPOSITOR_DE_GITHUB || "josecanaya";
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || process.env.NOMBRE_DEL_REPOSITOR_DE_GITHUB || "uberjosecopiloto";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || process.env.RAMA_DE_GITHUB || "main";

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      console.error("GITHUB_TOKEN no configurado en variables de entorno");
      return NextResponse.json(
        { error: "GITHUB_TOKEN no configurado. Configura la variable de entorno en Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "settings es requerido" },
        { status: 400 }
      );
    }

    // 1. Obtener el SHA del archivo actual
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/data/settings.json`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!getFileResponse.ok) {
      const error = await getFileResponse.text();
      return NextResponse.json(
        { error: `Error al obtener archivo: ${error}` },
        { status: getFileResponse.status }
      );
    }

    const fileData = await getFileResponse.json();
    const currentSha = fileData.sha;

    // 2. Obtener el SHA del commit actual de la rama
    const branchResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/refs/heads/${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!branchResponse.ok) {
      return NextResponse.json(
        { error: "Error al obtener rama" },
        { status: branchResponse.status }
      );
    }

    const branchData = await branchResponse.json();
    const baseTree = branchData.object.sha;

    // 3. Crear el contenido del archivo (base64)
    const content = JSON.stringify(settings, null, 2);
    const contentBase64 = Buffer.from(content).toString("base64");

    // 4. Actualizar el archivo
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/data/settings.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Actualizar settings.json desde UI - ${new Date().toISOString()}`,
          content: contentBase64,
          sha: currentSha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      return NextResponse.json(
        { error: `Error al actualizar archivo: ${error}` },
        { status: updateResponse.status }
      );
    }

    const result = await updateResponse.json();

    return NextResponse.json({
      success: true,
      message: "Settings actualizados correctamente",
      commit: result.commit,
    });
  } catch (error) {
    console.error("Error en update-settings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
