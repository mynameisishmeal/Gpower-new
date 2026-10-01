# Gpower CRM — How to Release an Update (Checklist)

Follow these exact 4 steps every time you make code changes and want to release an update to your desktop users.

---

### Step 1: Bump the Version Number in package.json
> **CRITICAL**: The desktop updater checks `latest.yml`, which gets its version directly from `package.json` (NOT from the GitHub tag). If you create a GitHub release without bumping `package.json`, the app will see `0.1.0` vs `0.1.0` and report that you are already on the latest version!

In `package.json`, bump the version (e.g., to `2.6.0`):
```json
"version": "2.6.0"
```

---

### Step 2: Build the Updated Installer
Run this command in your terminal:
```powershell
npm run electron:dist
```
This automatically compiles Next.js and creates 3 update files in `dist-electron/`:
- `Gpower-CRM-Setup-2.6.0.exe`
- `latest.yml`
- `Gpower-CRM-Setup-2.6.0.exe.blockmap`

---

### Step 3: Commit & Push with GitHub Desktop
1. Open **GitHub Desktop**.
2. Type a summary of your changes (e.g., *"Updated to v2.6.0 - Password security & Inventory search"*).
3. Click **Commit to master**.
4. Click **Push origin**.

---

### Step 4: Publish on GitHub
1. Open: **[github.com/mynameisishmeal/Gpower-new/releases/new](https://github.com/mynameisishmeal/Gpower-new/releases/new)**
2. In **Choose a tag**, type your new version: **`2.6`** (or `v2.6`) and click *Create new tag*.
3. Release title: **`v2.6`**
4. Drag and drop the exact 3 files from `dist-electron/` into the upload box (do not rename them):
   - `Gpower-CRM-Setup-2.6.0.exe`
   - `latest.yml`
   - `Gpower-CRM-Setup-2.6.0.exe.blockmap`
5. Click **Publish release**.

---

### 🚀 What happens next?
- Every user running Gpower CRM will automatically detect the new version in the background.
- It will download the changes and show them the **"Restart & Apply"** button.
- That's it!
