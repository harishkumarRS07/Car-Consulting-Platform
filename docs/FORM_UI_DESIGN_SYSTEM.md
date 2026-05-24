# CarConsult Form UI Design System

## 🎨 Design Principles

### Color Palette
```
Primary:     #2563EB (Blue-600)
Primary Alt: #0084FF (Bright Blue)
Success:     #10B981 (Green-500)
Error:       #DC2626 (Red-600)
Warning:     #F59E0B (Amber-500)
Background: #FFFFFF / #1F2937 (Dark)
Text:        #111827 (Dark) / #F3F4F6 (Light)
Border:      #E5E7EB (Light) / #374151 (Dark)
```

### Typography
```
Headings:    Bold, Dark gray / White
Labels:      Semibold, Dark gray / Light gray
Body:        Regular, Gray / Light gray
Helper:      Small, Gray / Light gray
```

### Spacing (Based on Tailwind)
```
XS: 0.25rem (1px)
SM: 0.5rem (2px)
MD: 1rem (4px)
LG: 1.5rem (6px)
XL: 2rem (8px)
2XL: 3rem (12px)
```

---

## 🎯 Form Field Patterns

### 1. Text Input Pattern
```
┌─────────────────────────────┐
│ Label                       │
│ ┌───────────────────────┐  │
│ │ Placeholder text...   │  │
│ └───────────────────────┘  │
│ Helper text (optional)      │
│ ✓ Or error message          │
└─────────────────────────────┘
```

**States:**
- Empty: Gray border, blue focus ring
- Filled: Blue border on focus
- Error: Red border, red error text
- Disabled: Gray, opacity 60%

### 2. Select/Dropdown Pattern
```
┌─────────────────────────────┐
│ Label                       │
│ ┌─────────────────────────┐ │
│ │ Option 1              ▼ │ │
│ └─────────────────────────┘ │
│ (Opens dropdown on click)    │
└─────────────────────────────┘
```

**Visual:**
- Chevron icon right-aligned
- Customized dropdown arrow
- Smooth open/close animation

### 3. Textarea Pattern
```
┌──────────────────────────────────┐
│ Label              Characters: 0/2000
│ ┌───────────────────────────────┐ │
│ │ Multiple lines of text...     │ │
│ │                               │ │
│ │                               │ │
│ └───────────────────────────────┘ │
└──────────────────────────────────┘
```

**Features:**
- Character counter
- Color warning at 90%+
- Resizable (or fixed)
- Min 4 rows

### 4. Checkbox Group Pattern
```
☐ Option 1    ☐ Option 4
☐ Option 2    ☐ Option 5
☐ Option 3    ☑ Option 6 (selected)
```

**Grid Layout:**
- 2 columns mobile
- 3 columns tablet
- 4 columns desktop
- Hover effect (slight move)
- Accent color when checked

### 5. Radio Button Pattern
```
◯ Option 1
◯ Option 2
◉ Option 3 (selected)
```

**Behavior:**
- Only one can be selected
- Click to toggle
- Hover highlight

### 6. File Upload Pattern
```
┌────────────────────────────────┐
│          📁 Upload Icon        │
│ Click to upload or drag & drop │
│ Max 2MB per file, up to 20     │
└────────────────────────────────┘

Preview Grid:
┌────────┐ ┌────────┐ ┌────────┐
│ Img 1  │ │ Img 2  │ │ Img 3  │
│   🗑    │ │   🗑    │ │   🗑    │
└────────┘ └────────┘ └────────┘
```

**Features:**
- Drag and drop support
- File preview thumbnails
- Remove buttons on hover
- Progress indicator
- Uploaded count

---

## 🎨 Form Layout Patterns

### Layout 1: Single Column (Mobile/Narrow)
```
┌─────────────────────┐
│   Full Width Field  │
├─────────────────────┤
│   Full Width Field  │
├─────────────────────┤
│   Full Width Field  │
├─────────────────────┤
│  [Cancel] [Submit]  │
└─────────────────────┘
```

### Layout 2: Two Columns (Tablet/Desktop)
```
┌─────────────────┬─────────────────┐
│  Field 1        │  Field 2        │
├─────────────────┼─────────────────┤
│  Field 3        │  Field 4        │
├─────────────────┴─────────────────┤
│     Full Width Description        │
├─────────────────┬─────────────────┤
│  [Cancel]       │    [Submit]     │
└─────────────────┴─────────────────┘
```

### Layout 3: Tabbed Sections
```
[Section 1] [Section 2] [Section 3]
┌──────────────────────────────────┐
│  Progress Bar                    │
├──────────────────────────────────┤
│                                  │
│  Section Content Here            │
│                                  │
├──────────────────────────────────┤
│  [Previous] [Cancel] [Next]      │
└──────────────────────────────────┘
```

---

## 🎯 Button Patterns

