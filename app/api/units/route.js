import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("units")
    .select("*")
    .order("code", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // no-store para que el panel siempre vea lo último
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req) {
  // Espera: { code: "1A", price?: 100000, status?: "reservado" }
  const body = await req.json();
  const { code, price, status } = body || {};
  if (!code) return NextResponse.json({ error: "Falta 'code'" }, { status: 400 });

  const fields = {};
  if (price !== undefined) fields.price = Number(price);
  if (status) fields.status = String(status);

  const { data, error } = await supabaseAdmin
    .from("units")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("code", code)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
