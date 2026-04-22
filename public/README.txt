KOMP — PWA Icon Update Kit
===========================

Why you're still seeing the old icon
------------------------------------
PWAs aggressively cache their install icon. Once Android or iOS has
installed your app with a given icon, the OS stores that PNG and will
not re-fetch it until you:

  1. Change the icon URL (or the manifest filename/content)
  2. AND uninstall + reinstall the app on your phone
     (or, on some phones, just clear the browser cache and long-press
      the install banner again)

Simply pushing a new `icon-192.png` with the same URL often isn't enough.
That's why this kit uses the same filenames your project probably already
has, but bumps the service-worker cache version to force re-fetching.


Files in this kit
-----------------
Drop these into your `public/` folder:

  icon-192.png              — standard, ~72% logo
  icon-512.png              — standard, ~72% logo
  icon-maskable-192.png     — maskable (~56% logo, safe-zone respected)
  icon-maskable-512.png     — maskable (~56% logo, safe-zone respected)
  apple-touch-icon.png      — 180×180 for iOS home screen
  favicon-32.png            — browser tab favicon
  manifest.json             — references all four install icons
  sw.js                     — service worker with cache-bust version

And the snippet `index.html.head.txt` shows the <head> tags you need.


Deployment steps
----------------
1. Copy all the PNGs + manifest.json + sw.js into your project's
   `public/` directory (overwrite the old ones).

2. Open `public/index.html` (or `index.html` in your Vite root) and
   make sure the <head> tags match `index.html.head.txt`. Remove or
   comment out any old `<link rel="icon">` or `<link rel="apple-touch-icon">`
   that points to a different file.

3. Commit, push, let Vercel redeploy.

4. ON YOUR PHONE — this is the step people skip:

   a) Delete the existing KOMP app from your home screen.
   b) Open Chrome/Safari and hard-refresh the site
      (pull-to-refresh a few times; on iOS Safari, close the tab and
      reopen from scratch).
   c) Re-install via "Add to Home Screen".

   The new K icon should appear.

   If it still doesn't, clear the browser's site data for your domain
   (Chrome: Settings → Site settings → your domain → Clear data) and
   try step (c) again.


Why maskable icons
------------------
On Android 8+, the launcher picks a shape (circle, rounded square,
teardrop, squircle — varies by OEM) and crops your icon into it. If
the app only provides "any" purpose icons, Android wraps them in a
small white square to avoid cropping content — which looks bad.

Maskable icons tell the OS "this icon is safe to crop; the important
content stays inside the centered 80%-diameter safe zone". Your K now
sits at ~56% of the frame so it survives even the most aggressive
crop shapes.


How the cache-bust works
------------------------
`sw.js` has `CACHE_VERSION = "komp-v2-icons"`. When the phone fetches
the new `sw.js`, it sees a different version string than the one
cached on device, activates it (`skipWaiting` + `clients.claim`), and
deletes every older cache entry — including old icons. Next time the
OS asks for `/icon-512.png`, it goes back to the network instead of
returning the stale version.

If you change icons again later, bump the version: `komp-v3-icons`,
`komp-v4-something`, etc. Any different string works.


Sanity check after deploy
-------------------------
Open the live site on desktop Chrome:

  1. DevTools → Application tab
  2. Manifest: should list all 4 icons, all should preview correctly
  3. Service Workers: should show `komp-v2-icons` as active
  4. Storage → Clear site data (optional but fastest way to verify
     a fresh install)