### Primary Button (Submit/Confirm)
```
┌─────────────────────┐
│  ✓ Submit           │ (Normal)
└─────────────────────┘

┌─────────────────────┐
│  ✓ Submit           │ (Hover - slightly lighter)
└─────────────────────┘

┌─────────────────────┐
│  ⟳ Submitting...    │ (Loading)
└─────────────────────┘

┌─────────────────────┐
│  ✓ Submit           │ (Disabled - opacity 50%)
└─────────────────────┘
```

**Style:**
- Gradient blue background
- White text
- Rounded corners
- Shadow on normal state
- Larger padding
- Full width on mobile

### Secondary Button (Cancel/Back)
```
┌─────────────────────┐
│  ← Back             │
└─────────────────────┘
```

**Style:**
- Gray background
- Dark gray text
- Same size as primary
- No shadow

### Icon Button (Delete/Edit)
```
[🗑] [✏] [👁] [↗]
```

**Style:**
- Square icon
- Hover background
- Small size
- Appears on row hover

---

## 🎨 Form Sections

### Section Container
```
┌──────────────────────────────────────┐
│ 📊 Specifications                     │
├──────────────────────────────────────┤
│ Field 1      Field 2                 │
│ Field 3      Field 4                 │
└──────────────────────────────────────┘
```

**Features:**
- Section title with icon
- Divider line
- Padding around content
- Light background color
- Smooth transitions

---

## ❌ Error Display Patterns

### Inline Field Errors
```
Email Address
┌──────────────────────────┐
│ Enter your email...      │ ← Red border
└──────────────────────────┘
⚠ Invalid email format

(Field has red ring on focus)
```

### Form-Level Errors
```
┌──────────────────────────────────┐
│ ⚠ Error                          │
│ Failed to save. Please try again │
└──────────────────────────────────┘
```

**Style:**
- Red background (light)
- Red border
- Red icon
- Red text
- Rounded corners
- Padding inside

### Success Message
```
┌──────────────────────────────────┐
│ ✓ Success                        │
│ Your changes have been saved     │
└──────────────────────────────────┘
```

### Alert/Warning
```
┌──────────────────────────────────┐
│ ℹ Note                           │
│ Please review before submitting  │
└──────────────────────────────────┘
```

---

## 🎯 Modal/Overlay Patterns

