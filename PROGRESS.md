# EETRA — Journal de Progression

> Checklist des fonctionnalités demandées et leur état d'avancement.
> Mis à jour au fil du développement.

---

## ✅ Fonctionnalités complétées

- [x] **Template Devis / Facture Pro** — `src/lib/templates.ts`
  - Tableau détaillé avec désignations, quantités, prix unitaires, totaux
  - Récap financier (Sous-total HT / TVA / TTC)
  - Clauses CGV (paiement, validité, annulation)
  - Zone signature + bon pour accord

- [x] **Enrichissement de tous les templates** — `src/lib/templates.ts`
  - Business Plan : 6 sections, 2 tableaux, KPIs, projections 5 ans, planning
  - Appel d'Offre : 7 sections, équipe projet, planning détaillé
  - Rapport d'Audit : 6 sections, matrices de risques, recommandations priorisées
  - Note de Direction : 6 sections, tableau décisions, clauses
  - Contrat : 3 clauses OHADA, tableau de paiement, propriété intellectuelle

- [x] **Icons pro SVG pour les templates** — `src/components/editor/panels/TemplatesPanel.tsx`
  - Remplacement des emojis par des icônes SVG inline professionnelles
  - Icônes spécifiques par type : BP, AO, Audit, Mémo, Contrat, Devis

- [x] **Historique des documents** — `src/app/history/page.tsx` + `src/contexts/HistoryContext.tsx`
  - Enregistrement automatique à chaque export PDF
  - Persistance localStorage
  - ID document, titre, entité, nombre de pages/blocs
  - Recherche, tri, suppression
  - Accessible via la sidebar

- [x] **QR Code d'authenticité** — `src/components/editor/document/CoverPage.tsx`
  - QR code généré via api.qrserver.com avec l'URL de vérification
  - Intégré en bas de la page de couverture avec badge "Authentifié"

- [x] **Signature électronique unique** — `src/lib/utils.ts` + `CoverPage.tsx`
  - Fonction `generateSignature()` — hash EESIG-XXXXXXXX-XXXXXXXX-XXXXXXXX
  - Dérivée du docId + nom entité + timestamp
  - Affichée sur la couverture + stockée dans l'historique

- [x] **Suppression de pages** — `src/components/editor/PagesPanel.tsx`
  - Bouton × rouge au survol de chaque miniature
  - Confirmation avant suppression
  - Renumérotation automatique

- [x] **Auto-création de page en débordement** — `src/components/editor/document/ContentPage.tsx` + `Canvas.tsx`
  - `ResizeObserver` sur la zone de contenu
  - Seuil = 940px (zone utile A4 hors header/footer)
  - Nouvelle page créée automatiquement

- [x] **Sélection du profil typographique du document** — `src/components/editor/DocumentStyleModal.tsx`
  - Modale affichée au premier chargement de l'éditeur
  - 4 presets : Classic, Modern, Éditorial, Minimal
  - Choix libre des polices titre, corps, mono
  - 6 options police titre, 5 corps, 4 mono
  - Couleur d'accent liée au profil entreprise

- [x] **Types enrichis** — `src/types/index.ts`
  - `DocumentStyle`, `FONT_TITLE_OPTIONS`, `FONT_BODY_OPTIONS`, `STYLE_PRESETS`
  - `HistoryEntry`, `TeamMember`
  - `Comment` avec replies et resolved
  - `TableData` pour l'édition avancée des tableaux

- [x] **Tableau avancé (ajout/suppression lignes & colonnes)** — `src/components/editor/blocks/BlockRenderer.tsx`
  - `InteractiveTable` : état local + callbacks
  - Boutons + Ligne / + Colonne
  - Suppression ligne (hover)
  - Cellules contenteditable

- [x] **Gestion d'équipe** — `src/app/team/page.tsx` + `src/contexts/TeamContext.tsx`
  - Ajout membre (nom, email, rôle)
  - Rôles : Admin / Rédacteur / Lecteur
  - Suppression, changement de rôle
  - Avatars générés
  - Accessible via la sidebar

- [x] **Commentaires avancés** — `src/components/editor/panels/CommentsPanel.tsx`
  - Réponses aux commentaires
  - Résolution de commentaire
  - Filtres : Tous / Ouverts / Résolus

---

## 🔄 En cours / Améliorations futures

- [ ] **Overflow automatique avancé** — détection plus fine bloc par bloc
- [ ] **QR Code offline** — génération SVG en local sans appel API externe
- [ ] **Base de données** (Prisma + PostgreSQL) — persistance serveur
- [ ] **Authentification réelle** (NextAuth.js)
- [ ] **Paiements Mobile Money** (Orange, MTN, Wave)
- [ ] **Collaboration temps réel** (WebSocket / Supabase Realtime)
- [ ] **Bibliothèque de documents** partagée
- [ ] **API REST publique**
- [ ] **Export DOCX** en plus du PDF
- [ ] **Tableau de bord analytics** avancé (graphiques CA, activité)

---

## 📁 Architecture des fichiers modifiés

```
src/
├── types/index.ts              ✅ DocumentStyle, HistoryEntry, TableData, TeamMember
├── lib/
│   ├── templates.ts            ✅ 6 templates enrichis (+ Devis)
│   └── utils.ts                ✅ generateSignature(), buildQrUrl()
├── contexts/
│   ├── DocumentContext.tsx     ✅ docStyle, showStyleModal, updateBlockTable, removePage
│   ├── HistoryContext.tsx      ✅ NOUVEAU — historique localStorage
│   └── TeamContext.tsx         ✅ NOUVEAU — gestion équipe
├── app/
│   ├── layout.tsx              ✅ HistoryProvider + TeamProvider ajoutés
│   ├── history/page.tsx        ✅ NOUVEAU — page historique
│   └── team/page.tsx           ✅ NOUVEAU — page équipe
└── components/editor/
    ├── DocumentStyleModal.tsx  ✅ NOUVEAU — sélection typographique
    ├── PagesPanel.tsx          ✅ Suppression pages
    ├── Canvas.tsx              ✅ Auto-overflow, log historique
    ├── Sidebar.tsx             ✅ Liens Histoire + Équipe
    ├── blocks/
    │   └── BlockRenderer.tsx   ✅ InteractiveTable (add row/col)
    ├── panels/
    │   ├── TemplatesPanel.tsx  ✅ Icônes SVG pro, 6 templates
    │   └── CommentsPanel.tsx   ✅ Réponses, résolution, filtres
    └── document/
        ├── CoverPage.tsx       ✅ QR Code + Signature électronique
        └── ContentPage.tsx     ✅ Overflow detection, suppression page
```

---

## 🛠️ Stack & Dépendances

| Package | Version | Usage |
|---------|---------|-------|
| next | ^14.2.5 | Framework |
| react | ^18.3.1 | UI |
| html2pdf.js | ^0.10.1 | Export PDF |
| lucide-react | ^0.383.0 | Icônes UI |
| clsx | ^2.1.1 | Classes CSS |
| api.qrserver.com | externe | QR Code generation |

---

*Dernière mise à jour : Mars 2026*
