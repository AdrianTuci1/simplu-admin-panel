import React, { useState } from 'react';
import { PaymentAPI } from '../../lib/api';
import { Button } from '../ui/button';

const PayWithSavedCard = ({ businessId, selectedCardId, onPaymentComplete, onPaymentError, businessType = 'dental', plans = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);

  // Filter plans based on business type
  const getFilteredPlans = () => {
    return plans.filter(plan => {
      // Show all plans that are available for this business type
      // The API should return appropriate plans based on business type
      return plan && plan.name;
    });
  };

  const filteredPlans = getFilteredPlans();

  // Get prices for selected plan
  const getPricesForPlan = (plan) => {
    if (!plan || !plan.prices) return [];
    return plan.prices;
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setSelectedPrice(null); // Reset price selection when plan changes
  };

  const handlePriceSelect = (price) => {
    setSelectedPrice(price);
  };

  const handlePayment = async () => {
    if (!selectedCardId) {
      setError('Selectează un card pentru plată');
      return;
    }

    if (!selectedPrice) {
      setError('Selectează un plan și interval de facturare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await PaymentAPI.payWithSavedCard(businessId, {
        paymentMethodId: selectedCardId,
        priceId: selectedPrice.id
      });
      
      if (result.success) {
        if (onPaymentComplete) {
          onPaymentComplete(result);
        }
      } else {
        setError('Plata a eșuat');
        if (onPaymentError) {
          onPaymentError(result);
        }
      }
    } catch (err) {
      setError(err.message);
      if (onPaymentError) {
        onPaymentError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'RON') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency
    }).format(price.unitAmount / 100); // Assuming price is in cents
  };

  const getIntervalName = (interval) => {
    return interval === 'month' ? 'lună' : 'an';
  };

  if (filteredPlans.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Plată cu Cardul Salvat</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nu sunt planuri disponibile pentru acest tip de business.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Plată cu Cardul Salvat</h3>
      
      <div className="space-y-4">
        {/* Plan Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Selectează Planul</label>
          <div className="grid gap-3">
            {filteredPlans.map((plan) => (
              <label key={plan.id} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlan?.id === plan.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selectedPlan?.id === plan.id}
                  onChange={() => handlePlanSelect(plan)}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-sm text-muted-foreground">{plan.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Price Selection */}
        {selectedPlan && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Selectează Intervalul de Facturare</label>
            <div className="grid grid-cols-2 gap-3">
              {getPricesForPlan(selectedPlan).map((price) => (
                <label key={price.id} className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  selectedPrice?.id === price.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="price"
                    value={price.id}
                    checked={selectedPrice?.id === price.id}
                    onChange={() => handlePriceSelect(price)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium">
                      {price.recurring.interval === 'month' ? 'Lunar' : 'Anual'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(price, price.currency.toUpperCase())}/{getIntervalName(price.recurring.interval)}
                    </div>
                    {price.recurring.interval === 'year' && (
                      <div className="text-xs text-green-600 font-medium">20% reducere</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Total Price */}
        {selectedPrice && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total de plată:</span>
              <span className="text-lg font-bold">
                {formatPrice(selectedPrice, selectedPrice.currency.toUpperCase())}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Facturare {getIntervalName(selectedPrice.recurring.interval)}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={!selectedCardId || !selectedPrice || loading}
          className="w-full"
        >
          {loading ? 'Se procesează plata...' : 'Plătește Acum'}
        </Button>
      </div>
    </div>
  );
};

export default PayWithSavedCard; 