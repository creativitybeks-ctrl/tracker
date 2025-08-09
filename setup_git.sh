#!/usr/bin/env bash
set -euo pipefail
echo "== Discipline Tracker Cloud: GitHub setup =="
if ! command -v git >/dev/null; then echo "Please install git first"; exit 1; fi
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
git init
git add .
git commit -m "Initial commit: Discipline Tracker Cloud (Next.js + Supabase + PWA)"
read -p "Enter your GitHub repo URL (e.g., git@github.com:USER/discipline-tracker-cloud.git): " REPO
git branch -M main
git remote add origin "$REPO"
git push -u origin main
echo "Now go to Vercel: New Project -> Import this repo, set env vars, and Deploy."
