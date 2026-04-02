# Rothko Art Generator

Weather-driven abstract art generator built with Next.js (App Router)

## Local Development

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open: `http://localhost:3000`

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`

## Project Structure

- `app/page.jsx`: main page and weather loading
- `app/api/weather/route.js`: weather API endpoint
- `app/lib/weather.js`: weather normalization helpers
- `app/lib/time-of-day.js`: brightness helpers
- `app/components/Canvas.jsx`: canvas render and weather readout

## Data Flow

1. UI requests weather from `/api/weather?q=location`
2. API fetches geocoding, forecast, and air quality from Open-Meteo
3. Data is normalized in `app/lib/weather.js`
4. `Canvas` receives normalized weather and renders output

## CI/CD

- `.github/workflows/ci.yml`: runs lint and build on pull requests and pushes to `main`
- `.github/workflows/deploy-self-hosted.yml`: auto-deploys on push to `main` using self-hosted runner
- `scripts/deploy.sh`: syncs app files, installs production deps, builds, and restarts app

### Self-Hosted Runner Requirements

- Linux self-hosted runner
- Node.js 20 and npm
- `bash` and `rsync`

### Deploy Server Config

Create this file on the runner host:

- `/etc/rothko-generator/deploy.env`

Minimum values:

```bash
DEPLOY_PATH=/var/www/rothko-generator
RESTART_COMMAND='pm2 restart rothko-art-generator || pm2 start npm --name rothko-art-generator -- start'
```

Optional ownership values:

```bash
APP_USER=www-data
APP_GROUP=www-data
```

## Collaboration Workflow

- Use feature branches
- Open pull requests into `main`
- Ensure CI passes before merging

See `CONTRIBUTING.md` for branch and PR guidelines.
