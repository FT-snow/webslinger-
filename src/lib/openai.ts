// OpenAI API integration for Spider-Man themed content
const OPENAI_API_KEY = process.env.OPENAIAPIKEY || process.env.NEXT_PUBLIC_OPENAIAPIKEY || '';

export interface SpiderManSuggestion {
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

export async function getSpiderManSuggestions(category?: string, difficulty?: string): Promise<SpiderManSuggestion[]> {
  try {
    const prompt = `Generate 10 Spider-Man themed words for a drawing game. 
    ${category ? `Focus on: ${category}` : 'Include a mix of characters, gadgets, locations, and concepts.'}
    ${difficulty ? `Difficulty level: ${difficulty}` : 'Mix of easy, medium, and hard words.'}
    
    Return as JSON array with format:
    [{"word": "Spider-Man", "category": "Characters", "difficulty": "easy", "description": "The main superhero"}, ...]
    
    Make sure words are:
    - Recognizable to Spider-Man fans
    - Appropriate for drawing
    - Fun and engaging
    - Mix of iconic and lesser-known elements`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Spider-Man expert helping create drawing game content. Always respond with valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse JSON response
    const suggestions = JSON.parse(content);
    return Array.isArray(suggestions) ? suggestions : [];
    
  } catch (error) {
    console.error('Error fetching Spider-Man suggestions:', error);
    
    // Fallback to static suggestions if API fails
    return getFallbackSuggestions(category, difficulty);
  }
}

function getFallbackSuggestions(category?: string, difficulty?: string): SpiderManSuggestion[] {
  const allSuggestions: SpiderManSuggestion[] = [
    // Characters
    { word: 'Spider-Man', category: 'Characters', difficulty: 'easy', description: 'The main superhero' },
    { word: 'Miles Morales', category: 'Characters', difficulty: 'medium', description: 'Ultimate Spider-Man' },
    { word: 'Green Goblin', category: 'Characters', difficulty: 'easy', description: 'Classic villain' },
    { word: 'Doctor Octopus', category: 'Characters', difficulty: 'easy', description: 'Scientist with metal arms' },
    { word: 'Venom', category: 'Characters', difficulty: 'medium', description: 'Black symbiote' },
    { word: 'Black Cat', category: 'Characters', difficulty: 'medium', description: 'Cat burglar' },
    { word: 'Kingpin', category: 'Characters', difficulty: 'easy', description: 'Crime boss' },
    
    // Gadgets
    { word: 'Web-Shooters', category: 'Gadgets', difficulty: 'medium', description: 'Spider-Man\'s wrist devices' },
    { word: 'Spider-Sense', category: 'Powers', difficulty: 'hard', description: 'Sixth sense ability' },
    { word: 'Symbiote', category: 'Concepts', difficulty: 'hard', description: 'Living alien suit' },
    
    // Locations
    { word: 'Daily Bugle', category: 'Locations', difficulty: 'easy', description: 'Newspaper building' },
    { word: 'Oscorp', category: 'Locations', difficulty: 'medium', description: 'Tech corporation' },
    { word: 'Queens', category: 'Locations', difficulty: 'easy', description: 'Spider-Man\'s neighborhood' },
    
    // Vehicles
    { word: 'Spider-Mobile', category: 'Vehicles', difficulty: 'hard', description: 'Spider-Man\'s car' },
    { word: 'Web-Wings', category: 'Gadgets', difficulty: 'medium', description: 'Gliding device' },
  ];

  // Filter by category and difficulty if specified
  let filtered = allSuggestions;
  
  if (category) {
    filtered = filtered.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
  }
  
  if (difficulty) {
    filtered = filtered.filter(s => s.difficulty === difficulty);
  }

  // Return 3 random suggestions
  return filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
}

export async function getSpiderManHint(word: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Spider-Man expert. Give a helpful but not obvious hint for drawing the given Spider-Man related word.'
          },
          {
            role: 'user',
            content: `Give a creative hint for drawing "${word}" that helps but doesn\'t give away the answer. Make it fun and Spider-Man themed.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content || `Try drawing ${word}!`;
    }
  } catch (error) {
    console.error('Error getting hint:', error);
  }
  
  return `Draw something related to ${word}!`;
}
