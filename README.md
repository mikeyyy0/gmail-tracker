# 📬 Gmail Open Tracker

Track when your sent emails are opened — directly in the Gmail sidebar.

## How It Works

1. When you send an email, a tiny invisible image (tracking pixel) is appended to the message body
2. When the recipient opens the email, their client loads the pixel from your Vercel server
3. The server logs the open event (timestamp, device type) to Supabase
4. The Gmail sidebar shows you all open events for the selected email

---

## Setup Guide (~15 minutes total)

### Step 1 — Create a Supabase Database (3 min)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** — give it a name like `gmail-tracker`
3. Choose a region close to you, set a strong database password
4. Wait ~2 minutes for the project to provision
5. Go to **SQL Editor** → **New Query**, paste the contents of `supabase-schema.sql`, and click **Run**
6. Go to **Project Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `service_role` key (under "Project API keys") → this is your `SUPABASE_SERVICE_KEY`
   - ⚠️ Use the **service_role** key (not anon key) so the server can write to the DB

---

### Step 2 — Deploy to Vercel (5 min)

1. [Create a free Vercel account](https://vercel.com) if you don't have one
2. Push this project to a GitHub repository (or use `vercel deploy` via CLI)
3. In Vercel, import the repository
4. Under **Settings → Environment Variables**, add these three variables:

   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_SERVICE_KEY` | Your Supabase service_role key |
   | `API_SECRET` | A random secret string you invent (e.g. `mys3cr3tkey99`) |

5. Deploy! Note your deployment URL, e.g. `https://gmail-tracker-xyz.vercel.app`

**Test it:** Open `https://YOUR-PROJECT.vercel.app/api/track?id=test123` in your browser — you should see a blank response (the pixel loaded) and no errors.

---

### Step 3 — Install the Google Apps Script Add-on (7 min)

1. Go to [script.google.com](https://script.google.com) and click **New Project**
2. Name it `Gmail Open Tracker`
3. Delete the default `Code.gs` content and paste in the contents of `apps-script/Code.gs`
4. **Update the CONFIG block** at the top of `Code.gs`:
   ```js
   var CONFIG = {
     VERCEL_URL: 'https://YOUR-PROJECT.vercel.app',  // ← your Vercel URL
     API_SECRET: 'YOUR_API_SECRET_HERE',             // ← same secret as Vercel env var
   };
   ```
5. Click the gear icon (**Project Settings**) and check **"Show 'appsscript.json' manifest file in editor"**
6. Click on `appsscript.json` in the file list, replace its contents with the contents of `apps-script/appsscript.json`
7. Click **Deploy → Test deployments** → **Install** to install it on your Gmail
8. Authorize all the permissions it requests (Gmail read/modify, URL fetch, storage)

#### Set up the send trigger:
1. In Apps Script, click the clock icon (**Triggers**)
2. Click **+ Add Trigger**
3. Choose function: `onGmailSend`
4. Event source: **From Gmail**
5. Event type: **On send**
6. Save

---

## Usage

- **Compose and send** an email as normal — the pixel is injected automatically
- **Open your Sent folder** and click any tracked email
- The **sidebar panel** will appear on the right showing open events
- Click **🔄 Refresh** to check for new opens

---

## Limitations

| Limitation | Details |
|---|---|
| **Apple Mail / iOS 15+** | Apple's Mail Privacy Protection pre-fetches images, which may log a false "open" immediately |
| **Image blocking** | Corporate email clients (Outlook, etc.) often block remote images — opens won't be tracked |
| **Overall accuracy** | Roughly 60–70% of real opens are captured — same as all commercial trackers |
| **Plain-text emails** | Tracking pixels only work in HTML emails |

---

## Project Structure

```
gmail-tracker/
├── api/
│   ├── track.js          # Vercel: logs pixel loads (open events)
│   └── opens.js          # Vercel: returns open events for a tracking ID
├── apps-script/
│   ├── Code.gs           # Gmail sidebar + send hook
│   └── appsscript.json   # Add-on manifest
├── supabase-schema.sql   # DB setup script
├── vercel.json           # Vercel configuration
├── package.json
└── README.md
```

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `SUPABASE_URL` | Vercel | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Vercel | Supabase service_role API key |
| `API_SECRET` | Vercel + Apps Script | Shared secret to protect `/api/opens` |

---

## Privacy Note

Email open tracking is a common practice used by most email platforms. However, be aware that some jurisdictions (EU under GDPR, etc.) may require disclosure of tracking to recipients. Use responsibly.
