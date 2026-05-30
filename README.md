# AI Portfolio - Setup Guide

## Quick Start

### 1. Create Brand New GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Name:** `ai-portfolio` (NOT the old one)
3. **Description:** Simple AI portfolio
4. Click **Create repository**

### 2. Push Code to GitHub

```bash
cd ai-portfolio-new
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/mitali06/ai-portfolio.git
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repo `ai-portfolio`
4. Add Environment Variable:
   - Name: `CLAUDE_API_KEY`
   - Value: Your API key
5. Click **Deploy**

### 4. Done!

You get a live URL. Share it on LinkedIn!

## Project Structure

```
ai-portfolio-new/
├── index.html      (Your portfolio)
├── api/
│   └── chat.js    (Backend)
└── package.json
```

That's it! Simple and clean.
