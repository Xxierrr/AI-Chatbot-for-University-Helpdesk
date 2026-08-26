# Architecture Documentation

## 1. High-Level System Architecture

```mermaid
graph TD
    Client[Web Browser] --> Frontend[React SPA]
    Frontend <-->|HTTP/REST| API[FastAPI Backend]
    
    subgraph Backend Application
        API --> Auth[Auth Service]
        API --> Chat[Chat Service]
        API --> Admin[Admin Service]
        
        Chat --> RAG[RAG Pipeline]
    end
    
    subgraph Data Layer
        Auth --> DB[(SQLite User DB)]
        Chat --> DB
        Admin --> DB
        RAG --> VDB[(ChromaDB)]
    end
    
    RAG <--> ExternalLLM[External LLM API]
```

## 2. Frontend Architecture (React)

```mermaid
graph TD
    App[App.jsx] --> Router[React Router]
    
    Router --> AuthLayout[Auth Layout]
    Router --> MainLayout[Main Layout]
    Router --> AdminLayout[Admin Layout]
    
    AuthLayout --> Login[Login Page]
    AuthLayout --> Register[Register Page]
    
    MainLayout --> Chat[Chat Interface]
    Chat --> Sidebar[History Sidebar]
    Chat --> MessageList[Message List]
    Chat --> Input[Chat Input]
    MessageList --> MsgBubble[Message Bubble]
    MsgBubble --> Citations[Citations]
    
    AdminLayout --> Dashboard[Admin Dashboard]
    AdminLayout --> DocManager[Document Manager]
    AdminLayout --> Insights[Insights/Unanswered]
```

## 3. Backend Architecture (FastAPI Modules)

```mermaid
graph TD
    Main[main.py] --> Routes[api/routes]
    
    Routes --> Auth[auth.py]
    Routes --> Chat[chat.py]
    Routes --> Admin[admin.py]
    
    Auth --> AuthSvc[services/auth_service.py]
    Chat --> ChatSvc[services/chat_service.py]
    Chat --> RAGSvc[services/rag_service.py]
    Admin --> AdminSvc[services/admin_service.py]
    
    AuthSvc --> Models[models/user.py]
    ChatSvc --> Models
    RAGSvc --> Embeddings[core/embeddings.py]
    AdminSvc --> VDBInt[core/vector_db.py]
```

## 4. RAG Pipeline Architecture

```mermaid
flowchart TD
    Q[User Question] --> R[Retrieval Engine]
    R -->|Embed Query| ST[Sentence Transformers]
    ST -->|Query Vector| CDB[(ChromaDB)]
    CDB -->|Top-K Chunks| R
    
    R --> P[Prompt Builder]
    P -->|Context + Query| LLM[LLM API]
    
    LLM --> Ans[Raw Answer]
    Ans --> Formatter[Response Formatter]
    Formatter -->|Add Citations| Final[Final Response]
```

## 5. Database Schema (ER Diagram)

```mermaid
erDiagram
    User ||--o{ Conversation : has
    Conversation ||--o{ Message : contains
    User {
        int id PK
        string email
        string password_hash
        string role "student/admin"
        datetime created_at
    }
    Conversation {
        int id PK
        int user_id FK
        string title
        datetime created_at
        datetime updated_at
    }
    Message {
        int id PK
        int conversation_id FK
        string role "user/assistant"
        text content
        json citations
        string feedback "up/down/none"
        datetime created_at
    }
    Document {
        int id PK
        string filename
        string file_type
        int file_size
        datetime uploaded_at
    }
```

## 6. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB
    
    User->>Frontend: Enter credentials
    Frontend->>API: POST /api/auth/login
    API->>DB: Query user by email
    DB-->>API: Return user record
    API->>API: Verify password hash
    API->>API: Generate JWT token
    API-->>Frontend: Return Token & User Info
    Frontend->>Frontend: Store Token (LocalStorage/Cookie)
    Frontend-->>User: Redirect to Chat/Dashboard
```

## 7. Chat Request/Response Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant API
    participant RAG
    participant Chroma
    participant LLM
    participant DB
    
    Frontend->>API: POST /api/chat (query, conv_id, token)
    API->>DB: Save user message
    API->>RAG: Process query
    RAG->>Chroma: Semantic search
    Chroma-->>RAG: Return context chunks
    RAG->>LLM: Generate response (Context + Query)
    LLM-->>RAG: Stream/Return response text
    RAG-->>API: Formatted response + citations
    API->>DB: Save assistant message
    API-->>Frontend: Return assistant response
```

## 8. Document Ingestion Flow

```mermaid
sequenceDiagram
    participant Admin
    participant API
    participant Parser
    participant Embedder
    participant Chroma
    participant DB
    
    Admin->>API: POST /api/admin/documents (File)
    API->>DB: Save document metadata
    API->>Parser: Extract text (PDF/DOCX/TXT)
    Parser->>Parser: Chunk text
    loop Over Chunks
        Parser->>Embedder: Generate vector
        Embedder-->>Parser: Vector array
        Parser->>Chroma: Insert (Vector, Metadata, Text)
    end
    API-->>Admin: Success message
```
