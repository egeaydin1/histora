# Histora Technical Architecture
## Deep Dive into System Components and Interactions

## 🏛️ High-Level Architecture

Histora follows a microservices-inspired architecture with a monolithic backend for simplicity and a modern frontend. The system is designed to be scalable, maintainable, and secure.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT ACCESS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   Web Browser       │  │   Mobile Browser    │  │   API Clients       │  │
│  │   (Next.js App)     │  │   (PWA)             │  │   (Third-party)     │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER / CDN                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND SERVICE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Next.js 14                                     │
│                            React 18 + TS                                   │
│                        Tailwind CSS + Heroicons                            │
│                           Firebase SDK                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                            FastAPI (Python)                                 │
│                      SQLAlchemy + AsyncPG (PostgreSQL)                      │
│                         Firebase Admin SDK                                  │
│                          Pydantic (Validation)                              │
│                          Structlog (Logging)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   DATABASE      │      │   AI SERVICES   │      │ AUTHENTICATION  │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│  PostgreSQL 15  │      │  OpenRouter     │      │   Firebase      │
│    (Primary)    │      │  OpenAI API     │      │   Auth System   │
│                 │      │  (Embeddings)   │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 🧩 Backend Architecture (FastAPI)

### Core Components

#### 1. Application Entry Point (`app/main.py`)
- FastAPI application factory
- Middleware configuration (CORS, TrustedHost, Request Timing)
- API router integration
- Lifespan events for startup/shutdown

#### 2. API Layer (`app/api/v1/`)
- Versioned API endpoints
- Router configuration and organization
- Endpoint-specific modules:
  - `auth.py` - Authentication and user management
  - `characters.py` - Character CRUD operations
  - `chat.py` - Chat session and message handling
  - `admin.py` - Administrative functions and monitoring
  - `usage.py` - Usage tracking and billing
  - `pricing.py` - Pricing plans and subscriptions
  - `health.py` - Health check endpoints

#### 3. Core Services (`app/core/`)
- `config.py` - Centralized configuration management using Pydantic Settings
- `database.py` - Database connection and session management
- `security.py` - Authentication utilities and password hashing

#### 4. Business Logic Services (`app/services/`)
- `ai_service.py` - AI model integration and chat processing
- `auth_service.py` - Authentication business logic
- `firebase_service.py` - Firebase integration layer
- `session_service.py` - Chat session management
- `token_service.py` - Token generation and validation
- `usage_service.py` - Usage tracking and billing calculations

#### 5. Data Models (`app/models/`)
- `database.py` - SQLAlchemy ORM models for all database entities
- Comprehensive schema with relationships and constraints

### Database Schema Design

#### User Management
```python
class User(Base):
    id = Column(UUID, primary_key=True)
    firebase_uid = Column(String, unique=True)
    email = Column(String, unique=True, nullable=False)
    display_name = Column(String)
    role = Column(String, default="user")
    credits = Column(Integer, default=100)
    # ... additional fields for user management
```

#### Character System
```python
class Character(Base):
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    system_prompt = Column(Text)
    personality_traits = Column(JSON)
    # ... additional character attributes
```

#### Chat Functionality
```python
class ChatSession(Base):
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    character_id = Column(String, ForeignKey("characters.id"))
    # ... session metadata

class ChatMessage(Base):
    id = Column(UUID, primary_key=True)
    session_id = Column(UUID, ForeignKey("chat_sessions.id"))
    role = Column(String)  # "user", "assistant", "system"
    content = Column(Text)
    # ... message metadata
```

#### Billing and Usage
```python
class UserUsage(Base):
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    credits_used = Column(Integer, default=0)
    # ... usage tracking

class PricingPlan(Base):
    id = Column(UUID, primary_key=True)
    name = Column(String, nullable=False)
    price_monthly = Column(Integer)
    monthly_token_limit = Column(Integer)
    # ... plan features

class CreditPackage(Base):
    id = Column(UUID, primary_key=True)
    credit_amount = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    # ... package details
```

### API Endpoint Structure

#### Authentication Endpoints (`/api/v1/auth/`)
- `POST /login` - User authentication
- `POST /register` - User registration
- `POST /refresh` - Token refresh
- `GET /me` - Current user information
- `POST /logout` - User logout

#### Character Endpoints (`/api/v1/characters/`)
- `GET /` - List all characters
- `GET /{character_id}` - Get character details
- `POST /` - Create new character (admin)
- `PUT /{character_id}` - Update character (admin)
- `DELETE /{character_id}` - Delete character (admin)

#### Chat Endpoints (`/api/v1/chat/`)
- `POST /sessions` - Create new chat session
- `GET /sessions/{session_id}` - Get session details
- `POST /sessions/{session_id}/messages` - Send message
- `GET /sessions/{session_id}/messages` - Get session messages
- `DELETE /sessions/{session_id}` - Delete session

