# UI/UX Direction & Visual Language

**Last Updated:** 2026-05-27

---

## 🎯 Core Design Principle

**WhiteWrite is NOT a text editor.**
**WhiteWrite IS a film production studio.**

Every UI decision should reinforce this positioning.

---

## 🎨 Visual Identity

### **Color Palette**

**Primary (Cinematic Dark Mode):**
- Background: `#0a0a0a` (near black)
- Surface: `#1a1a1a` (dark gray)
- Borders: `#2a2a2a` (subtle dividers)

**Accent Colors:**
- Primary: `#8b5cf6` (violet - for AI features)
- Secondary: `#d4af37` (gold - for premium/director mode)
- Success: `#10b981` (emerald - for completed)
- Warning: `#f59e0b` (amber - for in-progress)
- Error: `#ef4444` (red - for errors)

**Text:**
- Primary: `#f9fafb` (near white)
- Secondary: `#9ca3af` (gray)
- Tertiary: `#6b7280` (muted gray)

### **Typography**

**Headings:**
- Font: System serif (Georgia, Times, serif)
- Weight: Bold
- Style: Professional, editorial feel

**Body:**
- Font: System sans-serif (Inter, Helvetica, Arial)
- Weight: Regular, Medium
- Line height: 1.6 (comfortable reading)

**Code/Monospace:**
- Font: JetBrains Mono, Consolas
- Use for: Shot IDs, scene numbers, technical metadata

---

## 🎬 Icon System

**Replace writing icons with film icons:**

| Old (Writing) | New (Film) | Usage |
|--------------|-----------|-------|
| BookOpen | Clapperboard | Main project icon |
| PenLine | Film | Writing/drafting |
| Search | Target | Analysis/review |
| Sparkles | Wand2 | AI operations |
| - | Camera | Shot composition |
| - | Video | Timeline view |
| - | Layout | Storyboard |

**Icon Library:** Lucide React (already installed)

---

## 🏗️ Layout Architecture

### **Main Workspace Structure**

```
┌─────────────────────────────────────────┐
│  AppHeader (always visible)             │
├─────────────────────────────────────────┤
│ ┌───────┬───────────────────────────┐   │
│ │       │                           │   │
│ │ Side  │   Main Workspace Area     │   │
│ │ Panel │                           │   │
│ │       │   (Scene Cards /          │   │
│ │ Nav   │    Timeline /             │   │
│ │       │    Director View)         │   │
│ │       │                           │   │
│ └───────┴───────────────────────────┘   │
└─────────────────────────────────────────┘
```

### **Key UI Components**

#### **1. Scene Card (Visual)**
```
┌──────────────────────────┐
│  [Thumbnail/Mood Visual] │
│                          │
│  Scene Title             │
│  Act 1 • Chapter 2       │
│                          │
│  [Status Badge]          │
│  👤 Character Chips      │
│                          │
│  [Draft] [Review] [Direct]
└──────────────────────────┘
```

**Design Notes:**
- Card elevation: subtle shadow
- Rounded corners: 16px
- Hover: lift effect (shadow increase)
- Status badge: colored pill (green/amber/blue)

#### **2. Scene Timeline (Horizontal)**
```
┌─────┬─────┬─────┬─────┬─────┐
│ S1  │ S2  │ S3  │ S4  │ S5  │
└─────┴─────┴─────┴─────┴─────┘
  └──Act 1──┘ └──Act 2──┘
```

**Design Notes:**
- Draggable cards
- Act dividers (vertical lines)
- Tension curve overlay (optional)
- Click scene → open in workspace

#### **3. Director Panel (Shot List)**
```
┌───────────────────────────────────┐
│ Shot # │ Type    │ Description    │
├───────────────────────────────────┤
│ 1      │ Wide    │ Exterior ...   │
│ 2      │ Close   │ Character ...  │
│ 3      │ Medium  │ Dialogue ...   │
└───────────────────────────────────┘
```

**Design Notes:**
- Editable table cells
- Type dropdown (Wide, Medium, Close-up, POV)
- Copy row button
- Export to PDF button

#### **4. Visual Mood Board**
```
┌──────────────────────────┐
│  Lighting: Golden Hour   │
│  Palette: 🟡 🟠 🔴      │
│  Atmosphere: Tense       │
│                          │
│  [Storyboard Prompts]    │
│  "Wide shot of ..."      │
│  [Copy to Midjourney]    │
└──────────────────────────┘
```

---

## ✨ Motion & Interaction

### **Animation Principles**

1. **Smooth, Cinematic Transitions**
   - Duration: 200-300ms
   - Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
   - No jarring cuts

2. **Elevate on Hover**
   - Cards lift slightly
   - Shadow increases
   - Border glow (subtle)

3. **Fade & Slide**
   - Panels slide in from side
   - Content fades in (opacity)
   - No hard pops

4. **Loading States**
   - Skeleton screens (not just spinners)
   - Shimmer effect
   - Progress indicators

### **Key Interactions**

**Scene Card Click:**
- Card scales up slightly (1.02)
- Workspace slides in from right
- Previous content fades out

**Timeline Drag:**
- Card lifts with higher shadow
- Ghost card shows original position
- Snap to grid on drop

**AI Processing:**
- Pulsing violet glow
- Progress bar (if long operation)
- Success animation (checkmark + confetti)

---

## 🎭 Micro-Interactions

### **Button States**
- Default: subtle border
- Hover: background fill + lift
- Active: scale down (0.95)
- Disabled: opacity 0.5

### **Status Badges**
- Planned: Blue (`#3b82f6`)
- Drafted: Amber (`#f59e0b`)
- Analyzed: Purple (`#8b5cf6`)
- Shot-Ready: Green (`#10b981`)

### **Character Chips**
```
┌──────────────┐
│ 👤 John Doe  │
└──────────────┘
```
- Small avatar/icon
- Name truncated if long
- Hover: show full name + role tooltip

---

## 🚫 What to Avoid

❌ **Text-heavy lists** → Use visual cards
❌ **Plain white backgrounds** → Dark mode cinematic theme
❌ **Book/writing icons** → Use film/production icons
❌ **Dense information** → Breathable layouts with whitespace
❌ **Generic SaaS feel** → Premium production software feel
❌ **Cluttered dashboards** → Clean, focused views

---

## ✅ Design Checklist

Before shipping any UI:

- [ ] Does it feel like film software (not a text editor)?
- [ ] Is the color palette cinematic (dark + gold/violet)?
- [ ] Are icons film-themed?
- [ ] Is information visual (cards, timelines, graphs)?
- [ ] Are interactions smooth (animations, transitions)?
- [ ] Does it evoke "holy shit" reaction?

---

## 🔮 Future Visual Features

- **3D Scene Graph** (Three.js visualization)
- **Animated Tension Curve** (live updating)
- **Character Relationship Network** (force-directed graph)
- **Storyboard Gallery** (AI-generated images)
- **Virtual Camera Preview** (simulate shots in 3D)

---

## 📚 Design References

**Inspiration:**
- Final Draft (professional screenwriting software)
- Figma (clean, modern UI)
- Linear (beautiful task management)
- Runway ML (AI creative tools)
- Adobe Premiere (video editing timeline)

**Color Inspiration:**
- Film noir aesthetics
- Cinema screens (dark with warm accents)
- Hollywood premiere vibes (gold + black)
