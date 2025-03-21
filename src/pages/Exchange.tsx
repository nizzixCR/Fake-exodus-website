import React, { useState, useEffect } from 'react';
import { FiArrowDown, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { useWallet } from '../context/WalletContext';
import DisclaimerBanner from '../components/ui/DisclaimerBanner';

const Exchange: React.FC = () => {
  const { assets, updateAssetBalance } = useWallet();

  const [fromAsset, setFromAsset] = useState('');
  const [toAsset, setToAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [estimatedAmount, setEstimatedAmount] = useState('0');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set default assets when component mounts
  useEffect(() => {
    if (assets.length >= 2) {
      if (!fromAsset) setFromAsset(assets[0].id);
      if (!toAsset) setToAsset(assets[1].id);
    }
  }, [assets, fromAsset, toAsset]);

  const fromAssetDetails = assets.find(asset => asset.id === fromAsset);
  const toAssetDetails = assets.find(asset => asset.id === toAsset);

  // Generate a "realistic" exchange rate between assets
  useEffect(() => {
    if (fromAssetDetails && toAssetDetails) {
      // Base the exchange rate on the relative prices of the assets
      const baseRate = toAssetDetails.price / fromAssetDetails.price;

      // Add a small random variation to make it feel more realistic
      const variation = 0.97 + (Math.random() * 0.06); // Random between 0.97 and 1.03
      const finalRate = baseRate * variation;

      setExchangeRate(finalRate);
    }
  }, [fromAsset, toAsset, fromAssetDetails, toAssetDetails]);

  // Calculate estimated amount to receive
  useEffect(() => {
    if (amount && exchangeRate) {
      const estimated = parseFloat(amount) * exchangeRate;
      setEstimatedAmount(estimated.toFixed(8));
    } else {
      setEstimatedAmount('0');
    }
  }, [amount, exchangeRate]);

  // Handle swapping the assets
  const handleSwapAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setAmount('');
  };

  // Set max amount
  const handleSetMaxAmount = () => {
    if (fromAssetDetails) {
      setAmount(fromAssetDetails.balance.toString());
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    if (!fromAsset || !toAsset) {
      setErrorMessage('Please select assets to exchange');
      return;
    }

    if (fromAsset === toAsset) {
      setErrorMessage('Please select different assets');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > (fromAssetDetails?.balance || 0)) {
      setErrorMessage('Insufficient balance');
      return;
    }

    // Clear any previous errors
    setErrorMessage('');

    // Open confirmation dialog
    setShowConfirmation(true);
  };

  // Handle confirming the exchange
  const handleConfirmExchange = () => {
    if (!fromAssetDetails || !toAssetDetails) return;

    setIsLoading(true);

    // Simulate a network delay
    setTimeout(() => {
      // Reduce the balance of the "from" asset
      const newFromBalance = fromAssetDetails.balance - parseFloat(amount);
      updateAssetBalance(fromAssetDetails.id, Math.max(0, newFromBalance));

      // Increase the balance of the "to" asset
      const newToBalance = toAssetDetails.balance + parseFloat(estimatedAmount);
      updateAssetBalance(toAssetDetails.id, newToBalance);

      // Show success message
      setShowConfirmation(false);
      setIsLoading(false);
      setShowSuccess(true);

      // Reset form after a delay
      setTimeout(() => {
        setShowSuccess(false);
        setAmount('');
      }, 3000);
    }, 1500);
  };

  // Format the exchange rate display
  const formatExchangeRate = () => {
    if (!fromAssetDetails || !toAssetDetails) return '';
    return `1 ${fromAssetDetails.symbol} ≈ ${exchangeRate.toFixed(6)} ${toAssetDetails.symbol}`;
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Success message */}
      {showSuccess && (
        <div className="bg-exodus-green bg-opacity-10 text-exodus-green p-6 rounded-xl flex items-center">
          <div className="w-12 h-12 rounded-full bg-exodus-green bg-opacity-20 flex items-center justify-center mr-4">
            <FiRefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Exchange Complete!</h3>
            <p className="opacity-80">
              Exchanged {amount} {fromAssetDetails?.symbol} for {estimatedAmount} {toAssetDetails?.symbol}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-exodus-backgroundLight rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-exodus-text mb-4">Confirm Exchange</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-exodus-textSecondary">You Send</span>
                <span className="text-exodus-text font-medium">
                  {amount} {fromAssetDetails?.symbol}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-exodus-textSecondary">You Get</span>
                <span className="text-exodus-text font-medium">
                  {estimatedAmount} {toAssetDetails?.symbol}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-exodus-textSecondary">Exchange Rate</span>
                <span className="text-exodus-text font-medium">{formatExchangeRate()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-exodus-textSecondary">Network Fee</span>
                <span className="text-exodus-text font-medium">Included</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
                className="flex-1 py-3 rounded-md border border-gray-700 text-exodus-text hover:bg-exodus-background transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmExchange}
                disabled={isLoading}
                className="flex-1 py-3 rounded-md bg-exodus-accent text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main exchange form */}
      <div className="bg-exodus-backgroundLight rounded-xl p-6">
        <h2 className="text-xl font-semibold text-exodus-text mb-6">Exchange</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* From asset */}
            <div className="bg-exodus-background rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <label className="text-exodus-textSecondary text-sm">From</label>
                {fromAssetDetails && (
                  <span className="text-exodus-textSecondary text-sm">
                    Available: {fromAssetDetails.balance} {fromAssetDetails.symbol}
                  </span>
                )}
              </div>

              <div className="flex mb-4">
                <select
                  value={fromAsset}
                  onChange={(e) => setFromAsset(e.target.value)}
                  className="flex-1 bg-exodus-backgroundLight rounded-md px-4 py-3 text-exodus-text appearance-none focus:outline-none focus:ring-1 focus:ring-exodus-accent mr-2"
                >
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.00000001"
                  min="0"
                  max={fromAssetDetails?.balance.toString()}
                  className="flex-1 bg-exodus-backgroundLight rounded-md px-4 py-3 text-exodus-text focus:outline-none focus:ring-1 focus:ring-exodus-accent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSetMaxAmount}
                  className="text-exodus-accent text-sm hover:underline"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapAssets}
                className="bg-exodus-backgroundLight hover:bg-exodus-accent hover:bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center border border-gray-700"
              >
                <FiArrowDown className="text-exodus-accent" />
              </button>
            </div>

            {/* To asset */}
            <div className="bg-exodus-background rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <label className="text-exodus-textSecondary text-sm">To</label>
                {toAssetDetails && (
                  <span className="text-exodus-textSecondary text-sm">
                    Balance: {toAssetDetails.balance} {toAssetDetails.symbol}
                  </span>
                )}
              </div>

              <div className="flex mb-2">
                <select
                  value={toAsset}
                  onChange={(e) => setToAsset(e.target.value)}
                  className="flex-1 bg-exodus-backgroundLight rounded-md px-4 py-3 text-exodus-text appearance-none focus:outline-none focus:ring-1 focus:ring-exodus-accent mr-2"
                >
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={estimatedAmount}
                  readOnly
                  className="flex-1 bg-exodus-backgroundLight rounded-md px-4 py-3 text-exodus-text focus:outline-none"
                />
              </div>

              <div className="text-right text-exodus-textSecondary text-sm">
                {formatExchangeRate()}
              </div>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="bg-exodus-red bg-opacity-10 text-exodus-red p-3 rounded-md flex items-center">
                <FiAlertTriangle className="mr-2 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Exchange button */}
            <button
              type="submit"
              className="w-full py-4 rounded-md bg-exodus-accent text-white font-medium hover:bg-opacity-90 transition-colors"
            >
              Exchange
            </button>

            <p className="text-exodus-textSecondary text-xs text-center">
              By continuing, you agree to the exchange terms and acknowledge that your assets will be converted at a rate determined at the time of the exchange.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Exchange;
