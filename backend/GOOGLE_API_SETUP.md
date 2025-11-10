# Configuration de l'API Google Custom Search

## Problème actuel

Vous recevez des erreurs `400 Bad Request` de l'API Google, ce qui signifie que :
- Les clés API ne sont pas configurées
- Les clés sont invalides
- Le format de la requête est incorrect

## Solution : Configurer l'API Google Custom Search

### Étape 1 : Créer une clé API Google

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Allez dans **APIs & Services** > **Credentials**
4. Cliquez sur **Create Credentials** > **API Key**
5. Copiez la clé API générée
6. (Recommandé) Cliquez sur **Restrict Key** et limitez-la à **Custom Search API**

### Étape 2 : Activer l'API Custom Search

1. Dans Google Cloud Console, allez dans **APIs & Services** > **Library**
2. Recherchez "Custom Search API"
3. Cliquez sur **Enable**

### Étape 3 : Créer un moteur de recherche personnalisé

1. Allez sur [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Cliquez sur **Add** pour créer un nouveau moteur de recherche
3. Dans "Sites to search", entrez `*` pour rechercher sur tout le web
4. Donnez un nom à votre moteur (ex: "Guardian Mentions Scanner")
5. Cliquez sur **Create**
6. Dans les paramètres du moteur, activez **Search the entire web**
7. Copiez le **Search engine ID** (cx)

### Étape 4 : Configurer les variables d'environnement

Ajoutez ces lignes dans votre fichier `.env` :

```bash
GOOGLE_API_KEY=AIzaSyDiftPQe4efbyUB0ertM1F5WaAoyiBQtpc
GOOGLE_SEARCH_ENGINE_ID=26416625a5f04414e
```

### Étape 5 : Redémarrer le serveur

```bash
npm run start:dev
```

## Limites de l'API gratuite

- **100 requêtes par jour** gratuitement
- Au-delà : 5$ pour 1000 requêtes supplémentaires
- Maximum 10 résultats par requête

## Alternative : Mode de développement sans API

Si vous voulez tester sans configurer l'API Google, vous pouvez temporairement modifier le code pour retourner des résultats de test. Cependant, cela ne fonctionnera pas en production.

## Vérification

Une fois configuré, vous devriez voir dans les logs :
- ✅ Pas de message "Google API keys not configured"
- ✅ Pas d'erreur "400 Bad Request"
- ✅ Des résultats réels de recherche

## Dépannage

### Erreur 400 Bad Request
- Vérifiez que votre clé API est valide
- Vérifiez que l'API Custom Search est activée
- Vérifiez que le Search Engine ID est correct

### Erreur 403 Forbidden
- Vérifiez les restrictions de votre clé API
- Vérifiez que vous n'avez pas dépassé le quota quotidien

### Aucun résultat
- Vérifiez que "Search the entire web" est activé dans votre moteur de recherche
- Vérifiez que vos mots-clés sont correctement configurés dans votre profil
