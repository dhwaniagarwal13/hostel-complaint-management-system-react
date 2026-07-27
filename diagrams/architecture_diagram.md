# System Architecture Diagram

This diagram illustrates the high-level architecture of the **Hostel Complaint Management System**, showing the interaction between the frontend portals, the backend service layer, and the persistence layer.

```mermaid
graph TB
    subgraph Client_Layer ["Client Layer (React / Vite)"]
        direction TB
        SP[Student Portal]
        WP[Warden Portal]
        MSP[Maintenance Staff Portal]
        SVP[Supervisor Portal]
    end

    subgraph Service_Layer ["Cloud Infrastructure (Render & Supabase)"]
        direction LR
        WS[Render - Static Site Hosting]
        Auth[Supabase Auth]
        DB[(Supabase PostgreSQL)]
        Storage[Supabase Storage - Images]
    end

    %% Connections
    SP <--> WS
    WP <--> WS
    MSP <--> WS
    SVP <--> WS

    WS <--> Auth
    WS <--> DB
    WS <--> Storage

    subgraph Database_Schema ["Database Tables"]
        direction LR
        U[users table]
        C[complaints table]
        F[feedback table]
        SC[supervisor_credentials]
    end

    DB --- U
    DB --- C
    DB --- F
    DB --- SC

    classDef portal fill:#f9f,stroke:#333,stroke-width:2px;
    classDef service fill:#bbf,stroke:#333,stroke-width:2px;
    classDef database fill:#dfd,stroke:#333,stroke-width:2px;
    
    class SP,WP,MSP,SVP portal;
    class WS,Auth,DB,Storage service;
    class U,C,F,SC database;
```

## Component Breakdown

### 1. Client Layer (Vite + React)
*   **Student Portal**: Handles registration, complaint submission, tracking, and feedback.
*   **Warden Portal**: Dashboard for managing complaints, assigning staff, and viewing resident lists.
*   **Staff Portal**: Queue management for assigned tasks and resolution reporting.
*   **Supervisor Portal**: High-level administrative oversight across all hostels.

### 2. Service Layer (Supabase)
*   **Authentication**: Handles secure login for all four roles.
*   **PostgreSQL Database**: Stores all relational data (users, complaints, feedback).
*   **Storage Buckets**: Stores visual evidence (photos) submitted by students and staff.

### 3. Hosting Layer (Render)
*   **Static Site Hosting**: Serves the compiled React application over a global CDN.
*   **Environment Variables**: Securely stores the Supabase API keys (`VITE_SUPABASE_URL`, etc.).
