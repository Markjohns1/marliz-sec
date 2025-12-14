# 🎨 Frontend Setup Instructions

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

Frontend will start at: **http://localhost:3000**

## Step 3: Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation with categories
│   │   ├── Footer.jsx          # Footer with links
│   │   └── ArticleCard.jsx     # Reusable article card
│   ├── pages/
│   │   ├── Home.jsx            # Homepage with latest threats
│   │   ├── ArticleDetail.jsx   # Full article page
│   │   ├── CategoryPage.jsx    # Category filtered view
│   │   ├── Subscribe.jsx       # Newsletter signup
│   │   └── About.jsx           # About page
│   ├── services/
│   │   └── api.js              # API client
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles + Tailwind
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Key Features

### 🎨 Design System
- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful icons
- **Inter font** for modern typography
- Custom color scheme with primary/danger/success/warning variants

### 📱 Mobile-First
- Responsive grid layouts
- Mobile navigation menu
- Touch-friendly buttons
- Optimized images

### ⚡ Performance
- Code splitting with React Router
- Image lazy loading
- React Query for caching
- Optimized Tailwind build

### 🔍 SEO
- React Helmet for meta tags
- Semantic HTML
- Schema.org structured data
- Dynamic meta descriptions

## Environment Variables

Create `.env` file:

```bash
VITE_API_URL=http://localhost:8000
```

For production, update to your backend URL.

## Deployment

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Upload 'dist' folder to Netlify
```

### Option 3: Static Hosting
```bash
npm run build
# Upload 'dist' folder to any static host
```

## Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Your brand colors
  }
}
```

### Add Pages
1. Create file in `src/pages/`
2. Add route in `App.jsx`
3. Add link in `Header.jsx` or `Footer.jsx`

### Modify Components
All components are in `src/components/` - fully customizable!

## Troubleshooting

### Backend not connecting
- Ensure backend is running on port 8000
- Check CORS settings in backend `main.py`
- Verify `VITE_API_URL` in `.env`

### Styles not loading
```bash
rm -rf node_modules
npm install
npm run dev
```

### Build errors
```bash
npm run build
# Check console for specific errors
```

## Testing the Full Stack

1. **Start backend**: `uvicorn app.main:app --reload` (port 8000)
2. **Start frontend**: `npm run dev` (port 3000)
3. **Trigger news fetch**: `POST http://localhost:8000/api/admin/fetch-news`
4. **View articles**: `http://localhost:3000`

## Next Steps

- Frontend complete
- Backend complete
🎯 Add your API keys
🚀 Deploy to production
📈 Start marketing!

**You're ready to launch!** 🔥