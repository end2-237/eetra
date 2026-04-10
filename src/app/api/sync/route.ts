import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialise Supabase (utilise tes variables d'environnement Vercel)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Utilise la clé Service Role pour bypasser les RLS si c'est un backup privé
);

export async function POST(request: Request) {
  // 1. Vérification de la clé API
  const apiKey = request.headers.get('X-API-KEY');
  if (apiKey !== process.env.SNL_CLOUD_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, siteId, timestamp } = body;

    // 2. Stockage dans Supabase
    // Tu peux stocker l'objet JSON entier dans une colonne de type "jsonb"
    const { error } = await supabase
      .from('backups')
      .insert([
        { 
          site_id: siteId, 
          payload: data, 
          created_at: timestamp 
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}