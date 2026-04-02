# Guide d'Utilisation - Nouvelles Fonctionnalités de l'Éditeur

## Comment Utiliser les Nouvelles Fonctionnalités

### 1. Modifier l'Alignement du Texte

#### Accès
- Sélectionnez un bloc de texte (paragraphe, titre, citation, etc.)
- Ouvrez le **BlockStylePanel** (à intégrer dans votre interface)
- Section "Texte" → "Alignement"

#### Options
- **G**: Gauche (par défaut)
- **C**: Centre
- **D**: Droite
- **J**: Justifié

#### Exemple
```
Un paragraphe peut être aligné au centre
     pour créer un effet dramatique,
   ou justifié pour une présentation formelle.
```

---

### 2. Appliquer des Styles de Texte

#### Accès
- BlockStylePanel → Section "Texte" → "Styles"

#### Styles disponibles
- **Gras** (B): `Texte en gras`
- **Italique** (I): `Texte en italique`
- **Souligné** (U): `Texte souligné`

#### Combinaisons
Vous pouvez combiner plusieurs styles:
- Gras + Italique: ***Très important***
- Gras + Souligné: **_Très important_**

---

### 3. Changer la Couleur du Texte

#### Accès
- BlockStylePanel → Section "Texte" → "Couleur"

#### Palettes prédéfinies
- Noir (#111)
- Gris foncé (#444)
- Orange (#EA580C)
- Bleu (#1B4FD8)
- Vert (#059669)
- Rouge (#DC2626)

#### Couleur personnalisée
- Cliquez sur le carré "Sélecteur" pour choisir une couleur libre

---

### 4. Ajuster la Taille de Police

#### Accès
- BlockStylePanel → Section "Texte" → "Taille police"

#### Plages
- Minimum: 8px
- Maximum: 48px
- Par défaut: 12px

#### Cas d'usage
- **8-10px**: Légendes, notes de bas de page
- **12-14px**: Texte courant
- **18-24px**: Titres secondaires
- **32-48px**: Titres principaux

---

### 5. Sélectionner une Police

#### Accès
- BlockStylePanel → Section "Texte" → "Police"

#### Polices de Titre (12 options)
- Modernes: Bricolage Grotesque, Poppins, Syne
- Élégantes: Playfair Display, Bodoni Moda, Garamond
- Éditoriaux: DM Serif Display, Abril Fatface
- Géométriques: Montserrat, Raleway, Quicksand

#### Polices de Corps (12 options)
- Sans-serif: DM Sans, Inter, Roboto, Open Sans
- Serif: Lora, Source Serif 4, Merriweather, Crimson Text
- Hybrides: Bricolage Grotesque, Playfair Display, Times New Roman

#### Conseils de sélection
- **Titres + Corps**:
  - Playfair + Lora = Élégant et éditorial
  - Syne + DM Sans = Moderne et épuré
  - Bricolage + Bricolage = Cohésif et contemporain
  - Times NR + Times NR = Classique et intemporel

---

### 6. Personnaliser les Listes à Puces

#### Accès
- BlockStylePanel → Section "Liste" → "Style puces"

#### Styles disponibles
- **Disc** (•): Style par défaut, rond plein
- **Circle** (◦): Rond vide
- **Square** (▪): Carré plein

#### Exemple
```
• Premier élément
• Deuxième élément
• Troisième élément

vs

◦ Première option
◦ Deuxième option
◦ Troisième option

vs

▪ Point un
▪ Point deux
▪ Point trois
```

---

### 7. Configurer les Listes Numérotées

#### Accès
- BlockStylePanel → Section "Liste" → "Format numéros"

#### Formats disponibles
1. **Numérique**: 1, 2, 3, 4...
2. **Romain majuscule**: I, II, III, IV...
3. **Romain minuscule**: i, ii, iii, iv...
4. **Alphabétique majuscule**: A, B, C, D...
5. **Alphabétique minuscule**: a, b, c, d...

#### Exemples d'utilisation
- Numérique: Procédures et étapes
- Romain: Sections formelles d'un contrat
- Alphabétique: Énumération de points

---

### 8. Ajouter des Formes Décoratives

#### Accès
- BlockStylePanel → Section "Forme"
- Bloc de type "Séparateur"

#### Types de formes
- **Cercle**: Élégant et subtil
- **Rectangle**: Géométrique et formel
- **Ligne**: Minimaliste et épuré

#### Tailles
- **P** (Petite): 3px - Discret
- **M** (Moyenne): 5px - Équilibré (par défaut)
- **G** (Grande): 8px - Accentué

#### Couleurs
Choisir parmi la palette:
- Bleu (#1B4FD8)
- Orange (#EA580C)
- Vert (#059669)
- Rouge (#DC2626)
- Violet (#9333EA)
- Gris (#666666)

Ou sélectionner une couleur personnalisée.

#### Exemples
```
────● ────────  Séparateur avec cercle moyen bleu

──────■────────  Séparateur avec rectangle moyen vert

─────────────── Séparateur avec ligne petite grise
```

---

### 9. Insérer des Blocs n'importe Où

#### Avant (ancien comportement)
Les blocs s'ajoutaient toujours à la fin de la page.

#### Maintenant (nouveau)
- Utilisez `insertBlockAtIndex(pageId, type, index)`
- Insérez au milieu d'une page, même si rien ne précède
- Exemple: Ajouter un paragraphe au milieu d'une page vide

#### Code
```typescript
// Insérer un texte à l'index 2
insertBlockAtIndex(pageId, 'text', 2, 'Nouveau contenu')
```

---

### 10. Déplacer des Blocs

#### Accès (à implémenter dans l'UI)
- Boutons ↑ / ↓ sur chaque bloc
- Ou via `moveBlockUp()` / `moveBlockDown()`

#### Utilisation
- **↑**: Déplace le bloc vers le haut
- **↓**: Déplace le bloc vers le bas

#### Exemple
```
Avant:
1. Titre
2. Paragraph A
3. Paragraph B

Après (↑ sur B):
1. Titre
2. Paragraph B
3. Paragraph A
```

---

### 11. Personnaliser la Confidentialité

#### Accès
- EditorPanel → "Page de garde" → "Confidentialité"

#### Presets
1. **Confidentiel** (rouge) - Niveau standard
2. **Strictement Confidentiel** (rouge foncé) - Très sensible
3. **Usage Interne** (orange) - Interne à l'organisation
4. **Public** (vert) - Aucune restriction
5. **Brouillon** (violet) - Version préliminaire
6. **Restreint** (bleu) - Accès limité

#### Texte personnalisé
- Saisissez n'importe quel texte (max 50 caractères)
- Exemple: "POUR CONSEIL JURIDIQUE SEULEMENT"

#### Impact sur le document
- Apparaît dans l'en-tête du document
- Visible sur chaque page (si activé)
- Peut être inclus dans un filigrane

---

### 12. Configurer la Zone d'Orientation

#### Accès
- EditorPanel → Onglet "Orientation"

#### Trois sections indépendantes

##### A. Table des Matières (TdM)
- **Niveaux inclus**: H1, H2, H3, H4 (configurable)
- **Style de numérotation**: Numérique, Romain, Alphabétique
- **Numéros de page**: Afficher/masquer
- **Titre personnalisé**: "Table des Matières" par défaut

##### B. Liste des Illustrations
- **Contient**: Toutes les images avec légende
- **Titre personnalisé**: "Liste des Illustrations"
- **Format**: Automatique

##### C. Liste des Tableaux
- **Contient**: Tous les blocs "Tableau"
- **Titre personnalisé**: "Liste des Tableaux"
- **Format**: Automatique

#### Génération de pages
- Chaque section s'affiche sur une **page séparée**
- Placements possibles:
  - Après la couverture
  - Après une page de contenu spécifique
  - À la fin du document

#### Exemple
```
Page 1:  Couverture
Page 2:  Table des Matières
         ┌─ 1. Introduction ........... p.3
         ├─ 2. Contenu ............... p.5
         └─ 3. Conclusion ............ p.7
Page 3:  Liste des Illustrations
         ┌─ Fig. 1: Graphique ........ p.4
         └─ Fig. 2: Diagramme ........ p.6
Page 4:  Liste des Tableaux
         ┌─ Tableau 1: Données ...... p.5
         └─ Tableau 2: Résultats .... p.8
Pages 5+: Contenu principal
```

---

## Conseils de Bonnes Pratiques

### Harmonie Visuelle
- Limitez à 2-3 polices maximum dans un document
- Maintenez une cohérence d'alignement par section
- Utilisez les couleurs avec modération pour l'accent

### Accessibilité
- Évitez les couleurs trop fades pour le texte principal
- Maintenez le contraste: texte sombre sur fond clair
- Utilisez gras/italique plutôt que couleur seule pour l'emphase

### Structure Documentaire
- H1 pour le titre principal
- H2 pour les sections majeures
- H3 pour les sous-sections
- H4 pour les détails

### Listes Cohérentes
- Puces pour les listes non hiérarchiques
- Numéros pour les processus ou priorités
- Consistance au sein d'une section

### Formes Décoratives
- Une forme par section maximum
- Utilisez les séparateurs pour créer des ruptures visuelles
- Les petites formes sont plus subtiles

---

## Raccourcis et Conseils Avancés

### Sélection Rapide de Couleurs
```
Clic sur le code hexadécimal → Copier → Insérer dans le sélecteur
```

### Appliquer des Styles à Plusieurs Blocs
```
1. Configurez le style sur le premier bloc
2. Copier le style (à implémenter)
3. Coller sur d'autres blocs (à implémenter)
```

### Exporter avec Styles
- Les styles sont préservés dans l'export PDF
- Les polices Google Fonts sont embarquées
- Les couleurs sont fidèles à l'écran

---

## Dépannage

### Le texte ne change pas de couleur
- Vérifiez que le bloc est de type texte (non table, image)
- Assurez-vous d'avoir sauvegardé les changements

### Les polices n'apparaissent pas
- Vérifiez la connexion internet (Google Fonts)
- Rafraîchissez la page

### Les styles ne se sauvegardent pas
- Vérifiez que le localStorage est activé
- Consultez la console pour les erreurs

### La Zone d'Orientation ne génère pas de pages
- Activez au moins une section (TdM, illustrations ou tableaux)
- Vérifiez qu'il y a du contenu pour générer (titres, images, tableaux)

---

## Contact et Support

Pour des questions, suggestions ou rapports de bugs concernant ces nouvelles fonctionnalités, veuillez consulter la documentation technique en `ENHANCEMENTS.md`.

---

**Dernière mise à jour**: 2 Avril 2026
