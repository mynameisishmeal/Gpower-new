# Gpower CRM — How to Release an Update (Checklist)

Follow these exact 4 steps every time you make code changes and want to release an update to your desktop users.

---

### Step 1: Bump the Version Number
In `package.json`, increase the version number (e.g. from `0.1.0` to `0.1.1`):
```json
"version": "0.1.1"
```
*(Or simply run `npm run version:patch` in your terminal)*.

---

### Step 2: Build the Updated Installer
Run this command in your terminal:
```powershell
npm run electron:dist
```
This builds the new installer and automatically creates 3 update files in the `dist-electron/` folder:
- `Gpower CRM Setup 0.1.1.exe`
- `latest.yml`
- `Gpower CRM Setup 0.1.1.exe.blockmap`

---

### Step 3: Commit & Push with GitHub Desktop
1. Open **GitHub Desktop**.
2. Type a summary of your changes (e.g., *"Fixed login bug & updated to v0.1.1"*).
3. Click **Commit to master**.
4. Click **Push origin**.

---

### Step 4: Publish on GitHub
1. Open: **[github.com/mynameisishmeal/Gpower-new/releases/new](https://github.com/mynameisishmeal/Gpower-new/releases/new)**
2. In **Choose a tag**, type your new version: **`v0.1.1`** (click *Create new tag*).
3. Release title: **`v0.1.1`**
4. Drag and drop these 3 files from `dist-electron/` into the upload box:
   - `Gpower CRM Setup 0.1.1.exe`
   - `latest.yml`
   - `Gpower CRM Setup 0.1.1.exe.blockmap`
5. Click **Publish release**.

---

### 🚀 What happens next?
- Every user running Gpower CRM will automatically detect the new version in the background.
- It will download the changes and show them the **"Restart & Apply"** button.
- That's it!
