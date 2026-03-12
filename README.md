# EETRA — Plateforme Document d'Entreprise

Plateforme B2B de création de documents professionnels (Business Plans, Audits, Appels d'Offres, Contrats) avec IA rédactionnelle, charte corporate et export PDF.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditez .env.local et ajoutez votre clé API Anthropic

# 3. Lancer en développement
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## 🔑 Configuration

### Clé API Anthropic (pour les fonctionnalités IA)

1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générez une clé API
3. Ajoutez-la dans `.env.local` :

```
ANTHROPIC_API_KEY=sk-ant-...
```

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `ANTHROPIC_API_KEY` | Clé API Anthropic pour l'IA | Oui (pour IA) |
| `NEXT_PUBLIC_APP_URL` | URL de l'application (pour les liens) | Non |

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx            # Landing page
│   ├── login/              # Connexion / Inscription
│   ├── onboarding/         # Profil entreprise
│   ├── editor/             # Éditeur principal
│   └── api/ai/generate/    # API Route IA
├── components/
│   ├── ui/                 # Composants UI réutilisables
│   ├── landing/            # Composants de la landing page
│   └── editor/             # Composants de l'éditeur
│       ├── panels/         # Panneaux latéraux
│       ├── blocks/         # Rendu des blocs document
│       └── document/       # Pages A4 (couverture + contenu)
├── contexts/               # React Context (theme, profil, document)
├── hooks/                  # Hooks personnalisés
├── lib/                    # Utilitaires, templates, IA
└── types/                  # TypeScript types
```

## ✨ Fonctionnalités

- **Landing Page** — présentation, fonctionnalités, tarifs en FCFA, FAQ
- **Authentification** — connexion / inscription / mode démo
- **Profil entreprise** — logo, couleur corporate, coordonnées, filigrane
- **Éditeur** — 8 types de blocs, page de garde auto, pagination
- **5 Smart Templates** — Business Plan, Appel d'Offre, Audit, Note de Direction, Contrat
- **IA Rédactionnelle** — génération d'introduction, reformulation (via Anthropic Claude)
- **Analytics** — score de complétude, répartition des blocs
- **Revue Collaborative** — annotations horodatées
- **Export PDF** — via html2pdf.js
- **Mode clair/sombre** — toggle persistant
- **FCFA** — tarification en francs CFA

## 🏗️ Build de production

```bash
npm run build
npm start
```

## 🛠️ Stack technique

- **Next.js 14** — App Router, TypeScript
- **Tailwind CSS** — styling utilitaire
- **React Context** — gestion d'état
- **Anthropic Claude** — IA rédactionnelle
- **html2pdf.js** — export PDF
- **Lucide React** — icônes

## 📋 Roadmap

- [ ] Base de données (Prisma + PostgreSQL)
- [ ] Authentification réelle (NextAuth.js)
- [ ] Paiements Mobile Money (Orange, MTN, Wave)
- [ ] Collaboration temps réel
- [ ] Bibliothèque de documents
- [ ] API REST publique
