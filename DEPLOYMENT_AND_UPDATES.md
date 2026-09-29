# Gpower CRM — Seamless Uploads & Auto-Updates Guide

This guide explains how to release new updates to your desktop users seamlessly using GitHub Releases and electron-updater.

---

## 🚀 How the Auto-Update System Works

1. **Automatic Background Check**: Whenever Gpower CRM is launched, it silently contacts GitHub Releases (`mynameisishmeal/Gpower-new`) after 5 seconds to check if a new version is available. It also re-checks every 4 hours.
2. **Differential Delta Downloads**: When an update is detected, the app downloads only the differential block changes (`.blockmap`) in the background while users continue working without interruption.
3. **Update UI Notification**: A floating card appears in the bottom-right corner showing download progress (`Downloading... X%`).
4. **Instant Installation**: Once downloaded, users can click **"Restart & Apply"** to install immediately, or the update will automatically apply the next time the app quits.

---

## 🛠️ Method 1: Automated Release via GitHub Actions (Recommended)

GitHub Actions builds the Windows installer and publishes the release completely in the cloud.

### Step 1: Configure GitHub Repository Secrets (One-time Setup)
1. Go to your GitHub repository: [mynameisishmeal/Gpower-new](https://github.com/mynameisishmeal/Gpower-new).
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**:
   - **`ENV_LOCAL`**: Paste the full contents of your `.env.local` file (or provide `MONGODB_URI` and `NEXTAUTH_SECRET`).

> [!NOTE]
> GitHub provides `GITHUB_TOKEN` automatically with write permissions configured in `.github/workflows/release.yml`.

### Step 2: Trigger a Release
You can trigger a release in either of two ways:

#### Option A: 1-Click from GitHub UI
1. Go to **Actions** tab on your GitHub repository.
2. Select **Release Electron Desktop App** from the left sidebar.
3. Click **Run workflow** > **Run workflow**.

#### Option B: Push a Git Version Tag
In your terminal, bump the version and push a tag:
```powershell
npm run version:patch
git add package.json
git commit -m "Release v0.1.1"
git tag v0.1.1
git push origin main --tags
```
GitHub Actions will automatically build `Gpower CRM Setup 0.1.1.exe`, attach `latest.yml`, and publish the release.

---

## 💻 Method 2: Direct Release from Your Local Machine

If you prefer to build and upload directly from your computer:

### Step 1: Set your GitHub Token
Generate a GitHub Personal Access Token (classic) with `repo` scope at [github.com/settings/tokens](https://github.com/settings/tokens), then in PowerShell:
```powershell
$env:GH_TOKEN = "your_github_personal_access_token_here"
```

### Step 2: Bump Version & Publish
```powershell
npm run version:patch
npm run electron:publish
```
`electron-builder` will:
1. Terminate any running local instances to avoid file locks.
2. Build the optimized Next.js server bundle.
3. Package the native Windows installer.
4. Upload `Gpower CRM Setup X.Y.Z.exe`, `latest.yml`, and `.blockmap` directly to GitHub Releases.

---

## 🧪 Testing Auto-Updates Locally
To verify auto-updates in action:
1. Current version installed is `0.1.0`.
2. Release version `0.1.1` to GitHub Releases using Method 1 or Method 2.
3. Launch `0.1.0` — within 5–10 seconds, the update notification card will appear in the bottom-right corner and begin downloading the new version!
