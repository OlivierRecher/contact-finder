# 🎯 JobHunter AI - Contact Finder

Application web moderne pour identifier les contacts clés dans une entreprise cible et rédiger vos messages d'approche, construite avec Nuxt 3, Vue 3 et Tailwind CSS.

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📋 Prérequis

Vous aurez besoin de deux clés API :

1. **OpenAI API Key** : Pour analyser les profils et générer les messages
   - Obtenez votre clé sur [platform.openai.com](https://platform.openai.com/api-keys)

2. **Serper.dev API Key** : Pour rechercher des profils LinkedIn via Google X-Ray
   - Obtenez votre clé sur [serper.dev](https://serper.dev)

## 🎨 Fonctionnalités

- 🔍 Recherche de profils LinkedIn dans une entreprise cible
- 🤖 Analyse IA des profils avec scoring de pertinence
- ✉️ Génération automatique de messages personnalisés
- 💾 Stockage local des clés API (localStorage)
- 🎨 Interface moderne et responsive avec Tailwind CSS

## 📝 Utilisation

1. Entrez vos clés API dans la barre latérale gauche
2. Remplissez le formulaire :
   - Poste visé
   - Entreprise cible
   - Description du poste (optionnel)
   - Votre profil/résumé CV
3. Cliquez sur "Lancer la recherche"
4. Consultez les contacts identifiés avec leur score de pertinence
5. Cliquez sur "Rédiger un message" pour générer un message personnalisé
6. Copiez le message dans votre presse-papier

## 🛠️ Technologies

- **Nuxt 3** : Framework Vue.js full-stack
- **Vue 3** : Framework JavaScript progressif
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **OpenAI API** : Analyse et génération de contenu IA
- **Serper.dev API** : Recherche web avancée

## 📦 Build pour production

```bash
npm run build
```

## 🔒 Sécurité

Les clés API sont stockées localement dans le navigateur (localStorage) et ne sont jamais envoyées à un serveur tiers autre que les services API utilisés.

