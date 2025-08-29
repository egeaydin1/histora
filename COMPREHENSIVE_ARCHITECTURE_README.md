# Histora - AI Historical Figures Chat Platform
## Complete Architecture Documentation

Histora is an AI-powered platform that enables users to engage in realistic conversations with historical figures including philosophers, scientists, artists, and leaders. This document provides a comprehensive overview of the system architecture, components, and how they interact.

## 🏗️ System Architecture Overview

Histora follows a modern full-stack architecture with a clear separation between frontend and backend services:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   Web Browser       │  │   Mobile App        │  │   Desktop App       │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                        Load Balancer / CDN                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   Next.js 14        │  │   FastAPI           │  │   PostgreSQL        │  │
│  │   (Frontend)        │  │   (Backend)         │  │   (Database)        │  │
│  │   - React 18        │  │   - Python 3.11     │  │   - Users           │  │
│  │   - TypeScript      │  │   - REST API        │  │   - Characters      │  │
│  │   - Tailwind CSS    │  │   - JWT Auth        │  │   - Sessions        │  │
│  │   - Firebase SDK    │  │   - Firebase Admin  │  │   - Messages        │  │
│  └─────────────────────┘  │   - SQLAlchemy      │  │   - Usage Stats     │  │
│                           │   - AsyncPG         │  │   - Pricing Plans   │  │
│                           └─────────────────────┘  │   - Credit Packages │  │
│                                                    │   - Subscriptions   │  │
│                                                    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INTEGRATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   Firebase Auth     │  │   OpenRouter AI     │  │   OpenAI Embedding  │  │
│  │   (Authentication)  │  │   (Chat Models)     │  │   (RAG System)      │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🧱 Core Components

### 1. Frontend (Next.js 14 with App Router)

**Technology Stack:**
- Next.js 14 with App Router for server-side rendering and routing
- React 18 with TypeScript for component development
- Tailwind CSS for styling
- Firebase SDK for authentication
- Axios for API communication
- Heroicons for UI icons

**Key Features:**
- Responsive design that works on desktop and mobile
- Real-time chat interface with message streaming
- User authentication and session management
- Character selection and browsing
- Admin dashboard for system management
- Multi-language support (Turkish and English)

**Directory Structure:**
```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── chat/         # Chat interface pages
│   │   ├── login/        # Authentication pages
│   │   └── ...           # Other pages
│   ├── components/       # Reusable React components
│   ├── contexts/         # React context providers (AuthContext)
│   ├── lib/              # Utility functions and API client
│   ├── types/            # TypeScript interfaces and types
│   └── utils/            # Helper functions
├── public/               # Static assets (images, avatars)
└── package.json          # Frontend dependencies
```

**Authentication Flow:**
1. User authenticates with Firebase
2. Frontend receives Firebase ID token
3. Token is sent to backend for verification
4. Backend validates token and creates session
5. JWT token is returned to frontend for API access

### 2. Backend (FastAPI with Python 3.11)

**Technology Stack:**
- FastAPI for REST API development
- Python 3.11 for backend logic
- SQLAlchemy with AsyncPG for database operations
- Firebase Admin SDK for authentication verification
- Pydantic for data validation
- Uvicorn for ASGI server

**Key Features:**
- RESTful API with automatic OpenAPI documentation
- JWT-based authentication and authorization
- Real-time chat with historical figures
- RAG (Retrieval-Augmented Generation) system for document integration
- User management and billing system
- Admin panel for system monitoring

**Directory Structure:**
```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   └── v1/
│   │       ├── endpoints/ # Individual endpoint handlers
│   │       └── router.py # API router configuration
│   ├── core/             # Core configuration and utilities
│   ├── models/           # Database models
│   ├── services/         # Business logic services
│   └── main.py           # FastAPI application entry point
├── database/             # Database initialization scripts
├── uploads/              # User uploaded files
└── requirements.txt      # Python dependencies
```

**API Endpoints:**
- `/api/v1/auth/` - Authentication endpoints
- `/api/v1/characters/` - Character management
- `/api/v1/chat/` - Chat functionality
- `/api/v1/admin/` - Admin dashboard endpoints
- `/api/v1/usage/` - Usage tracking and billing
- `/api/v1/pricing/` - Pricing and subscription management
- `/api/v1/health/` - Health check endpoints

### 3. Database (PostgreSQL)

**Technology Stack:**
- PostgreSQL 15 for relational data storage
- Docker for containerized deployment
- SQLAlchemy ORM for database operations
- AsyncPG for asynchronous database connections

**Database Schema:**
The system uses a comprehensive database schema with the following key tables:

1. **Users Table**
   - Stores user authentication information
   - Tracks user roles and permissions
   - Manages credit balances and subscription status

2. **Characters Table**
   - Stores historical figure information
   - Maintains character personalities and traits
   - Tracks publishing status and categories

3. **Chat Sessions Table**
   - Manages conversation sessions between users and characters
   - Tracks session metadata and statistics

4. **Chat Messages Table**
   - Stores individual messages in conversations
   - Maintains message context and metadata

5. **User Usage Table**
   - Tracks token usage for billing purposes
   - Monitors AI model usage and costs

6. **Pricing Plans Table**
   - Manages subscription pricing options
   - Defines plan features and limitations

7. **Credit Packages Table**
   - Handles credit purchase options
   - Manages promotional packages

