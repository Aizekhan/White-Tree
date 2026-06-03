# Assets Directory

## Required Images

### StartBack.jpg
**Location:** `public/assets/StartBack.jpg`
**Purpose:** Background image for landing page (wizard screen)
**Used in:** `src/features/landing/StartScreen.css`

**Requirements:**
- Full-screen background (1920x1080 or higher)
- Dark magical/mystical atmosphere
- Good contrast for white text overlay
- Suggested: night sky, cosmic theme, magical forest

**Current status:** Using gradient fallback. Add StartBack.jpg and uncomment the CSS line in StartScreen.css:
```css
background: url('/assets/StartBack.jpg') center center / cover no-repeat;
```

## Placeholder Images

### Project Cards
- `ph-project.png` - Default project cover
- `ph-characters.png` - Characters placeholder
- `ph-locations.png` - Locations placeholder
- `ph-events.png` - Events placeholder
- `ph-factions.png` - Factions placeholder
- `ph-artifacts.png` - Artifacts placeholder
- `ph-shot.jpg` - Shot/storyboard placeholder

**Used in:** Director, Universe, Projects views

**Current status:** Using CSS gradients + emojis as fallback
