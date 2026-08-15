# 3D-POSM

**3D POSM** is a web-based 3D printing service that allows customers to upload STL files, configure their printing preferences, calculate estimated filament usage and printing cost, and manage their orders.

The system also provides an administrator dashboard for managing customer orders and downloading uploaded STL files.

## Features

### Customer

* Register and Login
* Upload STL files
* Create 3D printing orders
* Select printing material
    * PLA
    * PETG
    * ABS
* Configure infill percentage
* Configure layer height
* Configure wall thickness
* Calculate estimated filament usage
* Calculate printing price
* View order history
* View order status

### Administrator

* Admin dashboard
* View all customer orders
* Search orders
* Filter orders by status and material
* View order information
* Download uploaded STL files
* Manage order status

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend & Services

* Next.js API Routes
* Firebase Authentication
* Firebase Firestore
* Firebase Storage
* Firebase Admin SDK

### Deployment

* Vercel

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/N-Cloudss/webdev_tekken.git
cd webdev_tekken
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

PRUSA_SLICER_PATH=""

FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""
```

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Pembagian Tugas


| **Nama** | **Tugas** |
| -------- | -------- |
| Jonathan  |   Membuat login page, sign in page, landing page, dan order detail page. Mengerjakan backend seperti, mengintegrasikan slicer sebagai backend engine ke website, setup firebase authentication, firebase database, dan supabase bucket storage. |
| Amara    | Membuat Client Dashboard dan mengintegrasikan ke backend     |
| Rafif    |  Membuat  order page dan mengintegrasikan ke backend      |
| Gerhard    | Membuat admin page dan mengintegrasikan ke backend     |