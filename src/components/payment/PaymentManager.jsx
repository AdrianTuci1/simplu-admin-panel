import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../lib/stripe';
import SavedCardsList from './SavedCardsList';
import AddNewCard from './AddNewCard';
import PayWithSavedCard from './PayWithSavedCard';
import { Button } from '../ui/button';

const PaymentManager = ({ businessId, businessType, plans, onPaymentComplete, onPaymentError }) => {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  // Initialize Stripe when component mounts
  React.useEffect(() => {
    const initStripe = async () => {
      const stripe = await getStripe();
      setStripePromise(stripe);
    };
    initStripe();
  }, []);

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
  };

  const handleCardAdded = (newCard) => {
    setShowAddCard(false);
    setSelectedCardId(newCard.id);
    // Reîncarcă lista de carduri
    window.location.reload();
  };

  const handlePaymentComplete = (result) => {
    setPaymentResult(result);
    if (onPaymentComplete) {
      onPaymentComplete(result);
    }
  };

  const handlePaymentError = (error) => {
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Se încarcă sistemul de plăți...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6">
        {paymentResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">✅ Plată Completă!</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Status:</strong> {paymentResult.status}</p>
              {paymentResult.subscriptionId && (
                <p><strong>Subscription ID:</strong> {paymentResult.subscriptionId}</p>
              )}
              {paymentResult.amount && (
                <p><strong>Sumă:</strong> {paymentResult.amount}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-6">
          <div className="space-y-4">
            <SavedCardsList 
              onCardSelect={handleCardSelect} 
              selectedCardId={selectedCardId}
            />
            
            <Button
              onClick={() => setShowAddCard(!showAddCard)}
              variant="outline"
              className="w-full"
            >
              {showAddCard ? 'Anulează' : 'Adaugă Card Nou'}
            </Button>
          </div>

          {showAddCard && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <AddNewCard 
                onCardAdded={handleCardAdded}
                onCancel={() => setShowAddCard(false)}
              />
            </div>
          )}

          {selectedCardId && (
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <PayWithSavedCard
                businessId={businessId}
                businessType={businessType}
                plans={plans}
                selectedCardId={selectedCardId}
                onPaymentComplete={handlePaymentComplete}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}
        </div>
      </div>
    </Elements>
  );
};

export default PaymentManager; 