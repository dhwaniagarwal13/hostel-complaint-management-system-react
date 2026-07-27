# Data Flow Diagram (DFD)

This diagram visualizes how information moves through the **Hostel Complaint Management System**, specifically focusing on the lifecycle of a grievance.

```mermaid
sequenceDiagram
    autonumber
    participant S as Student
    participant DB as Supabase Database
    participant W as Warden
    participant MS as Maintenance Staff
    participant SV as Supervisor

    Note over S, DB: 1. Complaint Submission
    S->>DB: INSERT into 'complaints' (status: pending)
    DB-->>W: Notify: New Unassigned Complaint
    
    Note over W, DB: 2. Assignment Phase
    W->>DB: UPDATE 'complaints' (set assigned_to, status: in_progress)
    DB-->>MS: Notify: New Task in Queue
    
    Note over MS, DB: 3. Resolution Phase
    MS->>DB: UPDATE 'complaints' (set status: resolved, resolved_at: now)
    DB-->>S: Notify: Issue Fixed
    
    Note over S, DB: 4. Feedback Phase
    S->>DB: INSERT into 'feedback' (rating, 1-5)
    DB-->>W: Log: Audit Record Updated
    
    Note over SV, DB: 5. Administrative Oversight
    SV->>DB: SELECT * from 'users', 'complaints', 'feedback'
    DB-->>SV: Return: Cross-Hostel Analytics
```

## Data Lifecycle Summary

| Phase | Table Involved | Actor | Key Actions |
| :--- | :--- | :--- | :--- |
| **Submission** | `complaints` | Student | Uploads description, category, and photos. Sets `severity`. |
| **Assignment** | `complaints` | Warden | Reviews unassigned pool. Maps task to a `specialist`. |
| **Resolution** | `complaints` | Staff | Marks as `resolved`. Uploads completion evidence. |
| **Feedback** | `feedback` | Student | Rates resolution speed and quality (1-5 stars). |
| **Audit** | `users`, `complaints` | Supervisor | Monitors total user counts and system efficiency across hostels. |

## Data Security Layer
*   **Row-Level Security (RLS)**: Ensures students only see their own data, staff only see assigned tasks, and wardens/supervisors have broader administrative visibility.
*   **Encrypted Auth**: Handled by Supabase Auth (JWT), protecting user credentials.
