# Guardian - Auth / KYC / Dashboard Documentation

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Architecture](#architecture)
5. [Endpoints API](#endpoints-api)
6. [Flow utilisateur](#flow-utilisateur)
7. [Composants](#composants)
8. [Conformité RGPD](#conformité-rgpd)
9. [Tests](#tests)

---

## 🎯 Vue d'ensemble

Ce module implémente le flow complet d'inscription, KYC (Know Your Customer) et dashboard pour Guardian, conforme au design Base44 et aux exigences RGPD.

### Fonctionnalités principales
- ✅ Inscription / Connexion avec validation complète
- ✅ KYC avec upload sécurisé (presigned URLs)
- ✅ Dashboard avec métriques, Guardian Score, mentions
- ✅ Design Base44 (dark theme, cyan accents, glassmorphism)
- ✅ Conformité RGPD (consentements, audit trail, suppression)

---

## 🚀 Installation

```bash
cd frontend
npm install
```

### Dépendances principales
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React (icons)
- Supabase JS (auth & storage)

---

## ⚙️ Configuration

### 1. Variables d'environnement

Créez `.env.local` à partir de `.env.local.example` :

```bash
cp .env.local.example .env.local
```

Remplissez les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
BREVO_API_KEY=xkeysib-...
```

### 2. Backend requis

Le backend Nest.js doit être démarré sur `http://localhost:3001` (ou l'URL configurée).

Endpoints backend nécessaires :
- `POST /auth/register`
- `POST /auth/login`
- `GET /kyc/upload-url`
- `POST /kyc/submit`
- `POST /kyc/webhook`
- `GET /user/profile`
- `POST /scan/register-info`
- `GET /dashboard`
- `POST /scan/start`
- `POST /deletion/request`

### 3. Supabase Storage

Créez les buckets suivants dans Supabase :
- `kyc-documents` (privé, avec RLS)
- `identities` (privé)

---

## 🏗️ Architecture

### Structure des fichiers

```
frontend/
├── app/
│   ├── auth/
│   │   └── page.tsx                    # Page inscription/connexion
│   ├── onboarding/
│   │   └── kyc/
│   │       └── page.tsx                # Page KYC
│   ├── dashboard/
│   │   ├── layout.tsx                  # Layout avec sidebar
│   │   └── page.tsx                    # Dashboard principal
│   └── page.tsx                        # Landing page
├── components/
│   ├── auth/
│   │   ├── SignupForm.tsx              # Formulaire inscription
│   │   └── LoginForm.tsx               # Formulaire connexion
│   ├── kyc/
│   │   └── KYCUploader.tsx             # Upload documents KYC
│   ├── dashboard/
│   │   ├── DashboardSidebar.tsx        # Navigation sidebar
│   │   ├── DashboardHeader.tsx         # Header avec user info
│   │   ├── MetricCard.tsx              # Carte métrique
│   │   ├── GuardianScoreGauge.tsx      # Jauge score (canvas)
│   │   ├── MentionsList.tsx            # Liste mentions
│   │   ├── ActionsPanel.tsx            # Actions rapides
│   │   └── AccountStatusCard.tsx       # Statut compte
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── ThemeToggle.tsx
│       └── PricingSection.tsx
└── lib/
    ├── apiClient.ts                    # Client API
    ├── supabaseClient.ts               # Client Supabase
    └── utils.ts                        # Utilitaires
```

---

## 🔌 Endpoints API

### Auth

#### POST /auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "dob": "1990-01-15",
  "country": "FR",
  "pseudos": [
    { "platform": "twitter", "handle": "@jeandupont" },
    { "platform": "linkedin", "handle": "jean-dupont" }
  ],
  "keywords": ["marketing", "tech"],
  "gdpr_consent": true,
  "newsletter_consent": false
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "email": "jean@example.com"
}
```

#### POST /auth/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "jean@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "jean@example.com"
  }
}
```

### KYC

#### GET /kyc/upload-url
Obtenir une URL presigned pour upload.

**Headers:**
```
Authorization: Bearer <token>
```

**Query params:**
```
?filename=id_front.jpg&contentType=image/jpeg
```

**Response:**
```json
{
  "uploadUrl": "https://supabase.co/storage/...",
  "fileKey": "kyc-documents/user-uuid/id_front.jpg"
}
```

#### POST /kyc/submit
Soumettre les documents KYC pour vérification.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "fileRefs": {
    "id_front": "kyc-documents/user-uuid/id_front.jpg",
    "id_back": "kyc-documents/user-uuid/id_back.jpg",
    "selfie": "kyc-documents/user-uuid/selfie.jpg"
  }
}
```

**Response:**
```json
{
  "kyc_status": "pending",
  "message": "Documents soumis pour vérification"
}
```

#### POST /kyc/webhook
Webhook pour mise à jour du statut KYC (appelé par le provider).

**Body:**
```json
{
  "user_id": "uuid",
  "status": "verified",
  "provider": "onfido",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Dashboard

#### GET /dashboard
Récupérer toutes les données du dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "guardianScore": 72,
  "mentionsCount": 24,
  "deletionsCount": 3,
  "positiveMentions": 18,
  "alerts": 2,
  "mentions": [
    {
      "id": "uuid",
      "source": "LinkedIn",
      "title": "Article professionnel",
      "snippet": "Expert reconnu...",
      "sentiment": "positive",
      "url": "https://...",
      "date": "2025-01-10T12:00:00Z"
    }
  ],
  "accountStatus": {
    "kyc_status": "verified",
    "mandate_signed": true,
    "alerts_enabled": true
  }
}
```

#### POST /scan/start
Lancer un scan manuel.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "scan_id": "uuid",
  "status": "processing"
}
```

#### POST /deletion/request
Créer une demande de suppression RGPD.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "mentionId": "uuid",
  "site": "example.com",
  "reason": "Données obsolètes"
}
```

**Response:**
```json
{
  "deletion_id": "uuid",
  "status": "pending"
}
```

---

## 👤 Flow utilisateur

### 1. Inscription

```
Landing Page → Bouton "S'inscrire" → /auth
  ↓
Formulaire inscription (étape 1/2)
  - Prénom, nom, email, téléphone
  - Date de naissance, pays
  - Pseudos réseaux sociaux
  - Mots-clés
  - Consentements RGPD ✓
  ↓
POST /auth/register
  ↓
Redirection → /onboarding/kyc
```

### 2. KYC

```
/onboarding/kyc → Page d'information
  ↓
Étape upload (2/2)
  - Upload pièce d'identité (recto)
  - Upload pièce d'identité (verso) - optionnel
  - Upload selfie
  ↓
Pour chaque fichier:
  1. GET /kyc/upload-url
  2. PUT presigned URL (direct upload)
  3. Aperçu flouté affiché
  ↓
POST /kyc/submit (tous les fileRefs)
  ↓
Écran "Vérification en cours..."
  ↓
Redirection → /dashboard
```

### 3. Dashboard

```
/dashboard
  ↓
Affichage:
  - 4 métriques (mentions, demandes, positives, alertes)
  - Guardian Score (gauge + chart)
  - Actions rapides (scan, RGPD, settings)
  - Statut compte (KYC, mandat, alertes)
  - Liste mentions récentes
  ↓
Actions possibles:
  - Lancer scan → POST /scan/start
  - Créer demande RGPD → POST /deletion/request
  - Voir détails mention → Ouvre URL externe
```

---

## 🧩 Composants

### MetricCard
Carte métrique avec icône, valeur, et trend optionnel.

**Props:**
```typescript
{
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'cyan' | 'emerald' | 'amber' | 'red';
}
```

### GuardianScoreGauge
Jauge circulaire animée (Canvas) pour afficher le score.

**Props:**
```typescript
{
  score: number;  // 0-100
  size?: number;  // default 200
}
```

### MentionsList
Liste des mentions avec actions (ouvrir, créer suppression, ignorer).

**Props:**
```typescript
{
  mentions: Mention[];
  onCreateDeletion?: (mentionId: string) => void;
}
```

### KYCUploader
Composant d'upload avec preview floutée et validation.

**Props:**
```typescript
{
  type: 'id_front' | 'id_back' | 'selfie';
  label: string;
  onUploadComplete: (url: string) => void;
}
```

**Validations:**
- Taille max: 5MB
- Formats: JPG, PNG
- Preview floutée pour sécurité

---

## 🔒 Conformité RGPD

### Consentements

#### Lors de l'inscription
- ✅ Consentement RGPD **obligatoire** (checkbox)
- ✅ Consentement newsletter **optionnel** (opt-in)
- ✅ Timestamp + IP enregistrés côté backend
- ✅ Texte explicite : "J'accepte la collecte et le traitement de mes données personnelles conformément au RGPD"

#### Lors du KYC
- ✅ Page d'information avant upload
- ✅ Explication : pourquoi, sécurité, durée conservation
- ✅ Durée de rétention : 90 jours
- ✅ Droit de suppression immédiate

### Sécurité des documents

#### Upload
- ✅ Presigned URLs (pas de transit par serveur frontend)
- ✅ Upload direct client → Supabase Storage
- ✅ Chiffrement côté serveur (Supabase)
- ✅ Buckets privés avec RLS

#### Affichage
- ✅ Preview floutée (blur CSS + overlay)
- ✅ Jamais d'affichage brut dans UI sans justification
- ✅ Accès admin limité et journalisé

### Audit trail

Tous les événements KYC doivent être journalisés :
```json
{
  "event": "kyc_document_uploaded",
  "user_id": "uuid",
  "document_type": "id_front",
  "timestamp": "2025-01-15T10:30:00Z",
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

### Droits utilisateur

#### Droit d'accès
- GET /user/profile → toutes les données
- GET /user/kyc-documents → liste des documents

#### Droit de suppression
- DELETE /user/kyc-documents → suppression immédiate
- Bouton "Supprimer mes documents" dans `/settings`

#### Droit de portabilité
- GET /user/export → export JSON de toutes les données

### Checklist conformité

- [x] Consentement RGPD explicite avant collecte
- [x] Information claire sur l'utilisation des données
- [x] Durée de conservation affichée (90 jours)
- [x] Chiffrement des documents sensibles
- [x] Presigned URLs (pas de transit serveur)
- [x] Preview floutée (sécurité UI)
- [x] Audit trail complet
- [x] Droit de suppression immédiate
- [x] Accès admin journalisé
- [x] Politique de confidentialité accessible
- [x] Contact DPO disponible

---

## 🧪 Tests

### Tests manuels

#### 1. Test inscription
```bash
# Ouvrir http://localhost:3000/auth
# Remplir formulaire avec données valides
# Vérifier redirection vers /onboarding/kyc
```

#### 2. Test KYC
```bash
# Upload 3 fichiers (ID recto, ID verso, selfie)
# Vérifier preview floutée
# Vérifier soumission et redirection /dashboard
```

#### 3. Test dashboard
```bash
# Vérifier affichage métriques
# Vérifier Guardian Score gauge
# Cliquer "Scanner maintenant"
# Vérifier liste mentions
```

### Tests automatisés (à implémenter)

```typescript
// __tests__/auth/signup.test.tsx
describe('SignupForm', () => {
  it('should require GDPR consent', () => {
    // Test validation
  });
  
  it('should submit valid form', async () => {
    // Test API call
  });
});

// __tests__/kyc/uploader.test.tsx
describe('KYCUploader', () => {
  it('should validate file size', () => {
    // Test max 5MB
  });
  
  it('should validate file type', () => {
    // Test JPG/PNG only
  });
});
```

### Simulation webhook KYC

Pour tester le flow complet sans provider réel :

```bash
curl -X POST http://localhost:3001/kyc/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "status": "verified",
    "provider": "test",
    "timestamp": "2025-01-15T10:30:00Z"
  }'
```

---

## 📝 Notes de développement

### Design Base44
- Background: `#0b1220` (très sombre)
- Cards: `bg-white/5` avec `border-white/10`
- Accents: cyan (`#06b6d4`) et sky (`#0ea5e9`)
- Glassmorphism: `backdrop-blur-md`
- Hover: `scale-[1.02]` transition

### Performance
- Canvas gauge rendu côté client
- Lazy loading des mentions
- Debounce sur recherche
- Cache API avec SWR (à implémenter)

### Accessibilité
- Labels ARIA sur tous les boutons
- Contraste texte conforme WCAG AA
- Navigation clavier complète
- Screen reader friendly

---

## 🚀 Déploiement

### Vercel (recommandé)

```bash
vercel --prod
```

Variables d'environnement à configurer dans Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_KEY`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `BREVO_API_KEY`

### Docker

```bash
docker build -t guardian-frontend .
docker run -p 3000:3000 guardian-frontend
```

---

## 📞 Support

Pour toute question :
- Email: support@guardian.app
- Documentation: https://docs.guardian.app
- DPO: dpo@guardian.app

---

**Version:** 1.0.0  
**Dernière mise à jour:** 24 janvier 2025
