# Authentication Flow Documentation

## Overview
This document describes the complete authentication and user flow for the Record application.

## Flow Diagram

```
Home (/) 
  ├─ User NOT logged in → Redirect to /signup
  └─ User logged in → Redirect to /dashboard

Signup (/signup)
  ├─ Validates email format (proper email structure)
  ├─ Validates password requirements:
  │   ├─ Minimum 6 characters
  │   ├─ At least one uppercase letter
  │   ├─ At least one lowercase letter
  │   └─ At least one number
  ├─ Checks for duplicate/existing email (via API)
  ├─ On success:
  │   ├─ Shows success message
  │   └─ Redirects to /login
  └─ On failure:
      ├─ Duplicate email → Shows error under email field
      └─ Other errors → Shows general error message

Login (/login)
  ├─ Validates email format
  ├─ Validates password (minimum 6 characters)
  ├─ On success:
  │   ├─ Stores user data in localStorage
  │   └─ Redirects to /dashboard
  └─ On failure:
      └─ Shows error message (invalid credentials)

Dashboard (/dashboard)
  ├─ Checks authentication:
  │   ├─ No user data → Redirect to /login
  │   └─ Has user data → Load dashboard
  ├─ Displays logo (SVG image)
  ├─ Loads user profile dynamically:
  │   ├─ First tries to fetch from API
  │   ├─ Falls back to localStorage if API fails
  │   └─ Uses user email as fallback for name
  ├─ Shows user details:
  │   ├─ Email (from logged in user)
  │   ├─ Name (dynamic based on user)
  │   └─ Other profile fields (editable)
  └─ Fully responsive design
```

## Pages and Features

### 1. Home Page (`/`)
**Purpose:** Entry point that routes users appropriately

**Features:**
- Checks if user is logged in
- Redirects to `/signup` if not logged in
- Redirects to `/dashboard` if already logged in

---

### 2. Signup Page (`/signup`)
**Purpose:** New user registration

**Validations:**
1. **Email Validation:**
   - Required field
   - Must be a valid email format (contains @ and domain)
   - Checks for duplicate/existing emails in database
   - Shows specific error if email already exists

2. **Password Validation:**
   - Required field
   - Minimum 6 characters
   - Must contain at least one uppercase letter (A-Z)
   - Must contain at least one lowercase letter (a-z)
   - Must contain at least one number (0-9)
   - Real-time validation feedback

**Flow:**
1. User enters email and password
2. Frontend validates input
3. API call to signup endpoint
4. If duplicate email → Shows error: "This email is already registered"
5. If successful → Shows success alert and redirects to `/login`
6. User data is stored in localStorage

**Error Handling:**
- Duplicate email: Error shown directly under email field
- Invalid credentials: General error message shown
- Network errors: Generic error message

---

### 3. Login Page (`/login`)
**Purpose:** Existing user authentication

**Validations:**
1. **Email Validation:**
   - Required field
   - Must be a valid email format

2. **Password Validation:**
   - Required field
   - Minimum 6 characters

**Features:**
- Remember me checkbox
- Forgot password link (UI only)
- Social login buttons (UI only - Google, Facebook, LinkedIn)

**Flow:**
1. User enters credentials
2. Frontend validates input
3. API call to login endpoint
4. If successful → Stores user data in localStorage
5. Redirects to `/dashboard`
6. If failed → Shows error message

---

### 4. Dashboard Page (`/dashboard`)
**Purpose:** User profile management and main application interface

**Authentication Check:**
- Checks localStorage for user data
- If no user data → Redirects to `/login`
- If user data exists → Loads dashboard

**Features:**

1. **Logo Integration:**
   - Custom SVG logo displayed in sidebar
   - Responsive design with proper sizing

2. **Dynamic User Data:**
   - Fetches user profile from API first
   - Falls back to localStorage if API fails
   - Uses logged-in user's email
   - Dynamically populates:
     - Name (from user data or email prefix)
     - Email (from logged-in user)
     - All profile fields

