# Staff Portal Customization Plan

## Overview

This document outlines the plan for implementing comprehensive customization options for the HiQueue staff portal. Each organization will be able to customize their staff portal's appearance, branding, and behavior to match their brand identity and operational requirements.

---

## Current State

### Existing Infrastructure

The system already has foundational support for portal customization:

**Database Schema** (`Organization` model):
- `portalTheme` (JSON string): Stores theme class and CSS variables
- `portalBranding` (JSON string): Stores welcome message, tagline, and logo URL

**Type Definitions** (`portal-theme.ts`):
```typescript
type PortalTheme = {
  themeClass?: string        // e.g., "theme-ocean"
  cssVars?: Record<string, string>  // CSS custom properties
}

type PortalBranding = {
  welcomeMessage?: string
  tagline?: string
  logoUrl?: string
}
```

**Current Application** (`/org/[slug]/layout.tsx`):
- Applies theme class to portal root
- Applies CSS variables as inline styles
- Portal loads organization-specific settings

**UI Placeholder** (`PortalCustomizationCard.tsx`):
- Shows portal URL
- Mentions upcoming customization controls
- Currently read-only display

---

## Planned Features

### Phase 1: Theme Customization (Priority: High)

#### 1.1 Pre-built Theme Selection

**User Story**: As an organization admin, I want to select from pre-built themes so I can quickly brand my portal without design expertise.

**Available Themes** (from DESIGN.md):
1. **Organic Hospitality** (default) - Light & Green, calming botanical tones
2. **Ocean** - Cool water-inspired, clinical yet calming
3. **Sunset** - Warm golden hour tones, energetic but comforting
4. **High Contrast** - Ultra-accessible, maximum visibility

**Implementation**:
- UI Component: Theme selector with visual previews
- Storage: Update `portalTheme.themeClass` field
- Preview: Live preview in modal/iframe before saving
- Backend: Server action to validate and save theme selection

#### 1.2 Custom Color Palette

**User Story**: As an organization admin, I want to customize specific colors to match my brand guidelines.

**Customizable Colors**:
- Primary (main brand color)
- Secondary (accents)
- Tertiary (high-contrast elements)
- Background (main canvas)
- Surface (cards, containers)
- Text colors (on-primary, on-secondary, etc.)

**Implementation**:
- UI Component: Color picker for each semantic color
- Storage: Update `portalTheme.cssVars` with CSS custom properties
- Format: `{ "--color-primary": "#4a654e", "--color-secondary": "#586249" }`
- Validation: Ensure sufficient contrast ratios (WCAG AA minimum)
- Preview: Real-time preview of color changes

#### 1.3 Typography Customization

**User Story**: As an organization admin, I want to customize fonts to match my brand typography.

**Customizable Typography**:
- Font family selection (Google Fonts integration)
- Heading sizes and weights
- Body text size and line height
- Letter spacing for different text styles

**Implementation**:
- UI Component: Font selector with preview
- Storage: Add to `portalTheme.cssVars`
- Format: `{ "--font-family-primary": "Plus Jakarta Sans", "--font-size-heading": "40px" }`
- Loading: Load selected fonts via Google Fonts API or CDN
- Fallbacks: System font stack for accessibility

---

### Phase 2: Branding & Content (Priority: High)

#### 2.1 Logo Upload & Management

**User Story**: As an organization admin, I want to upload my organization logo so staff recognize our portal.

**Features**:
- Logo upload (PNG, SVG, JPG)
- Size validation (max 2MB, recommended dimensions)
- Image cropping/resizing tool
- Multiple logo variants:
  - Primary logo (light background)
  - Alternative logo (dark background)
  - Favicon

**Implementation**:
- UI Component: Image upload with drag-and-drop
- Storage: 
  - Images stored in `/public/uploads/org/[orgId]/` or cloud storage (S3/Cloudinary)
  - URL stored in `portalBranding.logoUrl`, `portalBranding.altLogoUrl`
- Server action: Handle file upload, validation, optimization
- Display: Logo shown in portal header, login page

#### 2.2 Welcome Messages & Copy

**User Story**: As an organization admin, I want to customize text on the portal so I can provide specific instructions to staff.

**Customizable Text Fields**:
- Welcome message (login page)
- Tagline (header)
- Login instructions
- Footer text
- Help text for different sections
- Success/error messages

**Implementation**:
- UI Component: Rich text editor (TipTap or similar)
- Storage: Update `portalBranding` with text fields
- Format: Support basic HTML or Markdown
- Localization: Future support for multiple languages
- Character limits: Enforce reasonable limits for each field

