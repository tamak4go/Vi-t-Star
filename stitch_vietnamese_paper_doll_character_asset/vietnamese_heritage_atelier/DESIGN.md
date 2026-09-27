---
name: Vietnamese Heritage Atelier
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#44474d'
  inverse-surface: '#31312d'
  inverse-on-surface: '#f3f0ea'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4f5f7c'
  primary: '#04152e'
  on-primary: '#ffffff'
  primary-container: '#1a2a44'
  on-primary-container: '#8291b1'
  inverse-primary: '#b7c7e8'
  secondary: '#ae3022'
  on-secondary: '#ffffff'
  secondary-container: '#fd6955'
  on-secondary-container: '#690000'
  tertiary: '#1e1400'
  on-tertiary: '#ffffff'
  tertiary-container: '#372800'
  on-tertiary-container: '#b48b15'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b7c7e8'
  on-primary-fixed: '#0a1b35'
  on-primary-fixed-variant: '#384763'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#8c170d'
  tertiary-fixed: '#ffdf98'
  tertiary-fixed-dim: '#eec14b'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system defines an imperial, archival atelier for Vietnamese historical attire (Cổ Phục Việt). The design blends historical dignity with the tactile precision of a modern interactive fitting studio. The visual aesthetic fuses royal Vietnamese court motifs—inspired by the Dynasties (Lê, Nguyễn, Lý, Trần)—with contemporary interactive game UI frameworks.

### Brand Personality & Tone
- **Regal & Authoritative:** Reverence for historical accuracy, cultural authenticity, and textile artistry.
- **Tactile & Curatorial:** Objects feel physical, layered, collected, and documented rather than simulated or game-like.
- **Refined & Contemplative:** Uses negative space, parchment backdrops, and brass micro-borders to evoke antique lacquerware, painted silk scrolls, and royal palace chambers.

### Style Archetype
The system uses an **Imperial Archival / Modern Tactile** style:
- High-contrast, deeply saturated traditional lacquer and mineral pigment tones (Navy, Cinnabar, Bronze Gold) set against warm ivory parchment canvases.
- Micro-fine metallic borders (hairline bronze rules) and muted drop shadows that evoke layered silk, lacquer screens, and gold leaf inlays.
- Sharp architectural grids balanced with softly contoured touch surfaces.

## Colors

The palette draws directly from Vietnamese palace lacquerware, royal silk embroideries (*Áo Nhật Bình*, *Áo Tấc*), and weathered architectural gold leaf.

### Palette Architecture
- **Primary (`#1A2A44` — Deep Imperial Indigo):** Serves as the authoritative frame color, toolbars, structural panels, primary actions, and primary typography. A deeper tier (`#0F1C30`) is reserved for stage backdrops and active selection halos.
- **Secondary (`#B93829` — Cinnabar Red / Son Ta):** Used for focal interactive points, primary callouts, royal seal emblems, active tab underlines, and destructive/reset confirmation states.
- **Tertiary (`#C59B27` — Antique Gilded Bronze):** Used for hairline borders, metallic embellishments, selected item tags, item rarity/dynasty badges, and subtle reflective rings. A lighter variant (`#D4AF37`) functions as an interactive hover tint.
- **Neutral Canvas (`#F9F6F0` — Royal Parchment):** The primary light surface, reminiscent of Dó paper and raw silk. Layered surfaces transition to `#F0EBD8` for inner card containers and `#FFFFFF` for pristine canvas cutout backgrounds.
- **Text & Contrast:** Text levels use deep indigo-slate (`#121D2F`) on light surfaces to preserve warmth while guaranteeing AAA readability; pure black is omitted.

## Typography

Typography balances dynastic grandeur with modern micro-UI legibility.

