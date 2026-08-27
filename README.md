# My-week
A to-do list with creativity 
# My Week PWA v0.22

This package is ready to deploy as a Progressive Web App.

Files:
- index.html
- manifest.webmanifest
- service-worker.js
- icons/

To install it on iPhone:
1. Deploy this folder to any HTTPS static host (for example Vercel, Cloudflare Pages, Netlify, GitHub Pages).
2. Open the deployed URL in Safari.
3. Tap Share → Add to Home Screen.
4. Launch from the new My Week icon.

Notes:
- Tasks and completed items currently use browser localStorage, so they stay on the same device/browser.
- No cloud database is connected yet.
- The daily quote is selected by date, so it stays the same throughout one day and changes on another day.