#### 2.3 Custom Links & Resources

**User Story**: As an organization admin, I want to add custom links so staff can access relevant resources.

**Features**:
- Add custom navigation links
- Quick links in portal header or footer
- Help/support links
- Policy documents
- Training materials

**Implementation**:
- Storage: Add `portalBranding.customLinks` array
- Format: `[{ label: string, url: string, icon?: string }]`
- UI Component: Link manager (add/edit/remove/reorder)
- Validation: URL validation, optional external link warning

---

### Phase 3: Layout & Behavior (Priority: Medium)

#### 3.1 Layout Presets

**User Story**: As an organization admin, I want to choose different layout styles for the portal.

**Layout Options**:
- **Centered**: Content centered with max-width (cozy, default)
- **Wide**: Full-width layout (more information density)
- **Sidebar**: Left sidebar navigation
- **Card Grid**: Grid-based layout for multiple sections

**Implementation**:
- Storage: Add `portalTheme.layoutPreset` field
- UI Component: Layout selector with visual previews
- Application: Conditional rendering in portal layout component
- Responsive: Each preset has mobile-optimized variant

#### 3.2 Component Density

**User Story**: As an organization admin, I want to adjust spacing to fit more/less information.

**Density Options**:
- **Comfortable** (default): Generous spacing, relaxed feel
- **Compact**: Tighter spacing, more information density
- **Spacious**: Extra whitespace, maximum calm

**Implementation**:
- Storage: Add `portalTheme.density` field ("comfortable" | "compact" | "spacious")
- Application: Apply spacing scale multiplier via CSS variables
- UI Component: Density selector with preview

#### 3.3 Animation & Motion

**User Story**: As an organization admin, I want to control animations for accessibility and preference.

**Options**:
- **Full Motion**: All transitions and animations
- **Reduced Motion**: Minimal, essential animations only
- **No Motion**: Instant transitions, no animations

**Implementation**:
- Storage: Add `portalTheme.motion` field
- Application: Apply via CSS class or data attribute
- Respect: Honor user's system `prefers-reduced-motion` preference
- UI Component: Motion preference selector

---

### Phase 4: Advanced Customization (Priority: Low)

#### 4.1 Custom CSS Override

**User Story**: As an organization admin with technical expertise, I want to add custom CSS for advanced styling.

