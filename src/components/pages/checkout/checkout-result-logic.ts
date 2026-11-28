export function paymentMessage(state: 'cancelled' | 'signed-out' | 'missing-session' | 'checking' | 'error' | 'pending' | 'confirmed') {
  switch (state) {
    case 'confirmed': return { title: 'Commande confirmée', body: 'Votre paiement est confirmé et votre commande a bien été prise en compte.' };
    case 'pending': return { title: 'Confirmation en attente', body: 'Le paiement et la finalisation de la commande ne sont pas encore confirmés. Vérifiez à nouveau dans quelques instants.' };
    case 'cancelled': return { title: 'Paiement interrompu', body: 'Vous avez quitté le paiement. Consultez vos commandes avant de réessayer.' };
    case 'signed-out': return { title: 'Connexion nécessaire', body: 'Connectez-vous pour vérifier le paiement de votre commande.' };
    case 'missing-session': return { title: 'Session de paiement manquante', body: 'Ce lien ne permet pas de vérifier le paiement. Consultez vos commandes.' };
    case 'error': return { title: 'Vérification indisponible', body: 'Le paiement n’a pas pu être vérifié. Réessayez dans quelques instants.' };
    case 'checking': return { title: 'Vérification du paiement', body: 'Nous vérifions le paiement et la finalisation de votre commande.' };
  }
}
