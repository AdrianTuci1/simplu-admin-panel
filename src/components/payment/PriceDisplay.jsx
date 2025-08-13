import React, { useState, useEffect } from 'react';
import { PaymentAPI } from '../../lib/api';

const PriceDisplay = ({ businessType = 'dental' }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingInterval, setBillingInterval] = useState('month');

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plansData = await PaymentAPI.getPlans();
        setPlans(plansData);
      } catch (err) {
        setError('Nu s-au putut încărca planurile');
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, []);

  const getPlanPrice = (plan, interval) => {
    if (interval === 'month') {
      return plan.priceMonthly;
    } else {
      return plan.priceYearly;
    }
  };

  const formatPrice = (price, currency = 'RON') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency
    }).format(price / 100); // Assuming price is in cents
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Se încarcă prețurile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Find the default plan for this business type
  const defaultPlan = plans.find(plan => 
    plan.key === 'basic' || plan.businessType === businessType
  );

  if (!defaultPlan) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Nu s-au găsit planuri disponibile</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Preț plan {defaultPlan.name}:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-2 py-1 text-xs rounded ${
              billingInterval === 'month'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Lunar
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-2 py-1 text-xs rounded ${
              billingInterval === 'year'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Anual
          </button>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold">
          {formatPrice(getPlanPrice(defaultPlan, billingInterval), defaultPlan.currency)}
        </div>
        <div className="text-sm text-muted-foreground">
          per {billingInterval === 'month' ? 'lună' : 'an'}
          {billingInterval === 'year' && (
            <span className="text-green-600 ml-1">(20% reducere)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceDisplay; 