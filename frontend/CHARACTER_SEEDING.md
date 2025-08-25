# Character Seeding - Histora Frontend

## Overview
This documentation covers the character seeding functionality that was implemented to fix URL construction issues and create 3 historical characters (Atatürk, Mevlana, Konfüçyüs) without RAG dependencies.

## Issues Fixed

### 1. URL Construction Problems
**Problem**: Multiple admin pages were using incorrect environment variable `NEXT_PUBLIC_API_BASE_URL` instead of `NEXT_PUBLIC_API_URL`, causing 404 errors with "undefined" in URLs.

**Files Fixed**:
- `/src/app/admin/characters/[id]/page.tsx` - Character detail page
- `/src/app/admin/characters/[id]/sources/page.tsx` - Character sources management
- `/src/app/admin/upload/page.tsx` - File upload functionality

**Changes Made**: Replaced all instances of `process.env.NEXT_PUBLIC_API_BASE_URL` with `process.env.NEXT_PUBLIC_API_URL`

### 2. Character Creation Without RAG
**Problem**: User needed 3 characters created based on seed file structure without using RAG system.

**Solution**: Created comprehensive character seeding system with multiple implementation options.

## Character Seeding Implementation

### Files Created

#### 1. Seed Data (`/src/data/seed-characters.json`)
Contains character definitions for:
- **Mustafa Kemal Atatürk** (1881-1938) - Turkish Republic founder
- **Mevlana Celaleddin Rumi** (1207-1273) - Sufi mystic and poet
- **Konfüçyüs** (551-479 BC) - Chinese philosopher

Each character includes:
- Basic information (name, birth/death years, nationality)
- Detailed system prompts for AI conversations
- Personality traits and speaking styles
- Knowledge context and supported languages
- Publishing status and metadata

#### 2. Seeding Script (`/scripts/seed-characters.js`)
Node.js utility script with two modes:
- **API Mode**: Creates characters via backend API calls
- **Mock Mode**: Generates static JSON files for development

Usage:
```bash
# Create characters via API (requires admin token)
ADMIN_TOKEN=your-token node scripts/seed-characters.js

# Create mock data files for development
node scripts/seed-characters.js --mock
```

#### 3. React Component (`/src/components/admin/SeedCharacters.tsx`)
Interactive admin interface for character creation:
- Visual preview of characters to be created
- Real-time creation status tracking
- Error handling and progress reporting
- Success/failure statistics

#### 4. Admin Page (`/src/app/admin/seed/page.tsx`)
Dedicated admin page for accessing the seeding functionality.

#### 5. Mock Data Files (`/public/mock-data/`)
Generated static files for development:
- `characters.json` - Complete character list
- `character-{id}.json` - Individual character files

## Character Details

### Mustafa Kemal Atatürk
- **Role**: Visionary leader and modernist thinker
- **Key Topics**: Turkish Republic foundation, modernization, education, women's rights
- **Speaking Style**: Official but warm, instructive
- **Personality**: Visionary, determined, modernist, leader

### Mevlana Celaleddin Rumi
- **Role**: Great Sufi mystic and poet
- **Key Topics**: Love and tolerance, spirituality, universal brotherhood
- **Speaking Style**: Poetic, wise, loving
- **Personality**: Loving, tolerant, wise, poet

### Konfüçyüs (Confucius)
- **Role**: Great philosopher and teacher
- **Key Topics**: Ethics and virtue, social order, education, family values
- **Speaking Style**: Wise, instructive, measured
- **Personality**: Wise, instructive, virtuous, respectful

## Usage Instructions

### For Developers
1. **Mock Mode Development**:
   ```bash
   node scripts/seed-characters.js --mock
   ```
   This creates static files in `/public/mock-data/` for frontend development.

2. **API Integration**:
   ```bash
   ADMIN_TOKEN=your-admin-token node scripts/seed-characters.js
   ```
   Requires valid admin authentication token.

### For Admin Users
1. Navigate to `/admin/seed` in the admin panel
2. Click "Create All Characters" button
3. Monitor creation progress in real-time
4. Review success/error statistics

## Technical Notes

### Environment Variables
Ensure these are properly set:
- `NEXT_PUBLIC_API_URL` - Backend API base URL (e.g., `http://localhost:8000`)
- `NEXT_PUBLIC_API_VERSION` - API version (e.g., `v1`)

### Character Data Structure
Characters follow the backend model structure:
```typescript
interface Character {
  id: string
  name: string
  title: string
  birth_year: number
  death_year: number | null
  nationality: string
  category: string
  description: string
  personality_traits: string[]
  speaking_style: string
  system_prompt: string
  knowledge_context: string
  supported_languages: string[]
  is_published: boolean
}
```

### Error Handling
- Network connectivity issues are handled gracefully
- Authentication errors are reported clearly
- Duplicate character creation is detected and skipped
- Detailed error messages are provided for debugging

## Future Enhancements

1. **Character Sources**: Add knowledge source management for each character
2. **Bulk Operations**: Support for updating existing characters
3. **Template System**: Character templates for different categories
4. **Import/Export**: JSON file import/export functionality
5. **Validation**: Enhanced data validation and sanitization

## Troubleshooting

### Common Issues
1. **"undefined" in URLs**: Check that `NEXT_PUBLIC_API_URL` is set correctly
2. **Authentication Errors**: Ensure admin login is successful and token is valid
3. **Character Creation Fails**: Verify backend is running and accessible
4. **Import Errors**: Check that all file paths are correct in components

### Development Mode
Use mock mode for frontend development when backend is not available:
```bash
node scripts/seed-characters.js --mock
```

This creates static files that can be used by frontend components without backend dependency.