import { NextResponse } from "next/server";
// Import RELATIVO para evitar problemas de alias:
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("units")
      .select("*")
      .order("code", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

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
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