### 4. AI Integration Layer

**Technology Stack:**
- OpenRouter for accessing various AI models
- OpenAI Embedding API for document processing
- Custom RAG (Retrieval-Augmented Generation) implementation

**Key Components:**

1. **Chat Service**
   - Integrates with OpenRouter to access AI models
   - Implements conversation context management
   - Handles different character personalities

2. **RAG System**
   - Processes user-uploaded documents
   - Creates embeddings using OpenAI API
   - Retrieves relevant context for conversations

3. **Document Processing**
   - Supports PDF, DOCX, TXT, and MD file formats
   - Implements chunking strategies for large documents
   - Maintains document metadata and relationships

## 🔄 Data Flow Architecture

### User Authentication Flow
1. User authenticates with Firebase on frontend
2. Frontend sends Firebase ID token to backend
3. Backend validates token with Firebase Admin SDK
4. Backend creates JWT session token
5. Frontend uses JWT for subsequent API requests

### Chat Conversation Flow
1. User selects a historical character
2. Frontend requests new chat session from backend
3. Backend creates session and returns session ID
4. User sends message to backend
5. Backend retrieves character context and personality
6. Backend processes message with AI model via OpenRouter
7. Backend stores conversation in database
8. Backend streams response back to frontend

### Document Integration Flow
1. User uploads document through frontend
2. Frontend sends file to backend
3. Backend processes document and extracts text
4. Backend creates chunks and generates embeddings
5. Backend stores document metadata and embeddings
6. During chat, RAG system retrieves relevant document chunks
7. Chunks are provided as context to AI model

## 🔐 Security Architecture

### Authentication
- Firebase Authentication for user registration and login
- JWT tokens for API authentication
- Role-based access control (user, admin)

### Data Protection
- HTTPS encryption for all communications
- Database connection encryption
- Environment variable management for secrets
- Input validation and sanitization

### Authorization
- API endpoints protected by authentication middleware
- Role-based permissions for admin functions
- Rate limiting to prevent abuse

## 📊 Monitoring and Logging

### Application Monitoring
- Structured logging with structlog
- Health check endpoints
- Performance metrics tracking
- Error reporting and alerting

### Database Monitoring
- Connection pooling with SQLAlchemy
- Query performance optimization
- Database health checks

### User Activity Tracking
- Usage statistics collection
- Session and message tracking
- Credit consumption monitoring

## 🚀 Deployment Architecture

### Development Environment
- Docker Compose for local development
- PostgreSQL container for database
- Automated setup scripts
- Hot reloading for development

### Production Deployment
- Backend deployed on Railway
- Frontend deployed on Vercel
- PostgreSQL database on Railway
- Firebase for authentication
- Environment-specific configuration

### CI/CD Pipeline
- GitHub for version control
- Automated testing
- Deployment scripts
- Environment management

## 🛠️ Development Workflow

### Local Development Setup
1. Clone repository
2. Configure environment variables
3. Run `./start.sh` to start all services
4. Access application at http://localhost:3000

### Code Structure Guidelines
- Clear separation of concerns
- Consistent naming conventions
- Comprehensive error handling
- Extensive documentation

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance testing for chat functionality

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Database connection pooling
- Load balancing support
- Caching strategies

### Performance Optimization
- Asynchronous database operations
- Efficient query patterns
- Response streaming for chat
- Database indexing

### Resource Management
- Memory-efficient processing
- Connection pooling
- Background task processing
- Resource cleanup

## 🎯 Business Logic Components

### Credit System
- Token-based billing model
- Credit packages for purchase
- Usage tracking and reporting
- Subscription plans

### Character Management
- Character creation and editing
- Personality trait system
- Category organization
- Publishing workflow

### Usage Analytics
- Token consumption tracking
- User behavior analysis
- Performance metrics
- Revenue reporting

## 🧪 Testing Architecture

### Test Types
- Unit tests for individual functions
- Integration tests for API endpoints
- End-to-end tests for user flows
- Performance tests for chat responses

### Testing Tools
- Pytest for Python backend tests
- Jest for frontend tests
- Postman for API testing
- Load testing tools

### Test Data Management
- Seeded test data
- Mock services for external APIs
- Database fixtures
- Test environment isolation

## 📚 API Documentation

The FastAPI backend automatically generates comprehensive API documentation available at:
- Swagger UI: `/docs`
- ReDoc: `/redoc`

Documentation includes:
- Endpoint descriptions
- Request/response schemas
- Example requests
- Authentication requirements

## 🆘 Troubleshooting Guide

### Common Issues
- Database connection failures
- Authentication errors
- AI model timeouts
- File upload issues

### Debugging Tools
- Structured logging
- Health check endpoints
- Database query logging
- Performance profiling

### Monitoring
- Application logs
- Database performance
- API response times
- Error rates

## 🤝 Contributing Guidelines

### Code Standards
- Follow PEP 8 for Python code
- Use TypeScript best practices
- Maintain consistent styling
- Write comprehensive tests

### Development Process
- Feature branching workflow
- Pull request reviews
- Automated testing
- Continuous integration

### Documentation
- Inline code comments
- API documentation
- Architecture diagrams
- User guides

## 📄 License Information

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Histora
- Inspired by the desire to make historical knowledge more accessible and engaging
- Built with modern technologies to provide the best user experience