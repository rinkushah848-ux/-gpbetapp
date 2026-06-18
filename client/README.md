# Frontend README

## Quick Start

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local

# Start development server
npm run dev
```

App runs on `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── login/page.tsx    # Login page
│   ├── home/page.tsx     # Dashboard (protected)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Redirect root
│   ├── globals.css       # Styles & theme
│   └── providers.tsx     # Client providers
├── components/           # React components
└── utils/
    ├── authService.ts    # API client & token management
    └── useAuth.ts        # Custom auth hook
```

## Routes

**Public:**
- `/login` - Login page

**Protected:**
- `/home` - User dashboard

**Redirects:**
- `/` → `/home` (or `/login` if not authenticated)

## Authentication

1. **Login:** Submit credentials to backend
2. **Token:** Store in localStorage
3. **Protection:** useAuth() hook checks token and redirects if needed
4. **API Calls:** authService automatically includes token in requests

## Styling

Uses **Tailwind CSS** with custom dark gaming theme.

**Colors:**
- Primary BG: `#0f0f1e` (dark)
- Secondary BG: `#1a1a2e`
- Accent 1: `#00d4ff` (cyan)
- Accent 2: `#ff006e` (pink)
- Text: `#eaeaea` (light)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Key Features

✅ Responsive design  
✅ Dark theme with gradients  
✅ Protected routes with auth guard  
✅ Error handling & loading states  
✅ User data display  
✅ Logout functionality  

## Development Tips

- Use `useAuth()` hook to protect components
- Check token status with `authService.isAuthenticated()`
- Tokens auto-expire after 7 days (user must re-login)
- localStorage stores token (in production, use httpOnly cookies)
