# FundEase Backend API

A comprehensive backend API for FundEase - A cooperative fund management system built with Node.js, Express, and MySQL.

## Features

- **User Management**: Registration, authentication, and role-based access control
- **Member Management**: Member registration, approval, and profile management
- **Financial Operations**: Contributions, loans, withdrawals, and repayments
- **Admin Dashboard**: Comprehensive admin panel for system management
- **Committee Functions**: Loan screening and approval workflows
- **Treasurer Operations**: Financial oversight and transaction management
- **Real-time Notifications**: Email notifications and in-app messaging
- **Payment Integration**: PayMongo payment gateway integration
- **Reporting**: Financial reports and analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with Gmail SMTP
- **File Upload**: Multer
- **Real-time**: Socket.io
- **Payment**: PayMongo API

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jungil13/sinking-backend.git
cd sinking-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the required values:
- Database connection details
- JWT secret key
- Email configuration
- Payment gateway credentials

5. Set up the database:
```bash
# Import the database schema
mysql -u your_username -p your_database < database_schema.sql
```

6. Start the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | Database host | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_PORT` | Database port | No (default: 3306) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `MAILTRAP_HOST` | Email SMTP host | Yes |
| `MAILTRAP_PORT` | Email SMTP port | Yes |
| `MAILTRAP_USER` | Email username | Yes |
| `MAILTRAP_PASS` | Email password | Yes |
| `MAILTRAP_FROM_EMAIL` | From email address | Yes |
| `MAILTRAP_FROM_NAME` | From name | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `PAYMONGO_SECRET_KEY` | PayMongo secret key | No |
| `WEBHOOK_SECRET_KEY` | Webhook secret key | No |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id/transactions` - Get member transactions

### Contributions
- `GET /api/contributions` - Get user contributions
- `POST /api/contributions` - Create contribution
- `GET /api/contributions/:id` - Get contribution by ID
- `PUT /api/contributions/:id/status` - Update contribution status

### Loans
- `POST /api/loans/request` - Request loan
- `GET /api/loans/user/:userID` - Get user loans
- `GET /api/loans` - Get all loans (admin)
- `PUT /api/loans/:id/status` - Update loan status

### Withdrawals
- `POST /api/withdrawals` - Create withdrawal request
- `GET /api/withdrawals/user/:userID` - Get user withdrawals
- `GET /api/withdrawals` - Get all withdrawals (admin)
- `PUT /api/withdrawals/:id/status` - Update withdrawal status

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/registrations` - Get pending registrations
- `POST /api/admin/registrations/:userId/approve` - Approve registration
- `POST /api/admin/registrations/:userId/reject` - Reject registration

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `members` - Member profiles and information
- `contributions` - Member contributions
- `loans` - Loan applications and records
- `loan_repayments` - Loan payment records
- `withdrawals` - Withdrawal requests
- `notifications` - System notifications
- `messages` - Internal messaging system

## Deployment

### Render Deployment

This application is configured for deployment on Render. The `render.yaml` file contains the deployment configuration.

1. Connect your GitHub repository to Render
2. Set up environment variables in Render dashboard
3. Deploy using the render.yaml configuration

### Manual Deployment

1. Set up a production server
2. Install Node.js and MySQL
3. Clone the repository
4. Install dependencies: `npm install --production`
5. Set up environment variables
6. Import database schema
7. Start the application: `npm start`

## Development

### Running Tests
```bash
npm test
```

### Database Testing
```bash
node check-db.js
```

### Email Testing
```bash
node test-email.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.