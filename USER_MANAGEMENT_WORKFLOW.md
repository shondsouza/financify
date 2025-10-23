# User Management Workflow Visualization

## 🔄 Complete User Lifecycle

```mermaid
graph TB
    A[Admin Login] --> B[Navigate to User Management]
    B --> C[Click Add Team Leader]
    C --> D[Fill Form]
    D --> E{Auto-generate Password?}
    E -->|Yes| F[Click Generate Button]
    E -->|No| G[Enter Custom Password]
    F --> H[Submit Form]
    G --> H
    H --> I{Validation}
    I -->|Failed| J[Show Errors]
    J --> D
    I -->|Success| K[Create User via API]
    K --> L{API Response}
    L -->|Error| M[Show Error Message]
    M --> D
    L -->|Success| N[Display Credentials Dialog]
    N --> O[Copy Credentials]
    O --> P[Save Credentials Securely]
    P --> Q[User Created Successfully]
```

## 👤 Team Leader Login Flow

```mermaid
graph TB
    A[Team Leader] --> B[Receives Credentials from Admin]
    B --> C[Navigate to Login Page]
    C --> D[Enter Email & Password]
    D --> E[Submit Login]
    E --> F{User Exists?}
    F -->|No| G[Show Error: Invalid Credentials]
    F -->|Yes| H{Account Active?}
    H -->|No| I[Show Error: Account Deactivated]
    H -->|Yes| J{Password Correct?}
    J -->|No| K[Show Error: Invalid Password]
    J -->|Yes| L[Login Successful]
    L --> M[Store Session]
    M --> N[Redirect to Team Leader Dashboard]
```

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant TL as Team Leader
    participant UI as Login UI
    participant API as Auth System
    participant DB as Supabase DB
    
    TL->>UI: Enter Email & Password
    UI->>API: Submit Credentials
    API->>DB: Query User by Email
    DB-->>API: User Data
    API->>API: Check if User Exists
    API->>API: Check if Account Active
    API->>API: Validate Password
    alt Authentication Success
        API-->>UI: User Object
        UI->>UI: Store in localStorage
        UI-->>TL: Redirect to Dashboard
    else Authentication Failed
        API-->>UI: Error Message
        UI-->>TL: Show Error
    end
```

## 👥 User Management Operations

```mermaid
graph LR
    A[Admin] --> B{Action}
    B -->|Create| C[Add Team Leader]
    B -->|Search| D[Search Users]
    B -->|Filter| E[Filter by Status]
    B -->|View| F[View Details]
    B -->|Deactivate| G[Disable Access]
    B -->|Reactivate| H[Enable Access]
    
    C --> I[User Created]
    D --> J[Filtered List]
    E --> J
    F --> K[User Info]
    G --> L[User Inactive]
    H --> M[User Active]
```

## 📊 User States

```mermaid
stateDiagram-v2
    [*] --> Created: Admin creates user
    Created --> Active: Auto-activated
    Active --> Inactive: Admin deactivates
    Inactive --> Active: Admin reactivates
    Active --> LoggedIn: User logs in
    LoggedIn --> Active: User logs out
    Inactive --> [*]: Cannot login
```

## 🔄 API Request Flow

```mermaid
sequenceDiagram
    participant UI as User Management UI
    participant API as Next.js API
    participant DB as Supabase
    participant User as Team Leader
    
    Note over UI,DB: Create User Flow
    UI->>API: POST /api/users
    API->>API: Validate Data
    API->>DB: Check Email Exists
    DB-->>API: Email Check Result
    alt Email Exists
        API-->>UI: Error: Duplicate Email
    else Email Available
        API->>DB: INSERT User
        DB-->>API: User Created
        API-->>UI: User Data + Password
        UI->>UI: Show Credentials Dialog
        UI->>User: Display Credentials
    end
    
    Note over UI,DB: Login Flow
    User->>UI: Enter Credentials
    UI->>API: Validate via getUserByEmail
    API->>DB: SELECT User
    DB-->>API: User Data
    API->>API: Verify Password & Status
    API-->>UI: Auth Result
    alt Success
        UI->>User: Access Dashboard
    else Failure
        UI->>User: Show Error
    end
