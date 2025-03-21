import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Détecter si l'environnement est GitHub Pages
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? '/Fake-exodus-website/' : '/', // Utilise la base appropriée en fonction de l'environnement
})
