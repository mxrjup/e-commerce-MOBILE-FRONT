# LOG — Application mobile

Application Expo / React Native avec connexion OIDC via Keycloak.
Les instructions ci-dessous permettent de la lancer sur un émulateur Android,
avec une infrastructure locale ou le déploiement INFRA de l'équipe.
Le catalogue est accessible sans connexion.

## Prérequis

- Node.js 22.18 ou plus récent et npm.
- Android Studio, le SDK Android et un émulateur configuré dans **Device Manager**.
- Java et les variables du SDK configurés pour compiler une application Android.
- Pour une exécution locale : Docker Desktop démarré et le dépôt `e-commerce-BACK` configuré.
- La commande `adb` disponible dans le `PATH` (dossier `platform-tools` du SDK Android).

Les commandes PowerShell suivantes partent de la racine du clone
`e-commerce-MOBILE-FRONT`, sauf indication contraire.

Le projet est réparti dans des dépôts indépendants :

- [e-commerce-MOBILE-FRONT](https://github.com/mxrjup/e-commerce-MOBILE-FRONT) : application mobile.
- [e-commerce-BACK](https://github.com/mxrjup/e-commerce-BACK) : code des API et services backend.
- [e-commerce-INFRA](https://github.com/mxrjup/e-commerce-INFRA) : infrastructure et déploiement des services, dont Keycloak.

Ces dépôts sont clonés séparément ; leur emplacement sur le PC est libre.

## 1. Installer et configurer l'application

```powershell
npm ci
Copy-Item .env.example .env
```

Si un fichier `.env` existe déjà, conserver sa configuration. Pour l'émulateur
Android, les valeurs attendues sont :

```dotenv
EXPO_PUBLIC_KEYCLOAK_URL=http://localhost:8180
EXPO_PUBLIC_KEYCLOAK_REALM=ecommerce
EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=mobile-app
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

`10.0.2.2` permet à l'émulateur de joindre la gateway sur le PC.
Keycloak utilise `localhost` pour conserver le même domaine pendant toute
la connexion ; le transfert de port est configuré à l'étape 3.

Pour un déploiement INFRA, utiliser l'adresse publique fournie par l'équipe.
Ne pas ajouter `/realms/ecommerce` : l'application construit ce suffixe depuis
`EXPO_PUBLIC_KEYCLOAK_REALM`. Configurer aussi `EXPO_PUBLIC_API_URL` avec l'URL
de la gateway du déploiement. Les adresses doivent être accessibles depuis
l'émulateur ou le téléphone.

## 2. Préparer Keycloak et les services

Si vous utilisez le déploiement INFRA déjà disponible, renseigner ses URL à
l'étape 1 ; il n'est pas nécessaire de démarrer des conteneurs sur votre PC.

**En local, lancer Docker depuis le dépôt backend `e-commerce-BACK`** en suivant
ses instructions de démarrage. Les conteneurs Keycloak et leurs dépendances
doivent être démarrés pour permettre l'authentification ; la gateway et les
services backend doivent également tourner pour utiliser les fonctionnalités API.
Garder ces conteneurs actifs pendant l'utilisation de l'application.

Attendre que Keycloak soit accessible à l'URL configurée à l'étape 1.

## 3. Démarrer l'émulateur et transférer les ports

Dans Android Studio, ouvrir **Device Manager**, puis démarrer un émulateur.
Depuis un terminal à la racine de `e-commerce-MOBILE-FRONT`, pour les services locaux :

```powershell
adb devices
adb reverse tcp:8180 tcp:8180
adb reverse tcp:8081 tcp:8081
```

L'émulateur doit apparaître avec l'état `device`.
Le port `8180` permet au navigateur Android de joindre Keycloak via
`localhost:8180`. Le port `8081` donne accès au serveur Expo.
Relancer les commandes `adb reverse` après un redémarrage de l'émulateur.
Le transfert `8180` ne concerne que Keycloak exécuté sur le PC ; une URL INFRA
distante est jointe directement. Le transfert `8081` reste utile pour Expo local.

## 4. Installer et ouvrir l'application

Pour la première installation, depuis la racine de `e-commerce-MOBILE-FRONT` :

```powershell
npx expo run:android
```

Cette commande compile, installe et ouvre l'application, puis démarre le
serveur de développement. Garder ce terminal ouvert.
Utiliser l'application Android compilée pour tester le retour OIDC
`ecommerce://auth-callback` ; Expo Go ne gère pas ce schéma personnalisé.
Voir la [documentation Expo sur l'authentification](https://docs.expo.dev/guides/authentication/).

Si l'application est déjà installée, démarrer simplement le serveur :

```powershell
npx expo start --localhost
```

Puis ouvrir l'application **mobile** depuis l'écran d'accueil de l'émulateur.
Une recompilation est nécessaire après une modification de configuration native.
Voir les [commandes Expo CLI](https://docs.expo.dev/more/expo-cli/).

## 5. Se connecter

Depuis le menu de l'accueil, appuyer sur **Se connecter**. Pour une installation
locale ayant importé les comptes de démonstration, utiliser :

| Compte | Mot de passe |
| --- | --- |
| `client.demo@ecommerce.test` | `demo1234` |
| `admin.demo@ecommerce.test` | `demo1234` |


## Dépannage

- **Le navigateur affiche `localhost:8180` sans accéder à Keycloak :** vérifier
  que Keycloak est démarré et relancer `adb reverse tcp:8180 tcp:8180`.
- **« Cookie not found » :** conserver la même URL publique Keycloak côté
  application et infrastructure, avec `/auth` pour le déploiement INFRA.
  En local, utiliser `http://localhost:8180` si Keycloak est exposé sans ce préfixe.
  Fermer l'ancienne page de connexion et relancer
  une connexion depuis l'application après avoir rechargé celle-ci.
- **Identifiants refusés :** utiliser un compte du realm `ecommerce`, par exemple
  les comptes ci-dessus. Un compte créé dans le realm `master` ne convient pas.
- **Le code de l'application ne charge pas :** vérifier que le serveur Expo tourne
  et relancer `adb reverse tcp:8081 tcp:8081`.
- **Une modification du `.env` n'est pas prise en compte :** redémarrer Expo avec
  `npx expo start --clear --localhost`, puis recharger l'application.
- **La compilation signale une image introuvable :** vérifier les chemins d'icônes
  et de splash dans `app.json` et restaurer les ressources manquantes.
