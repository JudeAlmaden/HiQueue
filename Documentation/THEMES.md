# Theme System Documentation

## Overview

HiQueue uses two separate theme systems:

1. **Public Pages Theme** - User-controlled theme for non-authenticated pages (homepage, login, register)
2. **Organization Portal Theme** - Organization-controlled theme for dashboard and staff portal pages

---

## Public Pages Theme

### Location
- Homepage (`/`)
- Login page (`/login`)
- Register page (`/register`)

### Implementation
Uses `next-themes` package with `ThemeProvider` wrapper.

**Files:**
- `src/components/theme-provider.tsx` - Client component wrapper for `next-themes`
- `src/components/theme-toggle.tsx` - Theme selector dropdown
- `src/app/layout.tsx` - Root layout with ThemeProvider

### Configuration
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

### Available Modes
- **System** - Follows OS preference
- **Light** - Light mode
- **Dark** - Dark mode

### User Control
Users can toggle theme via the Palette icon button in the header. This preference is stored in browser localStorage and persists across sessions.

---

## Organization Portal Theme

### Location
- Dashboard (`/dashboard/*`)
- Staff portal pages (`/org/[slug]/*`)
- Live ticketing (`/live/[queueId]`)
- Live display (`/org/[slug]/display/[queueId]`)
- Track ticket (`/live/[queueId]/track`)

### Implementation
Organization-specific theme loaded from database and applied via className and inline styles.

**Database:**
- Stored in `Organization.portalTheme` (JSON field)
- Stored in `Organization.portalBranding` (JSON field)

**Files:**
- `src/lib/portal-theme.ts` - Theme types and parsing logic
- `src/server/repositories/portal.repo.ts` - Theme data fetching
- `src/server/actions/portal.actions.ts` - Theme update actions
- `src/components/portal/PortalCustomizer.tsx` - Customization UI
- `src/app/dashboard/organizations/[slug]/portal/page.tsx` - Customization page

### Theme Components

#### 1. Color Theme
**Preset Themes:**
- `theme-red`
- `theme-orange`
- `theme-amber`
- `theme-yellow`
- `theme-lime`
- `theme-green`
- `theme-emerald`
- `theme-teal`
- `theme-cyan`
- `theme-sky`
- `theme-blue`
- `theme-indigo`
- `theme-violet`
- `theme-purple`
- `theme-fuchsia`
- `theme-pink`
- `theme-rose`
- `theme-slate`
- `theme-gray`
- `theme-zinc`
- `theme-neutral`
- `theme-stone`

**Custom Theme:**
- `theme-custom` - Allows custom CSS variable overrides

#### 2. Color Mode
- **Light** - Light color palette
- **Dark** - Dark color palette

**Note:** Custom Colors (`theme-custom`) uses a single brand palette and does not have Light/Dark variants.

#### 3. Layout Options

Different layouts for each portal surface:

**Portal Login Layout:**
- `centered` - Balanced, centered sign-in form
- `split` - Brand story panel + focused form panel
- `minimal` - Compact, distraction-free sign in

**Live Ticketing Layout:**
- `card` - Single-card kiosk with clear CTA flow
- `split-services` - Service selection and form side-by-side

**Live Display Layout:**
- `standard` - Now-serving center with waiting queue sidebar
- `no-waiting` - Full-screen now-serving, no waiting list shown

**Track Ticket Layout:**
- `centered` - Search-first stacked status experience

#### 4. Layout Controls

Advanced customization per layout section:

- **Split Panel Backgrounds** - Custom images/colors for split layouts
- **Page Backgrounds** - Custom background images/colors
- **Typography Scale** - Adjust font sizes (0.85x - 1.25x)
- **Font Color** - Override text colors
- **Sharpness** - Border radius control (0-24px)

#### 5. Branding

- **Logo URL** - Custom organization logo
- **Tagline** - Short text under organization name
- **Welcome Message** - Optional message on portal surfaces

### Theme Data Structure

```typescript
interface PortalTheme {
  themeClass?: string                      // e.g., "theme-blue", "theme-custom"
  mode?: "light" | "dark"                  // Only for preset themes
  cssVars?: Record<string, string>         // Custom CSS variables for theme-custom
  layout?: {
    login?: "centered" | "split" | "minimal"
    ticketing?: "card" | "split-services"
    liveDisplay?: "standard" | "no-waiting"
    track?: "centered"
  }
  layoutControls?: {
    login?: LayoutControlSettings
    ticketing?: LayoutControlSettings
    liveDisplay?: LayoutControlSettings
    track?: LayoutControlSettings
  }
}

interface PortalBranding {
  logoUrl?: string
  tagline?: string
  welcomeMessage?: string
}
```

### How Themes Are Applied

**Dashboard Layout (`src/app/dashboard/layout.tsx`):**
```tsx
const orgThemeClass = orgPortal?.theme.themeClass ?? ""
const orgModeClass = orgThemeClass !== "theme-custom" && orgPortal?.theme.mode === "dark" ? "dark" : ""
const customThemeStyle = orgThemeClass === "theme-custom" && orgPortal?.theme.cssVars 
  ? orgPortal.theme.cssVars 
  : {}

return (
  <div className={`... ${orgThemeClass} ${orgModeClass}`} style={customThemeStyle}>
    {/* Dashboard content */}
  </div>
)
```

