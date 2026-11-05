# LOG — Application mobile

Application Expo / React Native avec connexion OIDC via Keycloak.
Les instructions ci-dessous permettent de la lancer sur un émulateur Android,
avec le backend exécuté sur le même PC.

## Prérequis

- Node.js 22.18 ou plus récent et npm.
- Android Studio, le SDK Android et un émulateur configuré dans **Device Manager**.
- Java et les variables du SDK configurés pour compiler une application Android.
- Docker Desktop démarré pour lancer Keycloak et le backend.
- La commande `adb` disponible dans le `PATH` (dossier `platform-tools` du SDK Android).

Sous Windows, `adb.exe` se trouve généralement dans
`%LOCALAPPDATA%\Android\Sdk\platform-tools`.
Les commandes PowerShell suivantes partent du dossier `mobile/`.

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

## 2. Démarrer Keycloak

Dans un autre terminal, depuis `mobile/` :

```powershell
cd ../backend
docker compose up -d keycloak
```

Attendre que la page [Keycloak](http://localhost:8180) soit accessible.
Cette commande démarre aussi les dépendances déclarées de Keycloak.

Pour utiliser les fonctionnalités backend au-delà de la connexion, lancer
également la gateway et les services depuis le dossier `backend/` :

```powershell
docker compose --profile services up -d --build
```

Voir le [README du backend](../backend/README.md) pour les détails.

## 3. Démarrer l'émulateur et transférer les ports

Dans Android Studio, ouvrir **Device Manager**, puis démarrer un émulateur.
Depuis un terminal dans `mobile/` :

```powershell
adb devices
adb reverse tcp:8180 tcp:8180
adb reverse tcp:8081 tcp:8081
```

L'émulateur doit apparaître avec l'état `device`.
Le port `8180` permet au navigateur Android de joindre Keycloak via
`localhost:8180`. Le port `8081` donne accès au serveur Expo.
Relancer les commandes `adb reverse` après un redémarrage de l'émulateur.

## 4. Installer et ouvrir l'application

Pour la première installation, depuis `mobile/` :

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

Appuyer sur **Se connecter**, puis utiliser l'un des comptes de démonstration
importés par le backend local :

| Compte | Mot de passe |
| --- | --- |
| `client.demo@ecommerce.test` | `demo1234` |
| `admin.demo@ecommerce.test` | `demo1234` |

Le compte `admin` de la console Keycloak est distinct des comptes de l'application.
Après une connexion réussie, l'application ouvre la page d'accueil.
Le bouton **☰** donne accès au menu et à la déconnexion.

## Dépannage

- **Le navigateur affiche `localhost:8180` sans accéder à Keycloak :** vérifier
  que Keycloak est démarré et relancer `adb reverse tcp:8180 tcp:8180`.
- **« Cookie not found » :** conserver `http://localhost:8180` comme URL Keycloak
  côté application et backend. Fermer l'ancienne page de connexion et relancer
  une connexion depuis l'application après avoir rechargé celle-ci.
- **Identifiants refusés :** utiliser un compte du realm `ecommerce`, par exemple
  les comptes ci-dessus. Un compte créé dans le realm `master` ne convient pas.
- **Le code de l'application ne charge pas :** vérifier que le serveur Expo tourne
  et relancer `adb reverse tcp:8081 tcp:8081`.
- **Une modification du `.env` n'est pas prise en compte :** redémarrer Expo avec
  `npx expo start --clear --localhost`, puis recharger l'application.
- **La compilation signale une image introuvable :** vérifier les chemins d'icônes
  et de splash dans `app.json` et restaurer les ressources manquantes.
