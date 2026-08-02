# NET-PET-AI Architecture Diagrams

This document expresses the same system in four views:

1. Investor-grade value architecture
2. Student-facing product experience
3. Strict engineering architecture with APIs and data flow
4. Gospel 444 operating model

## 1. Investor-Grade Diagram

```mermaid
flowchart TB
    subgraph Market[Broken Market]
        M1[Traditional English Centers]
        M2[Generic Language Apps]
        M3[High Cost]
        M4[Low Accountability]
        M5[No Memory Continuity]
    end

    subgraph Wedge[NET-PET-AI Wedge]
        W1[Free AI Assessment]
        W2[5-Page Phonics Report]
        W3[Teacher + AI Hybrid Offer]
        W4[Lower Cost Than Centers]
    end

    subgraph Engine[Core Product Engine]
        E1[OBI Magic Chat]
        E2[Real Class Session Logs]
        E3[Per-Student Durable Memory]
        E4[Accountability Network]
    end

    subgraph Moat[Unforkable Moat]
        O1[Real Classroom Data]
        O2[Vietnam-Specific Pronunciation Patterns]
        O3[Teacher Continuity Between Classes]
        O4[Behavioral Accountability Loops]
    end

    subgraph Outcomes[Business Outcomes]
        B1[Higher Student Compliance]
        B2[Faster Transformation]
        B3[High Retention]
        B4[Low Operating Cost]
        B5[Scalable Hybrid Delivery]
    end

    Market --> Wedge
    Wedge --> Engine
    Engine --> Moat
    Engine --> Outcomes
    Moat --> Outcomes
```

## 2. Student-Facing Product Diagram

```mermaid
flowchart LR
    A[Student Sees Free Assessment] --> B[AI Diagnostic on 42 Sounds]
    B --> C[Receives Progress Report]
    C --> D[Starts Human Class With Michael]
    D --> E[Gets OBI Daily Homework Companion]

    subgraph DailyLoop[1-Hour Lifestyle]
        E --> F[45 Minutes Listening]
        F --> G[OBI Tracks What Was Studied]
        G --> H[15 Minutes Speaking With OBI]
        H --> I[Instant Feedback and Encouragement]
        I --> J[Progress Stored in Memory]
    end

    J --> K[Student Comes Back to Next Class Prepared]
    K --> L[Confidence, Continuity, Better English]

    subgraph Support[Optional Accountability]
        S1[Parent Login]
        S2[Boss Login]
        S3[Partner Login]
    end

    J -. if enabled .-> Support
    Support -. reminders and visibility .-> K
```

## 3. Strict Engineering Architecture

```mermaid
flowchart TB
    U1[Student Browser]
    U2[Teacher Workflow]
    U3[Parent or Boss View]

    subgraph Client[Client Layer]
        C1[Public UI]
        C2[Magic Chat UI]
        C3[Chrome Extension]
        C4[Web Speech STT and TTS]
        C5[Gemini Nano Local Assist]
    end

    subgraph Edge[Cloudflare Worker Layer]
        W1[Worker Router]
        W2[OBI Prompt and Orchestration]
        W3[DeepSeek API Client]
        W4[Rate Limits and Guardrails]
        W5[Report Generator]
    end

    subgraph State[State Layer]
        D1[SessionDO]
        D2[ProfileDO]
        D3[PetDO]
        D4[LedgerDO]
    end

    subgraph CurrentAPI[Current Routes]
        R1[GET /api/health]
        R2[POST /api/onboarding]
        R3[POST /api/lesson]
        R4[POST /api/practice]
        R5[POST /api/feedback]
        R6[POST /api/netpet/checkin]
        R7[GET /api/netpet/state]
        R8[POST /api/classroom/session/start]
        R9[POST /api/classroom/event]
        R10[GET /api/classroom/session]
        R11[GET /api/classroom/report]
    end

    subgraph PlannedAPI[Planned Off-Day Engine Routes]
        P1[POST /api/session/log]
        P2[GET /api/session/latest]
        P3[POST /api/accountability/flag]
        P4[GET /api/digest/daily]
    end

    U1 --> C1
    U1 --> C2
    U1 --> C3
    U2 --> C1
    U3 --> C1

    C2 --> W1
    C3 --> C4
    C3 --> C5
    C1 --> W1

    W1 --> CurrentAPI
    W1 -. next lane .-> PlannedAPI
    W1 --> W2
    W2 --> W3
    W1 --> W4
    W1 --> W5

    W2 --> D1
    W2 --> D2
    W2 --> D3
    W2 --> D4
    CurrentAPI --> D1
    CurrentAPI --> D2
    CurrentAPI --> D3
    CurrentAPI --> D4
    PlannedAPI -. session continuity .-> D1
    PlannedAPI -. audit trail .-> D4

    D1 --> W2
    D2 --> W2
    D4 --> W4
```

## 4. Gospel 444 Operating Model

```mermaid
flowchart TB
    subgraph G1[Gospel 1 - Soul]
        G1A[Teach Real Students]
        G1B[Stop Learning Loss After Class]
        G1C[Build Accountability Into Learning]
    end

    subgraph G2[Gospel 2 - Problem]
        G2A[Apps Are Easy to Ignore]
        G2B[Students Forget After Class]
        G2C[Normal AI Loses Context]
    end

    subgraph G3[Gospel 3 - System]
        G3A[Real Class Happens]
        G3B[Session Log Captured]
        G3C[OBI Loads Memory]
        G3D[AI Continues Teaching]
    end

    subgraph G4[Gospel 4 - Network]
        G4A[Student Action]
        G4B[Accountability Partner Visibility]
        G4C[Teacher Oversight]
        G4D[Next Class Improvement]
    end

    G1 --> G2 --> G3 --> G4
    G4 --> G3
```

## Notes

- The engineering diagram separates current Worker routes from planned Off-Day Engine routes.
- The investor view emphasizes moat, scalability, and unit economics.
- The student view emphasizes felt experience rather than infrastructure.
- The Gospel 444 view keeps the system tied to Soul, Problem, System, and Network so the architecture does not drift into a generic tutor product.
