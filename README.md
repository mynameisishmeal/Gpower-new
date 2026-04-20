# Gpower CRM - Next.js Migration

Modern CRM system for Gpower Frozen Foods, migrated from Express/EJS to Next.js 15 with TypeScript.

## Features

- 🛒 **Dual Sales System** - Cartons and Kilos
- 💳 **Multi-Payment** - Cash, Transfer, Card, Credit
- 📦 **Inventory Management** - Real-time stock tracking
- 👥 **User Management** - Role-based access control
- 🧾 **Receipt Generation** - Print-ready receipts
- 📊 **Analytics Dashboard** - Sales insights
- 📱 **Responsive Design** - Mobile-friendly

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/mfvpos
JWT_SECRET=your-secret-key-here
```

## Tech Stack

- Next.js 15
- TypeScript
- MongoDB
- Tailwind CSS
- JWT Authentication

## Project Structure

```
gpower-nextjs/
├── app/              # Pages and API routes
├── components/       # Reusable components
├── lib/             # Utilities
├── models/          # Database models
├── types/           # TypeScript types
└── middleware.ts    # Auth middleware
```

## User Roles

- **Super Admin** - Full access
- **Admin** - Manage sales, stock, users
- **Worker** - Create sales, view stock

## API Routes

- `/api/auth/login` - User authentication
- `/api/sales/*` - Sales operations
- `/api/stock/*` - Stock management
- `/api/products/*` - Product management
- `/api/users/*` - User management
- `/api/customers/*` - Customer management

## Pages

- `/sell/cartons` - Sell by cartons
- `/sell/kilos` - Sell by weight
- `/sales/history` - View sales
- `/stock` - Manage stock
- `/products` - Manage products
- `/users` - Manage users
- `/customers` - Manage customers
- `/analytics` - View analytics
- `/settings` - Configure system

## License

Proprietary - Gpower Frozen Foods

## Support

Contact development team for support.