3. **Profile Sections:**
   - Basic Profile (Name, Email, DOB, Gender, Phone, About)
   - Social Media Links (LinkedIn, Website, Instagram, YouTube)
   - Avatar with user initials

4. **Responsive Design:**
   - Mobile: Hamburger menu, collapsible sidebar
   - Tablet: Optimized layout
   - Desktop: Full sidebar visible
   - Responsive form fields and cards
   - Mobile-friendly navigation

5. **User Actions:**
   - Edit profile information
   - Save changes (API or localStorage)
   - Logout (clears localStorage and redirects to login)
   - Access support modal

**Sidebar Navigation:**
- Dashboard (active)
- Profile
- Skill Repository
- Learnings
- Jobs (with submenu)
- Tools (with submenu)
- Support
- Feedback

---

## API Integration

### API Endpoints (lib/api.ts)

1. **Signup**
   ```typescript
   POST /api/auth/signup
   Body: { name, email, password }
   Response: User object
   Errors: Duplicate email, validation errors
   ```

2. **Login**
   ```typescript
   POST /api/auth/login
   Body: { email, password }
   Response: User object with token
   Errors: Invalid credentials
   ```

3. **Get User Profile**
   ```typescript
   GET /api/users/:userId
   Response: Full user profile data
   ```

4. **Update User Profile**
   ```typescript
   PUT /api/users/:userId
   Body: Profile data
   Response: Updated profile
   ```

---

## Data Storage

### localStorage Structure

1. **User Data:**
   ```json
   {
     "key": "user",
     "value": {
       "id": "user-id",
       "name": "User Name",
       "email": "user@example.com",
       "createdAt": "timestamp"
     }
   }
   ```

2. **Profile Data:**
   ```json
   {
     "key": "profile_{userId}",
     "value": {
       "name": "Full Name",
       "email": "user@example.com",
       "dob": "YYYY-MM-DD",
       "gender": "Male/Female/Other",
       "phone": "Phone Number",
       "about": "Bio text",
       "linkedin": "LinkedIn URL",
       "website": "Website URL",
       "instagram": "Instagram handle",
       "youtube": "YouTube channel"
     }
   }
   ```

---

## Security Considerations

1. **Password Requirements:**
   - Minimum 6 characters
   - Mix of uppercase, lowercase, and numbers
   - No plaintext storage (handled by backend)

2. **Session Management:**
   - User data stored in localStorage
   - Cleared on logout
   - Checked on every protected route

3. **Validation:**
   - Client-side validation for UX
   - Server-side validation for security
   - Email format validation
   - Duplicate email checking

---

## User Experience Features

1. **Real-time Validation:**
   - Errors shown on blur
   - Cleared as user types
   - Visual feedback (red borders, error messages)

2. **Loading States:**
   - "SIGNING UP..." / "LOGGING IN..." buttons
   - Disabled states during API calls
   - Loading spinner on initial dashboard load

3. **Error Messages:**
   - Specific validation messages
   - Duplicate email detection
   - User-friendly error descriptions

4. **Responsive Design:**
   - Mobile-first approach
   - Collapsible sidebar on mobile
   - Optimized forms for all screen sizes
   - Touch-friendly UI elements

---

## Testing Checklist

- [ ] Signup with invalid email format
- [ ] Signup with weak password (< 6 chars, no uppercase, etc.)
- [ ] Signup with duplicate email
- [ ] Successful signup flow
- [ ] Login with invalid credentials
- [ ] Login with valid credentials
- [ ] Dashboard loads user data correctly
- [ ] Dashboard shows logged-in user's email
- [ ] Profile save functionality
- [ ] Logout functionality
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Logo displays correctly

---

## Future Enhancements

1. Email verification
2. Forgot password functionality
3. Social login integration
4. Two-factor authentication
5. Profile picture upload
6. Real-time profile updates
7. Password strength indicator
8. Session timeout handling
