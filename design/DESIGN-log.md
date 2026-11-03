---
version: alpha
name: log-design-system
description: >
  Un systeme de bois coupe. Un noir chaud tire du logo, un blanc casse, et un seul
  accent ambre qui ne sert jamais qu'aux actions. Deux volumes d'un meme langage :
  vitrine pour l'app mobile, ou la photo du produit porte l'ecran, et utilitaire pour
  le back-office, ou la densite prime. Aucun degrade decoratif, une seule ombre, une
  grammaire de rayons stricte. Tous les contrastes sont calcules, pas estimes.

colors:
  accent: "#9A5518"
  accent-soft: "#FBF0E3"
  accent-on-dark: "#D18A45"
  ink: "#17150F"
  ink-2: "#55504A"
  ink-3: "#696257"
  canvas: "#FFFFFF"
  canvas-warm: "#F6F4F0"
  surface-dark: "#17150F"
  on-dark: "#FFFFFF"
  on-dark-2: "#B5AEA3"
  line: "#E3DFD8"
  line-strong: "#938B80"
  ok: "#15603A"
  ok-soft: "#E7F1EB"
  ok-on-dark: "#5BB881"
  danger: "#B3261E"
  danger-soft: "#FBEAE8"
  danger-on-dark: "#F08A82"
  focus: "#9A5518"

typography:
  display-xl:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 34px
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -0.025em
  display-lg:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: -0.025em
  title-1:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: -0.02em
  title-2:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.44
    letterSpacing: -0.01em
  lead:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.57
    letterSpacing: 0
  body-strong:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0
  small:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.54
    letterSpacing: 0
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: 0.08em
    textTransform: uppercase
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.54
    letterSpacing: 0
  mono-small:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  button-lg:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  fine-print:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  none: 0px
  sm: 6px
  md: 10px
  lg: 16px
  pill: 999px
  full: 999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 0 18px
    height: 44px
  button-primary-mobile:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.sm}"
    padding: 0 24px
    height: 52px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 0 18px
    height: 44px
    border: 1px solid "{colors.line-strong}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink-2}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 0 14px
    height: 44px
  button-danger:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.danger}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 0 18px
    height: 44px
    border: 1px solid "{colors.danger}"
  button-icon:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    size: 44px
    border: 1px solid "{colors.line-strong}"
  input-text:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 0 12px
    height: 44px
    border: 1px solid "{colors.line-strong}"
  input-invalid:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    border: 1px solid "{colors.danger}"
  badge-ok:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    typography: "{typography.fine-print}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  badge-neutral:
    backgroundColor: "{colors.canvas-warm}"
    textColor: "{colors.ink-2}"
    typography: "{typography.fine-print}"
    rounded: "{rounded.pill}"
    padding: 4px 11px
    border: 1px solid "{colors.line}"
  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.fine-print}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  chip-filter:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: 0 14px
    height: 36px
    border: 1px solid "{colors.line-strong}"
  chip-filter-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.pill}"
    height: 36px
  panel:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    border: 1px solid "{colors.line}"
  table-header:
    backgroundColor: "{colors.canvas-warm}"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    padding: 12px 16px
  table-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: 14px 16px
  table-row-selected:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.ink}"
  side-nav:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    padding: "{spacing.lg}" "{spacing.md}"
    width: 232px
  side-nav-item:
    backgroundColor: transparent
    textColor: "{colors.line}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: 44px
  side-nav-item-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.sm}"
    height: 44px
  alert-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 14px 18px
  tab-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-3}"
    typography: "{typography.fine-print}"
    height: 56px
    border: 1px solid "{colors.line}"
  tab-item-active:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    typography: "{typography.fine-print}"
  product-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
    border: 1px solid "{colors.line}"
  product-tile-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: "{spacing.section}" "{spacing.lg}"
  variant-swatch:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    size: 48px
    border: 1px solid "{colors.line-strong}"
  variant-swatch-selected:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    size: 48px
    border: 2px solid "{colors.accent}"
  sticky-cta:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    height: 76px
    padding: "{spacing.sm}" "{spacing.md}"
    border: 1px solid "{colors.line}"
