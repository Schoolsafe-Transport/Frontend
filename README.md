# SchoolSafe — Smart School Transportation, Safety & Transit Platform

> **Safe, Verified & Transparent Transit for Every School Journey**

---

## 🎓 Final Graduation Project Information

> **Academic Program**: **Final Graduation Capstone Project**  
> **Supervising Institution**: **Information Network Security Administration (INSA)** / **Cyber Talent Center (CTC)**  
> **Student / Lead Developer**: **Rahel Berhae Weldemariam**  
> **Student / CTC ID**: **CTC-826-26**  
> **Contact Email**: `rahelnaba716@gmail.com`  
> **🌐 Live Web Application**: [https://schoolsafe-eight.vercel.app](https://schoolsafe-eight.vercel.app)  
> **Academic Year**: 2025/2026  

---

## 🌟 Project Overview

**SchoolSafe** is a school transportation, child safety, and transit marketplace platform engineered to protect students and empower families during their daily school commute. Developed as an individual final graduation capstone project for the **Cyber Talent Center (CTC)** and **Information Network Security Administration (INSA)**, SchoolSafe establishes a verified, transparent, and digitally monitored school transit ecosystem.

The platform bridges the gap between parents seeking dependable, background-verified transportation and private transport operators managing student vans and minibuses. Through real-time GPS telemetry, cryptographic QR boarding passes, transparent monthly fare negotiations, and an integrated commercial advertising system, SchoolSafe replaces informal, unmonitored transportation arrangements with a modern, accountable safety infrastructure.

### Verified Target Users
- **Parents & Legal Guardians**: Seeking trustworthy school transportation with real-time vehicle visibility and boarding verification.
- **Transport Providers & Fleet Owners**: Managing vehicle fleets, designated route corridors, student seat capacities, and monthly subscription earnings.
- **Vehicle Drivers**: Accessing daily route manifests, recording student boarding via QR scanners, and broadcasting live location coordinates.
- **Local Businesses & Advertisers**: Promoting family-friendly, educational, and automotive services through approved banner campaigns.
- **System Administrators**: Auditing KYC/KYB documents, inspecting vehicle roadworthiness records, moderating advertisements, and reviewing payments.
- *(Students are managed directly as dependent child profiles under their parent's account with digital QR credentials).*

---

## ⚠️ Problem Statement

Finding reliable and secure school transportation is one of the most critical challenges facing parents today:

1. **Lack of Identity Verification & Safety Vetting**: In informal transportation systems, parents have no way of verifying driver credentials, vehicle roadworthiness inspection certificates, or commercial operating licenses.
2. **Transit Blindspots & Parental Anxiety**: Parents experience acute anxiety after putting their children into morning transit vans without knowing the vehicle's real-time location, arrival time, or route deviations.
3. **Unrecorded Pickups & Missing Custody Transfers**: Traditional transit lacks systematic verification for when and where a child boarded or disembarked, creating dangerous gaps during daily custody transfers.
4. **Opaque Pricing & Inefficient Route Discovery**: Parents struggle to find transit providers servicing their specific neighborhood corridor and school branch, resulting in volatile pricing without formal service agreements.
5. **Administrative Burden & Payment Friction**: Transport providers struggle to manage physical rosters, track cash payments, and confirm bank transfer slips without a centralized management platform.

### How SchoolSafe Solves These Challenges

| Challenge | SchoolSafe Implemented Solution |
| :--- | :--- |
| **Unverified Providers** | Mandatory administrative KYC/KYB document review (driver licenses, roadworthiness certificates, and business registration). |
| **Transit Blindspots** | Real-time GPS broadcasting via WebSockets (Socket.IO) streaming live coordinates to an interactive Leaflet map HUD with speed and heading metrics. |
| **Unverified Custody** | Cryptographically signed Student QR SafePass cards scanned at doorstep pickup and school drop-off, generating timestamped boarding records. |
| **Route Inefficiency** | Searchable transportation marketplace filtered by neighborhood, school, branch, vehicle type, and remaining seat availability. |
| **Contract Uncertainty** | Built-in request-to-agreement workflow with formal monthly fee negotiations, binding digital agreements, and payment receipt tracking. |

---

## 🎯 Project Objectives

- **Child Safety First**: Provide student identification using dynamic QR passes and timestamped boarding/drop-off records.
- **End-to-End Transit Telemetry**: Deliver real-time GPS location streaming from vehicle hardware/mobile GPS to parents and administrators without third-party tracking fees.
- **Verified Marketplace Ecosystem**: Enforce a strict verification pipeline for transport providers, drivers, and vehicles before allowing route listings.
- **Fair & Transparent Pricing**: Enable direct parent-provider fare negotiation and transparent agreement records denominated in Ethiopian Birr (ETB).
- **Comprehensive Administration**: Equip platform administrators with full audit logs, incident management tools, and document inspection interfaces.
- **Sustainable Business Model**: Provide a commercial advertising engine allowing verified local businesses to run contextual promotional banners.

---

## ⚡ Implemented Platform Features

Every feature listed below is fully implemented and verifiable within the repository codebase:

### 1. Authentication, Security & Identity Verification
- **Role-Based Access Control (RBAC)**: Enforces role permissions across all 5 implemented platform roles (`PARENT`, `TRANSPORT_PROVIDER`, `DRIVER`, `BUSINESS`, `ADMIN` / `SUPER_ADMIN`).
- **JWT Session Security**: Stateless access tokens (15-minute expiration) paired with securely stored and revocable refresh tokens (7-day lifecycle).
- **Password Hashing**: One-way cryptographic password hashing powered by `bcryptjs`.
- **Email Verification Flow**: Automated verification email dispatch powered by `nodemailer` with 24-hour verification tokens and verification status confirmation.
- **Password Reset Lifecycle**: Secure forgot-password token generation and password reset views.
- **Fayda National Digital ID Integration**: Ethiopian National ID eSignet OIDC integration (`/api/fayda/auth-url`, `/api/fayda/callback`, `/api/fayda/initiate-fin`, `/api/fayda/verify-fin`) supporting sandbox simulation for identity verification testing.

### 2. Student & Child Profile Management
- **Dependent Child Registration**: Parents can register multiple children with full name, age, grade, school name, branch, medical notes, emergency contacts, and profile photo.
- **Student QR SafePass Generation**: Server-side cryptographic QR code generation (`qrcode`) embedding student identifiers and safety verification tokens.
- **Printable Transport Pass**: High-resolution printable ID pass modal (`PrintableTransportPassModal.tsx`) displaying student photo, route details, emergency contacts, and verifiable QR code for student backpacks.

### 3. Fleet & Route Corridor Management
- **Vehicle Fleet Management**: Transport providers register vehicles with plate numbers, make, model, seating capacity, manufacturing year, and roadworthiness inspection documents.
- **Capacity Constraint Enforcement**: Database-level validation preventing bookings from exceeding licensed vehicle passenger capacity.
- **Route Corridor Definition**: Providers configure start locations, school destinations, branch stops, morning/afternoon schedules, and base monthly fares (ETB).
- **Driver Fleet Assignment**: Linking verified drivers to registered vehicles and designated transit corridors.

### 4. Transportation Marketplace & Agreements
- **Multi-Factor Route Search**: Parents search active routes filtered by neighborhood/corridor, school, branch, vehicle type, price range, and available seats.
- **Direct Transit Requests**: Parents submit seat applications for specific children on verified routes.
- **Fare Negotiation & Counter-Offers**: Built-in offer and counter-offer workflow enabling parents and providers to agree on monthly fees.
- **Binding Transport Agreements**: Automatic conversion of accepted requests into binding `TransportationAgreement` records with locked seat allocation.

### 5. Real-Time GPS Tracking & Live Map HUD
- **Hardware-Level Geolocation**: Frontend device GPS tracking utilizing HTML5 Geolocation (`navigator.geolocation.watchPosition`) with live telemetry HUD, accuracy circle, and simulated route fallbacks.
- **Socket.IO Real-Time Gateway**: Dedicated WebSocket rooms (`room:trip:{tripId}`) streaming live coordinates, vehicle speed, and compass heading every 3–5 seconds.
- **Interactive Leaflet Map**: Responsive map interface with custom vehicle markers, route corridors, telemetry speed gauge, and satellite/street map layers.

### 6. Trip Execution & Boarding Verification
- **Trip Lifecycle Management**: Drivers and providers start, monitor, and complete morning and afternoon transit runs (`SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`).
- **Doorstep QR Check-In Scanner**: Driver mobile console (`DriverConsole.tsx`) and web boarding panel to scan student QR passes, creating timestamped `BoardingRecord` and `DropOffRecord` entries.
- **Real-Time Boarding Notifications**: WebSocket alerts notifying parents the moment their child boards or is dropped off by the vehicle.

### 7. Payment Receipt Workflow & Review
- **Payment Receipt Upload**: Parents upload bank deposit slips, CBE Birr receipts, or Telebirr transaction screenshots (JPG, PNG, PDF via `multer` to secure storage).
- **Administrative Payment Review**: Providers and platform administrators inspect payment receipts, verify bank transaction references, and approve or reject subscription payments.

### 8. Business Advertising Engine
- **Commercial Campaign Management**: Businesses register, create advertising campaigns, upload creative banners, and configure target landing page URLs.
- **Administrative Ad Moderation**: Platform administrators review and approve/reject banner creatives before public display.
- **Live Active Banner Placements**: Dynamic rendering of approved advertising banners (`ActiveAdBanner.tsx`) across parent and provider dashboard interfaces with impression tracking.

### 9. Platform Administration & Governance
- **10-Module Admin Dashboard**: Centralized management for pending provider applications, driver licenses, vehicle roadworthiness certifications, business ads, and payment receipts.
- **Immutable Audit Logging**: Non-deletable records in the PostgreSQL `AuditLog` table capturing administrator IDs, actions, timestamps, and reason codes.
- **Safety Incident Command**: Incident reporting and tracking system for mechanical delays, transit emergencies, or behavioral issues.

---

## 👥 Implemented User Roles

SchoolSafe enforces Role-Based Access Control (RBAC) across **5 distinct active platform roles**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SchoolSafe Implemented Roles                          │
├─────────────────────┬───────────────────────────────────────────────────────┤
│ Parent / Guardian   │ Registers children, searches routes, negotiates fares,│
│                     │ tracks live GPS, downloads QR passes, uploads receipts│
├─────────────────────┼───────────────────────────────────────────────────────┤
│ Transport Provider  │ Registers vehicles & drivers, manages route corridors,│
│                     │ approves parent requests, reviews monthly revenue     │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ Vehicle Driver      │ Accesses mobile console, views daily manifests,       │
│                     │ broadcasts live GPS, scans student boarding QR passes │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ Business / Sponsor  │ Creates promotional ad campaigns, uploads banners,    │
│                     │ monitors campaign click-through rates and impressions │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ System Administrator│ Audits KYC/KYB documents, verifies vehicles/drivers,  │
│                     │ moderates ad campaigns, reviews payments & audit logs │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

> [!NOTE]
> **Student Profiles**: Students are modeled as managed dependent records under authorized parent/guardian accounts. They receive cryptographic QR SafePass credentials and physical boarding passes, while their legal guardians retain full administrative custody and transit oversight.

---

## 💻 Technology Stack

The platform is engineered exclusively with modern, industry-standard technologies verified directly from the codebase:

### Frontend Web Portal (`Apps/web`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `v18.3.1` | Declarative component-driven user interface |
| **TypeScript** | `v5.6.2` | Static typing and compile-time verification |
| **Vite** | `v5.4.8` | Build tool and high-speed development server |
| **Leaflet & OpenStreetMap** | `v1.9.4` | Open-source interactive map rendering and GPS plotting |
| **Socket.IO Client** | `v4.7.5` | Real-time WebSocket subscriptions for GPS telemetry |
| **Axios** | `v1.7.7` | Promise-based HTTP client with interceptors |
| **Lucide React** | `v0.446.0` | Modern iconography suite |
| **CSS3 Design System** | Custom | Responsive, mobile-first design system with CSS custom properties |

### Mobile Application (`Apps/mobile`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React Native** | `v0.76.2` | Cross-platform native mobile application framework |
| **Expo SDK** | `~52.0.0` | Mobile runtime, camera QR scanner, and deployment toolchain |
| **Expo Location** | `~18.0.4` | Hardware GPS telemetry and device coordinate tracking |
| **Expo TaskManager** | `~12.0.3` | Background location tracking task execution |
| **Socket.IO Client** | `^4.7.5` | Live GPS streaming from vehicle driver to WebSocket gateway |
| **TypeScript** | `~5.3.3` | Mobile typed architecture and safety assertions |

### Backend API & Real-Time Gateway (`server`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=18.0.0` | Asynchronous event-driven server runtime environment |
| **Express.js** | `v4.21.0` | Web application framework for RESTful routing and middleware |
| **TypeScript** | `v5.6.2` | Strongly-typed backend service and controller architecture |
| **PostgreSQL** | `v16` | Enterprise relational database management system |
| **Prisma ORM** | `v5.20.0` | Type-safe database client, schema migrations, and relational modeling |
| **Socket.IO** | `v4.7.5` | Bi-directional WebSocket server with room partitioning |
| **JSON Web Tokens (JWT)**| `v9.0.2` | Stateless authentication with access and refresh tokens |
| **bcryptjs** | `v2.4.3` | One-way cryptographic password hashing |
| **Zod** | `v3.23.8` | Schema validation for all incoming HTTP payloads |
| **QRCode** | `v1.5.4` | Server-side QR SafePass bitmap and data URL generation |
| **Multer** | `v2.5.0` | Multipart file upload handler for payment receipts & documents |
| **Nodemailer** | `v10.1.7` | SMTP email transport for account verification tokens |
| **Helmet & Rate Limit** | `v7.1 / v8.7` | HTTP security headers and API rate-limiting defenses |

---

## 🏗️ System Architecture

SchoolSafe employs a modular, layered architecture designed for scalability, low-latency telemetry streaming, and zero-trust security.

```mermaid
flowchart TD
    subgraph Clients["Client Tier"]
        WP["Web Portal (React 18 + Vite)<br/>Parents • Transport Providers • Admins • Businesses"]
        MA["Mobile App (React Native + Expo)<br/>Vehicle Drivers (Console & GPS) • Parents (Alerts)"]
    end

    subgraph Gateway["API & Communication Gateway"]
        HTTPS["HTTPS REST API<br/>Express.js + Zod Validation"]
        WSS["WebSocket Telemetry Gateway<br/>Socket.IO (Room-Based Pub/Sub)"]
    end

    subgraph Backend["Application Services Tier (Node.js + TypeScript)"]
        AUTH["Auth & RBAC Service<br/>(JWT + bcrypt + Email Verification)"]
        TRANS["Transportation Service<br/>(Routes, Requests, Agreements)"]
        TRIP["Trip & GPS Telemetry Dispatcher<br/>(Live Coordinate Broadcasting)"]
        QR["QR SafePass Service<br/>(Generation & Boarding Validation)"]
        PAY["Payment Receipt Service<br/>(Multer File Review & Approval)"]
        AD["Advertising Campaign Engine<br/>(Creative Assets & Impression Counters)"]
        AUDIT["System Audit Logger<br/>(Administrative Governance)"]
    end

    subgraph Data["Persistence & Storage Tier"]
        DB[("PostgreSQL 16 Database<br/>(Managed via Prisma ORM - 24 Models)")]
        FS["Secure File Storage<br/>(/storage/receipts & documents)"]
    end

    subgraph External["External Integrations"]
        FAYDA["Fayda National ID Integration<br/>(eSignet OIDC Sandbox)"]
        SMTP["SMTP Mail Transport<br/>(Transactional Verification Emails)"]
        OSM["OpenStreetMap Tile Servers<br/>(Cartographic Map Tiles)"]
    end

    WP -->|HTTP REST Requests| HTTPS
    WP -->|Subscribe to Trip Rooms| WSS
    MA -->|HTTP REST Requests| HTTPS
    MA -->|Stream Driver GPS Coordinates| WSS

    HTTPS --> AUTH
    HTTPS --> TRANS
    HTTPS --> PAY
    HTTPS --> AD
    HTTPS --> AUDIT

    WSS --> TRIP
    HTTPS --> QR

    AUTH --> DB
    TRANS --> DB
    TRIP --> DB
    QR --> DB
    PAY --> DB
    PAY --> FS
    AD --> DB
    AUDIT --> DB

    AUTH -.->|OIDC Sandbox Verification| FAYDA
    AUTH -.->|Send Verification Tokens| SMTP
    WP -.->|Map Tiles| OSM
```

---

## 🚀 Installation & Setup

Follow these instructions to clone, configure, and execute the SchoolSafe ecosystem on your local workstation.

### Prerequisites
Ensure your system has the following installed:
- **Node.js**: `v18.0.0` or higher (recommended: `v20.x LTS`)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14` or higher (or Docker Desktop installed)
- **Git**: `v2.30` or higher
- **Expo Go App** *(Optional, for testing mobile application on Android/iOS)*

---

### Step 1: Clone the Repository
```bash
# Clone the repository
git clone https://github.com/Schoolsafe-Transport/SchoolSafe.git

# Navigate to the project root directory
cd SchoolSafe
```

---

### Step 2: Configure Environment Variables

Create the `.env` configuration files for each component using the provided `.env.example` templates:

```bash
# 1. Root Monorepo Environment
cp .env.example .env

# 2. Backend Server Environment
cp server/.env.example server/.env
```

> [!WARNING]
> **Security Notice**: Never commit `.env` files containing real database passwords, JWT secrets, or SMTP credentials to public repositories. Ensure `.env` is listed in your `.gitignore`.

---

### Step 3: Database Setup & Migration

#### Option A: Using Docker Compose (Recommended)
You can launch a PostgreSQL 16 container pre-configured for SchoolSafe in seconds:
```bash
# From the project root
docker compose up -d
```

#### Option B: Using Local PostgreSQL
If running a native PostgreSQL service, create a new database:
```sql
CREATE DATABASE schoolsafe_db;
```
Ensure your `DATABASE_URL` in `server/.env` points to your PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/schoolsafe_db?schema=public"
```

#### Run Prisma Migrations & Generate Client
```bash
# Navigate to the server directory
cd server

# Install server dependencies
npm install

# Generate Prisma Client types
npx prisma generate

# Apply database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with initial roles, admin, and test data
npm run seed
```

---

### Step 4: Start the Backend Server

```bash
# Ensure you are in the server directory
cd server

# Start the development server with live reload
npm run dev
```
- **API Server Address**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

### Step 5: Start the Web Frontend Portal

Open a new terminal window:
```bash
# From the project root, navigate to the web app
cd Apps/web

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
- **Web Application Address**: `http://localhost:5173`
- Open your browser and navigate to `http://localhost:5173` to access the SchoolSafe portal.

---

### Step 6: Run the Mobile Application (Driver & Alerts)

Open another terminal window:
```bash
# From the project root, navigate to the mobile app
cd Apps/mobile

# Install mobile dependencies
npm install

# Start the Expo development server
npx expo start
```
- **Testing on Physical Device**: Scan the generated QR code using the **Expo Go** app (Android) or Camera app (iOS) on the same Wi-Fi network.
- **Testing on Android Emulator**: Press `a` in the terminal.
- **Testing on iOS Simulator**: Press `i` in the terminal (macOS required).

---

### Monorepo Shortcut Commands
From the project root, you can also run the full suite using monorepo scripts:
```bash
npm run dev:server    # Launches the backend Express API
npm run dev:web       # Launches the Vite React frontend
npm run dev:mobile    # Launches the Expo React Native app
npm run docker:up     # Starts the PostgreSQL Docker container
npm run docker:down   # Stops the PostgreSQL container
```

---

## 🔐 Environment Variables

The table below describes the required environment variables. A clean template is provided in `.env.example`.

### Server Configuration (`server/.env`)

```env
# ===================================================
# Server & Environment Settings
# ===================================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# ===================================================
# PostgreSQL Database Connection (Prisma)
# ===================================================
DATABASE_URL=postgresql://postgres:your_db_password@localhost:5432/schoolsafe_db?schema=public

# ===================================================
# JWT Authentication Secrets
# ===================================================
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_min_32_characters
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min_32_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===================================================
# SMTP Email Transport (Account Verification)
# ===================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email_account@gmail.com
SMTP_PASS=your_email_app_specific_password
SMTP_PASSWORD=your_email_app_specific_password
EMAIL_FROM=noreply@schoolsafe.et

# ===================================================
# Ethiopian National ID Fayda (eSignet OIDC Sandbox)
# ===================================================
FAYDA_CLIENT_ID=your_fayda_client_id_placeholder
FAYDA_CLIENT_SECRET=your_fayda_client_secret_placeholder
FAYDA_REDIRECT_URI=http://localhost:5000/api/fayda/callback
FAYDA_ISSUER_URL=https://esignet.ida.fayda.et
FAYDA_AUTHORIZE_URL=https://esignet.ida.fayda.et/authorize
FAYDA_TOKEN_URL=https://esignet.ida.fayda.et/v1/esignet/oauth/v2/token
FAYDA_USERINFO_URL=https://esignet.ida.fayda.et/v1/esignet/oidc/userinfo

# ===================================================
# Storage Configuration
# ===================================================
RECEIPTS_STORAGE_DIR=./storage/receipts
```

### Web Client Configuration (`Apps/web/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Mobile App Configuration (`Apps/mobile/.env`)

```env
# For physical devices, replace localhost with your workstation LAN IP (e.g. 192.168.1.15)
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📁 Project Structure

```text
SchoolSafe/
├── Apps/
│   ├── mobile/                          # React Native + Expo Mobile Application
│   │   ├── assets/                      # Application icons, splash screens, logos
│   │   ├── src/
│   │   │   ├── components/              # Mobile screens & views
│   │   │   │   ├── AuthScreen.tsx       # Driver/Parent mobile login & token handling
│   │   │   │   ├── DriverConsole.tsx    # Route manifest, GPS broadcast, QR boarding scanner
│   │   │   │   └── ParentPortal.tsx     # Student tracking view & quick status alerts
│   │   │   ├── config/                  # Environment resolution
│   │   │   ├── services/                # Axios API client, Socket.IO, Expo Location service
│   │   │   └── types/                   # TypeScript interfaces
│   │   ├── App.tsx                      # Mobile entry point
│   │   ├── app.json                     # Expo manifest & permission declarations
│   │   └── package.json
│   │
│   └── web/                             # React 18 + Vite Web Application
│       ├── public/                      # Static assets & brand logos (logo-shield.png)
│       ├── src/
│       │   ├── components/              # Modular UI components
│       │   │   ├── admin/               # Admin approval panels, audit logs, verification modals
│       │   │   ├── dashboard/           # LiveTrackingMap.tsx (Leaflet GPS), HUD, passes
│       │   │   └── marketplace/         # Search, routes, agreements, ad banners
│       │   ├── context/                 # AuthContext.tsx (Global auth & token state)
│       │   ├── pages/                   # Application route pages
│       │   │   ├── admin/               # Dedicated System Administrator workspace
│       │   │   ├── DashboardView.tsx    # Multi-role unified dashboard
│       │   │   ├── RegisterView.tsx     # Role-based onboarding wizard
│       │   │   ├── LoginView.tsx        # Multi-role authentication view
│       │   │   ├── EmailVerificationView.tsx # Email token confirmation page
│       │   │   ├── FaydaVerificationView.tsx # National ID verification portal
│       │   │   ├── AboutView.tsx        # Platform mission & INSA capstone information
│       │   │   └── ContactView.tsx      # Support & inquiries view
│       │   ├── services/                # API client (Axios) & WebSocket subscriptions
│       │   ├── styles/                  # admin.css (Administration styling)
│       │   ├── index.css                # Responsive vanilla CSS design system
│       │   └── main.tsx                 # Vite application mount
│       ├── index.html                   # HTML entry point
│       └── vite.config.ts               # Vite configuration
│
├── server/                              # Node.js + Express Backend Engine
│   ├── prisma/
│   │   ├── migrations/                  # Historical SQL database migrations
│   │   ├── schema.prisma                # PostgreSQL Prisma schema (24 models)
│   │   └── seed.ts                      # Database seeding script
│   ├── src/
│   │   ├── config/                      # Database connection, JWT config, environment validation
│   │   ├── controllers/                 # HTTP controller handlers
│   │   ├── middleware/                  # JWT auth, RBAC guards, Multer upload filters
│   │   ├── routes/                      # Express route modules
│   │   │   ├── admin.routes.ts          # KYC verification, system metrics, audit logs
│   │   │   ├── advertising.routes.ts    # Ad campaigns, creatives, impressions
│   │   │   ├── auth.routes.ts           # Registration, login, verification, password reset
│   │   │   ├── fayda.routes.ts          # Fayda OIDC OAuth authorization & callback
│   │   │   ├── health.routes.ts         # Service status & diagnostic probes
│   │   │   ├── notification.routes.ts   # System notification dispatch
│   │   │   └── transportation.routes.ts # Vehicles, routes, requests, agreements, trips
│   │   ├── schemas/                     # Zod runtime payload validation schemas
│   │   ├── services/                    # Core business logic services
│   │   ├── socket/                      # Socket.IO telemetry and room handlers
│   │   ├── utils/                       # QR generation, token signing, mail dispatch
│   │   ├── app.ts                       # Express application middleware configuration
│   │   └── server.ts                    # HTTP & WebSocket server bootstrap
│   ├── storage/                         # Local storage for payment receipts & documents
│   ├── tests/                           # Jest & Supertest automated test suite
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                                # Technical & System Documentation
│   ├── ARCHITECTURE.md                  # Comprehensive system & security architecture
│   └── DATABASE_SCHEMA.md               # 24 core relational entities specification
│
├── docker-compose.yml                   # PostgreSQL 16 container definition
├── package.json                         # Monorepo scripts & dev dependencies
└── README.md                            # Official project documentation
```

---

## 📸 Screenshots & Demo

### Application Interface Placeholders

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       [Insert Screenshot 1 Here]                            │
│                 Parent Portal: Live GPS Tracking & HUD                      │
│      (Shows interactive Leaflet map, bus speed gauge, and arrival time)     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       [Insert Screenshot 2 Here]                            │
│            Printable Student Transport Pass with QR SafePass                │
│    (Shows student photo, authorized pickup contacts, and verifiable QR)     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       [Insert Screenshot 3 Here]                            │
│           Driver Mobile Console & Doorstep Check-in Scanner                 │
│      (Shows route manifest, passenger check-in status, and camera feed)     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       [Insert Screenshot 4 Here]                            │
│         System Administrator Dashboard & Verification Workflows             │
│        (Shows pending provider licenses, vehicle fleet, and audit logs)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 CTC / INSA Project Submission Information

This project is submitted in fulfillment of the final graduation capstone requirements for the **Cyber Talent Center (CTC)** and **Information Network Security Administration (INSA)**.

### 1. Live Deployment & Repository Links
- **🌐 Live Production Web App**: [https://schoolsafe-eight.vercel.app](https://schoolsafe-eight.vercel.app)
- **Primary Monorepo**: `[Insert Primary Monorepo Link, e.g., https://github.com/Schoolsafe-Transport/SchoolSafe]`
- **Frontend Web Repository**: `https://github.com/Schoolsafe-Transport/Frontend.git`
- **Mobile Application Repository**: `https://github.com/Schoolsafe-Transport/Mobile-App.git`

### 2. Five-Minute Video Presentation
- **Video Title**: SchoolSafe — Complete System Walkthrough & Live Safety Demonstration
- **Video Link**: `[Insert 5-Minute Video Presentation Link Here — e.g., YouTube / Google Drive / Loom]`
- **Video Scope**: Includes voice-over demonstration explaining project motivations, user roles, real-time GPS tracking, QR code boarding verification, payment review workflows, and platform administrative governance.

### 3. Project Summary
- **Project Name**: SchoolSafe
- **Project Type**: Smart School Transportation, Child Safety & Transit Marketplace Platform
- **Supervising Institution**: Information Network Security Administration (INSA) / Cyber Talent Center (CTC)
- **Academic Year**: 2025/2026

### 4. Author & Developer Information

| Full Name | Student / CTC ID | Role / Core Responsibilities | Contact Email |
| :--- | :--- | :--- | :--- |
| **Rahel Berhae Weldemariam** | **CTC-826-26** | **Lead Full-Stack Developer & System Architect** *(Individual Project)*<br>• System Architecture & PostgreSQL Database Modeling (24 entities)<br>• Express REST API, Zod Validation, RBAC & JWT Security<br>• Real-Time Socket.IO GPS Telemetry Gateway<br>• React 18 Web Portal, Admin Dashboard & Leaflet Maps<br>• QR SafePass Cryptographic Generation & Scanning Flows | `rahelnaba716@gmail.com` |

---

## 🔮 Future Improvements

While SchoolSafe provides a fully functional transportation management and safety platform, the following architectural milestones are planned for future production scaling:

1. **Production Fayda National ID Gateway**: Upgrading from the current sandbox/demo eSignet simulation to live production verification once official government partner API keys are issued.
2. **Automated Payment Gateways**: Integrating automated payment webhooks (Chapa, Telebirr Direct Gateway) alongside the existing verified offline receipt upload system.
3. **Native Push Notifications**: Implementing background mobile push notifications (FCM / APNS) to complement the existing real-time WebSocket alerts.
4. **Multilingual Support**: Providing native localization for Amharic (*አማርኛ*) and Afaan Oromoo (*Oromiffa*).

---

## 📄 License

This project is licensed under the **ISC License**.

```text
ISC License

Copyright (c) 2026 SchoolSafe Project Team

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

<div align="center">
<strong>SchoolSafe — Ensuring Every Child Arrives Safely, Every Single Day.</strong><br>
Final Graduation Capstone Project for Cyber Talent Center (CTC) / INSA Evaluation.
</div>
