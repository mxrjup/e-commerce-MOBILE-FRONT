# C14 — Fiche produit mobile

## Périmètre et sources

Implémentation dans e-commerce-MOBILE-FRONT uniquement, sans changement backend,
sans dépendance ajoutée et sans commit/push/PR.

- Issue : https://github.com/mxrjup/e-commerce-BACK/issues/47
- Avis C08 : https://github.com/mxrjup/e-commerce-BACK/issues/43 (ouverte lors de la consultation).
- Conventions lues : `CLAUDE.md`, `AGENT.md`, `AGENTS.md`.
- Design disponible : `design/DESIGN-log.md`, tokens `src/constants/theme.ts`,
  composants `Choice`, `ThemedText`, `ThemedView`.
- Backend inspecté en lecture seule : `../backend`, révision
  `519241e7c92cbdb012cd608a215eda9c4b2051b7`.
- Contrat : `catalog-service/src/main/java/com/ecommerce/catalog/dto/ProductDetailResponse.java`.
- Publication et 404 : `catalog-service/src/main/java/com/ecommerce/catalog/service/ProductCatalogService.java`.
- Route : `catalog-service/src/main/java/com/ecommerce/catalog/controller/ProductController.java`.
- Gateway : `api-gateway/src/main/resources/application.yml`.
- Documentation vérifiée pour Expo 58 :
  https://docs.expo.dev/versions/v58.0.0/,
  https://docs.expo.dev/versions/v58.0.0/sdk/image/,
  https://docs.expo.dev/router/reference/url-parameters/,
  https://reactnative.dev/docs/panresponder.

## Comportement livré

- La route existante `/product/[id]` est conservée. `id` est le **slug**, pas l’ID numérique.
  `useLocalSearchParams` transmet le slug au chargement public
  `GET /api/catalog/products/{slug}`, avec `auth: false`, encodage du segment,
  validation du DTO, annulation, délai de 15 secondes et protection contre les réponses obsolètes.
- États chargement, erreur réseau/HTTP, 404 et réessai ; retour explicite vers `/catalog`.
- Nom, marque, catégorie, description native, caractéristiques `key/value`, SKU,
  prix TTC, ancien prix uniquement s’il est supérieur au prix actuel, éco-participation.
- Attributs issus du DTO ; seuls des objets variante réellement reçus sont sélectionnés.
  Les attributs sont hiérarchiques : modifier un attribut conserve les précédents et
  ajuste les suivants si nécessaire. Les variantes indisponibles restent consultables.
  Prix, images, SKU et disponibilité changent ensemble.
- Disponibilité : `available=false` → Indisponible ; sinon `lowStock=true` → Stock faible ;
  sinon Disponible. Aucune quantité de stock calculée ou affichée.
- Galerie de la variante : miniatures, précédente/suivante, plein écran, pincement
  de 1× à 4×, déplacement borné, boutons de zoom et réinitialisation. Retour Android
  ferme la modale. Changer de variante réinitialise la galerie ; changer d’image
  réinitialise le zoom. États sans image et erreur de chargement.
- Les images sont exclusivement les URLs HTTP(S) du backend ; aucune image de remplacement.
- HTML converti en texte natif avec paragraphes et entités courantes. Aucune WebView,
  aucun script, lien actif ou contenu embarqué. Le style riche du HTML n’est pas conservé.
- Thèmes existants, SafeAreaView, scroll, contrôles accessibles et options repliables
  sur plusieurs lignes. Visuel carré sur petit téléphone, 4:3 ailleurs.

## Avis et accessoires : contrats manquants

La recherche des contrôleurs et DTO Java du backend, des mappings catalog et des routes
gateway n’a trouvé aucun endpoint d’avis, de notes ou d’accessoires associés. Le DTO
produit n’expose aucune de ces données. L’issue C08 décrit la fonctionnalité future,
elle ne constitue pas un contrat disponible.

`ProductReviews` et `ProductAccessories` sont des sections isolées et réutilisables,
avec un message « pas encore disponibles ». Aucun zéro avis, moyenne, commentaire,
accessoire ou endpoint conjectural n’est injecté.

À préciser côté backend avant intégration :

| Ressource | Informations et sémantique nécessaires |
| --- | --- |
| Avis | Route GET publique et clé produit (slug ou ID), moyenne et échelle de notation, nombre total d’avis, liste paginée et ordre ; pour chaque avis : identifiant stable, note, commentaire, auteur public/anonymisé, date ; règles de modération et comportement produit absent. |
| Accessoires | Route GET publique ou champ de relation dans le détail, clé produit, ordre/pagination ; pour chaque accessoire : identifiant stable, **slug de navigation**, titre, image éventuelle, prix TTC/devise et disponibilité si affichés ; distinction entre aucune association et service indisponible. |

Aucun nouveau contrat d’écriture d’avis ni aucune API backend n’est développé ici.

## Compatibilité panier et catalogue

Le bouton « Voir mon panier » utilise `/cart`. Aucun total ni mutation de panier n’est
réimplémenté. L’identifiant numérique de la variante reste disponible dans le modèle
pour une future intégration au service panier commun.

Le panier actuel appelle `/api/cart` sans conserver `X-Session-Token`. Le backend
`cart-service/.../controller/CartController.java` utilise ce jeton pour le panier invité
et le renvoie dans un header et dans `CartResponse`. Ajouter un achat ici en recopiant
ces appels ne garantirait pas sa présence lors de l’ouverture du panier. La fiche ne
propose donc pas d’ajout au panier ; la correction de session commune reste hors C14.
La barre basse est réservée à la navigation panier, sans masquer le scroll.