---

## Overview

Le systeme part d'une seule image : **une buche coupee**. Le logo en donne les trois
valeurs, un noir chaud, un blanc, et des cernes. Tout le reste en decoule.

Une regle structure l'ensemble : **l'ambre `{colors.accent}` ne designe jamais qu'une
action**. Un bouton, un filtre actif, un onglet courant, une ligne selectionnee. Jamais
un statut, jamais un niveau de stock, jamais une alerte. Du coup un utilisateur apprend
une seule chose en arrivant sur l'app, et elle reste vraie dans le back-office.

Le systeme s'exprime a **deux volumes**, comme une marque qui aurait une vitrine et un
arriere-boutique.

| | Volume vitrine | Volume utilitaire |
|---|---|---|
| Ou | App mobile client | Back-office web |
| Corps de texte | `{typography.lead}` 17px | `{typography.body}` 14px |
| Rythme vertical | `{spacing.section}` 64px entre blocs | `{spacing.lg}` 24px entre blocs |
| Densite | Un produit par ecran, la photo porte | Sept colonnes par ligne, le texte porte |
| Rayons | `{rounded.lg}` cartes, `{rounded.sm}` controles | `{rounded.md}` panneaux, `{rounded.sm}` controles |
| Surfaces sombres | Tuiles produit pleine largeur | Colonne de navigation |

Les tokens sont les memes. Seules la taille du corps, la densite et la place de l'image
changent. C'est ce qui permet a une personne qui maquette le mobile et une personne qui
maquette le back-office de produire deux ecrans qui se ressemblent sans se parler.

**Caracteristiques :**
- Un seul accent, reserve aux actions. Il n'existe pas de deuxieme couleur de marque.
- Aucun degrade decoratif. La profondeur vient du changement de surface, clair vers sombre.
- Une seule ombre dans tout le systeme, sous les visuels produit poses sur une surface.
- Une grammaire de rayons stricte, quatre valeurs, rien entre les deux.
- Chaque couple de couleurs a son ratio de contraste calcule et inscrit dans ce document.
- Tout badge porte un libelle texte, parce que le vert et le rouge ont presque la meme clarte.

## Colors

> Tous les ratios ci-dessous sont **calcules**, formule WCAG 2.1 de luminance relative.
> Seuils : 4,5:1 pour du texte, 3:1 pour une bordure de controle ou un element porteur de sens.

### Accent

