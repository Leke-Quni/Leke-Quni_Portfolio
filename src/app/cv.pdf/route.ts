import { connection } from "next/server";
import { getCvUrl } from "@/lib/site";

export async function GET() {
  await connection();
  const cvUrl = await getCvUrl();
  if (!cvUrl) return new Response("No CV has been uploaded yet.", { status: 404 });
  return Response.redirect(cvUrl, 307);
}
