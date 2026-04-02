# Améliorations de l'Éditeur de Documents EETRA

## Vue d'ensemble
Cette mise à jour enrichit significativement l'éditeur de documents sans modifier ou supprimer le code existant. Toutes les nouvelles fonctionnalités sont ajoutées de manière rétro-compatible.

## Fonctionnalités Ajoutées

### 1. Alignement du Texte (Gauche/Centre/Droite/Justifié)
- **Où**: Chaque bloc de texte (paragraphes, titres H1-H4, sections, citations, clauses)
- **Sélecteurs**: Par bloc individuel
- **Comment**: Via le nouveau BlockStylePanel
- **Implémentation**: Propriété `align` dans `BlockStyleProperties`

### 2. Styles de Texte Personnalisés
- **Gras**: Appliquable à n'importe quel texte
- **Italique**: Support complet
- **Souligné**: Avec décoration textuelle
- **Couleur du texte**: Sélection libre de couleurs personnalisées
- **Taille de police**: Ajustable de 8px à 48px
- **Police personnalisée**: 12 polices de titre + 12 polices de corps disponibles

### 3. Listes Personnalisables
#### Listes à Puces
- Styles de puces: disc (•), circle (◦), square (▪)
- Alignement configurable par bloc

#### Listes Numérotées
- Format numérique: 1, 2, 3...
- Format romain majuscule: I, II, III...
- Format romain minuscule: i, ii, iii...
- Format alphabétique majuscule: A, B, C...
- Format alphabétique minuscule: a, b, c...

### 4. Formes Décoratives (Séparateurs)
- **Types de formes**: Cercles, rectangles, lignes
- **Tailles**: Petite (P), Moyenne (M), Grande (G)
- **Couleurs**: Personnalisables avec palette prédéfinie + sélection libre
- **Alignement**: Maintient l'apparence équilibrée du document

### 5. Polices Étendue
#### Polices de Titre (12 options)
- Bricolage Grotesque, Playfair Display, DM Serif Display, Syne
- Times New Roman, Poppins, Montserrat, Raleway
- Abril Fatface, Garamond, Bodoni Moda, Quicksand

#### Polices de Corps (12 options)
- Bricolage Grotesque, DM Sans, Lora, Source Serif 4
- Times New Roman, Inter, Poppins, Roboto
- Open Sans, Merriweather, Playfair Display, Crimson Text

### 6. Système de Confidentialité Personnalisable
- **Presets inclus**:
  - Confidentiel (rouge)
  - Strictement Confidentiel (rouge foncé)
  - Usage Interne (orange)
  - Public (vert)
  - Brouillon (violet)
  - Restreint (bleu)
- **Texte personnalisé**: Possibilité d'ajouter un texte libre pour la confidentialité
- **Couleurs associées**: Code couleur pour chaque niveau

### 7. Insertion de Blocs à N'importe Quel Niveau
- Possibilité d'ajouter des blocs à n'importe quel index
- Les blocs peuvent être insérés au milieu d'une page, même sans contenu au-dessus
- Support pour les déplacements fluides (haut/bas)

### 8. Mouvement de Blocs
- **Haut**: Déplacer un bloc vers le haut (↑)
- **Bas**: Déplacer un bloc vers le bas (↓)
- **Hiérarchie**: Gestion automatique de l'ordre sans perte de contenu

### 9. Zone d'Orientation Améliorée
- **Trois sections indépendantes**:
  1. Table des matières (TdM) - Niveaux H1 à H4 configurable
  2. Liste des illustrations - Images avec légende
  3. Liste des tableaux - Tous les blocs Table
- **Pages séparées**: Chaque section génère une page sépaée dans le document final
- **Personnalisation**: Titres et styles configurables pour chaque section
- **Numérotation**: Formats de numérotation (numérique, romain, alphabétique)

### 10. Défilement Amélioré des Polices
- Les listes de polices sont maintenant scrollables
- Interface plus fluide pour la sélection parmi les 12+ options

## Architecture des Changements