**Staff Portal Pages:**
Similar pattern - fetch organization portal theme and apply classes/styles.

### Customization Access

**Navigation:**
1. Dashboard sidebar header → Click Palette icon
2. Redirects to `/dashboard/organizations/[slug]/portal?tab=theme`

**Permissions:**
- Only organization **owners** can modify portal themes and branding
- All members can view customization page but cannot save changes

**UI Tabs:**
- **Theme** - Select color theme and mode
- **Branding** - Configure logo, tagline, welcome message
- **Layout** - Choose layout presets per portal surface

---

## CSS Variables

### Global CSS Variables

Defined in `src/app/globals.css`:

**Light Mode Variables:**
```css
--background: 0 0% 100%
--foreground: 240 10% 3.9%
--primary: 240 5.9% 10%
--on-primary: 0 0% 98%
/* ... more variables */
```

**Dark Mode Variables:**
```css
.dark {
  --background: 240 10% 3.9%
  --foreground: 0 0% 98%
  --primary: 0 0% 98%
  --on-primary: 240 5.9% 10%
  /* ... more variables */
}
```

### Theme-Specific Variables

Each preset theme (e.g., `.theme-blue`) overrides the primary color:

```css
.theme-blue {
  --primary: 221.2 83.2% 53.3%
  --primary-container: 217.2 91.2% 59.8%
  /* ... theme-specific overrides */
}
```

**Custom Theme:**
```css
.theme-custom {
  /* CSS variables injected via inline style attribute */
}
```

---

## Server Actions

### Update Portal Theme
```typescript
updatePortalTheme(organizationId: string, theme: PortalTheme)
```
- Updates `Organization.portalTheme`
- Requires owner permission
- Validates and sanitizes theme data

### Update Portal Branding
```typescript
updatePortalBranding(organizationId: string, branding: PortalBranding)
```
- Updates `Organization.portalBranding`
- Requires owner permission
- Validates and sanitizes branding data

### Reset Portal Customization
```typescript
resetPortalCustomization(organizationId: string)
```
- Resets both theme and branding to defaults
- Requires owner permission

---

## Preview System

The customization page includes a live preview iframe:

**Preview URL Pattern:**
```
/org/[slug]/login?previewTheme={encodedTheme}
/live/[queueId]?previewTheme={encodedTheme}
/org/[slug]/display/[queueId]?previewTheme={encodedTheme}
/live/[queueId]/track?previewTheme={encodedTheme}
```

The `previewTheme` parameter contains URL-encoded JSON of the current theme being edited. Portal pages check for this parameter and temporarily apply the preview theme instead of the saved theme.

---

## Best Practices

### For Users
1. Use **Public Theme Toggle** for personal preference on login/register pages
2. Organizations should set portal theme to match their brand identity
3. Test theme changes in preview before saving
4. Consider accessibility when choosing colors (sufficient contrast)

### For Developers
1. Always fetch organization portal theme on server-side for portal pages
2. Use Tailwind CSS classes that respect CSS variables (e.g., `bg-primary`, `text-on-surface`)
3. Don't hardcode colors - use semantic color tokens
4. Test themes in both light and dark modes (for preset themes)
5. Validate theme data before saving to database
6. Use `suppressHydrationWarning` on `<html>` tag when using theme providers

### Performance
1. Organization portal themes are fetched per request (not cached globally)
2. Public theme preference is stored in browser localStorage
3. Theme CSS is included in main stylesheet (no runtime CSS-in-JS)
4. Custom theme CSS variables are applied via inline styles

---

## Troubleshooting

### Theme not applying on dashboard
- Check that `Organization.portalTheme` has valid JSON
- Verify theme class exists in `globals.css`
- Ensure layout component fetches and applies theme correctly

### Theme toggle not working on public pages
- Verify `ThemeProvider` is in root layout
- Check that `suppressHydrationWarning` is on `<html>` tag
- Ensure `theme-toggle.tsx` component is imported and rendered

### Custom theme not showing
- Verify `themeClass` is set to `"theme-custom"`
- Check that `cssVars` object has valid CSS variable names
- Ensure `customThemeStyle` is applied to container element

### Dark mode not applying
- For preset themes: Check that `mode: "dark"` is set and `orgModeClass` includes `"dark"`
- For custom themes: Dark mode is not supported (single palette only)
- For public pages: Check browser localStorage for theme preference

---

## Migration Notes

### From Single Theme to Dual Theme System

If migrating from a single global theme system:

1. **Identify page types** - Separate public vs. authenticated pages
2. **Install next-themes** - For public pages: `npm install next-themes`
3. **Create ThemeProvider wrapper** - Client component for public pages
4. **Keep organization theme system** - For dashboard and portal
5. **Update layouts** - Apply correct theme system per page type
6. **Test theme persistence** - Verify localStorage for public, DB for portal

### Database Schema

No migration needed - `portalTheme` and `portalBranding` are JSON fields that support any structure.

---

## Future Enhancements

Potential improvements:

- [ ] Allow staff members to override portal theme with personal preference
- [ ] Add theme scheduling (different themes for different times/seasons)
- [ ] Import/export theme configurations
- [ ] Theme marketplace for pre-built themes
- [ ] A11y contrast checker in customization UI
- [ ] Theme versioning and rollback
- [ ] Per-queue theme overrides
- [ ] Animation/transition customization
