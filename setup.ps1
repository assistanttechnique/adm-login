# Installation du projet ADM sous Windows (backend Django + frontend React).
# Usage : powershell -ExecutionPolicy Bypass -File setup.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# Lance une commande externe et s'arrête si elle échoue
function Invoke-Step([string]$Label, [scriptblock]$Command) {
    Write-Host "-> $Label" -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) { throw "Échec : $Label (code $LASTEXITCODE)" }
}

function Assert-Command([string]$Name, [string]$Hint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "$Name introuvable. $Hint" }
}

Assert-Command 'python' 'Installez Python 3.10 ou plus récent : https://www.python.org/downloads/'
Assert-Command 'npm' 'Installez Node.js 20.19+ ou 22.12+ : https://nodejs.org/'

# --- Backend -------------------------------------------------------------
Set-Location (Join-Path $root 'backend')
$python = Join-Path (Get-Location) '.venv\Scripts\python.exe'

if (-not (Test-Path $python)) {
    Invoke-Step 'Création de l''environnement Python (.venv)' { python -m venv .venv }
}
Invoke-Step 'Mise à jour de pip' { & $python -m pip install --quiet --upgrade pip }
Invoke-Step 'Installation des dépendances Python' { & $python -m pip install --quiet -r requirements.txt }

if (-not (Test-Path '.env')) {
    # Nouvelle clé secrète propre à cette machine (jamais versionnée)
    $key = & $python -c "from django.core.management.utils import get_random_secret_key as g; print(g())"
    $content = (Get-Content '.env.example' -Raw) -replace '(?m)^DJANGO_SECRET_KEY=.*$', "DJANGO_SECRET_KEY=$key"
    # UTF-8 sans BOM : un BOM empêcherait python-dotenv de lire la première variable
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) '.env'), $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host '-> backend/.env créé avec une nouvelle clé secrète' -ForegroundColor Cyan
}

Invoke-Step 'Application des migrations' { & $python manage.py migrate }

# --- Frontend ------------------------------------------------------------
Set-Location $root
Invoke-Step 'Installation des dépendances Node (npm ci)' { npm ci }

Write-Host ''
Write-Host 'Installation terminée.' -ForegroundColor Green
Write-Host 'Pour lancer le projet, ouvrez deux terminaux :'
Write-Host '  1) cd backend ; .\.venv\Scripts\python manage.py runserver'
Write-Host '  2) npm run dev'
Write-Host 'Puis ouvrez http://localhost:5173/login'
