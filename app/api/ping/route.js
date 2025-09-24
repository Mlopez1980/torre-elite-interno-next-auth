export async function GET() {
  return new Response(JSON.stringify({ ok: true, at: new Date().toISOString() }), {
    headers: { "Content-Type": "application/json" }
  });
}