- **Ambre bois** (`{colors.accent}`, #9A5518). Le seul signal d'action du systeme. Boutons
  primaires, filtre actif, onglet courant, lien. **5,70:1** sur `{colors.canvas}`, et
  **5,70:1** pour du blanc pose dessus, donc il fonctionne dans les deux sens.
- **Ambre tendre** (`{colors.accent-soft}`, #FBF0E3). Fond de ligne selectionnee et de
  badge accent. Du texte `{colors.accent}` dessus donne **5,07:1**, du `{colors.ink}`
  donne **16,23:1**.
- **Ambre clair** (`{colors.accent-on-dark}`, #D18A45). Reserve aux **surfaces sombres
  uniquement**. L'ambre de base n'y tient pas, il tombe a 3,20:1 contre
  `{colors.surface-dark}`. Celui-ci remonte a **6,46:1**. Sur blanc il tombe a 2,83:1,
  donc il ne doit jamais sortir d'une surface sombre.

### Surface

- **Blanc** (`{colors.canvas}`, #FFFFFF). La surface par defaut. Panneaux, cartes, lignes
  de tableau, fond des ecrans mobiles.
- **Blanc casse chaud** (`{colors.canvas-warm}`, #F6F4F0). Fond de page du back-office,
  en-tetes de tableau, pieds de panneau. Juste assez different du blanc pour poser un
  rythme sans tracer de trait.
- **Noir chaud** (`{colors.surface-dark}`, #17150F). Meme valeur que `{colors.ink}`,
  volontairement : la couleur du texte et celle des surfaces sombres sont la meme encre.
  Colonne de navigation du back-office, tuiles produit du mobile. Du blanc dessus donne
  **18,25:1**.

### Text

- **Encre** (`{colors.ink}`, #17150F). Titres et corps de texte. **18,25:1** sur blanc,
  **16,61:1** sur `{colors.canvas-warm}`.
- **Encre secondaire** (`{colors.ink-2}`, #55504A). Descriptions, texte d'aide, libelles
  de boutons fantomes. **7,98:1** sur blanc, **7,26:1** sur warm.
- **Encre tertiaire** (`{colors.ink-3}`, #696257). En-tetes de colonnes, libelles de
  champs, compteurs. **6,03:1** sur blanc, **5,48:1** sur warm. C'est le plus clair des
  trois gris qui passe encore sur les deux fonds : ne pas aller plus clair.
- **Sur sombre** (`{colors.on-dark}`, #FFFFFF) et **sur sombre secondaire**
  (`{colors.on-dark-2}`, #B5AEA3, **8,30:1**).

### Etats

- **Vert** (`{colors.ok}`, #15603A) sur **vert tendre** (`{colors.ok-soft}`, #E7F1EB) :
  **6,57:1**. Produit actif, stock suffisant.
- **Rouge** (`{colors.danger}`, #B3261E) sur **rouge tendre** (`{colors.danger-soft}`,
  #FBEAE8) : **5,61:1**. Rupture, suppression, champ invalide.
- Variantes sur sombre : `{colors.ok-on-dark}` #5BB881 (**7,49:1**),
  `{colors.danger-on-dark}` #F08A82 (**7,53:1**).

> **Le piege a connaitre.** `{colors.ok}` et `{colors.danger}` ont presque la meme
> luminance relative, leur contraste mutuel n'est que de **1,16:1**. Quelqu'un qui
> percoit mal les rouges ne les distingue pas. D'ou la regle : **tout badge porte un
> libelle texte**, et un etat intermediaire comme le stock bas reste un badge neutre
> avec le nombre en gras, jamais une troisieme couleur.

### Lignes

- **Filet** (`{colors.line}`, #E3DFD8). Separateurs et bordures de panneaux. **1,33:1**
  sur blanc, donc **purement decoratif** : il ne doit jamais porter une information.
- **Filet fort** (`{colors.line-strong}`, #938B80). Bordures de champs, de boutons
  secondaires, de puces de filtre. **3,36:1** sur blanc et **3,06:1** sur warm, soit le
  minimum requis pour un contour de controle.

### Degrade de marque

**Aucun.** La profondeur vient du passage d'une surface claire a une surface sombre, et
d'une seule ombre sous les visuels produit. Pas de degrade decoratif, nulle part.

## Typography

### Familles

- **Interface** : `Manrope, system-ui, sans-serif`. Geometrique, legerement technique,
  gratuite sur Google Fonts, graisses 200 a 800.
- **Technique** : `JetBrains Mono, ui-monospace, monospace`. Pour tout ce qui est
  reference ou nombre compare : SKU, EAN, identifiants, prix et quantites en colonne.
  Dessinee pour le code, ce qui va bien avec un produit qui s'appelle log.

### Hierarchie

| Token | Taille | Graisse | Interligne | Approche | Usage |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 34px | 800 | 1.08 | -0.025em | Titre d'accueil mobile |
| `{typography.display-lg}` | 28px | 800 | 1.15 | -0.025em | Titre de tuile produit, nom de produit sur la fiche |
| `{typography.title-1}` | 24px | 800 | 1.33 | -0.02em | Titre de page du back-office |
| `{typography.title-2}` | 18px | 600 | 1.44 | -0.01em | Titre de section, de panneau, de carte |
| `{typography.lead}` | 17px | 400 | 1.5 | 0 | Corps de texte mobile |
| `{typography.body}` | 14px | 400 | 1.57 | 0 | Corps de texte du back-office |
| `{typography.body-strong}` | 14px | 600 | 1.5 | 0 | Nom de produit dans un tableau |
| `{typography.small}` | 13px | 400 | 1.54 | 0 | Aide de saisie, message sous un champ |
| `{typography.label}` | 11px | 600 | 1.45 | 0.08em | En-tete de colonne, libelle de champ, capitales |
| `{typography.mono}` | 13px | 500 | 1.54 | 0 | SKU, prix, quantites |
| `{typography.mono-small}` | 12px | 400 | 1.5 | 0 | Reference secondaire sous un titre |
| `{typography.button}` | 14px | 600 | 1.0 | 0 | Libelle de bouton, back-office |
| `{typography.button-lg}` | 16px | 600 | 1.0 | 0 | Libelle de bouton, mobile |
| `{typography.fine-print}` | 12px | 400 | 1.4 | 0 | Badge, legende, mentions |

### Principes

- **Deux corps de texte, pas un.** 17px sur mobile, 14px dans le back-office. Ce n'est pas
  une incoherence, c'est le passage d'un volume a l'autre : on lit sur mobile, on balaie
  dans un tableau. 16px dans le back-office couterait une colonne par ecran.
- **Approche negative au-dessus de 18px seulement.** Les titres se resserrent de -0,01 a
  -0,025em. En dessous, jamais : a 11px l'approche est au contraire **positive**, +0,08em,
  parce qu'un libelle en capitales a besoin d'air.
- **Echelle de graisses : 400 / 500 / 600 / 800.** Le 500 est reserve au mono, le 700
  n'existe pas. Un titre est en 800, une emphase en 600.
- **Le mono est aligne a droite** des qu'il s'agit d'un nombre dans une colonne. C'est ce
  qui permet de comparer deux prix a l'oeil sans les lire.
- **Interlignes contextuels.** Les titres serrent entre 1,08 et 1,44. Les corps de texte
  respirent a 1,5 et 1,57.

### Substituts

Manrope et JetBrains Mono sont toutes deux libres et servies par Google Fonts, donc il n'y
a pas de substitution a prevoir. Si l'une venait a manquer, la pile systeme prend le
relais et le seul reglage a refaire est l'approche des titres : `system-ui` est un peu plus
large que Manrope, il faut descendre de 0,005em supplementaire.

## Layout

### Espacements

- **Base 4px.** Tokens : `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 ·
  `{spacing.md}` 16 · `{spacing.lg}` 24 · `{spacing.xl}` 32 · `{spacing.xxl}` 48 ·
  `{spacing.section}` 64.
- **Back-office** : 32px de marge de page, 24px entre blocs, 24px dans un panneau,
  14px x 16px dans une cellule de tableau.
- **Mobile** : 16px de marge laterale, 64px entre deux sections de vitrine, 12px dans une
  carte produit.
- **Boutons** : hauteur 44px au back-office, 52px pour une action primaire mobile. Jamais
  en dessous de 44px, c'est la cible tactile minimale.

### Grille et contenants

- Back-office : colonne de navigation de 232px fixe, contenu fluide a partir de 560px,
  tableaux a `min-width` avec defilement horizontal dans leur boite.
- Mobile : une seule colonne, 390px de reference, grille de deux cartes produit a partir
  de 360px de large.
- Les tuiles produit du mobile sont **pleine largeur**, sans marge laterale ni rayon : le
  changement de surface fait la separation.

### Philosophie du vide

Les deux volumes n'ont pas la meme respiration et c'est voulu. En vitrine, un visuel
produit a au moins 24px de vide autour et une section commence par 64px d'air. En
utilitaire, le vide est un cout : on descend a 24px entre blocs et 14px dans une ligne.
Le seul endroit ou le back-office respire, c'est l'en-tete de page.

## Elevation & Depth

| Niveau | Traitement | Usage |
|---|---|---|
| Plat | Aucune ombre, aucune bordure | Tuiles pleine largeur, colonne de navigation, lignes de tableau |
| Filet | 1px `{colors.line}` | Panneaux, cartes, separateurs |
| Contour de controle | 1px `{colors.line-strong}` | Champs, boutons secondaires, puces de filtre |
| Ombre produit | `0 8px 24px rgba(23, 21, 15, 0.12)` | Visuel produit pose sur une surface, et rien d'autre |
| Barre flottante | `0 -2px 16px rgba(23, 21, 15, 0.10)` | Barre d'action collee en bas d'un ecran mobile |

**Philosophie.** Deux ombres dans tout le systeme, et elles ont chacune une seule raison
d'etre. La premiere donne du poids a un produit pose sur une surface. La seconde dit qu'une
barre flotte au-dessus du contenu qui defile dessous, ce dont le mobile a besoin et pas le
web. Nulle part ailleurs : pas sur un bouton, pas sur une carte, pas sur un panneau, pas
sur du texte. Quand une hierarchie manque, on change de surface avant d'ajouter une ombre.

## Shapes

| Token | Valeur | Usage |
|---|---|---|
| `{rounded.none}` | 0px | Tuiles produit pleine largeur |
| `{rounded.sm}` | 6px | Champs, boutons, puces de navigation, nuanciers de variante |
| `{rounded.md}` | 10px | Panneaux et cartes du back-office |
| `{rounded.lg}` | 16px | Cartes produit et feuilles du mobile |
| `{rounded.pill}` | 999px | Badges, puces de filtre |
| `{rounded.full}` | 999px | Avatars, boutons icone ronds poses sur une photo |

**Geometrie des images.** Les visuels produit sont des rendus detoures sur fond clair,
carres en grille, 4:3 sur une fiche. Le rayon interieur d'une image dans une carte est
`{rounded.sm}`, un cran en dessous du rayon de la carte, pour que le contour reste
parallele.

## Components

### Navigation

**`side-nav`** — La colonne du back-office. Fond `{colors.surface-dark}`, 232px, trois
groupes separes par un libelle `{typography.label}` en `{colors.on-dark-2}` : Pilotage,
Catalogue, Ventes. En bas, l'identite de la personne connectee et son role. Chaque entree
fait 44px de haut.

**`side-nav-item-active`** — L'entree courante prend le fond `{colors.accent}` et
`aria-current="page"`. C'est le seul endroit du back-office ou l'accent remplit une grande
surface.

**`tab-bar`** — La barre du mobile, 56px plus la zone sure du bas, fond `{colors.canvas}`,
filet superieur `{colors.line}`. Cinq onglets maximum : Accueil, Recherche, Panier,
Commandes, Compte. L'onglet actif passe en `{colors.accent}`, icone et libelle ensemble,
jamais l'icone seule.

### Boutons

**`button-primary`** — L'action du systeme. Fond `{colors.accent}`, texte blanc,
`{rounded.sm}`, 44px. Une seule par ecran, ou par zone d'un ecran.

**`button-primary-mobile`** — La meme, a 52px et `{typography.button-lg}`, pour le pouce.

**`button-secondary`** — Fond blanc, contour `{colors.line-strong}`, texte `{colors.ink}`.
L'action de repli a cote de la primaire.

**`button-ghost`** — Sans fond ni contour, texte `{colors.ink-2}`. Pour les actions
annexes d'une barre d'outils, jamais seule dans un formulaire.

**`button-danger`** — Fond blanc, contour et texte `{colors.danger}`. Archiver, supprimer.
Jamais rempli : une action destructrice ne doit pas etre le bouton le plus visible.

**`button-icon`** — 44x44, contour `{colors.line-strong}`. `aria-label` obligatoire.

### Formulaires

**`input-text`** — 44px, contour `{colors.line-strong}` a 3,36:1, rayon `{rounded.sm}`.
Son libelle est un `{typography.label}` au-dessus, jamais un placeholder : un placeholder
disparait des qu'on tape.

**`input-invalid`** — Le contour passe `{colors.danger}` et un message
`{typography.small}` en `{colors.danger}` s'ajoute sous le champ. La couleur seule ne
suffit jamais, le message est obligatoire.

**`variant-swatch`** / **`variant-swatch-selected`** — Les choix de declinaison sur la
fiche produit, 48x48. Selectionne, le nuancier prend un contour 2px `{colors.accent}` et
le fond `{colors.accent-soft}`. Une variante en rupture est barree et `disabled`, pas
masquee : savoir qu'elle existe mais n'est pas dispo est une information.

### Donnees

**`table-header`** — Fond `{colors.canvas-warm}`, libelles `{typography.label}` en
`{colors.ink-3}`. Les colonnes de nombres sont alignees a droite, en-tete compris.

**`table-row`** / **`table-row-selected`** — Ligne blanche, filet inferieur
`{colors.line}`. Selectionnee, elle passe sur `{colors.accent-soft}`. La premiere cellule
d'une ligne est un `<th scope="row">`, pas un `<td>`.

**`badge-ok`**, **`badge-neutral`**, **`badge-danger`** — Trois badges et pas quatre.
L'etat intermediaire, typiquement un stock sous son seuil, est un `badge-neutral` avec le
nombre en `{colors.ink}` gras, ce qui evite d'introduire un orange qui se confondrait avec
l'accent.

**`chip-filter`** / **`chip-filter-selected`** — Les facettes. Contour
`{colors.line-strong}` au repos, fond `{colors.accent}` une fois actives, avec
`aria-pressed`. Chaque puce porte son compteur en `{typography.mono-small}`.

**`alert-danger`** — Bandeau `{colors.danger-soft}`, rayon `{rounded.md}`, une icone, un
texte, et un lien d'action aligne a droite. Utilise pour les ruptures de stock en tete de
liste.

### Vitrine

**`product-tile-dark`** — La tuile pleine largeur du mobile. Fond
`{colors.surface-dark}`, titre `{typography.display-lg}` en blanc, sous-titre en
`{colors.on-dark-2}`, lien en `{colors.accent-on-dark}`. Rayon zero, marges laterales
zero : le changement de surface fait la coupure.

**`product-card`** — La carte de grille, rayon `{rounded.lg}`, filet `{colors.line}`.
Visuel carre en haut au rayon `{rounded.sm}`, nom en `{typography.body-strong}` sur deux
lignes maximum, prix en `{typography.mono}`, note en etoiles en dessous.

**`sticky-cta`** — La barre d'achat collee en bas de la fiche produit. Fond blanc, filet
superieur, ombre de barre flottante. Prix a gauche, `button-primary-mobile` a droite.
Elle se superpose au contenu, donc la fiche reserve 76px de vide en bas.

## Do's and Don'ts

### A faire

- Reserver `{colors.accent}` aux actions, et seulement aux actions.
- Donner un libelle texte a chaque badge, l'icone et la couleur ne suffisent pas.
- Utiliser `{colors.accent-on-dark}` des qu'on pose un lien sur `{colors.surface-dark}`.
- Aligner a droite et passer en `{typography.mono}` tout nombre dans une colonne.
- Mettre le libelle d'un champ au-dessus du champ, en `{typography.label}`.
- Garder 44px de hauteur minimale pour toute cible cliquable, 52px sur mobile.
- Changer de surface, clair vers sombre, avant d'envisager d'ajouter une ombre.
- Marquer une variante indisponible comme `disabled` et la laisser visible.

### A ne pas faire

- Ne pas introduire une deuxieme couleur de marque. Il n'y en a qu'une.
- Ne pas utiliser l'accent pour un statut, un niveau de stock ou une alerte.
- Ne pas sortir `{colors.accent-on-dark}` d'une surface sombre : 2,83:1 sur blanc, il echoue.
- Ne pas poser d'ombre sur un bouton, une carte, un panneau ou du texte.
- Ne pas employer de degrade decoratif.
- Ne pas faire porter une information a `{colors.line}`, qui est a 1,33:1 : utiliser
  `{colors.line-strong}` des qu'un contour doit etre vu.
- Ne pas descendre sous 14px pour du texte lu, ni ajouter une approche negative en dessous
  de 18px.
- Ne pas melanger les rayons : 6 pour les controles, 10 pour les panneaux, 16 pour les
  cartes mobiles, 999 pour les badges, et rien entre les deux.
- Ne pas remplir un bouton destructeur.
- Ne pas mettre un libelle uniquement dans un placeholder.

## Responsive Behavior

### Points de rupture

| Nom | Largeur | Changements |
|---|---|---|
| Petit telephone | <= 375px | Grille produit a une colonne, titre d'accueil a 28px |
| Telephone | 376 - 640px | Grille a deux colonnes, barre d'onglets fixe en bas |
| Tablette | 641 - 1023px | Le back-office passe la navigation au-dessus du contenu, les tableaux defilent |
| Petit bureau | 1024 - 1279px | Navigation laterale de retour, tableaux en 5 colonnes visibles |
| Bureau | >= 1280px | Mise en page complete, 7 colonnes, panneaux cote a cote |

### Strategie de repli

- **Navigation du back-office** : colonne de 232px a partir de 1024px, empilee au-dessus du
  contenu en dessous. Elle n'est jamais collante et ne fait jamais `100vh`, sinon elle
  mange l'ecran sur telephone.
- **Tableaux** : jamais reorganises en cartes, toujours une boite a defilement horizontal
  avec un `min-width`. Un tableau qu'on transforme en cartes perd la comparaison entre
  lignes, qui est tout l'interet du tableau.
- **Barres d'outils** : `flex-wrap`, elles passent a la ligne plutot que de deborder.
- **Formulaires** : deux colonnes au-dessus de 1024px, une seule en dessous.
- **Fiche produit mobile** : le visuel passe de 4:3 a carre sous 376px, la barre d'achat
  reste collee.

### Cibles tactiles

44x44 minimum partout, 52px pour une action primaire mobile. Les puces de filtre
descendent a 36px de haut, ce qui est en dessous du seuil : c'est accepte parce qu'elles
sont larges et groupees, mais elles ne doivent jamais etre la seule facon d'atteindre une
fonction.

## Iteration Guide

1. Un composant a la fois, nomme par sa cle YAML (`{components.table-row-selected}`).
2. Les variantes d'un composant existant vivent comme des entrees separees, suffixees
   `-selected`, `-invalid`, `-mobile`, `-on-dark`.
3. Toujours referencer un token, jamais ecrire un hexadecimal en dur.
4. Documenter l'etat par defaut et l'etat actif ou selectionne. Le survol n'est pas
   documente : il n'existe pas sur mobile.
5. Avant d'ajouter une couleur, verifier qu'aucune combinaison existante ne repond au
   besoin. Le systeme tient a seize couleurs, c'est voulu.
6. Toute nouvelle couleur arrive avec son ratio de contraste calcule, inscrit dans ce
   document, et un seuil declare.

## Known Gaps

- **Theme sombre complet non defini.** `{colors.surface-dark}` sert de surface
  ponctuelle, navigation et tuiles, pas de mode sombre general. Les variantes `-on-dark`
  existantes sont un debut, pas un theme.
- **Etats de survol et de focus partiellement specifies.** L'anneau de focus est
  `{colors.focus}` a 2px, mais les etats de survol ne sont pas documentes, conformement au
  point 4 du guide d'iteration.
- **Animations et transitions absentes.** Aucune duree ni courbe n'est fixee.
- **Composants de graphiques non couverts.** Le tableau de bord KPI, tache `O14`, aura
  besoin d'une palette de series et de regles d'axes qui n'existent pas encore ici.
- **Iconographie non fixee.** Les maquettes utilisent des traces SVG a 2px dessines a la
  main. Choisir une bibliotheque, Lucide par exemple, reste a faire.
- **Les ratios de contraste des combinaisons sur surface sombre** autres que celles
  listees ne sont pas calcules.
