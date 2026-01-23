// API route para actualizar events.json en Git usando GitHub API

import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "josecanaya";
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "uberjosecopiloto";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN no configurado" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "events es requerido y debe ser un array" },
        { status: 400 }
      );
    }

    // 1. Obtener el SHA del archivo actual
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/data/events.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
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

    // 2. Crear el contenido del archivo (base64)
    const content = JSON.stringify(events, null, 2);
    const contentBase64 = Buffer.from(content).toString("base64");

    // 3. Actualizar el archivo
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/data/events.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Actualizar events.json desde UI - ${new Date().toISOString()}`,
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
      message: "Events actualizados correctamente",
      commit: result.commit,
    });
  } catch (error) {
    console.error("Error en update-events:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
