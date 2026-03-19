# Getting Started with Rothko Art Generator

## Step 1: Setup

```bash
cd rothko-starter
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Step 3: Build the Canvas Drawing

Open `app/components/Canvas.jsx` and implement:

1. Get reference to canvas element
2. Use `getContext('2d')`
3. Create rectangles with `fillRect()`
4. Map weather data to colors

**Starter code:**

```jsx
"use client";
import { useEffect } from "react";

export default function Canvas({ weather }) {
  useEffect(() => {
    const canvas = document.getElementById("rothko-canvas");
    const ctx = canvas.getContext("2d");

    // TODO: Draw rectangles here
  }, [weather]);

  return <canvas id="rothko-canvas" width={800} height={600} />;
}
```

## Step 4: Create Random Rectangles

```jsx
// Create 3-5 rectangles at random positions with random colors
const rectangles = [
  { x: 50, y: 50, width: 300, height: 200, color: "#FF6B6B" },
  { x: 100, y: 300, width: 350, height: 180, color: "#4ECDC4" },
  { x: 400, y: 150, width: 300, height: 250, color: "#FFE66D" },
];

rectangles.forEach((rect) => {
  ctx.fillStyle = rect.color;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
});
```

## Step 5: Connect Weather Data

Map temperature to color hue:

```jsx
const temp = weather?.main?.temp || 20; // 0-30°C typically
const hue = 150 + (temp / 30) * 180; // Blue (150°) to Red (330°)
const color = `hsl(${hue}, 70%, 50%)`;
```

## Step 6: Add Settings Panel

Implement `app/components/SettingsPanel.jsx` with sliders for:

- **Complexity**: Number of rectangles (3-8)
- **Grain**: Opacity/transparency
- **Softness**: Blur amount

## Step 7: Connect Real Weather API

Get API key from [OpenWeatherMap](https://openweathermap.org/api)

Replace the `route.js` with:

```jsx
const apiKey = process.env.OPENWEATHER_API_KEY;
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`,
);
```

Add to `.env.local`:

```
OPENWEATHER_API_KEY=your_api_key_here
```

## Debugging Tips

1. **Canvas not showing?**
   - Check browser console for errors
   - Verify canvas dimensions are set

2. **Canvas blank?**
   - Add a background color first: `ctx.fillStyle = "white"; ctx.fillRect(0, 0, 800, 600);`
   - Check if drawing code runs

3. **Colors not working?**
   - Log the color values: `console.log(color)`
   - Test with simple hex colors first: `#FF0000`

4. **Weather not loading?**
   - Check network tab in DevTools
   - Verify API endpoint works

## File You'll Mainly Edit

1. `app/components/Canvas.jsx` - Main implementation
2. `app/components/SettingsPanel.jsx` - Settings UI
3. `app/api/weather/route.js` - API integration
4. `app/page.jsx` - Connect components if needed

## Common Issues

| Issue                          | Solution                              |
| ------------------------------ | ------------------------------------- |
| Canvas elements not responsive | Use ref + ResizeObserver              |
| Colors too bright/dark         | Adjust HSL lightness value            |
| Weather API 404                | Check location spelling, use fallback |
| Settings don't update canvas   | Ensure Canvas gets settings as prop   |

## Resources

- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [React useEffect Guide](https://react.dev/reference/react/useEffect)
- [HSL Color Picker](https://www.w3schools.com/colors/colors_hsl.asp)
- [OpenWeatherMap Docs](https://openweathermap.org/api)

**Happy coding! 🎨**
