# 🌉 The Bridge — Modern LMS Frontend Application

<div align="center">

![Angular](https://img.shields.io/badge/Angular-18.2.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.47-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
[![Vercel Production](https://img.shields.io/badge/Vercel-Live_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://9antra-the-bridge-frontend-pdjd-silk.vercel.app)
[![Backend Status](https://img.shields.io/badge/Backend_API-Render_Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://nineantra-the-bridge-backend.onrender.com)
[![CI/CD Frontend](https://github.com/mohamedazizsaid/9antra_the-Bridge_Frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/mohamedazizsaid/9antra_the-Bridge_Frontend/actions/workflows/frontend-ci.yml)

<br/>

**The Bridge Frontend** est l'application Single Page (SPA) moderne, réactive et hautement performante de la plateforme d'apprentissage **The Bridge**, propulsée par **Angular 18**, **TailwindCSS**, et connectée à l'API Spring Boot sécurisée.

> 🚀 **Application Frontend en Production (Vercel)** : [https://9antra-the-bridge-frontend-pdjd-silk.vercel.app](https://9antra-the-bridge-frontend-pdjd-silk.vercel.app)  
> 🌐 **Backend API Officielle (Render)** : [https://nineantra-the-bridge-backend.onrender.com](https://nineantra-the-bridge-backend.onrender.com)  
> 📚 **Swagger UI Backend** : [https://nineantra-the-bridge-backend.onrender.com/swagger-ui/index.html](https://nineantra-the-bridge-backend.onrender.com/swagger-ui/index.html)  
> 🩺 **Health Check Backend** : [https://nineantra-the-bridge-backend.onrender.com/api/health](https://nineantra-the-bridge-backend.onrender.com/api/health)

[Fonctionnalités](#-fonctionnalités-majeures) • [Production](#-environnements-de-production) • [Design System](#-design-system--uiux) • [Architecture](#-structure-du-projet) • [Démarrage](#-démarrage-rapide) • [CI/CD & Vercel](#-pipeline-cicd-github-actions--vercel) • [Tests](#-tests--qualité)

---

</div>

## 📌 Sommaire

- [✨ Présentation & Vision](#-présentation--vision)
- [🌐 Environnements de Production](#-environnements-de-production)
- [🎨 Design System & UI/UX](#-design-system--uiux)
- [🚀 Fonctionnalités Majeures](#-fonctionnalités-majeures)
  - [1. Portail Public & Vitrine de Formations](#1-portail-public--vitrine-de-formations)
  - [2. Authentification & Sécurité (IAM)](#2-authentification--sécurité-iam)
  - [3. Espace Stagiaire (Étudiant)](#3-espace-stagiaire-étudiant)
  - [4. Espace Formateur (Instructeur)](#4-espace-formateur-instructeur)
  - [5. Tableau de Bord Administrateur](#5-tableau-de-bord-administrateur)
  - [6. Paiements Stripe & Reçus](#6-paiements-stripe--reçus)
  - [7. Vérification de Diplômes Blockchain](#7-vérification-de-diplômes-blockchain)
  - [8. Notifications & Messagerie Temps Réel](#8-notifications--messagerie-temps-réel)
- [🛠️ Stack Technique](#️-stack-technique)
- [📂 Structure du Projet](#-structure-du-projet)
- [⚡ Démarrage Rapide](#-démarrage-rapide)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Variables d'Environnement](#variables-denvironnement)
  - [Lancement du Serveur de Développement](#lancement-du-serveur-de-développement)
  - [Compilation de Production](#compilation-de-production)
- [🧪 Tests & Qualité](#-tests--qualité)
  - [Tests Unitaires (Karma / Jasmine)](#tests-unitaires-karma--jasmine)
  - [Tests End-to-End (Playwright)](#tests-end-to-end-playwright)
  - [Linting & Formatage Automatisé](#linting--formatage-automatisé)
- [🐳 Conteneurisation Docker & Nginx](#-conteneurisation-docker--nginx)
- [🔄 Pipeline CI/CD GitHub Actions & Vercel](#-pipeline-cicd-github-actions--vercel)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## ✨ Présentation & Vision

**The Bridge Frontend** offre une expérience utilisateur fluide, immersive et ultra-rapide dédiée à la formation professionnelle et académique. L'application interconnecte trois profils utilisateurs distincts (**Étudiants**, **Formateurs**, **Administrateurs**) autour d'une interface élégante, dotée d'animations dynamiques, de tableaux de bord analytiques en temps réel et d'une intégration transparente avec la blockchain Polygon.

---

## 🌐 Environnements de Production

L'écosystème **The Bridge** est déployé en production avec une architecture découplée haute performance :

| Composant | Plateforme | URL Officielle | Rôle / Description |
|---|---|---|---|
| 💻 **Frontend Web App** | **Vercel** | [`https://9antra-the-bridge-frontend-pdjd-silk.vercel.app`](https://9antra-the-bridge-frontend-pdjd-silk.vercel.app) | Application Angular 18 SPA |
| 🛡️ **Backend REST API** | **Render** | [`https://nineantra-the-bridge-backend.onrender.com`](https://nineantra-the-bridge-backend.onrender.com) | Serveur Spring Boot 4.1 |
| 📚 **Swagger UI Docs** | **Render** | [`https://nineantra-the-bridge-backend.onrender.com/swagger-ui/index.html`](https://nineantra-the-bridge-backend.onrender.com/swagger-ui/index.html) | Documentation interactive OpenAPI 3 |
| 🩺 **Health Check API** | **Render** | [`https://nineantra-the-bridge-backend.onrender.com/api/health`](https://nineantra-the-bridge-backend.onrender.com/api/health) | État de santé des services |

---

## 🎨 Design System & UI/UX

- **Aesthetic Glassmorphism & Modern Dark/Light Modes** : Composants visuels raffinés utilisant des transparences soignées, des dégradés harmonieux et des ombres douces.
- **Animations Avancées (GSAP)** : Transitions de pages fluides, animations d'entrée séquencées et micro-interactions au survol.
- **Iconographie Vectorielle (Lucide Angular)** : Plus de 100+ icônes vectorielles cohérentes et légères.
- **Visualisation de Données (Chart.js)** : Graphiques interactifs (courbes de revenus, progression des inscriptions, taux de réussite aux évaluations).
- **Responsive First** : Expérience optimisée sur mobile, tablette et écrans ultra-larges.

---

## 🚀 Fonctionnalités Majeures

### 1. Portail Public & Vitrine de Formations
- **Landing Page Dynamique** : Présentation interactive de la plateforme, splash screen animé, statistiques globales et témoignages.
- **Explorateur de Catalogue** : Recherche instantanée, filtres par catégorie, niveau de difficulté et prix.
- **Fiches Détaillées de Formation** : Syllabus complet, aperçu des modules, objectifs pédagogiques, profil du formateur et bouton d'inscription direct.

### 2. Authentification & Sécurité (IAM)
- **Inscription Interactive Multi-Étapes** : Formulaire avec téléversement et recadrage d'avatar en temps réel vers Cloudinary.
- **Connexion Hybride** : Authentification standard (Email/Password) et boutons **OAuth2 Social Login** (Google & Facebook).
- **Validation OTP par Email** : Saisie automatisée de code de sécurité à 6 chiffres avec compte à rebours et renvoi instantané.
- **Réinitialisation de Mot de Passe Sécurisée** : Workflow guidé avec validation de complexité du mot de passe.
- **Intercepteur HTTP Automatisé** : Injection transparente du header `Authorization: Bearer <token>` et gestion des redirections 401/403.

### 3. Espace Stagiaire (Étudiant)
- **Tableau de Bord Personnel** : Résumé des formations en cours, heures d'apprentissage cumulées et prochaines sessions.
- **Lecteur de Cours Immersif** : Navigation chapitrée, suivi de progression leçon par leçon, téléchargement de supports de cours et vidéos.
- **Espace Certifications & Diplômes** :
  - Consultation des diplômes officiels obtenus.
  - Téléchargement du certificat vectoriel au format **PDF haute définition**.
  - Lien direct de vérification de transaction vers **PolygonScan (Amoy Testnet)**.
- **Module d'Évaluations & Quizz** : Passage de tests en ligne avec chronomètre, validation instantanée et restitution des notes.

### 4. Espace Formateur (Instructeur)
- **Assistant de Création de Cours (Formation Wizard)** : Créateur dynamique de formations étape par étape (infos générales, création de modules, ajout de leçons, upload de médias).
- **Gestion des Sessions & Emploi du Temps** : Planification des cours en direct et gestion du nombre de places.
- **Feuille d'Émargement Numérique** : Validation de la présence des apprenants par session.
- **Correction des Évaluations** : Suivi des soumissions et notation des étudiants.

### 5. Tableau de Bord Administrateur
- **Analytics & KPIs Globaux** : Graphiques financiers (chiffre d'affaires Stripe), volume d'inscriptions mensuelles, répartition des utilisateurs.
- **Gestion Complète des Utilisateurs** : Annuaire filtrable, modification dynamique des rôles (`ROLE_ETUDIANT`, `ROLE_FORMATEUR`, `ROLE_ADMIN`), suspension/activation de comptes.
- **Système de Diffusion d'Annonces (Broadcast)** : Envoi d'annonces instantanées ciblées à tous les utilisateurs ou par rôle spécifique.
- **Journaux d'Audit Système** : Visualisation en temps réel des actions critiques, tentatives de connexion et événements de sécurité.

### 6. Paiements Stripe & Reçus
- **Intégration Stripe Elements** : Formulaire de paiement sécurisé par carte bancaire avec conformité PCI-DSS.
- **Page de Confirmation & Callback** : Gestion du retour de paiement (`/payment-callback`) avec déblocage instantané de la formation.

### 7. Vérification de Diplômes Blockchain
- **Portail Public de Vérification** : Outil permettant à un recruteur ou tiers de renseigner un code de certificat ou de scanner un QR Code pour vérifier en temps réel l'authenticité de l'ancrage sur la blockchain **Polygon**.

### 8. Notifications & Messagerie Temps Réel
- **WebSockets STOMP** : Réception immédiate des alertes (validation d'inscription, nouveau message, attribution de diplôme).
- **Système de Toasts Animés** : Notifications visuelles toast contextuelles (succès, avertissement, erreur).

---

## 🛠️ Stack Technique

| Domaine | Technologie | Rôle / Utilisation |
|---|---|---|
| **Framework Web** | Angular 18.2.0 | Architecture modulaire & composants standalone |
| **Langage** | TypeScript 5.5 | Typage statique robuste et interfaces DTO strictes |
| **Styling** | TailwindCSS 3.4 + SCSS | Utility-first CSS, design tokens et responsivité |
| **Programmation Réactive** | RxJS 7.8 | Gestion asynchrone des flux d'événements et requêtes HTTP |
| **Animations** | GSAP 3.15 | Animations graphiques haute performance |
| **Visualisation** | Chart.js 4.5 | Graphiques financiers et statistiques dynamiques |
| **Iconographie** | Lucide Angular 1.0 | Bibliothèque vectorielle SVG moderne |
| **Tests Unitaires** | Karma + Jasmine | Couverture de code et tests de composants |
| **Tests E2E** | Playwright 1.47 | Tests de fumée et parcours utilisateur automatisés |
| **Qualité de Code** | ESLint + Prettier + Husky | Linting Angular, formatage strict et hooks Git |
| **Conteneurisation** | Docker + Nginx Alpine | Image de production multi-stage optimisée |
| **Hébergement & CI/CD** | Vercel + GitHub Actions | Déploiement automatisé avec previews sur Pull Requests |

---

## 📂 Structure du Projet

```
the_bridge_frontend/
├── .github/
│   └── workflows/
│       └── frontend-ci.yml       # Pipeline CI/CD GitHub Actions
├── e2e/                          # Tests End-to-End Playwright
├── public/                       # Assets statiques publics & favicons
├── src/
│   ├── app/
│   │   ├── core/                 # Services singleton, Guards, Intercepteurs HTTP
│   │   │   ├── guards/           # AuthGuard, RoleGuard (Admin/Formateur/Stagiaire)
│   │   │   ├── interceptors/     # AuthInterceptor (injection JWT), ErrorInterceptor
│   │   │   └── services/         # AuthService, FormationService, PaiementService, AdminService...
│   │   ├── pages/                # Vues et modules de routage
│   │   │   ├── auth/             # Login, Register, Forgot Password, Reset Password
│   │   │   ├── dashboard/        # Espaces sécurisés
│   │   │   │   ├── admin/        # Dashboard Admin (Stats, Users, Broadcast, Logs)
│   │   │   │   ├── formateur/    # Dashboard Formateur (Overview, Sessions)
│   │   │   │   ├── formations/   # Liste, Détail de cours, Wizard de création
│   │   │   │   └── stagiaire/    # Dashboard Étudiant (Overview, Historique)
│   │   │   ├── landing/          # Vitrine publique & Catalogue
│   │   │   ├── payment-callback/ # Confirmation de paiement Stripe
│   │   │   └── splash/           # Écran d'accueil animé
│   │   ├── shared/               # Composants UI réutilisables (Navbar, Sidebar, Modal, Toasts)
│   │   ├── app-routing.module.ts # Définition de toutes les routes de l'application
│   │   └── app.component.ts      # Composant racine
│   ├── assets/                   # Images, logos et polices locales
│   ├── environments/             # Configurations d'environnement (générées via set-env.js)
│   ├── index.html                # Point d'entrée HTML
│   ├── main.ts                   # Démarrage de l'application Angular
│   └── styles.css                # Styles globaux et directives TailwindCSS
├── Dockerfile                    # Build multi-stage (Node 20 -> Nginx)
├── nginx.conf                    # Configuration Nginx avec réécriture SPA et compression gzip
├── package.json                  # Dépendances et scripts npm
├── set-env.js                    # Script d'injection dynamique des variables au build
├── tailwind.config.js            # Configuration du thème et plugins Tailwind
└── vercel.json                   # Configuration Vercel SPA
```

---

## ⚡ Démarrage Rapide

### Prérequis

- **Node.js** : Version `20.x` ou supérieure (`node -v`)
- **npm** : Version `10.x` ou supérieure (`npm -v`)
- **Backend API** : L'instance backend locale (`http://localhost:8080`) ou l'API de production ([Render](https://nineantra-the-bridge-backend.onrender.com)).

### Installation

1. **Cloner le repository frontend :**
```bash
git clone https://github.com/mohamedazizsaid/9antra_the-Bridge_Frontend.git
cd the_bridge_frontend
```

2. **Installer les dépendances :**
```bash
npm install
```

### Variables d'Environnement

Créez un fichier `.env.local` à la racine pour configurer l'URL de l'API backend :

```env
DEV_API_URL=http://localhost:8080/api
PROD_API_URL=https://nineantra-the-bridge-backend.onrender.com/api
```

Le script `set-env.js` génère automatiquement les fichiers `src/environments/environment.ts` et `src/environments/environment.prod.ts` avant chaque démarrage ou compilation.

### Lancement du Serveur de Développement

```bash
npm start
```
Accédez à l'application sur : 👉 **`http://localhost:4200`**

### Compilation de Production

```bash
npm run build:prod
```
Les fichiers statiques optimisés sont générés dans le dossier `dist/the-bridge-frontend/browser`.

---

## 🧪 Tests & Qualité

### Tests Unitaires (Karma / Jasmine)

```bash
# Lancement interactif avec navigateur Chrome
npm test

# Lancement en mode CI headless avec rapport de couverture
npm run test:ci
```

### Tests End-to-End (Playwright)

```bash
# Exécution des tests E2E en local (mode interactif / headed)
npm run e2e:local

# Exécution en mode headless
npm run e2e

# Exécution ciblée contre une URL de preview spécifique
E2E_BASE_URL=https://mon-deploiement-preview.vercel.app npm run e2e
```

### Linting & Formatage Automatisé

```bash
# Vérification ESLint
npm run lint

# Correction automatique des erreurs de linting
npm run lint:fix

# Formatage Prettier du code source
npm run format

# Vérification du formatage en CI
npm run format:check
```

---

## 🐳 Conteneurisation Docker & Nginx

Le projet dispose d'une configuration **Docker Multi-Stage** optimisée pour la production.

1. **Stage 1 (Builder)** : Utilise l'image `node:20-alpine` pour compiler l'application avec les dépendances de production.
2. **Stage 2 (Server)** : Utilise l'image légère `nginx:alpine` pour servir l'application avec compression gzip, mise en cache des assets et réécriture des routes SPA.

```bash
# Construction de l'image Docker
docker build -t the-bridge-frontend:latest .

# Démarrage du conteneur sur le port 80
docker run -d --name the-bridge-frontend -p 80:80 the-bridge-frontend:latest
```
Accédez ensuite à l'application sur `http://localhost`.

---

## 🔄 Pipeline CI/CD GitHub Actions & Vercel

Les déploiements sur **Vercel** sont orchestrés **exclusivement** via le pipeline GitHub Actions (`.github/workflows/frontend-ci.yml`) pour garantir une politique de tolérance zéro sur les bugs :

```
Push / Pull Request
    │
    ├── 1. Quality Job ───────► ESLint + Prettier Check + Tests Karma Headless + Codecov
    │
    ├── 2. Preview Deploy ────► Déploiement d'une URL de Preview éphémère sur Vercel (sur PR)
    │        │
    │        ├── 3. E2E Smoke ──► Tests Playwright exécutés sur l'URL de Preview
    │        │
    │        └── 4. Lighthouse ─► Audit de performance, accessibilité et SEO
    │
    └── [Sur branche 'main' uniquement]
         │
         └── 5. Prod Deploy ──► Déploiement en Production Vercel (uniquement si 100% validé)
```

### Secrets GitHub Actions Requis

Configurez les secrets dans : `Settings → Secrets and variables → Actions` :

| Secret | Description | Source |
|---|---|---|
| `VERCEL_TOKEN` | Token d'accès API Vercel | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Identifiant de l'équipe/organisation Vercel | Fichier `.vercel/project.json` après `npx vercel link` |
| `VERCEL_PROJECT_ID` | Identifiant unique du projet Vercel | Fichier `.vercel/project.json` après `npx vercel link` |
| `PROD_API_URL` | URL de l'API backend en production | `https://nineantra-the-bridge-backend.onrender.com/api` |
| `CODECOV_TOKEN` | Token de téléversement de couverture | [Codecov](https://codecov.io) |

---

## 🤝 Contribution

1. Forkez le projet (`git checkout -b feature/NouvelleFonctionnalite`)
2. Respectez la convention **Conventional Commits** (`git commit -m 'feat: ajout nouvelle fonctionnalite'`)
3. Poussez votre branche (`git push origin feature/NouvelleFonctionnalite`)
4. Ouvrez une **Pull Request** vers la branche `main`

---

## 📄 Licence

Ce projet est sous licence propriétaire — développé dans le cadre de la plateforme **The Bridge**. Tous droits réservés.

<div align="center">
<sub>Fait avec passion pour l'excellence de l'apprentissage en ligne 🚀</sub>
</div>