### Backdrop
- Semi-transparent black (#000 20% opacity)
- Blur effect (6px)
- Dismissible on click

### Modal Content
```
┌────────────────────────────────────────┐
│ Header (Blue gradient background)      │
│ ┌─────────────────────────────────── ┐ │
│ │ Title                            [X] │ │
│ └─────────────────────────────────── ┘ │
├────────────────────────────────────────┤
│                                        │
│  Form Content                          │
│                                        │
├────────────────────────────────────────┤
│  [Cancel]                 [Submit]    │
└────────────────────────────────────────┘
```

**Properties:**
- Rounded corners (1.5rem)
- Shadow (2xl)
- Max width dependent on content
- Centered on screen
- Smooth slide-in animation

---

## 🌙 Dark Mode Adjustments

### Dark Mode Colors
```
Background:  #1F2937 (Gray-800)
Surface:     #111827 (Gray-900)
Text:        #F3F4F6 (Gray-100)
Border:      #374151 (Gray-700)
Hover:       #2D3748 (Gray-700)
Input BG:    #2D3748 (Gray-700)
```

### Example Dark Input
```
┌─────────────────────────────┐
│ Label (Light Gray)          │
│ ┌───────────────────────┐   │
│ │ Placeholder (White)   │   │
│ │ Dark gray background  │   │
│ └───────────────────────┘   │
│ Helper text (Light Gray)    │
└─────────────────────────────┘
```

**Transitions:**
- Color changes smooth (200ms)
- No flicker
- Consistent contrast ratios

---

## 📱 Responsive Adjustments

### Mobile (< 640px)
```
Single column layout
Full width buttons
Stack checkboxes (1 column)
Larger touch targets (min 44px)
Simplified header (more compact)
Hide advanced options initially
```

### Tablet (640px - 1024px)
```
2 column layout where appropriate
Half width buttons side by side
Grid checkboxes (2 columns)
Reduced padding on fields
Collapsible sections
```

### Desktop (> 1024px)
```
2-4 column layout
Full width buttons (if form is narrow)
Expanded checkboxes (3-4 columns)
Standard padding
All sections visible
Sidebar patterns possible
```

---

## ✨ Animation Patterns

### Field Focus
```
Duration: 200ms
Effect: Border color change + ring glow
```

### Error Shake
```
Duration: 400ms
Effect: 5px left-right shake
```

### Success Checkmark
```
Duration: 600ms
Effect: Scale 0→1 with elastic timing
```

### Section Expand/Collapse
```
Duration: 200ms
Effect: Height 0→auto, opacity 0→1
```

### Button Hover
```
Duration: 200ms
Effect: Scale 1→1.02, shadow increase
```

### Modal In/Out
```
In:  Scale 0.95→1, opacity 0→1 (300ms)
Out: Scale 1→0.95, opacity 1→0 (200ms)
```

---

## ♿ Accessibility

### ARIA Attributes
```html
<input
  aria-label="Email address"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="email-error"
/>
<div id="email-error" role="alert">
  Invalid email format
</div>
```

### Focus Management
- Visible focus ring (4px)
- Tab order logical
- Focus trap in modals
- Auto-focus first input

### Semantic HTML
- Use `<form>` element
- Proper `<label>` associations
- `<fieldset>` for groups
- `<legend>` for groups
- Proper heading hierarchy

---

## 📐 Sizing Chart

### Button Sizes
```
Small:  8px 12px   (text) + 32px height
Medium: 12px 16px  (text) + 40px height
Large:  16px 24px  (text) + 48px height
```

### Input Sizes
```
Small:  24px height + 8px padding
Medium: 32px height + 10px padding
Large:  40px height + 12px padding
```

### Spacing
```
Compact:  4px between elements
Standard: 16px between elements
Loose:    24px between sections
```

---

## 🎯 Component Variants

### Input Variants
- Text
- Email
- Number
- Password
- URL
- Date
- Time
- Color

### Select Variants
- Single select
- Multi-select (checkboxes)
- Search select
- Native select

### Button Variants
- Primary (Blue)
- Secondary (Gray)
- Danger (Red)
- Success (Green)
- Outline
- Ghost

### Size Variants
- Small
- Medium (default)
- Large

### State Variants
- Default
- Hover
- Focus
- Active
- Disabled
- Loading

---

## 📝 Form Validation States

### Field States
```
1. Empty (Unfocused)
   - Gray border
   - Placeholder visible
   - No error

2. Empty (Focused)
   - Blue border
   - Placeholder dimmed
   - No error

3. Filled + Valid
   - Green border or checkmark
   - Value visible
   - Optional success message

4. Filled + Invalid
   - Red border
   - Value visible
   - Red error message
   - ⚠ icon

5. Disabled
   - Gray background
   - Opacity 60%
   - Cursor not-allowed
```

---

## 🔄 Form Submission Flow

```
1. User fills form
   ↓ (Real-time validation)
   
2. User clicks submit
   ↓
   
3. Button shows loading state
   └─ Spinner + "Submitting..."
   ↓
   
4. API call to backend
   ↓
   
5a. Success
    └─ Success animation
    └─ Redirect or close
    
5b. Error
    └─ Error message display
    └─ Form remains open
    └─ Button returns to normal
```

---

## 💡 Best Practices

1. **Consistency**
   - Use same spacing & colors throughout
   - Match existing form patterns
   - Align with design system

2. **Feedback**
   - Show validation immediately
   - Provide clear error messages
   - Confirm successful submission

3. **Accessibility**
   - Proper labels & input associations
   - ARIA attributes where needed
   - Keyboard navigation support

4. **Performance**
   - Debounce search/filter inputs
   - Lazy load images
   - Minimize re-renders

5. **Mobile-First**
   - Single column base layout
   - Expand for larger screens
   - Touch-friendly targets (min 44px)

6. **Clear CTAs**
   - Primary action prominent
   - Secondary actions subtle
   - Confirm destructive actions

7. **Error Prevention**
   - Validate before submission
   - Show inline errors
   - Prevent double-submit

8. **User Guidance**
   - Helper text for complex fields
   - Placeholder text for format hint
   - Success messages when appropriate

---

## 📚 Component Examples

### Example 1: Login Form
```
[CarConsult Logo]
┌──────────────────────────┐
│ Admin Login              │
├──────────────────────────┤
│ Email                    │
│ [............]           │
│                          │
│ Password                 │
│ [............] [👁]      │
│                          │
│ [☑] Remember me          │
│                          │
│ [Login Button]           │
└──────────────────────────┘
```

### Example 2: Car Add/Edit Form
```
Header (Blue gradient)
Tabs: Basic | Details | Pricing | Images

Tab 1: Basic
┌────────────┬────────────┐
│ Title      │ Brand      │
├────────────┼────────────┤
│ Model      │ Year       │
└────────────┴────────────┘

[Next] [Cancel]
```

### Example 3: Filter Form
```
┌──────────────────────┐
│ 🔍 Search cars...    │
├──────────────────────┤
│ Sort: [Newest ▼]     │
├──────────────────────┤
│ ▼ Brand (3)          │
│   ☑ Maruti           │
│   ☑ Honda            │
│   ☐ Toyota           │
├──────────────────────┤
│ ▼ Fuel Type          │
│   ☑ Petrol           │
│   ☐ Diesel           │
│   ☐ CNG              │
├──────────────────────┤
│ ▼ Price Range        │
│ ₹1,00,000 - ₹50,00,000
├──────────────────────┤
│ [Clear All Filters]  │
└──────────────────────┘
```

---

## 🎨 Final Notes

This design system ensures:
- ✅ Consistent user experience
- ✅ Professional appearance
- ✅ Accessibility compliance
- ✅ Mobile responsiveness
- ✅ Dark mode support
- ✅ Performance optimized
- ✅ Intuitive interactions
- ✅ Clear feedback

Follow these patterns for all forms and components in CarConsult!