**Features**:
- Custom CSS editor with syntax highlighting
- Scoped to portal only (won't affect dashboard)
- Preview before applying
- Version history for CSS changes
- CSS validation and sanitization

**Implementation**:
- Storage: Add `portalTheme.customCss` field (text)
- UI Component: Code editor (Monaco or CodeMirror)
- Application: Inject as `<style>` tag in portal layout
- Security: Sanitize to prevent XSS, restrict dangerous properties
- Limit: Max 50KB of custom CSS

#### 4.2 Custom JavaScript (Staff Portal Enhancements)

**User Story**: As an organization admin with technical expertise, I want to add custom behavior to the portal.

**Features**:
- Custom JavaScript for analytics, chat widgets, etc.
- Whitelist of allowed APIs
- Script injection in portal head or body

**Implementation**:
- Storage: Add `portalBranding.customScripts` array
- Format: `[{ src?: string, code?: string, placement: "head" | "body" }]`
- Security: 
  - Content Security Policy restrictions
  - Script validation and sanitization
  - Isolate from main application context
- UI Component: Script manager with warning about security implications

#### 4.3 Multi-Language Support

**User Story**: As an organization serving diverse staff, I want to provide the portal in multiple languages.

**Features**:
- Language selector in portal
- Translate all customizable text
- Default language per organization
- Fallback to English for missing translations

**Implementation**:
- Storage: Add `portalBranding.translations` object
- Format: `{ "en": {...}, "es": {...}, "fr": {...} }`
- Application: i18n library (next-intl or similar)
- UI Component: Translation manager for each language
- Auto-translate: Optional integration with translation API

---

## Technical Architecture

### Database Changes

**No schema changes required** - existing `portalTheme` and `portalBranding` JSON fields are sufficient. Content will be:

```typescript
// portalTheme example
{
  "themeClass": "theme-ocean",
  "layoutPreset": "centered",
  "density": "comfortable",
  "motion": "reduced",
  "cssVars": {
    "--color-primary": "#0077b6",
    "--color-secondary": "#00b4d8",
    "--font-family-primary": "Inter, sans-serif"
  },
  "customCss": "/* optional custom CSS */"
}

// portalBranding example
{
  "logoUrl": "/uploads/org/123/logo.png",
  "altLogoUrl": "/uploads/org/123/logo-dark.png",
  "faviconUrl": "/uploads/org/123/favicon.ico",
  "welcomeMessage": "Welcome to our staff portal",
  "tagline": "Serving with excellence",
  "loginInstructions": "Use your staff credentials to sign in",
  "footerText": "© 2026 Our Organization",
  "customLinks": [
    { "label": "Help Center", "url": "https://help.example.com" },
    { "label": "Staff Handbook", "url": "/handbook" }
  ],
  "translations": {
    "en": { "welcomeMessage": "Welcome to our staff portal" },
    "es": { "welcomeMessage": "Bienvenido a nuestro portal de personal" }
  },
  "customScripts": [
    { "src": "https://analytics.example.com/script.js", "placement": "head" }
  ]
}
```

### New Components

1. **`PortalCustomizer.tsx`** - Main customization interface
   - Tabbed interface: Theme | Branding | Layout | Advanced
   - Live preview panel
   - Save/reset functionality

2. **`ThemeSelector.tsx`** - Pre-built theme selection with previews

3. **`ColorPicker.tsx`** - Color customization with contrast validation

4. **`FontSelector.tsx`** - Font family and typography settings

5. **`LogoUploader.tsx`** - Image upload and management

6. **`TextCustomizer.tsx`** - Rich text editor for custom copy

7. **`LinkManager.tsx`** - Add/edit/remove custom links

8. **`LayoutPresetSelector.tsx`** - Layout options with visual previews

9. **`CustomCssEditor.tsx`** - Code editor for advanced CSS

10. **`PreviewFrame.tsx`** - Live preview of customization changes

### API Endpoints / Server Actions

1. **`updatePortalTheme`** - Update `portalTheme` JSON
   - Validation: Theme class, CSS variables, custom CSS
   - Authorization: User must be org owner/admin

2. **`updatePortalBranding`** - Update `portalBranding` JSON
   - Validation: Text fields, URLs
   - Authorization: User must be org owner/admin

3. **`uploadPortalAsset`** - Handle file uploads
   - Validation: File type, size, dimensions
   - Storage: Save to file system or cloud
   - Return: Public URL for asset

4. **`resetPortalCustomization`** - Reset to defaults
   - Sets theme and branding to empty objects

5. **`previewPortalCustomization`** - Generate preview URL
   - Create temporary preview with unsaved changes
   - Return preview URL with token

### Security Considerations

1. **File Upload Security**
   - Validate file types (whitelist: png, jpg, svg)
   - Scan for malware
   - Limit file size (2MB max)
   - Store outside web root or use signed URLs

2. **Custom CSS/JS Security**
   - Sanitize CSS to prevent XSS
   - Restrict dangerous CSS properties (behavior, expression)
   - Validate JavaScript against Content Security Policy
   - Isolate custom code from main application

3. **Authorization**
   - Only org owners/admins can modify customization
   - Validate user permissions on every update
   - Log all customization changes for audit

4. **Rate Limiting**
   - Limit file uploads per hour
   - Limit customization updates per day
   - Prevent abuse of preview generation

---

## User Interface Design

### Navigation: Dashboard → Organizations → [Org] → Portal Customization

The customization interface will be accessible at:
```
/dashboard/organizations/[slug]/portal
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > [Org Name] > Portal Customization              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┬──────────────────────────────────┐  │
│  │ Sidebar          │ Main Content                     │  │
│  │                  │                                  │  │
│  │ • Theme          │  [Customization controls]        │  │
│  │ • Branding       │                                  │  │
│  │ • Layout         │                                  │  │
│  │ • Advanced       │                                  │  │
│  │                  │                                  │  │
│  │ [Preview Button] │                                  │  │
│  │ [Save Button]    │                                  │  │
│  │ [Reset Button]   │                                  │  │
│  └──────────────────┴──────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Theme Tab

- **Pre-built Themes**: Grid of theme cards with live previews
- **Custom Colors**: Color picker for each semantic color with contrast checker
- **Typography**: Font selector and size controls
- **Preview**: Mini portal preview showing all changes in real-time

### Branding Tab

- **Logo Section**: 
  - Primary logo upload
  - Alternative logo upload (for dark mode)
  - Favicon upload
  - Preview of logos in context
  
- **Text Content**:
  - Welcome message (rich text)
  - Tagline (plain text)
  - Login instructions (rich text)
  - Footer text (rich text)
  
- **Custom Links**:
  - List of current links
  - Add/edit/remove/reorder interface

### Layout Tab

- **Layout Preset**: Visual selector for layout options
- **Density**: Radio buttons (Comfortable / Compact / Spacious)
- **Motion**: Radio buttons (Full / Reduced / None)
- **Preview**: Full-size portal preview with selected layout

### Advanced Tab

- **Custom CSS**:
  - Code editor with syntax highlighting
  - Line numbers, auto-completion
  - Warning about careful use
  
- **Custom Scripts**:
  - List of added scripts
  - Add script form (URL or inline code)
  - Security warnings
  
- **Multi-Language**:
  - Language selector
  - Translation editor for each language
  - Import/export translations (JSON)

---

## Development Plan

### Milestone 1: Foundation (Week 1-2)

**Goals**: Set up customization UI and basic theme selection

**Tasks**:
1. Create `/dashboard/organizations/[slug]/portal/page.tsx`
2. Build `PortalCustomizer` container component
3. Implement `ThemeSelector` with 4 pre-built themes
4. Create server action `updatePortalTheme`
5. Test theme switching on live portal
6. Update `PortalCustomizationCard` to link to new page

**Deliverable**: Org admins can select from 4 pre-built themes

---

### Milestone 2: Color & Typography (Week 3-4)

**Goals**: Enable custom color and font selection

**Tasks**:
1. Implement `ColorPicker` component with contrast validation
2. Build color customization UI for all semantic colors
3. Create `FontSelector` with Google Fonts integration
4. Update `updatePortalTheme` to handle CSS variables
5. Implement real-time preview for color/font changes
6. Add reset to defaults functionality

**Deliverable**: Org admins can customize colors and fonts

---

### Milestone 3: Branding & Assets (Week 5-6)

**Goals**: Logo upload and text customization

**Tasks**:
1. Implement `LogoUploader` component with drag-and-drop
2. Create `uploadPortalAsset` server action with validation
3. Set up file storage (local or cloud)
4. Build `TextCustomizer` with rich text editor
5. Create `LinkManager` for custom navigation links
6. Update `updatePortalBranding` server action
7. Display logo and custom text in portal

**Deliverable**: Org admins can upload logos and customize text

---

### Milestone 4: Layout & Behavior (Week 7-8)

**Goals**: Layout presets and behavioral customization

**Tasks**:
1. Design and implement 4 layout presets
2. Build `LayoutPresetSelector` component
3. Implement density controls (spacing adjustment)
4. Add motion preference controls
5. Update portal layout to support all presets
6. Test responsive behavior for each preset

**Deliverable**: Org admins can choose layouts and adjust density/motion

---

### Milestone 5: Preview & Polish (Week 9-10)

**Goals**: Live preview and UX improvements

**Tasks**:
1. Build `PreviewFrame` component with iframe isolation
2. Implement preview generation (temporary state)
3. Add real-time preview updates during editing
4. Create mobile preview mode
5. Implement undo/redo functionality
6. Add customization tour/onboarding
7. Polish UI/UX based on testing

**Deliverable**: Smooth preview and editing experience

---

### Milestone 6: Advanced Features (Week 11-12)

**Goals**: Custom CSS, scripts, and multi-language (optional)

**Tasks**:
1. Build `CustomCssEditor` with Monaco
2. Implement CSS sanitization and validation
3. Create script manager for custom JavaScript
4. Add CSP and security validations
5. (Optional) Implement basic multi-language support
6. Add audit logging for customization changes
7. Performance testing and optimization

**Deliverable**: Advanced customization options available

---

## Testing Strategy

### Unit Tests
- Parse/serialize functions for theme and branding JSON
- Color contrast validation
- CSS sanitization
- File upload validation

### Integration Tests
- Theme switching applies correct styles
- Logo upload stores and displays correctly
- Custom colors override default theme
- Server actions properly validate and authorize

### E2E Tests
- Admin navigates to customization page
- Admin selects theme and sees preview
- Admin uploads logo and it appears on portal
- Admin saves customization and visits portal
- Unauthorized user cannot access customization

### Accessibility Tests
- Color contrast meets WCAG AA standards
- All controls keyboard accessible
- Screen reader friendly
- Reduced motion preferences honored

### Performance Tests
- Logo upload and processing time
- Portal load time with custom CSS
- Preview generation speed
- Database JSON field size limits

---

## Success Metrics

### Adoption Metrics
- % of organizations that customize their portal
- Average number of customizations per organization
- Most popular customization features

### Engagement Metrics
- Time spent on customization page
- Number of preview interactions before saving
- Frequency of customization updates

### Satisfaction Metrics
- User feedback on customization ease
- Support tickets related to portal branding
- Staff recognition of branded portal

---

## Future Enhancements

### Phase 5: Template Marketplace
- Pre-designed templates by industry (healthcare, retail, hospitality)
- Community-contributed themes
- Template previews and ratings
- One-click template application

### Phase 6: A/B Testing
- Test different portal configurations
- Compare staff engagement across variants
- Analytics on portal effectiveness

### Phase 7: White-Label Option
- Completely remove HiQueue branding
- Custom domain support (portal.yourcompany.com)
- Enterprise tier feature

### Phase 8: Design System Tokens
- Export organization theme as design tokens
- Import tokens from Figma or design tools
- Sync with brand guidelines automatically

---

## Migration Plan

### Existing Organizations

All existing organizations have default empty objects for `portalTheme` and `portalBranding`, so no migration needed. They will:

1. Continue using default "Organic Hospitality" theme
2. See "Customize your portal" option in dashboard
3. Can opt-in to customization at any time
4. Changes apply immediately to their portal

### Backward Compatibility

- Portal layout already reads `portalTheme` and `portalBranding`
- Empty/missing fields gracefully fall back to defaults
- New fields are optional and additive
- No breaking changes to existing portal functionality

---

## Documentation

### Admin User Guide
- "How to customize your staff portal"
- "Choosing the right theme for your brand"
- "Uploading and managing your logo"
- "Best practices for portal branding"
- "Accessibility guidelines for custom colors"

### Developer Documentation
- Portal theme architecture
- Adding new pre-built themes
- CSS variable reference
- Security considerations for custom code
- API reference for customization endpoints

---

## Appendix

### A. Pre-built Theme Specifications

#### Organic Hospitality (Default)
```css
--color-primary: #4a654e (Sage)
--color-secondary: #586249 (Mint)
--color-tertiary: #466558 (Forest)
--color-background: #faf9f6 (Warm Off-White)
--color-surface: #ffffff (Pure White)
```

#### Ocean Theme
```css
--color-primary: #0077b6 (Deep Sea Blue)
--color-secondary: #00b4d8 (Bright Cyan)
--color-tertiary: #023e8a (Navy)
--color-background: #f0f8ff (Ice White)
--color-surface: #ffffff (Pure White)
```

#### Sunset Theme
```css
--color-primary: #e07a5f (Terracotta/Coral)
--color-secondary: #f4a261 (Sand/Orange)
--color-tertiary: #8f5d5d (Warm Brown)
--color-background: #fff5ee (Warm Cream)
--color-surface: #ffffff (Pure White)
```

#### High Contrast Theme
```css
--color-primary: #ffff00 (Bright Yellow)
--color-secondary: #00ffff (Bright Cyan)
--color-tertiary: #ff00ff (Magenta)
--color-background: #000000 (Pure Black)
--color-surface: #1a1a1a (Near Black)
--color-text: #ffffff (Pure White)
```

### B. CSS Custom Properties Reference

All customizable CSS variables:
- `--color-primary`, `--color-on-primary`
- `--color-secondary`, `--color-on-secondary`
- `--color-tertiary`, `--color-on-tertiary`
- `--color-background`, `--color-on-background`
- `--color-surface`, `--color-on-surface`
- `--color-error`, `--color-on-error`
- `--font-family-primary`, `--font-family-secondary`
- `--font-size-heading-lg`, `--font-size-heading-md`, etc.
- `--spacing-base`, `--spacing-xs`, `--spacing-sm`, etc.
- `--border-radius-sm`, `--border-radius-md`, etc.

### C. File Upload Specifications

**Supported Formats**:
- Logo: PNG (recommended), SVG, JPG, WebP
- Favicon: ICO, PNG (16x16, 32x32, 48x48)

**Size Limits**:
- Logo: Max 2MB, recommended 500KB
- Favicon: Max 100KB

**Recommended Dimensions**:
- Logo: 200x60px (wide) or 100x100px (square)
- Favicon: 32x32px

**Optimization**:
- Automatic compression on upload
- WebP conversion for JPG/PNG
- Multiple sizes generated for responsive display

---

## Conclusion

This customization plan transforms the HiQueue staff portal from a single unified experience to a white-label solution where each organization can express their unique brand identity. By implementing in phases, we can deliver value incrementally while maintaining system stability and gathering user feedback to inform later features.

The architecture leverages existing JSON fields for storage, avoiding complex migrations, and the component-based approach ensures maintainability and extensibility for future enhancements.

**Estimated Timeline**: 12 weeks for complete implementation
**Priority**: High (Phase 1-2), Medium (Phase 3-5), Low (Phase 4-6)
**Team**: 1-2 frontend developers, 1 backend developer, 1 designer
