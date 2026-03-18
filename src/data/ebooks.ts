export interface EbookChapter {
  id: string
  title: string
  content: string
}

export interface Ebook {
  id: string
  title: string
  subtitle: string
  category: string
  coverColor: string
  icon: string
  pages: number
  readTime: string
  tags: string[]
  description: string
  author: string
  year: number
  free: boolean
  chapters: EbookChapter[]
}

export const EBOOK_CATEGORIES = [
  'Droit des Affaires',
  'Finance & Comptabilité',
  'Management',
  'Marchés Publics',
  'Fiscalité',
  'Ressources Humaines',
]

export const EBOOKS: Ebook[] = [
  {
    id: 'ohada-contrats',
    title: 'Droit des Contrats OHADA',
    subtitle: 'Guide pratique des obligations commerciales',
    category: 'Droit des Affaires',
    coverColor: '#1B4FD8',
    icon: '⚖️',
    pages: 58,
    readTime: '45 min',
    tags: ['OHADA', 'Contrats', 'Obligations'],
    description: 'Maîtrisez les fondements du droit des contrats dans l\'espace OHADA : formation, exécution, inexécution et résolution des litiges commerciaux.',
    author: 'Équipe Juridique EETRA',
    year: 2026,
    free: true,
    chapters: [
      {
        id: 'c1',
        title: 'Introduction au Droit OHADA',
        content: `L'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA) a été créée par le Traité de Port-Louis du 17 octobre 1993. Elle regroupe aujourd'hui 17 États membres d'Afrique centrale et de l'Ouest, représentant plus de 300 millions d'habitants.

**Objectifs fondamentaux**

L'OHADA poursuit trois objectifs principaux :
- Sécuriser l'environnement juridique des entreprises
- Attirer les investissements étrangers
- Favoriser l'intégration économique régionale

**Les Actes Uniformes**

Le cœur du système OHADA repose sur les Actes Uniformes, directement applicables dans tous les États membres sans transposition nationale. Les principaux Actes Uniformes sont :

1. L'Acte Uniforme relatif au Droit Commercial Général (AUDCG)
2. L'Acte Uniforme relatif au Droit des Sociétés Commerciales et du Groupement d'Intérêt Économique (AUSCGIE)
3. L'Acte Uniforme portant organisation des sûretés
4. L'Acte Uniforme relatif aux Procédures Collectives d'Apurement du Passif
5. L'Acte Uniforme portant Droit de l'Arbitrage

**La CCJA**

La Cour Commune de Justice et d'Arbitrage (CCJA) est la juridiction supranationale de l'OHADA. Elle contrôle l'application des Actes Uniformes et constitue une voie de recours au-dessus des juridictions nationales.`,
      },
      {
        id: 'c2',
        title: 'Formation et Validité du Contrat',
        content: `Un contrat est un accord de volontés entre deux ou plusieurs personnes, destiné à créer, modifier, transmettre ou éteindre des obligations. Pour être valide dans l'espace OHADA, un contrat doit réunir quatre conditions essentielles.

**Le consentement libre et éclairé**

Le consentement doit être exempt de vices. Trois vices du consentement sont reconnus :

*L'erreur* : Elle doit porter sur un élément essentiel du contrat. L'erreur sur la valeur ou les motifs n'est pas en principe une cause de nullité.

*Le dol* : Il consiste en des manœuvres frauduleuses destinées à tromper le cocontractant. Le dol incident (qui n'a pas été déterminant de la volonté) n'entraîne pas la nullité mais peut donner lieu à des dommages et intérêts.

*La violence* : Elle peut être physique ou morale. La crainte révérencielle (respect dû aux parents, supérieurs) n'est pas en principe une violence suffisante pour vicier le consentement.

**La capacité juridique**

Sont incapables de contracter, sauf exceptions légales :
- Les mineurs non émancipés
- Les majeurs sous tutelle ou curatelle
- Les personnes morales agissant en dehors de leur objet social

**L'objet du contrat**

L'objet doit être déterminé ou déterminable, possible et licite. Est nul tout contrat ayant pour objet une chose hors du commerce ou contraire à l'ordre public.

**La cause**

La cause est la raison déterminante pour laquelle les parties ont contracté. Elle doit exister et être licite.

**Formes particulières**

Certains contrats requièrent des formes spéciales :
- Le contrat de vente d'immeubles doit être notarié
- Le contrat de bail commercial doit être écrit pour les durées supérieures à 2 ans
- Les contrats de travail à durée déterminée doivent être constatés par écrit`,
      },
      {
        id: 'c3',
        title: 'Exécution et Inexécution des Obligations',
        content: `**Principes d'exécution**

L'obligation doit être exécutée de bonne foi. Ce principe fondamental impose à chaque partie de se comporter loyalement, non seulement lors de l'exécution du contrat, mais aussi lors de sa formation et lors des négociations précontractuelles.

**Les effets obligatoires**

Le contrat légalement formé tient lieu de loi à ceux qui l'ont fait. Il ne peut être révoqué que par consentement mutuel des parties (mutuus dissensus) ou dans les cas prévus par la loi.

**L'inexécution et ses conséquences**

En cas de non-exécution d'une obligation, le créancier dispose de plusieurs recours :

*La mise en demeure* : Préalablement à tout recours en justice, le créancier doit en principe mettre en demeure le débiteur d'exécuter son obligation. La mise en demeure peut résulter d'une lettre recommandée, d'un acte extrajudiciaire ou du dépôt d'une requête en justice.

*L'exécution forcée* : Le créancier peut, après mise en demeure, poursuivre l'exécution en nature de l'obligation si elle est possible. Il peut également, dans certains cas, faire exécuter lui-même l'obligation aux frais du débiteur.

*Les dommages et intérêts* : En cas d'inexécution ou de retard dans l'exécution, le débiteur est condamné au paiement de dommages et intérêts, sauf s'il justifie que l'inexécution provient d'une cause étrangère.

**La force majeure**

Est considérée comme force majeure l'événement imprévisible, irrésistible et extérieur à la volonté du débiteur. La pandémie de COVID-19 a constitué dans certains cas une force majeure, sous réserve de l'appréciation souveraine des juges.

**La clause pénale**

Les parties peuvent convenir dans le contrat d'une clause pénale fixant par avance le montant des dommages et intérêts dus en cas d'inexécution. Cette clause peut être modérée ou augmentée par le juge si elle est manifestement excessive ou dérisoire.`,
      },
      {
        id: 'c4',
        title: 'Clauses Essentielles des Contrats Commerciaux',
        content: `**La clause de confidentialité (NDA)**

Toute relation d'affaires implique le partage d'informations sensibles. La clause de confidentialité doit préciser :
- L'étendue des informations couvertes (commerciales, techniques, financières)
- La durée de l'obligation (généralement 2 à 5 ans après la fin du contrat)
- Les exceptions (informations déjà publiques, obtenues de tiers légitimement)
- Les sanctions en cas de violation

**La clause de propriété intellectuelle**

Dans les contrats de prestation de service ou de développement, il convient de préciser à qui appartient le résultat des travaux. À défaut de stipulation expresse, les droits sur les créations restent acquis au créateur.

**La clause de limitation de responsabilité**

Cette clause permet de plafonner les dommages et intérêts auxquels une partie pourra être condamnée. Elle ne peut écarter la responsabilité en cas de faute lourde ou dolosive.

**La clause de règlement des litiges**

Elle précise :
- La tentative préalable de règlement amiable
- Le choix entre juridiction nationale et arbitrage CCJA
- La loi applicable
- La langue du litige

**La clause résolutoire**

Elle permet la résolution automatique du contrat en cas d'inexécution d'une obligation essentielle, après mise en demeure restée sans effet dans un délai convenu (généralement 15 à 30 jours).

**La clause d'indexation (contrats long terme)**

Pour les contrats à exécution successive, il est conseillé d'indexer les prix sur un indice reconnu (IPC, cours matières premières) afin de préserver l'équilibre économique du contrat sur la durée.`,
      },
    ],
  },
  {
    id: 'business-plan-afrique',
    title: 'Business Plan en Afrique de l\'Ouest',
    subtitle: 'Méthode et templates pour convaincre les investisseurs',
    category: 'Management',
    coverColor: '#059669',
    icon: '📊',
    pages: 44,
    readTime: '35 min',
    tags: ['Business Plan', 'Financement', 'Investissement'],
    description: 'Guide complet pour rédiger un business plan convaincant adapté au contexte économique et financier de l\'Afrique de l\'Ouest.',
    author: 'Équipe Stratégie EETRA',
    year: 2026,
    free: true,
    chapters: [
      {
        id: 'c1',
        title: 'Structure d\'un Business Plan Efficace',
        content: `Un business plan est le document de référence qui présente votre projet d'entreprise dans sa globalité. Il remplit deux fonctions essentielles : vous aider à structurer votre réflexion, et convaincre les tiers (banques, investisseurs, partenaires) de la viabilité de votre projet.

**Les 9 composantes incontournables**

1. **Résumé exécutif** (1-2 pages) : C'est la partie la plus importante. Rédigée en dernier, elle synthétise les points clés du projet. Elle doit répondre à : Qui ? Quoi ? Pour qui ? Avec quels moyens ? Avec quels résultats attendus ?

2. **Présentation de l'équipe fondatrice** : En Afrique de l'Ouest, les investisseurs financent d'abord des hommes et des femmes. Mettez en avant les compétences complémentaires de l'équipe, les expériences pertinentes et la connaissance du marché local.

3. **Description du produit/service** : Expliquez clairement la valeur créée, le problème résolu et votre avantage compétitif différenciateur.

4. **Analyse du marché** : Taille du marché adressable (TAM/SAM/SOM), concurrence, tendances, barrières à l'entrée.

5. **Stratégie commerciale** : Canaux de distribution, politique tarifaire, plan d'acquisition client.

6. **Plan opérationnel** : Processus de production/livraison, ressources humaines, logistique.

7. **Projections financières** : Compte de résultat prévisionnel sur 3-5 ans, plan de trésorerie, bilan prévisionnel, point mort.

8. **Besoins de financement** : Montant recherché, utilisation des fonds, structure capitalistique.

9. **Annexes** : CV fondateurs, études de marché, lettres d'intention clients, extraits Kbis/RCCM.`,
      },
      {
        id: 'c2',
        title: 'Projections Financières Crédibles',
        content: `**Hypothèses réalistes pour l'Afrique de l'Ouest**

La crédibilité de votre business plan repose avant tout sur la qualité de vos hypothèses. Les investisseurs expérimentés dans la région savent que les projections "optimistes" sous-estiment systématiquement les délais et surestiment les revenus.

*Délai d'acquisition des premiers clients* : Comptez 6 à 12 mois pour les TPE/PME locales, et 12 à 24 mois pour les grandes entreprises ou entités publiques qui pratiquent des cycles d'achat longs.

*Taux de conversion* : En B2B, un taux de conversion de 10-15% des prospects qualifiés est réaliste. N'annoncez jamais 50% dans votre plan.

*Délai de paiement* : Provisionnez 60 à 90 jours de délai de paiement client dans votre modèle de trésorerie. C'est une réalité du marché régional.

**Construction du compte de résultat**

Partez du chiffre d'affaires et déduisez :
- Le coût des marchandises vendues (CMV) ou coût de revient
- Les charges d'exploitation (loyer, salaires, charges sociales, communication)
- Les charges financières (intérêts d'emprunts)
- Les impôts et taxes (IS, TVA non récupérable)

Pour calculer votre BFR (Besoin en Fonds de Roulement) :
BFR = Stocks + Créances clients - Dettes fournisseurs

**Le point mort (seuil de rentabilité)**

C'est le niveau de CA à partir duquel vous commencez à être rentable :
Point mort = Charges fixes / Taux de marge sur coûts variables

Exemple : Si vos charges fixes sont 5 000 000 FCFA/mois et votre taux de marge est 40%, votre point mort mensuel est 12 500 000 FCFA de CA.`,
      },
      {
        id: 'c3',
        title: 'Financement : Options dans la Sous-région',
        content: `**Les sources de financement disponibles**

*L'autofinancement et les "3F"* : Family, Friends, Fools. C'est souvent le premier tour de table. Montant typique : 1 à 10 millions FCFA.

*Les banques commerciales* : Réticentes aux startups sans historique, elles financent plus facilement les entreprises avec 2-3 ans d'activité. Elles exigent des garanties (hypothèque, caution personnelle). Taux pratiqués : 9 à 15% dans la zone UEMOA.

*Les institutions de microfinance* : Pour les petits besoins (500 000 à 5 000 000 FCFA), les IMF (Advans, ACEP, PAMECAS, etc.) sont plus accessibles que les banques.

*Les fonds d'investissement régionaux* : 
- Cauris Management (CI, SN, BF)
- AfricInvest
- Amethis Finance
- I&P (Investisseurs & Partenaires)

Ces fonds investissent généralement à partir de 50-100 millions FCFA en échange d'une participation minoritaire (20-40%).

*Les subventions et concours* : 
- CTIC Dakar
- Jeune Afrique Business
- Orange Fab Africa
- Fonds de Développement des PME (selon les pays)

**Structurer son tour de table**

Évitez de céder plus de 25-30% de votre capital lors d'un premier tour. Préservez votre capacité à faire des tours suivants en gardant une majorité de contrôle.

Utilisez des instruments juridiques adaptés :
- Actions ordinaires pour les investisseurs financiers
- BSA (Bons de Souscription d'Actions) pour les mentors/advisors
- Compte courant d'associé pour les apports temporaires des fondateurs`,
      },
    ],
  },
  {
    id: 'syscohada-comptabilite',
    title: 'Comptabilité SYSCOHADA Révisé',
    subtitle: 'Maîtrisez le système comptable de l\'espace OHADA',
    category: 'Finance & Comptabilité',
    coverColor: '#7C3AED',
    icon: '📒',
    pages: 62,
    readTime: '50 min',
    tags: ['SYSCOHADA', 'Comptabilité', 'Bilan', 'UEMOA'],
    description: 'Guide complet du Système Comptable OHADA révisé (2017) : principes, plan de comptes, états financiers annuels et gestion de trésorerie.',
    author: 'Équipe Finance EETRA',
    year: 2026,
    free: false,
    chapters: [
      {
        id: 'c1',
        title: 'Principes Fondamentaux du SYSCOHADA',
        content: `Le Système Comptable OHADA (SYSCOHADA) révisé est entré en vigueur le 1er janvier 2018. Il s'applique à toutes les entités soumises au droit OHADA, qu'elles soient commerciales, industrielles, artisanales, agricoles ou prestataires de services.

**Les conventions comptables de base**

*La continuité d'exploitation* : Les états financiers sont établis dans la perspective de la poursuite des activités de l'entité.

*La permanence des méthodes* : L'entité conserve les mêmes méthodes d'évaluation d'un exercice à l'autre pour assurer la comparabilité.

*L'importance significative* : Tout élément susceptible d'influencer le jugement des utilisateurs des états financiers doit être présenté de manière appropriée.

*La prééminence de la réalité économique* : Les opérations sont enregistrées et présentées conformément à leur nature et à leur réalité économique, et non selon leur apparence juridique.

**Les trois systèmes comptables**

Le SYSCOHADA propose trois niveaux selon la taille de l'entreprise :

1. **Système normal** : Pour les grandes et moyennes entreprises. États financiers complets : Bilan, Compte de résultat, Tableau des flux de trésorerie, Tableau de variation des capitaux propres, Notes annexes.

2. **Système allégé** : Pour les PME dont le CA est inférieur à certains seuils. Bilan simplifié, compte de résultat abrégé.

3. **Système minimal de trésorerie** : Pour les très petites entités. Comptabilité de caisse simplifiée.

**Les principaux changements du SYSCOHADA révisé (2017)**

- Introduction du concept de "juste valeur"
- Nouvelles règles pour les instruments financiers
- Traitement des contrats de location (proche des normes IFRS 16)
- Consolidation des comptes pour les groupes
- Amélioration de la présentation des états financiers`,
      },
      {
        id: 'c2',
        title: 'Le Plan de Comptes et ses Classes',
        content: `Le plan de comptes SYSCOHADA est organisé en 9 classes :

**Classe 1 — Ressources durables**
Comptes de capitaux propres (10 à 16), dettes financières (17, 18), provisions pour risques (19).
*Exemples* : 101 Capital, 111 Réserves légales, 171 Emprunts, 191 Provisions pour risques

**Classe 2 — Actif immobilisé**
Immobilisations incorporelles (20-21), corporelles (22-25), financières (26-27), amortissements et provisions (28-29).
*Exemples* : 211 Fonds commercial, 231 Bâtiments, 241 Matériel industriel, 261 Titres de participation

**Classe 3 — Actif circulant (stocks)**
Marchandises (31), matières premières (32), en-cours (33-34), produits finis (35), autres (37-38).
*Exemple* : 311 Marchandises générales, 321 Matières premières

**Classe 4 — Tiers**
Fournisseurs (40), clients (41), personnel (42), État (44), organismes sociaux (43), débiteurs/créditeurs divers (46-47).
*Exemples* : 401 Fournisseurs, 411 Clients, 421 Rémunérations dues au personnel, 441 État, impôt sur les bénéfices

**Classe 5 — Trésorerie**
Valeurs mobilières de placement (50), banques (52), chèques et coupons (53), caisse (57).
*Exemple* : 521 Banque locale, 571 Caisse siège

**Classes 6, 7, 8 — Charges, Produits, Résultats**
Achats (60-61), services extérieurs (62-63), impôts et taxes (64), charges de personnel (66), dotations (68) / Ventes (70), autres produits (71-75), reprises (78) / Résultat (89).

**La balance des comptes**

Mensuellement, établissez une balance générale qui récapitule pour chaque compte :
- Le solde initial
- Les mouvements débiteurs du mois
- Les mouvements créditeurs du mois  
- Le solde final

La balance doit être équilibrée : Total débit = Total crédit.`,
      },
    ],
  },
  {
    id: 'appels-offres',
    title: 'Guide des Marchés Publics',
    subtitle: 'Répondre efficacement aux appels d\'offres publics',
    category: 'Marchés Publics',
    coverColor: '#B45309',
    icon: '🏛️',
    pages: 38,
    readTime: '30 min',
    tags: ['Marchés Publics', 'Appels d\'Offres', 'Administration'],
    description: 'Comprendre la réglementation des marchés publics, préparer un dossier solide et optimiser vos chances de succès.',
    author: 'Équipe Marchés EETRA',
    year: 2026,
    free: true,
    chapters: [
      {
        id: 'c1',
        title: 'Cadre Réglementaire des Marchés Publics',
        content: `**La réglementation UEMOA**

La directive UEMOA n°05/2005 et ses textes d'application constituent le cadre commun des marchés publics dans les 8 pays de l'Union. Chaque État membre dispose de son propre Code des Marchés Publics.

**Les seuils de passation**

Les marchés publics sont soumis à des procédures différentes selon leur montant :

- **Marché de gré à gré** : En dessous d'un seuil fixé par chaque État (généralement 5-10 millions FCFA pour les services)
- **Demande de renseignements et de prix (DRP)** : De ce seuil à environ 25-50 millions FCFA
- **Appel d'offres ouvert** : Au-dessus de ce seuil, obligatoire. Publicité nationale ou internationale selon le montant

**Les types d'appels d'offres**

*L'Appel d'Offres Ouvert (AOO)* : Toute entreprise qualifiée peut soumissionner. C'est la procédure de droit commun.

*L'Appel d'Offres Restreint (AOR)* : Seules les entreprises présélectionnées peuvent soumissionner. Utilisé pour les marchés complexes ou spécialisés.

*La procédure d'entente directe* : Réservée aux cas d'urgence impérieuse ou de secret défense. Strictement encadrée.

**Les acteurs du marché public**

- L'Autorité Contractante (maître d'ouvrage)
- La Commission de Passation des Marchés (CPM)
- La Direction Nationale des Marchés Publics (DNMP ou DGMP)
- L'Autorité de Régulation des Marchés Publics (ARMP)`,
      },
      {
        id: 'c2',
        title: 'Préparer un Dossier de Soumission Gagnant',
        content: `**Analyse préalable du dossier d'appel d'offres**

Avant de décider de soumissionner, évaluez :
- Votre aptitude technique à réaliser la prestation
- Votre capacité financière (garantie de soumission, avance de démarrage)
- Les délais de réalisation (est-ce compatible avec votre carnet de commandes ?)
- Votre connaissance du maître d'ouvrage

**Les pièces administratives obligatoires**

Préparez et maintenez à jour en permanence :
- Attestation d'immatriculation (RCCM ou registre équivalent)
- Attestation de régularité fiscale (à renouveler tous les 3 mois)
- Attestation de régularité envers les organismes sociaux (CNPS, etc.)
- Certificat de non faillite délivré par le tribunal
- Références de chantiers similaires avec attestations de bonne exécution
- CV du personnel clé (chef de projet, experts)

**L'offre technique**

C'est votre proposition de valeur. Elle doit montrer :
1. Votre compréhension profonde du besoin du maître d'ouvrage
2. Votre méthodologie d'exécution détaillée
3. Votre planning de réalisation réaliste
4. Votre organisation et les moyens mobilisés
5. Vos références similaires valorisées

**L'offre financière**

- Présentez une décomposition claire et détaillée des prix
- Vérifiez scrupuleusement les unités (FCFA HT, TVA, FCFA TTC)
- Ne sous-évaluez pas : un prix anormalement bas peut être rejeté
- Provisionnez les aléas (20-25% recommandé sur les travaux)
- Vérifiez les conditions de révision de prix pour les marchés pluriannuels

**Erreurs fatales à éviter**

- Dossier incomplet (pièces manquantes = rejet automatique)
- Paraphe ou signature manquant
- Cachet d'entreprise absent
- Offre déposée hors délai (même de quelques minutes)
- Mélange des enveloppes technique et financière (quand elles sont séparées)`,
      },
    ],
  },
  {
    id: 'fiscalite-pme-uemoa',
    title: 'Fiscalité des PME en Zone UEMOA',
    subtitle: 'Comprendre et optimiser la charge fiscale de votre entreprise',
    category: 'Fiscalité',
    coverColor: '#DC2626',
    icon: '💰',
    pages: 46,
    readTime: '40 min',
    tags: ['Fiscalité', 'TVA', 'IS', 'UEMOA', 'Optimisation'],
    description: 'Guide pratique sur les principaux impôts applicables aux PME dans l\'espace UEMOA : TVA, IS, taxes professionnelles, et conseils d\'optimisation légale.',
    author: 'Équipe Fiscale EETRA',
    year: 2026,
    free: false,
    chapters: [
      {
        id: 'c1',
        title: 'La TVA dans l\'espace UEMOA',
        content: `La Taxe sur la Valeur Ajoutée (TVA) est un impôt indirect sur la consommation. Elle est collectée par les entreprises pour le compte de l'État.

**Fonctionnement de la TVA**

La TVA est calculée sur la valeur ajoutée à chaque étape du circuit économique. Le mécanisme du droit à déduction évite les doubles impositions :

TVA à payer = TVA collectée sur ventes - TVA déductible sur achats

*Exemple pratique* :
- Vous achetez des fournitures pour 1 000 000 FCFA HT + 180 000 FCFA de TVA (18%) = 1 180 000 FCFA TTC
- Vous vendez à 1 800 000 FCFA HT + 324 000 FCFA de TVA = 2 124 000 FCFA TTC
- TVA à reverser à l'État : 324 000 - 180 000 = **144 000 FCFA**

**Taux de TVA en vigueur**

Le taux normal est de **18%** dans les pays UEMOA. Des taux réduits existent selon les pays :
- 0% (exonération avec droit à déduction) : exportations, certains produits agricoles
- Exonération simple (sans droit à déduction) : services médicaux, enseignement, certains services financiers

**La TVA et les seuils d'assujettissement**

En Côte d'Ivoire, sont obligatoirement assujettis à la TVA les opérateurs réalisant un CA annuel supérieur à 50 millions FCFA. Au Sénégal, le seuil est de 50 millions FCFA également. Au-dessous, le régime de la taxe forfaitaire (ou CGU/TFP selon les pays) s'applique.

**La déclaration de TVA**

Les assujettis déclarent et paient la TVA mensuellement (ou trimestriellement selon les pays et régimes). La déclaration doit être déposée au plus tard le 15 ou 20 du mois suivant.

**La TVA et les marchés publics**

Attention : les marchés publics sont soumis à la TVA même si l'acheteur est l'État. L'État dispose toutefois d'un régime particulier de retenue à la source de TVA dans certains pays.`,
      },
      {
        id: 'c2',
        title: 'L\'Impôt sur les Sociétés (IS)',
        content: `**Généralités**

L'Impôt sur les Sociétés (IS) frappe les bénéfices réalisés par les personnes morales (SA, SARL, SAS, etc.). Le taux normal est généralement de **25 à 30%** selon les pays UEMOA.

**Détermination du résultat fiscal**

Le résultat fiscal diffère du résultat comptable. Il s'obtient par :
Résultat fiscal = Résultat comptable + Réintégrations - Déductions

*Principales réintégrations (charges non déductibles)* :
- Amendes et pénalités fiscales
- Dons et libéralités au-delà des plafonds autorisés
- Dépenses somptuaires (logements de luxe, yachts, véhicules au-delà des plafonds)
- Rémunérations excessives des dirigeants
- Charges non justifiées par des pièces comptables

*Principales déductions* :
- Amortissements des immobilisations (selon les durées fiscalement admises)
- Provisions pour créances douteuses (sous conditions)
- Report des déficits antérieurs (généralement limité à 3-5 ans)

**Le minimum forfaitaire d'imposition (MFI)**

Dans la plupart des pays UEMOA, l'IS ne peut pas être inférieur à un minimum forfaitaire calculé sur le chiffre d'affaires (généralement 0,5% à 1% du CA). Même en cas de déficit, ce minimum est dû.

**Les acomptes provisionnels**

L'IS est payé en cours d'année sous forme d'acomptes (généralement trimestriels), calculés sur la base de l'impôt de l'exercice précédent.

**Optimisation fiscale légale**

- Utilisez pleinement les amortissements dégressifs pour les équipements
- Constituez des provisions pour créances douteuses identifiées
- Profitez des incitations fiscales sectorielles (zones franches, Code des Investissements)
- Structurez votre groupe pour optimiser les flux intra-groupe dans le respect des prix de transfert`,
      },
    ],
  },
  {
    id: 'droit-travail-ohada',
    title: 'Droit Social et Emploi en Afrique de l\'Ouest',
    subtitle: 'Guide pratique du droit du travail pour les employeurs',
    category: 'Ressources Humaines',
    coverColor: '#0E7490',
    icon: '👥',
    pages: 52,
    readTime: '42 min',
    tags: ['RH', 'Contrat de Travail', 'Licenciement', 'CNPS'],
    description: 'Maîtrisez le cadre légal de la relation de travail : recrutement, gestion de la paie, discipline et rupture du contrat dans l\'espace OHADA.',
    author: 'Équipe RH EETRA',
    year: 2026,
    free: true,
    chapters: [
      {
        id: 'c1',
        title: 'Le Contrat de Travail : Formes et Types',
        content: `**Définition et caractéristiques**

Le contrat de travail est la convention par laquelle une personne (le salarié) s'engage à mettre son activité au service d'une autre personne (l'employeur) sous sa subordination, moyennant une rémunération.

Le lien de subordination juridique est l'élément distinctif fondamental : il se manifeste par le pouvoir de l'employeur de donner des ordres, d'en contrôler l'exécution et de sanctionner les manquements.

**Le Contrat à Durée Indéterminée (CDI)**

C'est le contrat de droit commun. Sa résiliation est soumise à des conditions strictes (préavis, indemnités légales). Il peut être verbal mais la forme écrite est vivement recommandée.

**Le Contrat à Durée Déterminée (CDD)**

Il doit obligatoirement être écrit et préciser :
- Le motif du recours au CDD (remplacement d'un absent, accroissement d'activité, emploi saisonnier, etc.)
- La date de début et de fin, ou la durée
- La qualification du salarié

*Limites importantes* : Le CDD ne peut en principe se renouveler qu'une fois. La durée totale (CDD + renouvellement) est limitée (souvent 2 ans selon les pays). Au-delà, le contrat est requalifié en CDI.

**La période d'essai**

Sa durée varie selon la qualification du salarié :
- Ouvriers/employés non qualifiés : 1 à 3 mois
- Agents de maîtrise : 3 à 6 mois
- Cadres et assimilés : 3 à 6 mois (parfois jusqu'à 1 an)

Durant la période d'essai, chaque partie peut rompre le contrat sans préavis ni indemnité.`,
      },
      {
        id: 'c2',
        title: 'Paie, Cotisations et Obligations de l\'Employeur',
        content: `**La structure de la rémunération**

Le salaire comprend :
1. Le salaire de base (fixé par la convention collective ou le contrat)
2. Les primes et accessoires (ancienneté, transport, logement, rendement)
3. Les avantages en nature (véhicule, logement, repas)

Le SMIG (Salaire Minimum Interprofessionnel Garanti) est fixé par décret dans chaque pays. Il constitue le plancher en dessous duquel aucun salarié ne peut être rémunéré.

**Les cotisations sociales**

Les cotisations patronales et salariales sont versées à la Caisse Nationale de Prévoyance Sociale (CNPS, INPS, CARFO selon les pays).

*Cotisations patronales* (variables selon les pays) :
- Prestations familiales : 5 à 10% du salaire brut
- Accidents du travail : 2 à 5% (variable selon secteur)
- Assurance vieillesse : 3 à 8% du salaire brut plafonné

*Cotisations salariales* :
- Assurance vieillesse : 2 à 6% du salaire brut plafonné
- Impôt sur les traitements et salaires (ITS) : barème progressif

**Calcul simplifié de la paie**

1. Salaire brut global = Salaire de base + Primes + Avantages en nature valorisés
2. Retenues salariales = Cotisations CNPS + ITS
3. Salaire net = Salaire brut - Retenues salariales

**Obligations déclaratives**

- Déclaration mensuelle des salaires auprès de l'administration fiscale
- Déclaration trimestrielle à la CNPS avec paiement des cotisations
- Livre de paie obligatoire (peut être informatisé)
- Registre du personnel à tenir à jour

**Congés payés**

Le droit aux congés payés est acquis à raison de 2,5 jours ouvrables par mois de service effectif, soit 30 jours ouvrables (5 semaines) pour un an d'ancienneté.`,
      },
    ],
  },
]
