# Rothko Art Generator - Barebone Starter

A minimal Next.js starter project to build a Rothko-style abstract art generator.

## Quick Start

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`

## File Structure

```
app/
├── api/
│   └── weather/
│       └── route.js          (Weather API endpoint - implement this)
├── components/
│   ├── Canvas.jsx            (Main canvas - implement drawing logic)
│   ├── SettingsPanel.jsx     (Settings sliders)
│   ├── Footer.jsx            (Footer)
│   └── LocationInput.jsx     (Location search)
├── page.jsx                  (Main page)
├── layout.jsx                (Layout)
└── globals.css               (Global styles)

package.json
next.config.mjs
tailwind.config.js
postcss.config.js
jsconfig.json
```

## What You Need to Build

### 1. **Canvas Component** (Priority: HIGH)

- [ ] Create HTML5 canvas element
- [ ] Generate Rothko-style rectangles
- [ ] Use weather data to influence colors
- [ ] Add useEffect to draw on canvas

**Hints:**

- Use `canvas.getContext('2d')`
- Map weather temp to color values
- Create 3-5 rectangles with varying opacity

### 2. **Settings Panel** (Priority: MEDIUM)

- [ ] Add sliders for: complexity, grain, softness
- [ ] Pass settings to Canvas component
- [ ] Update canvas based on settings

**Hints:**

- Use `<input type="range">`
- useState to manage slider values
- Pass as props to Canvas

### 3. **Weather API** (Priority: MEDIUM)

- [ ] Replace mock data with real API
- [ ] Use OpenWeatherMap API (free tier)
- [ ] Extract temp, humidity, cloud cover

**Hints:**

- Sign up at openweathermap.org
- Get your API key
- Use fetch() to call their API

### 4. **Data Mapping** (Priority: HIGH)

- [ ] Map temperature → color hue/saturation
- [ ] Map humidity → opacity/grain
- [ ] Map cloud cover → complexity

**Hints:**

- HSL colors work great for mapping values
- Use `hsl(hue, saturation%, lightness%)`
- hue: 0-360, saturation: 0-100, lightness: 0-100

### 5. **Polish** (Priority: LOW)

- [ ] Better UI styling
- [ ] Loading states
- [ ] Error handling
- [ ] Export/download image

## Learning Path

1. Start with Canvas.jsx - get something drawing first
2. Implement basic rectangles (no weather integration yet)
3. Connect weather data to colors
4. Add Settings panel for user control
5. Connect real weather API
6. Polish the UI

## Key Concepts to Learn

- HTML5 Canvas API
- React hooks (useState, useEffect)
- Next.js API routes
- Tailwind CSS
- Color theory (RGB vs HSL)
- API integration with fetch()

## Useful Resources

- [MD5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com)
- [Rothko Info](https://en.wikipedia.org/wiki/Mark_Rothko)

## Next Steps After Building

- Add animation/transitions
- Save/export compositions
- Create a gallery of previous artworks
- Add different art styles beyond Rothko
- Deploy to Vercel

---

**No node_modules included - run `npm install` first!**
