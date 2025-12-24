# Auto Wiki - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from automotive industry leaders and modern car manufacturer websites (BMW, Tesla, Porsche) combined with content-rich platforms like Wikipedia and Medium for the blog section. The design emphasizes visual impact through high-quality automotive photography while maintaining information density and easy navigation.

## Core Design Principles

1. **Automotive Excellence**: Premium, tech-forward aesthetic that reflects the passion and precision of the automotive world
2. **Visual Hierarchy**: Large, impactful imagery balanced with clear, readable technical specifications
3. **Information Density**: Comprehensive data presentation without overwhelming users
4. **Speed & Performance**: Fast-loading, responsive design that mirrors automotive performance values

## Typography

**Primary Font**: Inter (via Google Fonts CDN)
- Hero Headlines: text-5xl md:text-6xl lg:text-7xl, font-bold, tracking-tight
- Section Titles: text-3xl md:text-4xl, font-bold
- Card Titles: text-xl md:text-2xl, font-semibold
- Body Text: text-base md:text-lg, font-normal
- Specifications: text-sm md:text-base, font-medium
- Captions/Meta: text-xs md:text-sm, font-normal

## Layout System

**Spacing Units**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32 for consistent rhythm
- Section padding: py-16 md:py-24 lg:py-32
- Card padding: p-6 md:p-8
- Component spacing: space-y-6 md:space-y-8
- Grid gaps: gap-6 md:gap-8 lg:gap-12

**Container Strategy**:
- Full-width hero sections: w-full
- Content sections: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Text content: max-w-4xl for optimal reading

## Component Library

### Navbar (Sticky, Dark)
- Height: h-16 md:h-20
- Background: bg-slate-900/95 backdrop-blur-md
- Logo: left-aligned, h-8 md:h-10
- Navigation links: horizontal on desktop, hamburger menu on mobile
- Login/CTA button: bg-blue-500 hover:bg-blue-600
- Border: border-b border-slate-800

### Hero Section (Landing Page)
- Height: min-h-screen flex items-center
- Background: Full-width, high-quality automotive image (sports car in motion, preferably blue/silver tones)
- Overlay: bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent
- Content positioning: Left-aligned, max-w-3xl
- Primary CTA: Large button with backdrop-blur-sm bg-blue-500/90
- Secondary CTA: Outlined button with border-2 border-white/50 backdrop-blur-sm

### Car Card (Grid Layout)
- Container: rounded-xl overflow-hidden bg-slate-800 shadow-xl
- Image: aspect-video, object-cover, high-quality car photo
- Content padding: p-6
- Hover effect: transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl
- Brand/Model: text-xl font-bold
- Metadata: flex items-center gap-4 text-sm (year, type icons)
- CTA: "View Details" button, full-width, bg-blue-500

### Car Detail Page
- Hero image: Full-width panoramic car image, min-h-[60vh], object-cover
- Specifications grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6
- Spec cards: bg-slate-800 rounded-lg p-6, with icon + label + value
- Description section: prose prose-invert max-w-4xl

### Blog Card
- Container: rounded-xl overflow-hidden bg-slate-800
- Featured image: aspect-[16/9]
- Category badge: Absolute top-4 left-4, bg-cyan-500 px-3 py-1 rounded-full text-xs
- Content padding: p-6
- Author/Date: flex items-center gap-2 text-sm text-slate-400
- Excerpt: line-clamp-3

### Filter/Search Bar
- Container: bg-slate-800 rounded-xl p-6 mb-12
- Layout: grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4
- Dropdowns: bg-slate-700 rounded-lg px-4 py-3 with custom select styling
- Search input: bg-slate-700 rounded-lg px-4 py-3 with search icon

### Buttons
- Primary: bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors
- Secondary: border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white
- On-image buttons: backdrop-blur-md bg-white/10 border border-white/20 text-white (no hover state changes for on-image context)
- Admin: bg-cyan-500 hover:bg-cyan-600

### Footer
- Background: bg-slate-900
- Layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
- Sections: About, Quick Links, Categories, Social/Contact
- Copyright: border-t border-slate-800 mt-12 pt-8 text-center text-sm

### Admin Dashboard
- Sidebar: w-64 bg-slate-900 h-screen fixed left-0
- Main content: ml-64 p-8
- Forms: bg-slate-800 rounded-xl p-8
- Input fields: bg-slate-700 rounded-lg px-4 py-3 w-full
- Image upload: Dashed border upload zone with drag-drop

## Page-Specific Layouts

### Landing Page Sections
1. Hero (full viewport with background image)
2. About Project (3-column icon grid, py-20)
3. Featured Cars (3-column grid of car cards)
4. Latest Articles (3-column grid of blog cards)
5. CTA Section (centered, bg-gradient-to-r from-blue-600 to-cyan-500)
6. Footer

### Car Database Page
1. Filter bar (sticky below navbar)
2. Results count and sort options
3. Car grid (3-column on desktop, 2 on tablet, 1 on mobile)
4. Pagination (centered, numbered with arrows)

### Blog Page
1. Category filter chips (horizontal scroll on mobile)
2. Featured post (large, 2/3 width on desktop)
3. Regular posts grid (2-3 columns)
4. Load more button

## Images

**Required Images**:
1. **Landing Hero**: Wide panoramic shot of a modern sports car (preferably in motion, blue/silver color), high contrast, professional quality - Full viewport background
2. **Featured Cars Section**: 3 high-quality car images showcasing different vehicle types (sports car, SUV, classic car)
3. **Car Detail Pages**: Multiple angles of each vehicle - hero panoramic + 4-6 detail shots
4. **Blog Featured Images**: Automotive-related imagery (close-ups of engines, driving scenes, vintage cars, technology)
5. **About Page**: Team photos, project development images

**Image Treatment**: All images should have slight darkening overlay when text appears on top (bg-black/40 or gradient overlays)

## Responsive Breakpoints

- Mobile: 320px - 767px (single column, stacked navigation)
- Tablet: 768px - 1023px (2 columns, simplified grids)
- Desktop: 1024px+ (full multi-column layouts)

## Animations

Use sparingly:
- Card hover transforms (scale, shadow)
- Button hover states (background color transitions)
- Fade-in on scroll for section entry (optional enhancement)
- Smooth page transitions between routes

## Icons

Use **Heroicons** (via CDN) for all interface icons:
- Navigation icons (menu, close, search)
- Specification icons (engine, speed, fuel, drive type)
- Social media icons
- Admin panel icons (add, edit, delete)