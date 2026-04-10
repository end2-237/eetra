import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialisation avec tes variables exactes du .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

// On crée le client Supabase
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export async function POST(request: Request) {
  // Vérification si les variables sont chargées (évite le crash au build Vercel)
  if (!supabase) {
    return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 });
  }

  // 1. Vérification de la clé secrète SNL
  const apiKey = request.headers.get('X-API-KEY');
  
  // Note: Assure-toi d'ajouter SNL_CLOUD_SECRET dans Vercel ou ton .env
  if (apiKey !== process.env.SNL_CLOUD_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, siteId, timestamp } = body;

    // 2. Insertion dans la table 'backups'
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

    return NextResponse.json({ 
      success: true, 
      message: "Sauvegarde effectuée avec succès" 
    });

  } catch (err: any) {
    console.error("Erreur de synchronisation:", err.message);
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: err.message 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY', // <--- C'EST CA QUI MANQUE
    },
  });
}