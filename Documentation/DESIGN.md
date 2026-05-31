---
name: Organic Hospitality
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#424842'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#737972'
  outline-variant: '#c2c8c0'
  surface-tint: '#4a654e'
  primary: '#4a654e'
  on-primary: '#ffffff'
  primary-container: '#8ba88e'
  on-primary-container: '#233d29'
  inverse-primary: '#b0ceb2'
  secondary: '#586249'
  on-secondary: '#ffffff'
  secondary-container: '#dde7c7'
  on-secondary-container: '#5e684e'
  tertiary: '#466558'
  on-tertiary: '#ffffff'
  tertiary-container: '#87a899'
  on-tertiary-container: '#1f3d32'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cceace'
  primary-fixed-dim: '#b0ceb2'
  on-primary-fixed: '#07200f'
  on-primary-fixed-variant: '#334d38'
  secondary-fixed: '#dde7c7'
  secondary-fixed-dim: '#c0caac'
  on-secondary-fixed: '#161e0a'
  on-secondary-fixed-variant: '#414a32'
  tertiary-fixed: '#c8eada'
  tertiary-fixed-dim: '#adcebe'
  on-tertiary-fixed: '#012016'
  on-tertiary-fixed-variant: '#2f4d41'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is centered on the concept of "calm waiting." By leveraging organic modernism and a hospitality-focused aesthetic, it aims to transform the high-stress experience of queuing into a moment of pause. The visual language is soft, breathable, and approachable, moving away from the clinical or industrial feel common in utility applications.

The target audience includes both service providers who want to project a premium, caring image and end-users who value clarity and comfort. The UI evokes an emotional response of being "looked after" through heavy use of whitespace, a nature-inspired palette, and soft, tactile interactions.

## Colors

The design system supports multiple overarching themes, with "Organic Hospitality" acting as the default. Users can select different themes that override the base CSS variables while maintaining the same semantic color aliases.

### 1. Organic Hospitality (Default Light & Dark)
Rooted in a "Light and Green" philosophy, using botanical tones to induce a sense of tranquility.
- **Primary (Sage):** Used for main actions and brand presence. It is muted enough to remain calm but distinct enough for hierarchy.
- **Secondary (Mint):** Used for backgrounds of subtle components, progress bars, and success states.
- **Tertiary (Forest):** Reserved for high-contrast text, iconography, and deep-state buttons to ensure accessibility.
- **Neutral (Warm Off-White / Deep Moss):** The primary canvas color, reducing eye strain and feeling "cozy."
- **Functional Accents:** A soft terracotta is used for errors or alerts to maintain the organic feel.

### 2. Ocean Theme (`.theme-ocean`)
A cool, water-inspired palette for a clean, clinical yet calming aesthetic.
- **Primary:** Deep Sea Blue (`#0077b6`)
- **Secondary:** Bright Cyan (`#00b4d8`)
- **Tertiary:** Navy (`#023e8a`)
- **Neutral:** Ice White and Light Blue backgrounds.

### 3. Sunset Theme (`.theme-sunset`)
Warm, inviting tones reminiscent of golden hour, providing an energetic but comforting environment.
- **Primary:** Terracotta/Coral (`#e07a5f`)
- **Secondary:** Sand/Orange (`#f4a261`)
- **Tertiary:** Warm Brown (`#8f5d5d`)
- **Neutral:** Warm cream and peach backgrounds.

### 4. High Contrast Theme (`.theme-high-contrast`)
An accessible, ultra-high-visibility theme ensuring maximum legibility.
- **Primary:** Bright Yellow (`#ffff00`)
- **Secondary:** Bright Cyan (`#00ffff`)
- **Tertiary:** Magenta (`#ff00ff`)
- **Neutral:** Pure Black background with Pure White text and borders.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels to maintain a friendly and optimistic character. The typeface's soft curves and open apertures provide excellent legibility while reinforcing the approachable brand personality.

Headlines use a tighter letter-spacing and heavier weights to create a grounded visual anchor. Body text is set with generous line-height to maximize readability and "airiness." For mobile devices, headline sizes are scaled down to ensure they don't overwhelm the screen, maintaining the serene, spacious feel.

## Layout & Spacing

The layout follows a **fixed-grid** model for desktop and tablet to ensure content remains contained and cozy, while transitioning to a **fluid-grid** on mobile.

- **Desktop (1440px+):** 12-column grid with a max-width of 1200px. Large margins (`xl`) are used to push content toward the center, creating a focused, editorial feel.
- **Mobile:** 4-column grid with 20px side margins. 
- **Spacing Rhythm:** An 8px base unit is used. To achieve the "cozy" effect, padding within components should always lean toward the larger end of the scale (e.g., using `md` for card padding instead of `sm`).
- **Whitespace:** Elements are grouped into "islands" of information, surrounded by significant whitespace (`lg`) to prevent the interface from feeling cluttered or overwhelming during wait times.

## Elevation & Depth

Visual hierarchy is achieved through **ambient shadows** and **tonal layering** rather than harsh lines. 

- **Shadows:** Use extremely diffused, low-opacity shadows. The shadow color should be slightly tinted with the Primary Sage color (e.g., `rgba(44, 74, 62, 0.08)`) to keep the depth feeling natural and integrated.
- **Tiers:** 
  - **Level 0 (Background):** Warm Off-White.
  - **Level 1 (Cards/Containers):** Pure White with a soft shadow or a Surface Gray background.
  - **Level 2 (Overlays/Modals):** Pure White with a more pronounced, deeper ambient shadow.
- **Outlines:** Use very low-contrast outlines (1px, 5% Forest Green) only when necessary for accessibility on interactive elements like input fields.

## Shapes

The shape language is consistently rounded to evoke comfort and safety. 

- **Base Radius:** 0.5rem (8px) for small components like checkboxes or tags.
- **Container Radius:** 1rem (16px) for cards and main content areas.
- **Pill Shapes:** Specifically reserved for Buttons and "Active Status" chips to make them feel more tactile and "hand-friendly."
- **Iconography:** Icons should feature rounded caps and corners, avoiding any sharp 90-degree points.

## Components

- **Buttons:** Primary buttons are pill-shaped with a solid Primary Sage fill and White text. Secondary buttons use a Mint fill with Forest Green text. No borders.
- **Cards:** Cards are the primary container. They feature a 16px corner radius, a soft ambient shadow, and generous internal padding (24px).
- **Input Fields:** Use a subtle Surface Gray background rather than a white box with a border. On focus, the background transitions to white with a soft Primary Sage glow.
- **Chips & Tags:** Small, pill-shaped elements used for queue categories or estimated wait times. They use the Secondary Mint color for high legibility without high contrast.
- **Queue Progress:** Represented by thick, rounded-cap lines or soft circular rings. The track should be a very light gray, and the progress should be Primary Sage.
- **Lists:** List items are separated by whitespace and tonal changes rather than divider lines. Each list item feels like a "mini-card."
- **Modals:** Use a heavy backdrop blur (12px) to keep the user focused on the task while maintaining the "glassy," airy feel of the system.
- **Others:** Use shadcn components