#### Admin Endpoints (`/api/v1/admin/`)
- `GET /stats` - System statistics
- `GET /users` - List users
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user
- `GET /characters` - List all characters
- `POST /characters/publish` - Publish characters

#### Usage Endpoints (`/api/v1/usage/`)
- `GET /quota` - User quota information
- `GET /stats` - Usage statistics
- `GET /history` - Usage history

#### Pricing Endpoints (`/api/v1/pricing/`)
- `GET /plans` - Available pricing plans
- `GET /packages` - Credit packages
- `POST /subscribe` - Subscribe to plan
- `POST /purchase` - Purchase credits

## 🖥️ Frontend Architecture (Next.js 14)

### Core Components

#### 1. Page Structure (`src/app/`)
- App Router implementation with server components
- Route groups for logical organization
- Dynamic routing for character and session pages

#### 2. Component Library (`src/components/`)
- Reusable UI components
- Atomic design principles
- TypeScript interfaces for props

#### 3. State Management (`src/contexts/`)
- React Context for authentication state
- Global state management patterns
- Custom hooks for data fetching

#### 4. API Integration (`src/lib/`)
- Axios-based API client
- Request/response interceptors
- Error handling and retry logic

### Key Pages and Features

#### Homepage (`/`)
- Character showcase
- Category browsing
- Featured characters display
- Call-to-action for authentication

#### Chat Interface (`/chat/[characterId]`)
- Real-time message streaming
- Session management
- Document integration UI
- Character personality display

#### User Dashboard (`/dashboard`)
- Usage statistics
- Session history
- Credit balance
- Subscription management

#### Admin Panel (`/admin/*`)
- System monitoring dashboard
- User management
- Character management
- Usage analytics
- System configuration

### Authentication Flow

1. **Firebase Authentication**
   - Email/password or social login
   - Token management
   - Session persistence

2. **Backend Token Exchange**
   - Firebase ID token sent to backend
   - Token validation with Firebase Admin SDK
   - JWT generation for API access

3. **Session Management**
   - Token refresh handling
   - Logout functionality
   - Role-based access control

## 🤖 AI Integration Architecture

### Core AI Services

#### 1. Chat Service (`app/services/ai_service.py`)
- Model selection and fallback strategies
- Conversation context management
- Response streaming implementation
- Error handling and retry logic

#### 2. RAG System
- Document processing pipeline
- Text chunking strategies
- Embedding generation with OpenAI
- Vector similarity search

#### 3. Model Integration
- OpenRouter API for chat models
- Multiple model support (Gemini, DeepSeek, etc.)
- Model parameter configuration
- Cost tracking and optimization

### Document Processing Pipeline

1. **File Upload**
   - Multi-format support (PDF, DOCX, TXT, MD)
   - Size validation and security checks
   - Temporary storage

2. **Text Extraction**
   - Format-specific extraction libraries
   - Text cleaning and normalization
   - Metadata extraction

3. **Chunking Strategy**
   - Semantic chunking
   - Overlap management
   - Chunk metadata

4. **Embedding Generation**
   - OpenAI Embedding API integration
   - Batch processing for efficiency
   - Vector storage

5. **Indexing**
   - Vector database storage
   - Metadata indexing
   - Search optimization

## 🔌 Integration Architecture

### External Services

#### 1. Firebase Authentication
- User authentication and management
- Token validation
- Security rules

#### 2. OpenRouter AI Models
- Access to multiple AI models
- Rate limiting and quotas
- Cost management

#### 3. OpenAI Embedding API
- Document embedding generation
- Vector similarity search
- Cost optimization

#### 4. PostgreSQL Database
- Primary data storage
- ACID compliance
- Connection pooling

### Internal Service Communication

#### 1. API Layer Communication
- RESTful API design
- JSON data exchange
- Error handling

#### 2. Database Operations
- SQLAlchemy ORM for data access
- Async database operations
- Transaction management

#### 3. Service Layer Interactions
- Dependency injection patterns
- Business logic separation
- Error propagation

## 🛡️ Security Architecture

### Authentication Security
- Firebase Auth for user authentication
- JWT tokens for API access
- Token expiration and refresh
- Role-based access control

### Data Security
- HTTPS encryption for all communications
- Database connection encryption
- Input validation and sanitization
- SQL injection prevention

### Application Security
- CORS policy configuration
- Rate limiting
- Input size restrictions
- File type validation

### Infrastructure Security
- Environment variable management
- Secret storage best practices
- Container security
- Network isolation

## 📊 Monitoring and Logging