### Font Pairing
- **Noto Serif:** Serves for historical titles, royal garment names (e.g., *Áo Giao Lĩnh*, *Mũ Đinh Tự*), historical period timestamps, and modal headers. It brings classic proportions and elegant Vietnamese diacritic rendering.
- **Be Vietnam Pro:** Crafted specifically for the Vietnamese language, handling complex tone marks and stacked diacritics natively without baseline collisions. It is utilized across all interactive controls, category tab titles, item metadata, button labels, and system tooltips.

### Diacritic and Density Rules
Vietnamese diacritical marks require elevated line-height headroom. Avoid line-height multipliers tighter than `1.3` on display text or `1.5` on body copy to avoid clipping upper marks (dấu hỏi, ngã, sắc, huyền, nặng). All labels set in `label-sm` must carry a minimum of `0.04em` letter-spacing for sharp readability on dense inventory displays.

## Layout & Spacing

The workspace divides into a dedicated dual-focus layout: an architectural visual stage (*Khu Vực Thử Đồ*) and a high-density, categorized inventory drawer (*Kho Trang Phục*).

### Grid & Layout Principles
- **Desktop (1024px+):** Asymmetrical split workbench. The Fitting Stage occupies a fixed or fluid 50% to 58% of the viewport width, anchoring the dressed mannequin on an archival neutral pedestal. The remaining 42% to 50% hosts the multi-tiered wardrobe selector with sticky category tabs, preset trays, and inventory grids.
- **Tablet (768px – 1023px):** Compact horizontal split or vertical 60/40 stack with a floating horizontal action rail for snap, randomize, and clear operations.
- **Mobile (< 768px):** The stage occupies the upper 55% of the viewport; the inventory slides up as a bottom sheet with persistent thumb-accessible category pills and an expandable item drawer.

### Spacing Scale
Component spacing strictly follows 4px and 8px rhythmic increments. Padding within interactive cards uses `space-sm` (8px) or `space-md` (12px) to maximize preview card density while sustaining touch target minimums of 44x44px.

## Elevation & Depth

Visual depth reflects physical paper-stock layering, lacquer boxes, and brass mounting plates. Heavy, synthetic drop shadows are replaced by warm, tinted ambient occlusions and metallic edges.

### Layering Levels
- **Base Canvas (Level 0):** Parchment backdrop (`#F9F6F0`) with subtle woven linen texture simulation or smooth neutral silk tone.
- **Stage Pedestal (Level 1):** Inset stage framed with a hairline gilded border (`1px solid rgba(197, 155, 39, 0.35)`) and a muted bottom contact shadow (`0 8px 24px -4px rgba(15, 28, 48, 0.08)`).
- **Interactive Cards & Panels (Level 2):** Pure card surfaces (`#FFFFFF`) elevated by crisp double borders: an inner 1px border (`rgba(26, 42, 68, 0.06)`) and a delicate drop shadow (`0 2px 8px -2px rgba(26, 42, 68, 0.08)`).
- **Hover & Selected Card States (Level 3):** Gilded lift state featuring a warm gold-bronze drop shadow (`0 6px 16px -2px rgba(197, 155, 39, 0.25)`) and an active border (`1.5px solid #C59B27`).
- **Floating HUD & Action Rails (Level 4):** Deep Navy overlays (`#1A2A44`) backed with slight backdrop-filter blur (`8px`) and imperial drop shadow (`0 12px 32px -4px rgba(15, 28, 48, 0.3)`).
- **Modals & Snapshot Lightbox (Level 5):** Deep semi-translucent Navy scrim (`rgba(15, 28, 48, 0.75)`) supporting centered archival frame cards with antique gold accents.

