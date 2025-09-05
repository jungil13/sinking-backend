# Deployment Guide for Render

This guide will help you deploy the FundEase backend to Render with PostgreSQL.

## Prerequisites

1. A Render account
2. A GitHub repository with your code

## Deployment Steps

### 1. Database Setup

✅ **Database Already Created!**

Your PostgreSQL database is already set up with these details:
- **Name**: `sinking-db`
- **Database**: `fundease`
- **User**: `fundease_user`
- **Hostname**: `dpg-d2ssh024d50c73dh3ok0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Internal URL**: `postgresql://fundease_user:Ai12lgEfUFHZbcTrrPsrF0SwI3GZNLAr@dpg-d2ssh024d50c73dh3ok0-a/fundease`
- **External URL**: `postgresql://fundease_user:Ai12lgEfUFHZbcTrrPsrF0SwI3GZNLAr@dpg-d2ssh024d50c73dh3ok0-a.oregon-postgres.render.com/fundease`

### 2. Web Service Setup

1. In your Render dashboard, create a new Web Service:
   - Go to "New" → "Web Service"
   - Connect your GitHub repository
   - Name: `sinking-backend`
   - Environment: Node
   - Plan: Free
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`

### 3. Environment Variables

Set the following environment variables in your Render web service:

#### Required Variables:
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `DATABASE_URL`: `postgresql://fundease_user:Ai12lgEfUFHZbcTrrPsrF0SwI3GZNLAr@dpg-d2ssh024d50c73dh3ok0-a.oregon-postgres.render.com/fundease`
- `JWT_SECRET`: (Generate a secure random string)

#### Optional Variables:
- `FRONTEND_URL`: Your frontend URL
- `MAILTRAP_HOST`: `smtp.gmail.com`
- `MAILTRAP_PORT`: `587`
- `MAILTRAP_USER`: Your email
- `MAILTRAP_PASS`: Your email password
- `MAILTRAP_FROM_EMAIL`: Your email
- `MAILTRAP_FROM_NAME`: `FundEase System`
- `PAYMONGO_SECRET_KEY`: Your PayMongo secret key
- `WEBHOOK_SECRET_KEY`: Your webhook secret key

### 3.1 Local Development Environment Variables

For local development, create a `.env` file in the backend directory with:

```env
# Database Configuration for PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=fundease
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# PayMongo Configuration (for payments)
PAYMONGO_SECRET_KEY=your_paymongo_secret_key
WEBHOOK_SECRET_KEY=your_webhook_secret_key

# Mailtrap Configuration (alternative email service)
MAILTRAP_HOST=smtp.gmail.com
MAILTRAP_PORT=587
MAILTRAP_USER=your_email@gmail.com
MAILTRAP_PASS=your_app_password
MAILTRAP_FROM_EMAIL=your_email@gmail.com
MAILTRAP_FROM_NAME=FundEase System
```

**Important**: 
- Replace all placeholder values with your actual credentials
- Never commit the `.env` file to version control
- For production, use the environment variables in Render dashboard instead of a `.env` file

### 4. Database Initialization

After deployment, you need to initialize the database:

1. Go to your web service dashboard
2. Open the Shell/Console
3. Run: `npm run setup-db`

This will create all the necessary tables and insert the default admin user.

### 5. Verify Deployment

1. Check that your service is running
2. Test the database connection: `npm run check-db`
3. Access your API at: `https://your-service-name.onrender.com`

## Default Admin Credentials

After running the database setup, you can login with:
- Username: `admin`
- Password: `admin123`

**Important**: Change the default password immediately after first login!

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check if the database is running
   - Ensure SSL is enabled for production

2. **Build Failed**
   - Check that all dependencies are in package.json
   - Verify the build command is correct

3. **Service Won't Start**
   - Check the logs in Render dashboard
   - Verify all required environment variables are set
   - Ensure the start command is correct

### Logs

You can view logs in the Render dashboard under your service's "Logs" tab.

## Security Notes

1. Always use strong, unique passwords
2. Keep your JWT_SECRET secure and don't commit it to version control
3. Use HTTPS in production
4. Regularly update dependencies
5. Monitor your application logs for suspicious activity

## Scaling

For production use, consider upgrading to a paid plan for:
- Better performance
- More resources
- Custom domains
- SSL certificates
- Better support