### Application Monitoring
- Structured logging with structlog
- Performance metrics collection
- Error tracking and alerting
- Health check endpoints

### Database Monitoring
- Query performance tracking
- Connection pool monitoring
- Database health checks
- Slow query detection

### User Activity Tracking
- Session and message tracking
- Usage statistics collection
- Feature adoption metrics
- Error rate monitoring

### Performance Monitoring
- Response time tracking
- Throughput monitoring
- Resource utilization
- Bottleneck identification

## 🚀 Deployment Architecture

### Development Environment
- Docker Compose for service orchestration
- PostgreSQL container
- Local development scripts
- Hot reloading for development

### Production Deployment
- Railway for backend deployment
- Vercel for frontend deployment
- Environment-specific configuration
- Automated deployment pipelines

### Environment Configuration
- Environment variables for configuration
- Multi-environment support (dev, staging, prod)
- Secret management
- Configuration validation

### Scaling Strategy
- Horizontal scaling for web services
- Database connection pooling
- Load balancing
- Caching strategies

## 🧪 Testing Architecture

### Test Structure
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for user flows
- Performance tests for critical paths

### Testing Tools
- Pytest for Python backend tests
- Jest for frontend tests
- Postman for API testing
- Load testing tools

### Test Data Management
- Database seeding for tests
- Mock services for external APIs
- Test environment isolation
- Data cleanup strategies

## 📈 Performance Optimization

### Backend Optimization
- Asynchronous database operations
- Connection pooling
- Query optimization
- Caching strategies

### Frontend Optimization
- Code splitting
- Image optimization
- Bundle size reduction
- Performance monitoring

### Database Optimization
- Indexing strategies
- Query optimization
- Connection management
- Data partitioning

### AI Service Optimization
- Model selection strategies
- Response caching
- Batch processing
- Cost optimization

## 🔄 Data Flow Patterns

### User Authentication Flow
```
User → Firebase Auth → Frontend Token → Backend Validation → JWT Generation → API Access
```

### Chat Conversation Flow
```
User Message → Frontend → Backend Processing → AI Model → Response Streaming → Frontend Display
```

### Document Integration Flow
```
File Upload → Text Extraction → Chunking → Embedding → Vector Storage → RAG Retrieval → Chat Context
```

### Usage Tracking Flow
```
API Request → Usage Service → Database Storage → Analytics Processing → Reporting
```

## 🎯 Business Logic Components

### Credit System
- Token-based billing
- Credit package management
- Usage tracking and reporting
- Subscription handling

### Character Management
- Character creation and editing
- Personality trait system
- Category organization
- Publishing workflow

### Session Management
- Chat session lifecycle
- Message history
- Context management
- Session cleanup

### Usage Analytics
- Token consumption tracking
- User behavior analysis
- Performance metrics
- Revenue reporting

## 📚 API Design Principles

### RESTful Design
- Resource-based URLs
- Standard HTTP methods
- Statelessness
- Cacheable responses

### Error Handling
- Consistent error format
- Appropriate HTTP status codes
- Detailed error messages
- Error logging

### Data Validation
- Pydantic models for request validation
- Database constraints
- Business logic validation
- Error response formatting

### Documentation
- Automatic OpenAPI generation
- Example requests and responses
- Authentication requirements
- Rate limiting information

## 🛠️ Development Tools and Practices

### Code Quality
- Type checking with TypeScript and Pydantic
- Linting with ESLint and Flake8
- Formatting with Prettier and Black
- Code review processes

### Version Control
- Git for version control
- Feature branching workflow
- Pull request reviews
- Continuous integration

### Deployment
- Automated testing
- Deployment scripts
- Environment management
- Rollback strategies

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Database sharding strategies
- Load balancing
- CDN integration

### Performance Scaling
- Caching layers
- Database optimization
- Asynchronous processing
- Resource management

### Data Scaling
- Database partitioning
- Archive strategies
- Query optimization
- Index management

## 🆘 Troubleshooting and Debugging

### Common Issues
- Database connection problems
- Authentication failures
- AI model timeouts
- Performance bottlenecks

### Debugging Tools
- Structured logging
- Health check endpoints
- Performance profiling
- Error tracking systems

### Monitoring
- Application performance monitoring
- Database performance
- API response times
- Error rates and patterns

## 🤝 Contributing Guidelines

### Code Standards
- Follow established patterns
- Maintain consistent styling
- Write comprehensive tests
- Document complex logic

### Development Process
- Feature branching
- Pull request reviews
- Automated testing
- Continuous integration

### Documentation
- Inline code comments
- API documentation
- Architecture diagrams
- User guides

This comprehensive technical architecture document provides a detailed overview of how Histora's components work together to create a robust, scalable, and maintainable AI chat platform for historical figures.