À la demande complémentaire de l’utilisateur, le catalogue et les rubriques sont
maintenant branchés sur `GET /api/catalog/products`. Chaque carte ouvre
`/product/<slug>`. Les rubriques transmettent leur slug dans `category`, `brand` ou
`universe`. Le catalogue permet de combiner ces trois filtres, avec une sélection
par famille comme le prévoit le backend, et de les réinitialiser.
Les pages de 12 produits se remplacent sans accumulation ; changer les filtres
revient à la première page. Chargement, erreur/réessai et résultat vide sont explicites.
La recherche textuelle de produits et les facettes C12 ne sont pas ajoutées ici.

Fichiers supplémentaires pour ce branchement :

- `src/components/pages/catalog/catalog-page.tsx`
- `src/components/pages/catalog/catalog-reference-page.tsx`
- `src/components/pages/catalog/catalog-filters.tsx`
- `src/components/pages/catalog/catalog-filter-group.tsx`
- `src/components/shared/catalog/catalog-products.tsx`
- `src/services/product-list.ts`
- `tests/product-list.test.mjs`

`catalog-api.ts` et `tests/product-page.test.mjs` ont également été étendus.
Validation finale de ce complément : TypeScript et lint réussis, **46 tests réussis**,
dont rendu d’une carte et navigation effective du bouton vers le slug via le routeur
substitué. API locale : 17 produits (pages de 12 puis 5, sans doublon), catégorie
Claviers 3 produits, marque Logitech 4, univers Gaming 11, Claviers + Logitech 2,
marque inexistante 0. Pour chaque liste non vide, le premier slug a été résolu vers
sa fiche et l’identité produit vérifiée. Aucun contrôle visuel supplémentaire
sur appareil ou navigateur n’a été réalisé.

## Fichiers modifiés / ajoutés

- `src/app/product/[id].tsx`
- `src/components/pages/product/product-page.tsx`
- `src/components/pages/product/product-gallery.tsx`
- `src/components/pages/product/product-logic.ts`
- `src/components/pages/product/product-sections.tsx`
- `src/components/pages/product/use-product.ts`
- `src/services/catalog-api.ts`
- `src/services/product-detail.ts`
- `tests/product-detail.test.mjs`
- `tests/product-page.test.mjs`
- `tsconfig.json` : imports `.ts` explicites compatibles avec les tests Node existants.
- `docs/c14-product-detail.md`

Les fichiers préexistants non suivis `Diagram BDD.txt` et
`docs/c12-product-search.md` n’ont pas été modifiés.

## Vérifications du 17 novembre 2026

- `npm ci` : réussi après relance hors sandbox (premier essai : EPERM Windows).
  npm signale 10 vulnérabilités modérées dans l’arbre verrouillé ; aucune mise à jour
  de dépendance ni `audit fix` hors périmètre.
- `npx tsc --noEmit` : réussi.
- `npm run lint` : réussi hors sandbox.
- `npm test` : **39 tests réussis**, dont 17 nouveaux. Les tests de rendu utilisent
  React DOM Server et React Native Web déjà installés, avec frontière plateforme,
  hook réseau et routeur substitués. Ce ne sont pas des tests tactiles natifs.
- Cas couverts : slug public et encodé, pas de token, HTTP 403/404/503, réseau/retry,
  annulation, DTO malformé, combinaisons de variantes disjointes, prix/images/SKU,
  promotions, états de stock, absence d’image, description HTML inerte, états vides,
  bornes du zoom, rendu chargement/succès/404/erreur, boutons retry/catalogue/panier.
- API locale réelle : **17 produits et 28 variantes** validés via le service mobile ;
  slug inexistant → HTTP 404. Aucune donnée écrite au backend.
- Expo web : compilation et réponse **HTTP 200** de
  `/product/crucial-pro-ddr5-6000` sur le serveur local de vérification.
- `npx expo export --platform android --output-dir .expo/c14-android` : réussi,
  1403 modules, bundle Hermes. Premier essai sandbox bloqué par `spawn EPERM`,
  relance hors sandbox réussie. Artefacts dans `.expo/` ignoré par Git.
- `git diff --check` : réussi.

**Limites explicites :** aucun parcours visuel exécuté dans un navigateur ni sur
émulateur Android/iOS. L’hôte navigateur et le canal d’automatisation Windows sont
indisponibles ; `adb devices` ne liste aucun appareil connecté. Les 17 produits
locaux ont des listes d’images vides. Le pincement, le déplacement, le retour natif,
TalkBack, les thèmes et la mise en page sur appareil doivent encore être exercés.
L’export Android n’est ni un build APK ni une preuve d’exécution sur appareil.

## Proposition de PR

Titre : `feat(product): implement mobile product detail page`

Description :

Remplace la fiche temporaire par une fiche publique chargée par slug depuis le
catalogue. Affiche les variantes existantes avec prix TTC, promotions, SKU,
disponibilité, description sécurisée et caractéristiques techniques. Branche aussi
les rubriques et le catalogue sur les listes paginées réelles, leurs filtres et les
liens vers les fiches par slug. Ajoute la
galerie avec plein écran et zoom tactile, ainsi que les états de chargement,
d’erreur, de produit absent et de réessai.

Les avis et accessoires ont des états vides explicites : leurs endpoints ne sont
pas encore présents dans le backend inspecté. Les contrats attendus et la limite
de session du panier existant sont documentés dans `docs/c14-product-detail.md`.
Aucune dépendance ni API backend ajoutée.

Validation : npm ci, TypeScript, lint, 46 tests, validation de 17 produits/28 variantes
réels, route web HTTP 200 et export Android/Hermes. Validation tactile et visuelle
sur appareil encore à réaliser ; aucune capture disponible.

Closes mxrjup/e-commerce-BACK#47
