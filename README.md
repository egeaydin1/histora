# Histora - AI Historical Figures Chat Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

Histora is an AI-powered platform that enables users to engage in realistic conversations with historical figures including philosophers, scientists, artists, and leaders.

## 🌟 Features

- **Character Selection**: Choose from a variety of historical figures to chat with
- **AI-Powered Conversations**: Realistic dialogue using advanced language models
- **Multilingual Support**: Available in Turkish and English
- **Document Integration**: Upload and chat with historical documents
- **Admin Panel**: Manage characters, users, and system settings
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for PostgreSQL database)
- Firebase account (for authentication)

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd histora
   ```

2. Set up environment variables:
   ```bash
   cp .env.ex .env
   # Edit .env with your configuration
   ```

3. Start the development environment:
   ```bash
   ./start.sh
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🚄 Railway Deployment

To deploy the Histora backend to Railway:

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will automatically detect this as a Python application
4. Set the following environment variables in Railway:
   ```
   DATABASE_URL=postgresql://<railway-db-user>:<railway-db-password>@<railway-db-host>:<railway-db-port>/<railway-db-name>
   DB_HOST=<railway-db-host>
   DB_PORT=<railway-db-port>
   DB_NAME=<railway-db-name>
   DB_USER=<railway-db-user>
   DB_PASSWORD=<railway-db-password>
   ```
5. Add any other required environment variables from your `.env` file

### Automatic Database Initialization

The application now automatically creates database tables when deployed to Railway. No manual migration steps are required.

If you need to manually initialize the database, you can still do so:
```bash
railway run python backend/create_tables.py
```

## 🌐 Vercel Deployment (Frontend)

To deploy the frontend to Vercel:

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set the root directory to `/frontend`
4. Set the build command to `npm run build`
5. Set the output directory to `.next`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://<your-railway-app-url>
   NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
   # ... other Firebase config variables
   ```

## 📁 Project Structure

```
histora/
├── backend/              # FastAPI backend
│   ├── app/              # Application code
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Configuration and utilities
│   │   ├── models/       # Database models
│   │   └── services/     # Business logic
│   ├── database/         # Database initialization
│   └── uploads/          # Uploaded files
├── frontend/             # Next.js frontend
│   ├── public/           # Static assets
│   └── src/              # Source code
│       ├── app/          # Pages and layouts
│       ├── components/   # React components
│       ├── contexts/     # React contexts
│       └── lib/          # Utility functions
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## 🛠️ Development Scripts

- `./start.sh` - Start development environment
- `./stop.sh` - Stop development environment
- `./restart.sh` - Restart development environment

## 📚 Documentation

- [Environment Setup Roadmap](ENVIRONMENT_SETUP_ROADMAP.md)
- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [RAG Admin Roadmap](RAG_ADMIN_ROADMAP.md)
- [Railway Deployment Guide](RAILWAY_DEPLOYMENT_GUIDE.md)
- [Railway Deployment Summary](RAILWAY_DEPLOYMENT_SUMMARY.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Histora
- Inspired by the desire to make historical knowledge more accessible and engaging