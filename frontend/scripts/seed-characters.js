#!/usr/bin/env node

/**
 * Character seeding utility for Histora frontend
 * This script creates 3 characters (Atatürk, Mevlana, Konfüçyüs) without RAG dependencies
 */

const fs = require('fs');
const path = require('path');

// Read the character data
const charactersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/seed-characters.json'), 'utf8'));

async function seedCharacters() {
  console.log('🌱 Starting character seeding...');
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
  
  try {
    // Get admin token (you'll need to login first)
    const adminToken = process.env.ADMIN_TOKEN || 'your-admin-token-here';
    
    if (adminToken === 'your-admin-token-here') {
      console.log('⚠️  Please set ADMIN_TOKEN environment variable or login to admin panel first');
      console.log('   Example: ADMIN_TOKEN=your-token node scripts/seed-characters.js');
      return;
    }

    for (const characterData of charactersData) {
      console.log(`🔄 Creating character: ${characterData.name}`);
      
      try {
        // Prepare character data for API (remove frontend-specific fields)
        const apiCharacterData = {
          id: characterData.id,
          name: characterData.name,
          title: characterData.title,
          birth_year: characterData.birth_year,
          death_year: characterData.death_year,
          nationality: characterData.nationality,
          category: characterData.category,
          description: characterData.description,
          personality_traits: characterData.personality_traits,
          speaking_style: characterData.speaking_style,
          avatar_url: characterData.avatar_url,
          system_prompt: characterData.system_prompt,
          knowledge_context: characterData.knowledge_context,
          supported_languages: characterData.supported_languages,
          is_published: characterData.is_published
        };

        const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/admin/characters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(apiCharacterData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`  ✅ Created character: ${result.name} (ID: ${result.id})`);
        } else {
          const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
          console.log(`  ❌ Failed to create ${characterData.name}: ${error.detail || response.statusText}`);
        }
      } catch (error) {
        console.log(`  ❌ Error creating ${characterData.name}: ${error.message}`);
      }
    }
    
    console.log('🎉 Character seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

// Mock mode - create characters as static files for development
function createMockCharacters() {
  console.log('🔧 Creating mock characters for development...');
  
  const mockDir = path.join(__dirname, '../public/mock-data');
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir, { recursive: true });
  }
  
  // Create individual character files
  charactersData.forEach(character => {
    const fileName = `character-${character.id}.json`;
    const filePath = path.join(mockDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(character, null, 2));
    console.log(`  📄 Created mock file: ${fileName}`);
  });
  
  // Create characters list file
  const listFilePath = path.join(mockDir, 'characters.json');
  fs.writeFileSync(listFilePath, JSON.stringify(charactersData, null, 2));
  console.log(`  📄 Created characters list: characters.json`);
  
  console.log('✅ Mock characters created successfully!');
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--mock')) {
    createMockCharacters();
  } else {
    seedCharacters();
  }
}

module.exports = {
  seedCharacters,
  createMockCharacters,
  charactersData
};