```

## 🎯 Feature Access Matrix

```
┌─────────────────────┬───────────┬──────────────┐
│ Feature             │   Admin   │ Team Leader  │
├─────────────────────┼───────────┼──────────────┤
│ Create Events       │     ✅    │      ❌      │
│ View Events         │     ✅    │      ✅      │
│ Respond to Events   │     ❌    │      ✅      │
│ Assign Staff        │     ✅    │      ❌      │
│ Manage Users        │     ✅    │      ❌      │
│ Create Team Leaders │     ✅    │      ❌      │
│ View Assignments    │     ✅    │      ✅      │
│ Track Time          │     ✅    │      ❌      │
│ View Own Earnings   │     ❌    │      ✅      │
│ Generate Reports    │     ✅    │      ❌      │
│ Access Chat         │     ✅    │      ✅      │
└─────────────────────┴───────────┴──────────────┘
```

## 🔒 Security Layers

```mermaid
graph TD
    A[User Request] --> B{Email Validation}
    B -->|Invalid| C[Reject: Invalid Email]
    B -->|Valid| D{Duplicate Check}
    D -->|Exists| E[Reject: Email Exists]
    D -->|New| F{Password Validation}
    F -->|Weak| G[Reject: Weak Password]
    F -->|Strong| H{Role Check}
    H -->|Invalid| I[Reject: Invalid Role]
    H -->|Valid| J[Create User]
    J --> K{Active Status}
    K -->|Inactive| L[Reject: Account Disabled]
    K -->|Active| M[Grant Access]
    M --> N[Dashboard Access]
```

## 📱 User Interface Flow

```mermaid
graph TB
    subgraph "Admin Dashboard"
        A1[Overview Tab]
        A2[Events Tab]
        A3[Assignments Tab]
        A4[User Management Tab]
        A5[Time Tracking Tab]
        A6[Chat Tab]
    end
    
    subgraph "User Management Tab"
        B1[Stats Cards]
        B2[Search Bar]
        B3[Filter Buttons]
        B4[User List Table]
        B5[Add Team Leader Button]
    end
    
    subgraph "Create User Dialog"
        C1[Name Field]
        C2[Email Field]
        C3[Phone Field]
        C4[Password Field]
        C5[Generate Button]
        C6[Submit Button]
    end
    
    subgraph "Credentials Dialog"
        D1[Account Details]
        D2[Login Credentials]
        D3[Copy Buttons]
        D4[Security Warning]
        D5[Done Button]
    end
    
    A4 --> B1
    A4 --> B2
    A4 --> B3
    A4 --> B4
    A4 --> B5
    B5 --> C1
    B5 --> C2
    B5 --> C3
    B5 --> C4
    C4 --> C5
    C6 --> D1
    C6 --> D2
    D2 --> D3
    D5 --> B4
```

## 🎬 User Journey Map

### Admin Creating Team Leader

```
1. LOGIN
   ↓
2. Navigate to User Management
   ↓
3. Click "Add Team Leader"
   ↓
4. Fill Form (Name, Email, Phone)
   ↓
5. Generate Password (or custom)
   ↓
6. Submit Form
   ↓
7. View Success Dialog
   ↓
8. Copy Credentials
   ↓
9. Share with Team Leader
   ↓
10. COMPLETE
```

### Team Leader First Login

```
1. Receive Credentials from Admin
   ↓
2. Navigate to Platform
   ↓
3. Enter Email & Password
   ↓
4. Click Sign In
   ↓
5. Redirect to Dashboard
   ↓
6. Explore Features
   ↓
7. Respond to Events
   ↓
8. Track Assignments
   ↓
9. View Earnings
   ↓
10. ACTIVE USER
```

## 💾 Data Flow

```mermaid
graph LR
    A[Admin Form] -->|HTTP POST| B[API Route]
    B -->|Validate| C{Valid?}
    C -->|No| D[Return Error]
    C -->|Yes| E[Check Duplicate]
    E -->|Exists| D
    E -->|New| F[Create in DB]
    F -->|Success| G[Return User + Password]
    G -->|Display| H[Credentials Dialog]
    H -->|Copy| I[Clipboard]
    I -->|Share| J[Team Leader]
    J -->|Login| K[Auth Check]
    K -->|Success| L[Dashboard Access]
```

## 🔄 State Management

```
Component State (user-management.jsx):
├── teamLeaders: []           // List of all team leaders
├── loading: false            // Loading state
├── showCreateForm: false     // Dialog visibility
├── showCredentials: {}       // Credential visibility per user
├── selectedUser: null        // Currently selected user
├── showDeleteDialog: false   // Deactivate confirmation
├── searchTerm: ''            // Search query
├── filterStatus: 'all'       // Filter selection
├── formData: {...}           // Form inputs
├── formErrors: {}            // Validation errors
├── submitting: false         // Submit state
└── createdUser: null         // Newly created user with password
```

## 📈 Success Metrics

```
Key Performance Indicators:

┌─────────────────────────┬─────────┬──────────┐
│ Metric                  │ Target  │  Status  │
├─────────────────────────┼─────────┼──────────┤
│ User Creation Time      │  < 30s  │    ✅    │
│ Login Success Rate      │  > 95%  │    ✅    │
│ Search Response Time    │  < 1s   │    ✅    │
│ Form Validation         │  100%   │    ✅    │
│ Duplicate Prevention    │  100%   │    ✅    │
│ Credential Copy Success │  > 99%  │    ✅    │
└─────────────────────────┴─────────┴──────────┘
```

---

**Note**: These diagrams provide a visual representation of the user management workflow. For implementation details, refer to the code files and documentation.
