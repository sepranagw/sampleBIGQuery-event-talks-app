##Sample Agentic AI Code lab-produced app
#### The first of several
#### The server is up and running! 🎉
#### ──────
#### ✅ Your BigQuery Release Notes App is Live

####   Open http://127.0.0.1:5000 in your browser.

###  What was built

####    File                                                               │ Purpose
####   ────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────   
####    app.py                                                     │ Flask backend — proxies & parses the Atom XML feed into JSON
####    index.html                                                     │ Page structure with modal, tweet bar, skeleton loaders
####    style.css                                                     │ Dark glassmorphism UI with animated orbs and card micro-animations
####    app.js                                                     │ Fetch, render, selection state, tweet composer

###  Features at a glance

####   • 🔄 Refresh button — shimmer skeleton loading while fetching, spinner on the button
####   • 📋 Release note cards — each shows title, date badge, summary excerpt, and a direct link to Google Cloud docs
####   • ☑️ Multi-select — check multiple cards; a sticky tweet bar slides in from the top
####   • 🐦 Tweet (two ways):
#####       • Click the Tweet button on any individual card
#####       • Select multiple cards and click Tweet selected in the bar
#####       • A compose modal pre-fills the tweet text (editable, with a live 280-char counter) and opens Twitter Web Intent — no API keys needed  

#### Quickstart

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/sepranagw/sampleBIGQuery-event-talks-app.git
   cd sampleBIGQuery-event-talks-app
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask development server:**
   ```bash
   python app.py
   ```

4. **Open the app in your browser:**
   ```
   http://127.0.0.1:5000
   ```
