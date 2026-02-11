# B2B Supply Chain Dashboard

A modern B2B Supply Chain Dashboard built with React, TypeScript, and Tailwind CSS.

## Design System

This project uses a design system extracted from Figma file `vc0Z4XyqIuUwVyTiVFoAJh`.

### Typography
- **Primary Font**: Inter (weights: 200, 400, 500, 600)
- **Display Font**: Apercu
- **Monospace Font**: Apercu-Mono

### Color Palette
The color system includes:
- **Primary**: Blue scale for brand colors
- **Secondary**: Slate scale for neutral elements
- **Success**: Green scale for positive states
- **Warning**: Amber scale for caution states
- **Error**: Red scale for error states
- **Info**: Sky scale for informational elements
- **Chart Colors**: Optimized palette for data visualization
- **Status Colors**: Semantic colors for supply chain states (in-transit, delivered, pending, delayed, processing)

### Layout Structure
The main layout follows a standard dashboard pattern:
- **Sidebar**: Collapsible navigation (64px collapsed, 256px expanded)
- **Header**: Fixed top bar with search and user controls
- **Main Content**: Scrollable content area with responsive grid

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── App.tsx              # Main application layout
├── styles/
│   └── globals.css      # Global styles and Tailwind imports
└── components/          # React components (to be added)

tailwind.config.js       # Tailwind configuration with design tokens
tsconfig.json           # TypeScript configuration
postcss.config.js       # PostCSS configuration
```

## Customization

### Updating Colors
Edit `tailwind.config.js` to modify the color palette.

### Updating Typography
Edit `tailwind.config.js` to modify font families and sizes.

### Layout Adjustments
Edit `src/App.tsx` to adjust the main layout structure.

## Next Steps

1. Install dependencies: `npm install`
2. Populate navigation items in the sidebar
3. Add header components (search, notifications, user menu)
4. Create dashboard widgets and data visualization components
5. Connect to your backend API

## Notes

- The layout structure in `App.tsx` is a container layout matching typical B2B dashboard patterns
- To match your exact Figma design, you may need to adjust spacing, sizing, and component placement
- The Tailwind configuration includes all design tokens extracted from the Figma file
- CSS custom properties are available in `globals.css` for additional customization
