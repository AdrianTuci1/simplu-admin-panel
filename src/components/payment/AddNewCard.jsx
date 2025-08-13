import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { UserAPI } from '../../lib/api';
import { Button } from '../ui/button';

const AddNewCard = ({ onCardAdded, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe nu este inițializat');
      setLoading(false);
      return;
    }

    try {
      // Creează PaymentMethod
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (pmError) {
        setError(pmError.message);
        setLoading(false);
        return;
      }

      // Atașează cardul la cont
      await UserAPI.addPaymentMethod({
        paymentMethodId: paymentMethod.id
      });

      // Resetează formularul
      elements.getElement(CardElement).clear();
      
      if (onCardAdded) {
        onCardAdded(paymentMethod);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Adaugă Card Nou</h3>
        {onCancel && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            disabled={loading}
          >
            Anulează
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Detalii Card</label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full"
        >
          {loading ? 'Se salvează...' : 'Salvează Cardul'}
        </Button>
      </form>
    </div>
  );
};

export default AddNewCard; 