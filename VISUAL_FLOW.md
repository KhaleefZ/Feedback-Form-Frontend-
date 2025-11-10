# Visual Authentication Flow

## Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          HOME PAGE (/)                           │
│                                                                   │
│                    Check localStorage for user                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         User Exists?               No User
                │                       │
                ▼                       ▼
┌───────────────────────┐   ┌────────────────────────┐
│   Redirect to         │   │   Redirect to          │
│   /dashboard          │   │   /signup              │
└───────────────────────┘   └───────────┬────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNUP PAGE (/signup)                       │
├─────────────────────────────────────────────────────────────────┤
│  1. User enters email                                            │
│     • Validate email format (contains @ and domain)              │
│     • Real-time validation on blur                               │
│                                                                   │
│  2. User enters password                                         │
│     • Minimum 6 characters                                       │
│     • At least 1 uppercase letter (A-Z)                         │
│     • At least 1 lowercase letter (a-z)                         │
│     • At least 1 number (0-9)                                   │
│     • Real-time validation feedback                              │
│                                                                   │
│  3. Click "SIGN UP" button                                       │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   API Call    │
                    │  POST /signup │
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
         Success       Duplicate         Other
            │            Email            Error
            ▼               │               │
┌────────────────────┐      ▼               ▼
│  Show Alert:       │  ┌──────────────┐ ┌──────────────┐
│  "Signup          │  │ Show error:  │ │ Show error:  │
│   successful!"     │  │ "This email │ │ "Signup     │
│                    │  │  is already │ │  failed..."  │
│  Store user data   │  │  registered"│ └──────────────┘
│  in localStorage   │  └──────────────┘
└────────┬───────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LOGIN PAGE (/login)                        │
├─────────────────────────────────────────────────────────────────┤
│  1. User enters email                                            │
│     • Validate email format                                      │
│                                                                   │
│  2. User enters password                                         │
│     • Validate minimum 6 characters                              │
│                                                                   │
│  3. (Optional) Check "Remember me"                               │
│                                                                   │
│  4. Click "LOGIN" button                                         │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   API Call    │
                    │  POST /login  │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
             Success               Invalid
                │                 Credentials
                │                       │
                ▼                       ▼
    ┌──────────────────────┐    ┌──────────────┐
    │  Store user data in  │    │  Show error: │
    │  localStorage:       │    │  "Invalid    │
    │  {                   │    │   email or   │
    │    id: "...",        │    │   password"  │
    │    name: "...",      │    └──────────────┘
    │    email: "...",     │
    │    createdAt: "..."  │
    │  }                   │
    └──────────┬───────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD PAGE (/dashboard)                   │
├─────────────────────────────────────────────────────────────────┤
│  1. Check Authentication                                         │
│     └─ No user in localStorage? → Redirect to /login            │
│                                                                   │
│  2. Load User Data (Dynamic)                                     │
│     ┌─ Try: GET /api/users/:userId                              │
│     │  └─ Success: Load full profile from API                    │
│     └─ Fail: Load from localStorage                              │
│        └─ None: Use email as default                             │
│                                                                   │
│  3. Display Components                                           │
│     ├─ Sidebar with LOGO (SVG)                                   │
│     ├─ Header with user avatar                                   │
│     ├─ Profile form with user's email                            │
│     └─ All fields editable                                       │
│                                                                   │
│  4. User Actions                                                 │
│     ├─ Edit profile → Click "Save"                               │
│     │  ├─ Try: PUT /api/users/:userId                           │
│     │  └─ Fail: Save to localStorage                             │
│     │                                                             │
│     └─ Logout                                                    │
│        ├─ Clear localStorage                                     │
│        └─ Redirect to /login                                     │
│                                                                   │
│  5. Responsive Design                                            │
│     ├─ Mobile: Hamburger menu, collapsible sidebar              │
│     ├─ Tablet: Optimized layout                                  │
│     └─ Desktop: Full sidebar + content                           │
└─────────────────────────────────────────────────────────────────┘
```

## Validation Rules Visual

### Email Validation
```
Input: user@example.com
  ↓
Check: Contains @? ✓
  ↓
Check: Contains domain? ✓
  ↓
Check: Valid format? ✓
  ↓
API Call: Check duplicate? 
  ├─ Exists → ❌ Error: "Already registered"
  └─ New    → ✓ Proceed
```

### Password Validation
```
Input: MyPass123
  ↓
Check: Length ≥ 6? ✓ (9 characters)
  ↓
Check: Has uppercase? ✓ (M, P)
  ↓
Check: Has lowercase? ✓ (y, a, s, s)
  ↓
Check: Has number? ✓ (1, 2, 3)
  ↓