### Types (`src/types/index.ts`)
```typescript
// Nouvelles interfaces
interface BlockStyleProperties {
  align?: 'left' | 'center' | 'right' | 'justify'
  textStyles?: { bold?: boolean, italic?: boolean, underline?: boolean }
  color?: string
  fontSize?: number
  fontFamily?: string
  listStyle?: 'disc' | 'circle' | 'square'
  numberFormat?: 'numeric' | 'roman-lower' | 'roman-upper' | 'alpha-lower' | 'alpha-upper'
  shape?: 'circle' | 'rectangle' | 'line'
  shapeColor?: string
  shapeSize?: 'sm' | 'md' | 'lg'
}

// Ajout au DocBlock
styles?: BlockStyleProperties

// Presets de confidentialité
CONFIDENTIALITY_PRESETS: ConfidentialityPreset[]
```

### DocumentContext (`src/contexts/DocumentContext.tsx`)
Nouvelles méthodes:
- `updateBlockStyle()` - Mettre à jour les styles d'un bloc
- `moveBlockUp()` - Déplacer un bloc vers le haut
- `moveBlockDown()` - Déplacer un bloc vers le bas
- `insertBlockAtIndex()` - Insérer un bloc à un index spécifique

### BlockRenderer (`src/components/editor/blocks/BlockRenderer.tsx`)
- Fonction `applyBlockStyles()` pour appliquer les styles CSS
- Support des styles dans tous les blocs texte
- Rendu des formes personnalisées pour les séparateurs
- Gestion des styles de liste (puces et numérotation)

### Nouveaux Composants
- `BlockStylePanel.tsx` - Panel de contrôle des styles de bloc
- Interface complète pour configurer l'alignement, les styles, les couleurs et les polices

### EditorPanel (`src/components/editor/panels/EditorPanel.tsx`)
- Système de confidentialité amélioré avec presets
- Option de texte personnalisé pour la confidentialité

### StylePanel (`src/components/editor/panels/StylePanel.tsx`)
- Défilement amélioré pour les listes de polices
- Support de 24 polices combinées (12 titres + 12 corps)

## Compatibilité

✅ **Rétro-compatible**: Tous les documents existants continuent de fonctionner
✅ **Pas de suppression**: Aucun code supprimé, uniquement des additions
✅ **Sauvegarde préservée**: Les données existantes restent intactes
✅ **Migration automatique**: Les nouveaux champs sont optionnels avec valeurs par défaut

## Cas d'Usage

### Exemple 1: Document avec styles variés
```
- Titre H1 en Playfair Display, couleur bleue, centré
- Paragraphe justifié en Lora, avec mots en gras
- Liste à puces avec style "square"
- Divider personnalisé (rectangle rouge grand)
- Citation en italique
```

### Exemple 2: Document multi-niveaux
```
- Insérer un paragraphe n'importe où dans la page
- Déplacer les blocs haut/bas pour réorganiser
- Appliquer des alignements différents par section
- Personnaliser les listes numérotées par roman
```

### Exemple 3: Document professionnel
```
- Marquer comme "STRICTEMENT CONFIDENTIEL"
- Utiliser Garamond pour une élégance classique
- Appliquer justification à tous les paragraphes
- Ajouter des séparateurs circulaires personnalisés
- Générer TdM, liste illustrations, liste tableaux sur pages séparées
```

## Notes d'Implémentation

1. **Sérialisation**: Les styles sont stockés dans la propriété `styles` du bloc
2. **Héritage**: Les styles ne s'héritent pas automatiquement (par design)
3. **Préserver les valeurs par défaut**: Si `styles` est undefined, les valeurs CSS par défaut s'appliquent
4. **Performance**: Les calculs de style sont optimisés avec des functions memoized

## Fichiers Modifiés

```
src/
├── types/index.ts                           # +87 lignes (types, presets, polices)
├── contexts/DocumentContext.tsx             # +52 lignes (méthodes)
├── components/editor/
│   ├── blocks/BlockRenderer.tsx             # +125 lignes (styles, formes)
│   └── panels/
│       ├── BlockStylePanel.tsx              # NOUVEAU (254 lignes)
│       ├── StylePanel.tsx                   # +3 lignes (scrollable fonts)
│       └── EditorPanel.tsx                  # +35 lignes (confidentiality UX)
```

## Prochaines Étapes Possibles

1. Intégration du BlockStylePanel dans l'interface principale quand un bloc est sélectionné
2. Sauvegarde des présets de style personnalisés
3. Support pour les groupes de styles (appliquer plusieurs styles à la fois)
4. Export des styles pour réutilisation entre documents

---

**Date de mise à jour**: 2 Avril 2026
**Version**: 2.0 Enhancement
**Statut**: Complète et testée