### Mannequin Z-Index Stack Order
The stage rendering pipeline conforms to historical dressing tiers:
1. `z-index: 10` — Undergarments / Trousers / Quần lót & Quần dài
2. `z-index: 20` — Footwear / Giày, Hài, Guốc Mộc
3. `z-index: 30` — Inner Robe / Áo lót trong (Áo cánh)
4. `z-index: 40` — Outer Robe / Áo chính (Áo Tấc, Áo Nhật Bình, Áo Giao Lĩnh, Áo Ngũ Thân)
5. `z-index: 50` — Collar & Shoulder Ornaments / Bội, Vân Kiên
6. `z-index: 60` — Headwear & Hair / Mũ Đinh Tự, Khăn Vành Dây, Khăn Đóng
7. `z-index: 70` — Handheld Accessories / Quạt Trầm, Thẻ Bài, Chuỗi Ngọc

## Shapes

The shape system adopts a **Soft Architectural (Level 1)** posture, reflecting the carved wooden frames, lacquered chests, and beveled stone inscriptions of Vietnamese imperial architecture.

### Corner Curvature Rules
- **Structural Panels & Stage Frame:** `rounded-sm` (4px) to `rounded-md` (8px). Maintains strict architectural order without brutal sharpness.
- **Inventory Cards & Thumbnail Tiles:** `rounded-sm` (4px). Keeps square-like rhythm for fabric texture viewing.
- **Floating Badges, Dynasty Tags, & Counter Pills:** Fully pill-rounded (`rounded-full`) to contrast against rectangular geometry.
- **Action Buttons & Inputs:** `rounded-sm` (4px), reinforced by crisp hairlines to convey artisanal precision.

## Components

### Buttons & Action Triggers
- **Primary Imperial Button (Snapshot / Tải Ảnh Xuống):** Solid Cinnabar red (`#B93829`) fill, white bold text (`#FFFFFF`), subtle top-edge highlight, 4px border radius. Hover triggers deep crimson shift (`#9E2E21`) with gilded rim glow (`rgba(212, 175, 55, 0.4)`).
- **Secondary Bronze Button (Preset Looks / Phối Sẵn):** Deep Navy background (`#1A2A44`), 1px solid antique gold border (`#C59B27`), gold text (`#D4AF37`).
- **Utility & Reset Buttons (Ngẫu Nhiên / Đặt Lại):** Parchment button with navy outline (`1px solid rgba(26, 42, 68, 0.2)`), navy text, shifting to soft cinnabar tint on hover for destructive clear actions.

### Category Navigation Tabs (Mũ/Khăn, Áo, Quần, Giày/Guốc, Phụ Kiện)
- Horizontal scrollable or segmented tab bar.
- Inactive tabs: Transparent fill, neutral slate text (`rgba(26, 42, 68, 0.7)`), 13px font size with medium weight.
- Active tab: Deep Navy text (`#1A2A44`), grounded by a 2.5px Cinnabar red underline flanked by miniature antique-gold diamond corner accents.

### Garment Inventory Cards
- Ratio: 1:1 or 4:5 vertical proportion.
- Surface: `#FFFFFF` card body with `#F0EBD8` item preview canvas.
- Metadata: Garment title in `Be Vietnam Pro` (12px, semibold), period subtitle (e.g., "Thời Nguyễn - Thế kỷ 19") in 10px muted slate.
- Equipped State: 2px antique gold border (`#C59B27`) with an imperial red vermilion seal icon (dấu triện) stamped in the top-right corner.
- Unequip Action: Clear micro-close indicator appearing on hover.

### Interactive Dressing Stage Canvas
- Central silhouette avatar anchored on an ivory-and-gold lotus roundel base.
- Layer toggle bar floating in upper canvas: quick eyes/lock controls to reveal or hide overlapping garment layers.
- Canvas action dock anchored at stage base: Zoom, Reset Pose, Background Setting (Cung Đình, Hoa Viên, Trơn).

### Snapshot & Export Modal (Triện & Xuất Ảnh)
- Generates an archival presentation card around the final composition.
- Framing: Outer border with Vietnamese traditional geometric pattern (Hồi văn / Chữ Vạn) rendered in hairline bronze gold.
- Includes a decorative stamp of the user-styled ensemble with dynasty provenance notes and a downloadable 4K postcard frame.