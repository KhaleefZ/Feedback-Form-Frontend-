# Frontend-ShadCN

A modern Next.js application with ShadCN UI components for a professional support and profile management system.

## Features

- 🎨 **Modern UI**: Built with ShadCN UI components
- 🔐 **Authentication**: Login and SignUp pages
- 📊 **Dynamic Dashboard**: Profile management with real-time updates
- 💬 **Support System**: Integrated support request modal
- 📱 **Responsive Design**: Mobile-first approach
- 🎯 **Type-Safe**: Built with TypeScript

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
Frontend-ShadCN/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard with profile
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home/redirect page
├── components/
│   ├── ui/                   # ShadCN UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   └── select.tsx
│   └── SupportModal.tsx      # Support request modal
├── lib/
│   ├── utils.ts              # Utility functions
│   └── api.ts                # API integration
└── public/                   # Static assets
```

## Components

### Dashboard
- Dynamic profile management
- Social media integration
- Responsive sidebar navigation
- Profile sections (Education, Experience, etc.)

### Authentication
- Login page with form validation
- SignUp page with password confirmation
- Error handling and loading states

### Support Modal
- Category selection
- Form validation
- Success feedback
- API integration

## Technologies

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **ShadCN UI**: Component library
- **Tailwind CSS**: Styling
- **Radix UI**: Accessible components
- **Lucide React**: Icons
- **React Icons**: Additional icons

## API Integration

The app connects to a backend API for:
- User authentication (login/signup)
- Profile management
- Support requests

Configure the API URL in `.env.local`.

## Customization

### Theme
Customize colors in `tailwind.config.ts` and `app/globals.css`

### Components
All UI components are in `components/ui/` and can be customized

### API Endpoints
Update endpoints in `lib/api.ts`

## License

MIT License - See LICENSE file for details
