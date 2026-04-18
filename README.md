# Rothko Art Generator

Weather-driven abstract art generator built with Next.js (App Router)

## Features

- Weather-based art generation
- Responsive design with Tailwind CSS
- Automated CI/CD pipeline
- Cross-platform deployment packaging

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run package` - Create deployment package

## Deployment

GitHub Actions automatically deploys on:

- Push to `develop` - staging deployment
- Push to `main` - production deployment

Manual deployment:

```bash
npm run package
```

Upload `rothko-generator-deploy.zip` to hosting platform.

## Project Structure

```
app/
  api/weather/           # Weather API endpoint
  components/            # React components
  lib/                   # Utility functions
  page.jsx              # Main page
scripts/                 # Deployment scripts
__tests__/              # Tests
```

## How It Works

1. UI requests weather from `/api/weather?q=location`
2. API fetches data from Open-Meteo
3. Weather data is normalized
4. Canvas renders art based on conditions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

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
