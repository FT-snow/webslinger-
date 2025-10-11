'use client';

import React, { useState, useEffect } from 'react';
import StarBorder from './StarBorder';
import { getSpiderManSuggestions, SpiderManSuggestion } from '@/lib/openai';

interface WordSelectorProps {
  onWordSelect: (word: string) => void;
  onClose: () => void;
}

const spiderManWords = [
  // Characters
  'Spider-Man', 'Miles Morales', 'Gwen Stacy', 'Peter Parker', 'Mary Jane',
  'Aunt May', 'Uncle Ben', 'Green Goblin', 'Doctor Octopus', 'Venom',
  'Carnage', 'Kingpin', 'Vulture', 'Electro', 'Sandman', 'Lizard',
  'Mysterio', 'Rhino', 'Scorpion', 'Kraven the Hunter', 'Shocker',
  'Black Cat', 'Silver Sable', 'Prowler', 'Tombstone', 'Hammerhead',
  
  // Gadgets & Equipment
  'Web-Shooters', 'Spider-Sense', 'Web-Slinging', 'Wall-Crawling',
  'Spider-Suit', 'Symbiote', 'Web-Line', 'Spider-Tracers',
  'Utility Belt', 'Web-Fluid', 'Spider-Bot', 'Spider-Cycle',
  
  // Locations
  'Daily Bugle', 'Oscorp', 'Empire State University', 'Queens',
  'Manhattan', 'Brooklyn', 'Stark Tower', 'Avengers Tower',
  'Baxter Building', 'Hell\'s Kitchen', 'Times Square',
  'Central Park', 'Spider-Verse', 'Web of Life',
  
  // Powers & Abilities
  'Super Strength', 'Enhanced Reflexes', 'Wall-Crawling', 'Web-Slinging',
  'Spider-Sense', 'Agility', 'Stamina', 'Healing Factor',
  'Camouflage', 'Venom Blast', 'Bio-Electricity',
  
  // Vehicles & Tech
  'Spider-Mobile', 'Web-Wings', 'Spider-Copter', 'Web-Projector',
  'Spider-Tank', 'Spider-Signal', 'Spider-Bike',
  
  // Events & Concepts
  'With Great Power', 'Responsibility', 'Spider-Verse', 'Multiverse',
  'Clone Saga', 'Maximum Carnage', 'Secret Wars', 'Civil War',
  'One More Day', 'Back in Black', 'Spider-Island',
  
  // Supporting Cast
  'J. Jonah Jameson', 'Betty Brant', 'Robbie Robertson', 'Flash Thompson',
  'Harry Osborn', 'Liz Allen', 'Ned Leeds', 'Randy Robertson',
  'Carlie Cooper', 'Anna Maria Marconi', 'Miles Warren',
];

const WordSelector: React.FC<WordSelectorProps> = ({ onWordSelect, onClose }) => {
  const [selectedWords, setSelectedWords] = useState<SpiderManSuggestion[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setIsLoading(true);
        const suggestions = await getSpiderManSuggestions();
        setSelectedWords(suggestions);
      } catch (error) {
        console.error('Error fetching words:', error);
        // Fallback to static words
        const shuffled = [...spiderManWords].sort(() => 0.5 - Math.random());
        const fallbackWords = shuffled.slice(0, 3).map(word => ({
          word,
          category: 'Characters',
          difficulty: 'medium' as const,
          description: 'Spider-Man related'
        }));
        setSelectedWords(fallbackWords);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (selectedWords.length > 0) {
      // Auto-select first word if time runs out
      onWordSelect(selectedWords[0].word);
    }
  }, [timeLeft, selectedWords, onWordSelect]);

  const handleWordSelect = (word: string) => {
    onWordSelect(word);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-spider-black/95 backdrop-blur-sm border border-spider-red/30 rounded-xl p-8 max-w-2xl w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-spider-red text-2xl font-speedy spider-text-glow mb-2">
            🕷️ Choose Your Word, Web-Slinger! 🕷️
          </h2>
          <p className="text-spider-grey">
            Select one of these Spider-Man themed words to draw. Time left: 
            <span className={`ml-2 text-lg font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-spider-blue'}`}>
              {timeLeft}s
            </span>
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-spider-red text-4xl mb-4 animate-spin">🕷️</div>
            <p className="text-spider-grey font-speedy">Loading Spider-Man words...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {selectedWords.map((suggestion, index) => (
              <StarBorder
                key={suggestion.word}
                color={index === 0 ? '#da5047' : index === 1 ? '#0648a9' : '#abadbf'}
                speed="3s"
                className="w-full"
                onClick={() => handleWordSelect(suggestion.word)}
              >
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">
                    {index === 0 ? '🕷️' : index === 1 ? '🕸️' : '⚡'}
                  </div>
                  <div className="text-lg font-speedy text-white">
                    {suggestion.word}
                  </div>
                  <div className="text-xs text-spider-grey mt-1">
                    {suggestion.category} • {suggestion.difficulty}
                  </div>
                  <div className="text-xs text-spider-blue mt-1">
                    {suggestion.description}
                  </div>
                </div>
              </StarBorder>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-spider-grey text-spider-black rounded-lg font-speedy hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-center">
          <div className="text-spider-grey text-sm">
            💡 Tip: Choose a word that's fun to draw and easy for others to guess!
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSelector;
