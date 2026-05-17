# Static Site Generator Configuration

This is a **fully static website** configured for deployment on both Netlify and GitHub Pages. No server required!

## Build Output

✅ Production build creates a `dist/` folder with:
- `index.html` - Entry point
- `assets/` - Bundled CSS, JavaScript, and images
- `_redirects` - Netlify routing config for client-side navigation

## Deployment Options

### Option 1: GitHub Pages (Recommended for repo: Custom-Core-Labs-v1.0)

The site deploys to: `https://yourusername.github.io/Custom-Core-Labs-v1.0/`

**Automatic Deployment:**
1. Push to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) runs automatically
3. Builds and deploys to GitHub Pages

**Manual Deployment:**
```bash
npm run build
# Upload dist/ folder to GitHub Pages via settings
```

### Option 2: Netlify

Deploy to your own domain at the root path.

**Automatic Deployment:**
1. Connect your GitHub repo to Netlify
2. `netlify.toml` configures build automatically
3. Every push triggers a deploy

**Manual Deployment:**
```bash
npm run build
# Drag dist/ folder to Netlify
```

**Environment Variable (optional):**
For root-path deployment on Netlify, set in Netlify dashboard:
```
VITE_BASE_PATH = /
```

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Production Build

```bash
npm run build
npm run preview
```

The `dist/` folder is ready to deploy!

## Static Site Features

✅ Client-side React routing (no server needed)
✅ All assets bundled and minified
✅ Cache busting with hash filenames
✅ Tailwind CSS optimization
✅ Production-ready performance
✅ Works offline (if cached)

## Deployment Checklist

- [x] Static build configured (dist/)
- [x] Client-side routing redirects (/_redirects, netlify.toml)
- [x] Base path support for GitHub Pages (/Custom-Core-Labs-v1.0/)
- [x] GitHub Actions CI/CD ready
- [x] Netlify deployment ready
- [x] No server-side dependencies

## Verify Deployment

After deploying, check:
1. Home page loads at `/` or `/Custom-Core-Labs-v1.0/`
2. Navigation links work (e.g., `/showcases` → `/Custom-Core-Labs-v1.0/showcases`)
3. Refresh works on all pages (should stay on correct page)
4. Styling fully loaded (Tailwind CSS applied)
