import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Headers CORS réutilisables
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  // 1. Vérification configuration Supabase
  if (!supabase) {
    return NextResponse.json(
      { error: 'Configuration Supabase manquante' }, 
      { status: 500, headers: corsHeaders }
    );
  }

  // 2. Vérification de la clé secrète SNL
  const apiKey = request.headers.get('X-API-KEY');
  
  // Utilise ta clé fixe si la variable d'env n'est pas encore sur Vercel
  const secret = process.env.SNL_CLOUD_SECRET || 'snl-prod-auth-9e32-4f12-b88a-772b1527c94d';

  if (apiKey !== secret) {
    return NextResponse.json(
      { error: 'Non autorisé' }, 
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { data, siteId, timestamp } = body;

    // 3. Insertion dans Supabase (Table: backups)
    const { error } = await supabase
      .from('backups')
      .insert([
        { 
          site_id: siteId, 
          payload: data, 
          created_at: timestamp || new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: "Sauvegarde effectuée avec succès" },
      { status: 200, headers: corsHeaders }
    );

  } catch (err: any) {
    console.error("Erreur de synchronisation:", err.message);
    return NextResponse.json(
      { error: 'Erreur serveur', details: err.message }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// api/sync/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const metaOnly = searchParams.get('meta') === 'true'; // Est-ce qu'on veut juste la date ?
  const apiKey = request.headers.get('X-API-KEY');

  if (apiKey !== process.env.SNL_CLOUD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  // On récupère la dernière ligne pour ce siteId
  const { data, error } = await supabase! 
    .from('backups')
    .select('payload, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  if (!data) return NextResponse.json({ timestamp: null, data: null }, { headers: corsHeaders });

  // Si l'utilisateur veut juste checker la date (Smart Sync)
  if (metaOnly) {
    return NextResponse.json({ timestamp: data.created_at }, { headers: corsHeaders });
  }

  // Sinon on renvoie tout pour la restauration
  return NextResponse.json({ 
    data: data.payload, 
    timestamp: data.created_at 
  }, { headers: corsHeaders });
}