# 🎨 GPOWER CRM THEMES

## Available Themes

1. **Modern Blue** (Current) - Professional & Clean
2. **Dark Slate** - Modern Dark Mode
3. **Emerald Green** - Fresh & Vibrant
4. **Purple Luxury** - Premium Feel
5. **Orange Energy** - Bold & Dynamic
6. **Minimal Gray** - Ultra Clean
7. **Teal Ocean** - Calm & Professional
8. **Rose Pink** - Soft & Modern

## How to Switch Themes

1. Open `app/themes.css`
2. Find the theme you want (e.g., "THEME 3: EMERALD GREEN")
3. Copy the entire `@theme { ... }` block
4. Open `app/globals.css`
5. Replace the existing `@theme { ... }` block (lines 7-28)
6. Save and refresh your browser

## Preview

### Modern Blue (Default)
- Background: Light gray-blue
- Primary: Bright blue (#3b82f6)
- Best for: Professional business apps

### Dark Slate
- Background: Dark navy
- Primary: Light blue
- Best for: Night mode, reduced eye strain

### Emerald Green
- Background: Light mint
- Primary: Emerald (#10b981)
- Best for: Fresh, eco-friendly feel

### Purple Luxury
- Background: Light lavender
- Primary: Purple (#9333ea)
- Best for: Premium, creative brands

### Orange Energy
- Background: Light peach
- Primary: Orange (#f97316)
- Best for: Bold, energetic brands

### Minimal Gray
- Background: Off-white
- Primary: Dark gray
- Best for: Minimalist, clean design

### Teal Ocean
- Background: Light cyan
- Primary: Teal (#14b8a6)
- Best for: Calm, professional feel

### Rose Pink
- Background: Light pink
- Primary: Rose (#f43f5e)
- Best for: Soft, modern aesthetic

## Custom Theme

Want your own colors? Edit the `@theme` block in `globals.css`:

```css
@theme {
  --color-primary: #YOUR_COLOR;
  --color-background: #YOUR_BG;
  /* etc... */
}
```

## Dark Mode

Dark mode automatically activates based on system preferences.
To force dark mode, replace the `@media (prefers-color-scheme: dark)` block.
