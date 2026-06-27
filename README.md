# Trackly Sand Ops

Trackly is a role-based web app for daily vehicle and sand loading activity at a mining site in India.

## Roles

- Staff: fills daily loading entries and submits them for review.
- Reviewer: reviews pending entries, edits reviewable information, approves or rejects, and downloads the reviewed form.
- Analyst: views revenue, load, and quantity dashboards.
- Admin: manages the full application and creates users.

## Run Locally

```powershell
npm start
```

Open `http://localhost:3000`.

Without Google credentials, the app runs in demo memory mode with these accounts:

- `admin@trackly.local` / `admin123`
- `staff@trackly.local` / `staff123`
- `reviewer@trackly.local` / `review123`
- `analyst@trackly.local` / `analyst123`

## Google Sheets and Drive Setup

1. Create a Google Cloud service account.
2. Enable Google Sheets API and Google Drive API for the project.
3. Create a Google Sheet with these tabs: `Entries`, `Users`, and `AuditLog`.
4. Create a Drive folder for reviewed forms.
5. Share both the Sheet and Drive folder with the service account email as Editor.
6. Copy `.env.example` to `.env` or set the same environment variables before running the server.

The app uses Google Sheets as the database and uploads reviewed HTML forms to Google Drive when `GOOGLE_DRIVE_FOLDER_ID` is configured.

## Docker

Build the image:

```powershell
docker build -t trackly-sand-ops .
```

Run it locally:

```powershell
docker run --rm -p 8080:8080 --env-file .env trackly-sand-ops
```

Then open `http://localhost:8080`.

## Deploy to Google Cloud Run

1. Build and push the container image to Artifact Registry or Container Registry.
2. Deploy the image to Cloud Run.
3. Set these runtime environment variables in Cloud Run:
   - `HOST=0.0.0.0`
   - `PUBLIC_BASE_URL=https://your-service-url.a.run.app`
   - `SESSION_SECRET`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_DRIVE_FOLDER_ID`
   - optional: `ADMIN_EMAIL`, `ADMIN_PASSWORD`

If you are using Cloud Run with an attached service account (recommended), you do not need `GOOGLE_CLIENT_EMAIL` or `GOOGLE_PRIVATE_KEY`.
Instead, attach the service account to the Cloud Run service and share the Sheet/Drive folder with that service account email.

If you cannot use ADC, set both:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` with the raw key contents and literal `\n` escapes.

Example deploy command with service account ADC:

```powershell
gcloud run deploy trackly --source . --region=asia-south1 \
  --service-account=931263418105-compute@developer.gserviceaccount.com \
  --allow-unauthenticated \
  --set-env-vars 'GOOGLE_SHEET_ID=1t8sS_uIMvdNv5KD6FhMe1vYjDc1R4kgFl3DS2Ezv9Kg,GOOGLE_DRIVE_FOLDER_ID=15RQ0ajAk9bcAT48AErSQXfoHjklpsqdt,SESSION_SECRET=replace-with-a-long-random-secret'
```

If you are deploying from PowerShell, use single quotes around the whole `--set-env-vars` value.

## Production Notes

Passwords are stored in hashed form. For stronger production hardening, add HTTPS-only cookie settings, move secrets into Secret Manager, and restrict the Drive folder permissions to your organization.
