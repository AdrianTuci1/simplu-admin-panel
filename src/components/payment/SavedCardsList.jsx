import React, { useState, useEffect } from 'react';
import { UserAPI } from '../../lib/api';
import { Button } from '../ui/button';

const SavedCardsList = ({ onCardSelect, selectedCardId }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const fetchSavedCards = async () => {
    try {
      setLoading(true);
      const data = await UserAPI.getPaymentMethods();
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (cardId) => {
    onCardSelect(cardId);
  };

  if (loading) return (
    <div className="text-center py-4">
      <p className="text-muted-foreground">Se încarcă cardurile...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-4">
      <p className="text-red-600">Eroare: {error}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Carduri Salvate</h3>
      
      {cards.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground mb-2">Nu ai carduri salvate</p>
          <p className="text-sm text-muted-foreground">Adaugă un card nou pentru plăți rapide</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedCardId === card.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCardSelect(card.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {card.card.brand.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      •••• {card.card.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expiră {card.card.exp_month}/{card.card.exp_year}
                    </div>
                  </div>
                </div>
                {selectedCardId === card.id && (
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCardsList; 