import React, { useState, useEffect } from 'react';
import { FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { useWallet } from '../context/WalletContext';
import DisclaimerBanner from '../components/ui/DisclaimerBanner';

const Send: React.FC = () => {
  const { assets, updateAssetBalance } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [fee, setFee] = useState('0.0001');
  const [feeSpeed, setFeeSpeed] = useState('medium');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Set the first asset as default when component mounts
  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0].id);
    }
  }, [assets, selectedAsset]);

  const selectedAssetDetails = assets.find(asset => asset.id === selectedAsset);

  // Calculate max amount user can send (balance - fee)
  const maxAmount = selectedAssetDetails ?
    (selectedAssetDetails.balance - parseFloat(fee)).toFixed(8) : '0';

  const resetForm = () => {
    setAmount('');
    setAddress('');
    setNote('');
    setFeeSpeed('medium');
    setFee('0.0001');
    setShowConfirmation(false);
    setShowSuccess(false);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    if (!selectedAsset) {
      setErrorMessage('Please select an asset');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > (selectedAssetDetails?.balance || 0)) {
      setErrorMessage('Insufficient balance');
      return;
    }

    if (!address || address.length < 10) {
      setErrorMessage('Please enter a valid address');
      return;
    }

    // Clear any previous errors
    setErrorMessage('');

    // Open confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmSend = () => {
    // Simulate sending by updating the balance
    if (selectedAssetDetails) {
      const newBalance = selectedAssetDetails.balance - parseFloat(amount);
      updateAssetBalance(selectedAssetDetails.id, Math.max(0, newBalance));

      // Show success message
      setShowConfirmation(false);
      setShowSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    }
  };

  // Calculate fee based on speed
  useEffect(() => {
    switch (feeSpeed) {
      case 'slow':
        setFee('0.00005');
        break;
      case 'medium':
        setFee('0.0001');
        break;
      case 'fast':
        setFee('0.0002');
        break;
      default:
        setFee('0.0001');
    }
  }, [feeSpeed]);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Success message */}
      {showSuccess && (
        <div className="bg-exodus-green bg-opacity-10 text-exodus-green p-6 rounded-xl flex items-center">
          <div className="w-12 h-12 rounded-full bg-exodus-green bg-opacity-20 flex items-center justify-center mr-4">
            <FiArrowRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Transaction Sent!</h3>
            <p className="opacity-80">
              {amount} {selectedAssetDetails?.symbol} has been sent from your wallet.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-exodus-backgroundLight rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-exodus-text mb-4">Confirm Transaction</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-exodus-textSecondary">Sending</span>
                <span className="text-exodus-text font-medium">
                  {amount} {selectedAssetDetails?.symbol}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-exodus-textSecondary">To Address</span>
                <span className="text-exodus-text font-medium truncate max-w-[200px]">{address}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-exodus-textSecondary">Fee</span>
                <span className="text-exodus-text font-medium">{fee} {selectedAssetDetails?.symbol}</span>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-exodus-textSecondary">Total</span>
                  <span className="text-exodus-text font-medium">
                    {(parseFloat(amount) + parseFloat(fee)).toFixed(8)} {selectedAssetDetails?.symbol}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 rounded-md border border-gray-700 text-exodus-text hover:bg-exodus-background transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSend}
                className="flex-1 py-3 rounded-md bg-exodus-accent text-white hover:bg-opacity-90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main send form */}
      <div className="bg-exodus-backgroundLight rounded-xl p-6">
        <h2 className="text-xl font-semibold text-exodus-text mb-6">Send</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Asset selector */}
            <div>
              <label className="block text-exodus-textSecondary text-sm mb-2">Asset</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full bg-exodus-background rounded-md px-4 py-3 text-exodus-text appearance-none focus:outline-none focus:ring-1 focus:ring-exodus-accent"
              >
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.symbol}) - {asset.balance} available
                  </option>
                ))}
              </select>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-exodus-textSecondary text-sm">Amount</label>
                {selectedAssetDetails && (
                  <span className="text-exodus-textSecondary text-sm">
                    Available: {selectedAssetDetails.balance} {selectedAssetDetails.symbol}
                  </span>
                )}
              </div>

              <div className="flex">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.00000001"
                  min="0"
                  max={selectedAssetDetails?.balance.toString()}
                  className="flex-1 bg-exodus-background rounded-l-md px-4 py-3 text-exodus-text focus:outline-none focus:ring-1 focus:ring-exodus-accent"
                />

                <button
                  type="button"
                  onClick={() => setAmount(maxAmount)}
                  className="bg-exodus-accent bg-opacity-10 text-exodus-accent px-4 py-3 rounded-r-md hover:bg-opacity-20 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Address input */}
            <div>
              <label className="block text-exodus-textSecondary text-sm mb-2">To Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter ${selectedAssetDetails?.name} Address`}
                className="w-full bg-exodus-background rounded-md px-4 py-3 text-exodus-text focus:outline-none focus:ring-1 focus:ring-exodus-accent"
              />
            </div>

            {/* Note input (optional) */}
            <div>
              <label className="block text-exodus-textSecondary text-sm mb-2">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note to this transaction"
                className="w-full bg-exodus-background rounded-md px-4 py-3 text-exodus-text focus:outline-none focus:ring-1 focus:ring-exodus-accent h-24 resize-none"
              />
            </div>

            {/* Network fee selector */}
            <div>
              <label className="block text-exodus-textSecondary text-sm mb-2">Network Fee</label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFeeSpeed('slow')}
                  className={`p-3 rounded-md text-center ${
                    feeSpeed === 'slow'
                      ? 'bg-exodus-accent bg-opacity-10 text-exodus-accent'
                      : 'bg-exodus-background text-exodus-text hover:bg-opacity-80'
                  }`}
                >
                  <div className="font-medium">Slow</div>
                  <div className="text-sm opacity-70">~60 min</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeSpeed('medium')}
                  className={`p-3 rounded-md text-center ${
                    feeSpeed === 'medium'
                      ? 'bg-exodus-accent bg-opacity-10 text-exodus-accent'
                      : 'bg-exodus-background text-exodus-text hover:bg-opacity-80'
                  }`}
                >
                  <div className="font-medium">Medium</div>
                  <div className="text-sm opacity-70">~20 min</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeSpeed('fast')}
                  className={`p-3 rounded-md text-center ${
                    feeSpeed === 'fast'
                      ? 'bg-exodus-accent bg-opacity-10 text-exodus-accent'
                      : 'bg-exodus-background text-exodus-text hover:bg-opacity-80'
                  }`}
                >
                  <div className="font-medium">Fast</div>
                  <div className="text-sm opacity-70">~5 min</div>
                </button>
              </div>

              <div className="mt-2 text-sm text-exodus-textSecondary">
                Fee: {fee} {selectedAssetDetails?.symbol}
              </div>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="bg-exodus-red bg-opacity-10 text-exodus-red p-3 rounded-md flex items-center">
                <FiAlertTriangle className="mr-2 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-4 rounded-md bg-exodus-accent text-white font-medium hover:bg-opacity-90 transition-colors"
            >
              Send {amount ? `${amount} ${selectedAssetDetails?.symbol}` : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Send;
