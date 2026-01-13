# HR System Design System

## 🎨 Overview

Design System สำหรับ HR System ที่รองรับทั้งภาษาไทยและอังกฤษ

---

## 📝 Typography

### Fonts

| ภาษา | Font | ใช้งาน |
|------|------|--------|
| ไทย | **Anuphan** | ข้อความภาษาไทยทั้งหมด |
| อังกฤษ | **Inter** | ข้อความภาษาอังกฤษ |

### Font Classes

```html
<!-- Default (Thai first, English fallback) -->
<p className="font-sans">ข้อความ Text</p>

<!-- Force Thai -->
<p className="font-thai">ข้อความไทย</p>

<!-- Force English -->
<p className="font-english">English Text</p>
```

### Type Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem | 1.5 | Labels, badges |
| `text-sm` | 0.875rem | 1.5 | Secondary text |
| `text-base` | 1rem | 1.6 | Body text |
| `text-lg` | 1.125rem | 1.5 | Subtitles |
| `text-xl` | 1.25rem | 1.4 | Card titles |
| `text-2xl` | 1.5rem | 1.35 | Section headers |
| `text-3xl` | 1.875rem | 1.3 | Page titles |

---

## 🎨 Colors

### Primary (Blue)

```css
primary-50   /* Background highlights */
primary-100  /* Borders, subtle backgrounds */
primary-500  /* Buttons, links */
primary-600  /* Hover states */
primary-700  /* Active states */
```

### Semantic Colors

| Color | Usage | Classes |
|-------|-------|---------|
| **Success** | ตรงเวลา, สำเร็จ | `text-success`, `bg-success-50` |
| **Warning** | มาสาย, รออนุมัติ | `text-warning`, `bg-warning-50` |
| **Danger** | ขาดงาน, ปฏิเสธ | `text-danger`, `bg-danger-50` |
| **Info** | ข้อมูล, OT | `text-info`, `bg-info-50` |

---

## 🏷️ Badges

### Status Badges

```html
<span className="badge-success">ตรงเวลา</span>
<span className="badge-warning">รออนุมัติ</span>
<span className="badge-danger">ปฏิเสธ</span>
<span className="badge-info">OT</span>
<span className="badge-neutral">ทั่วไป</span>
```

---

## 👤 Avatars

### Sizes

```html
<div className="avatar avatar-sm avatar-primary">AB</div>  <!-- 32px -->
<div className="avatar avatar-md avatar-primary">AB</div>  <!-- 40px -->
<div className="avatar avatar-lg avatar-primary">AB</div>  <!-- 48px -->
```

---

## 📦 Cards

### Interactive Card

```html
<div className="card-interactive">
  <!-- Card content -->
</div>
```

### Stat Card

```html
<div className="stat-card">
  <div className="stat-value">42</div>
  <p className="stat-label">พนักงาน</p>
</div>
```

---

## 📄 Page Layout

### Page Container

```html
<div className="page-container">
  <div className="page-header">
    <h1 className="page-title">หัวข้อ</h1>
    <p className="page-description">รายละเอียด</p>
  </div>
  <!-- Content -->
</div>
```

---

## 🔲 Empty States

```html
<div className="empty-state">
  <Icon className="empty-state-icon" />
  <p className="empty-state-title">ไม่มีข้อมูล</p>
  <p className="empty-state-description">คำอธิบายเพิ่มเติม</p>
</div>
```

---

## 🎭 Shadows

| Class | Usage |
|-------|-------|
| `shadow-soft` | Subtle elevation |
| `shadow-medium` | Modals, dropdowns |
| `shadow-card` | Card default |
| `shadow-card-hover` | Card hover |

---

## ⚡ Animations

### Built-in Animations

```html
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-in-top">Slide from top</div>
<div className="animate-slide-in-bottom">Slide from bottom</div>
<div className="animate-pulse-soft">Subtle pulse</div>
```

### Stagger Animations

```html
<div className="animate-fade-in animate-stagger-1">Item 1</div>
<div className="animate-fade-in animate-stagger-2">Item 2</div>
<div className="animate-fade-in animate-stagger-3">Item 3</div>
```

---

## 📜 Scrollbars

```html
<!-- Hide scrollbar -->
<div className="scrollbar-hide overflow-y-auto">...</div>

<!-- Custom styled scrollbar -->
<div className="scrollbar-custom overflow-y-auto">...</div>
```

---

## 🖨️ Print

```html
<!-- Hide element when printing -->
<div className="no-print">Will not print</div>
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Min Width |
|------------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1400px |

---

## ✅ Best Practices

1. **ใช้ font-sans เป็น default** - รองรับทั้งไทยและอังกฤษ
2. **ใช้ semantic colors** - success, warning, danger, info
3. **ใช้ component classes** - badge-*, avatar-*, stat-*
4. **ใช้ page layout classes** - page-container, page-header
5. **ใช้ animations อย่างเหมาะสม** - ไม่มากเกินไป

---

## 🔧 CSS Variables

ดู `app/globals.css` สำหรับ CSS variables ทั้งหมด
