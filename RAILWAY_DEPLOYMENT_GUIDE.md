# Railway Deployment Guide for Histora

This guide will help you deploy the Histora backend to Railway with database configuration.

## Prerequisites

1. A Railway account (https://railway.app)
2. A GitHub account with the Histora repository
3. Environment variables configured in your `.env` file

## Step 1: Create Railway Project

1. Go to https://railway.app and sign in to your account
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your Histora repository

## Step 2: Configure Environment Variables

Railway will automatically detect this as a Python application. You need to configure the environment variables:

1. In your Railway project, go to "Settings" → "Variables"
2. Add the following required variables:

### Database Configuration
```
DATABASE_URL=postgresql://<railway-db-user>:<railway-db-password>@<railway-db-host>:<railway-db-port>/<railway-db-name>
DB_HOST=<railway-db-host>
DB_PORT=<railway-db-port>
DB_NAME=<railway-db-name>
DB_USER=<railway-db-user>
DB_PASSWORD=<railway-db-password>
```

### Firebase Configuration (Required)
```
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_PRIVATE_KEY_ID=<your-firebase-private-key-id>
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
FIREBASE_CLIENT_EMAIL=<your-firebase-client-email>
FIREBASE_CLIENT_ID=<your-firebase-client-id>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### AI Model Configuration (Required for chat functionality)
```
OPENROUTER_API_KEY=<your-openrouter-api-key>
OPENAI_API_KEY=<your-openai-api-key>
```

### Security Configuration
```
JWT_SECRET_KEY=<your-jwt-secret-key>
ADMIN_API_KEY=<your-admin-api-key>
```

### Application Configuration
```
ENVIRONMENT=production
DEBUG=false
BACKEND_URL=<your-railway-app-url>
```

## Step 3: Set Up PostgreSQL Database

Railway provides a PostgreSQL database add-on:

1. In your Railway project, click "+ New" → "Database"
2. Select "PostgreSQL"
3. Railway will automatically provision a database
4. Update your environment variables with the database connection details from Railway

## Step 4: Deploy the Application

1. Railway will automatically start deploying your application
2. Monitor the deployment logs in the "Deployments" tab
3. Once deployed, your application will be available at the Railway-generated URL

## Step 5: Automatic Database Initialization

The application now automatically creates database tables when deployed to Railway through the startup script. Railway's NIXPACKS builder will automatically install dependencies from [requirements.txt](file:///Users/hientranpc/Desktop/Claude/histora/requirements.txt).

If you need to manually initialize the database, you can still do so:

1. Go to your Railway project
2. Click on your service
3. Go to the "Console" tab
4. Run the following command:
   ```bash
   python backend/create_tables.py
   ```

## Step 6: Create Admin User (Optional)

To create an admin user for the admin panel:

1. In the Railway console, run:
   ```bash
   python backend/create_admin.py
   ```
2. Follow the prompts to create an admin user

## Environment Variables Reference

Here's a complete list of environment variables you may need to configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `DB_HOST` | Database host | ✅ |
| `DB_PORT` | Database port | ✅ |
| `DB_NAME` | Database name | ✅ |
| `DB_USER` | Database user | ✅ |
| `DB_PASSWORD` | Database password | ✅ |
| `FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase private key ID | ✅ |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | ✅ |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | ✅ |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI models | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | ✅ |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | ✅ |
| `ADMIN_API_KEY` | API key for admin operations | ✅ |
| `ENVIRONMENT` | Application environment (production) | ✅ |
| `BACKEND_URL` | Your Railway app URL | ✅ |

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check that all database environment variables are correctly set
   - Ensure the database is properly provisioned in Railway

2. **Application Not Starting**
   - Check the deployment logs for error messages
   - Verify all required environment variables are set

3. **Authentication Not Working**
   - Ensure Firebase configuration is correct
   - Check that Firebase project is properly set up

### Checking Logs

You can view application logs in Railway:

1. Go to your Railway project
2. Click on your service
3. Go to the "Logs" tab

### Health Check

Once deployed, you can check if your application is running properly:

```bash
curl https://<your-railway-app-url>/health
```

This should return:
```json
{
  "status": "healthy",
  "app": "Histora",
  "version": "1.0.0",
  "environment": "production"
}
```

## Updating the Application

To update your deployed application:

1. Push changes to your GitHub repository
2. Railway will automatically detect the changes and start a new deployment
3. Monitor the deployment progress in the "Deployments" tab

## Scaling

Railway automatically scales your application based on demand. You can also manually configure scaling:

1. Go to your Railway project
2. Click on your service
3. Go to "Settings" → "Performance"
4. Adjust the instance count and size as needed

## Backup and Recovery

Railway automatically backs up your PostgreSQL database. To restore from a backup:

1. Go to your Railway project
2. Click on your database service
3. Go to "Backups"
4. Select a backup and click "Restore"

## Support

For issues with deployment:

1. Check the Railway documentation: https://docs.railway.app
2. Review application logs for error messages
3. Ensure all environment variables are correctly configured
4. Verify that your Railway account has sufficient resources