Result: ✓ Valid Password
```

```
Input: pass
  ↓
Check: Length ≥ 6? ❌ (4 characters)
  └─ Error: "Password must be at least 6 characters long"
```

```
Input: password123
  ↓
Check: Length ≥ 6? ✓
  ↓
Check: Has uppercase? ❌
  └─ Error: "Password must contain at least one uppercase letter"
```

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│  (Frontend)  │
└──────┬───────┘
       │
       │ POST /api/auth/signup
       │ { email, password }
       │
       ▼
┌──────────────┐
│   Backend    │◄──────┐
│   API        │       │
└──────┬───────┘       │
       │               │
       │ Check DB      │
       │ for duplicate │
       │               │
       ▼               │
┌──────────────┐       │
│   Database   │───────┘
└──────┬───────┘
       │
       │ Return result
       │
       ▼
┌──────────────┐
│   Browser    │
│ localStorage │
│   + Redux    │
└──────────────┘
```

## State Management

```
┌─────────────────────────────────────┐
│         localStorage                │
├─────────────────────────────────────┤
│                                     │
│  Key: "user"                        │
│  Value: {                           │
│    id: "uuid",                      │
│    name: "John Doe",                │
│    email: "john@example.com",       │
│    createdAt: "2025-10-31"          │
│  }                                  │
│                                     │
│  Key: "profile_uuid"                │
│  Value: {                           │
│    name: "John Doe",                │
│    email: "john@example.com",       │
│    dob: "1990-01-01",               │
│    gender: "Male",                  │
│    phone: "1234567890",             │
│    about: "Bio text...",            │
│    linkedin: "linkedin.com/in/...", │
│    website: "website.com",          │
│    instagram: "@username",          │
│    youtube: "@channel"              │
│  }                                  │
│                                     │
└─────────────────────────────────────┘
```

## Responsive Breakpoints

```
Mobile (<768px)
├─ Hamburger menu
├─ Full-width sidebar (slide-in)
├─ Stacked form fields
├─ Hidden "Premium" button text
└─ Single column layout

Tablet (768px - 1024px)
├─ Collapsible sidebar
├─ Two-column form
├─ Optimized spacing
└─ Visible navigation

Desktop (>1024px)
├─ Fixed sidebar (always visible)
├─ Profile navigation sidebar
├─ Two-column layout
├─ Full feature visibility
└─ Maximum screen utilization
```

## Component Hierarchy

```
Dashboard Page
├─ Sidebar (Navigation)
│  ├─ Logo (SVG Image)
│  ├─ Menu Items
│  │  ├─ Dashboard
│  │  ├─ Profile
│  │  ├─ Skill Repository
│  │  ├─ Learnings
│  │  ├─ Jobs (submenu)
│  │  └─ Tools (submenu)
│  └─ Support Links
│
├─ Header
│  ├─ Hamburger Menu (mobile)
│  ├─ Page Title
│  ├─ Premium Button
│  ├─ Notification Bell
│  └─ User Dropdown
│     ├─ Avatar
│     ├─ User Info
│     └─ Logout Option
│
└─ Main Content
   ├─ Profile Sidebar (desktop)
   │  ├─ Avatar
   │  ├─ User Name
   │  └─ Section Links
   │
   └─ Profile Form Card
      ├─ Header (Title + Actions)
      ├─ Basic Info Fields
      │  ├─ Name (disabled)
      │  ├─ Email (disabled)
      │  ├─ DOB
      │  ├─ Gender
      │  └─ Phone
      ├─ About Section
      └─ Social Media Links
```

## Error Handling Flow

```
API Call
  │
  ├─ Success (200)
  │   └─ Process data → Update UI → Show success message
  │
  ├─ Duplicate Email (409)
  │   └─ Show error under email field
  │
  ├─ Validation Error (400)
  │   └─ Show specific field errors
  │
  ├─ Unauthorized (401)
  │   └─ Clear localStorage → Redirect to login
  │
  ├─ Server Error (500)
  │   └─ Show generic error → Fallback to localStorage
  │
  └─ Network Error
      └─ Show connection error → Retry option
```

## Session Flow

```
User Logs In
  │
  ├─ Store user data in localStorage
  │
  ├─ Set timestamp
  │
  └─ On each page load:
      │
      ├─ Check if user exists
      │   └─ No → Redirect to /login
      │
      ├─ (Optional) Check token expiry
      │   └─ Expired → Refresh or logout
      │
      └─ Load user data
          └─ Display dashboard

User Logs Out
  │
  ├─ Clear localStorage
  │
  ├─ Clear any session data
  │
  └─ Redirect to /login
```
