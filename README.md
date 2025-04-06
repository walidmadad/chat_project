# 💬 MessengerApp – Application de Chat en Temps Réel

MessengerApp est une application de chat en temps réel, multi-utilisateurs, avec une interface en **React** (Next.js), un serveur **TCP en C**, et un **proxy WebSocket en Node.js**.

---

## 🖼️ Aperçu de l'Interface

- Page d’accueil avec champ pseudo
- Interface de chat en temps réel
- Envoi avec bouton ou touche Entrée
- Affichage dynamique des messages

---

## 🔧 Technologies Utilisées

| Partie              | Stack                     |
| ------------------- | ------------------------- |
| **Frontend**        | React (Next.js), Tailwind |
| **Proxy WebSocket** | Node.js, ws               |
| **Backend TCP**     | C (Sockets, Threads)      |

---

## 🗂️ Structure du Projet

```
MessengerApp/
├── front/ # Frontend React (Next.js)
│ ├── public/
│ │ └── favicon.ico # Icône de l'application
│ ├── src/
│ │ └── app/
│ │ ├── globals.css # Fichier CSS global
│ │ ├── layout.js # Layout global
│ │ └── page.js # Page principale de l'application
│ ├── .gitignore
│ ├── jsconfig.json
│ ├── next.config.mjs # Configuration Next.js
│ ├── package.json # Dépendances frontend
│ ├── package-lock.json
│ ├── postcss.config.mjs # Configuration PostCSS
│ └── README.md
│
├── server/ # Serveur TCP en C
│ ├── client.c # Code source du client en C
│ └── server.c # Code source du serveur TCP
│
├── webSocket/ # Proxy WebSocket entre frontend et serveur C
│ ├── package.json # Dépendances proxy WebSocket
│ ├── package-lock.json
│ ├── proxy.js # Fichier principal du proxy WebSocket
│ └── README.md
```

---

## 🚀 Fonctionnalités

- 🔒 Connexion via pseudo
- 💬 Envoi/réception de messages en temps réel
- 🌐 Communication client ↔ WebSocket ↔ TCP server
- 🧵 Serveur multiclient géré avec `pthread` en C
- ⚡ Interface responsive (React + Tailwind)

---

## ⚙️ Prérequis

- Node.js `v16+`
- Un compilateur C (`gcc`)
- NPM / Yarn
- Navigateur moderne

---

## 🛠️ Installation & Lancement

### Installation

### 1. Cloner dépot

```bash
git clone https://github.com/walidmadad/chat_project.git
cd chat_project
```

### 2. Lancer le Serveur TCP

Depuis le dossier `server/` :

```bash
cd server
gcc -o server server.c -lpthread
./server
```

Le serveur écoute sur le port **2525**.

### 3. Lancer le Proxy WebSocket

Depuis webSocket/ :

```bash
cd webSocket
npm install
node proxy.js
```

Le proxy écoute sur ws://localhost:3001 et relaie les messages vers le serveur TCP (localhost:2525).

### 4. Lancer le Client React

```bash
cd front
npm install
npm run dev
```

L'interface React se connecte automatiquement au proxy WebSocket (ws://localhost:3001).

## Contributeurs

- **Walid Madad**
- **Mehdi Himmiche**
