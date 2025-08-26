# Next.js Todo App

A clean, beautiful Todo app built with Next.js 14, TypeScript, Tailwind CSS, and Zustand.

## Features

- ⚡️ Lightning fast and responsive
- 🎨 Beautiful minimal UI with dark mode
- 📱 Mobile-first design
- 💾 Local storage persistence
- ✨ Smooth animations with Framer Motion
- 🤖 AI-powered chat assistant

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- Capacitor (iOS/Android)

## Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Start dev server

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build && npm start
```

## Building for Mobile

1. Build web app

   ```bash
   npm run build
   ```

2. Add platforms

   ```bash
   npx cap add ios
   npx cap add android
   ```

3. Build and sync

   ```bash
   npx cap sync
   ```

4. Open native IDEs

   ```bash
   npx cap open ios     # Opens Xcode
   npx cap open android # Opens Android Studio
   ```

## Contributing

Pull requests are welcome! See CONTRIBUTING.md for guidelines.

## License

MIT
