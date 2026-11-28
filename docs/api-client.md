# Client API partagé

Dans un composant sous `AuthProvider`, utiliser `useApi()` :

```tsx
import { useApi } from '@/hooks/use-api';
import { ApiError } from '@/services/api-client';

const api = useApi();

async function loadCart() {
  try {
    const cart = await api.get('/api/cart');
    return cart;
  } catch (error) {
    if (error instanceof ApiError) {
      // error.status : code HTTP (0 si erreur réseau)
      // error.code : catégorie ; error.data : réponse d'erreur du backend
    }
    throw error;
  }
}
```

- `get`, `post`, `put`, `patch`, `delete` et `request` sont disponibles.
- Les corps de `post`, `put` et `patch` sont sérialisés en JSON.
- Passer un type de réponse si le contrat est connu : `api.get<Cart>('/api/cart')`. Ce type ne valide pas les données à l'exécution.
- Le token Bearer provient de `getAccessToken()`, qui renouvelle la session si nécessaire. Sans session, la requête est refusée avant l'appel réseau.
- Pour une route publique : `api.get('/chemin-public', { auth: false })`.
- Délai par défaut : 15 secondes. Un `signal` fourni par l'appelant remplace ce délai. Les erreurs d'annulation et de délai sont propagées.
- Une réponse vide (par exemple HTTP 204) retourne `undefined` ; une réponse JSON est décodée ; les autres réponses restent du texte.
- Les erreurs HTTP, notamment 401 et 403, sont remontées à l'appelant. Aucune requête n'est rejouée automatiquement.
- Seuls les chemins commençant par `/` vers la gateway sont acceptés ; les redirections HTTP sont refusées.

`EXPO_PUBLIC_API_URL` configure l'origine de la gateway, sans chemin `/api`.
Sans configuration : Android utilise `http://10.0.2.2:8080` (émulateur), web et iOS utilisent `http://localhost:8080`.
Sur téléphone physique, utiliser l'adresse IP locale du PC. Sur web, configurer `http://localhost:8080`.

Tests unitaires (Node 22.18 ou plus récent) : `node --test tests/api-client.test.mjs`.
