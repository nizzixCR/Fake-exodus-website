import React, { useState, useEffect } from 'react';
import { FiCopy, FiDownload, FiShare2 } from 'react-icons/fi';
import { useWallet } from '../context/WalletContext';
import DisclaimerBanner from '../components/ui/DisclaimerBanner';

const Receive: React.FC = () => {
  const { assets, updateAssetBalance, getQRCodeUrl } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState('');
  const [copied, setCopied] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState('');
  const [showReceiveConfirmation, setShowReceiveConfirmation] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Set the first asset as default when component mounts
  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0].id);
    }
  }, [assets, selectedAsset]);

  const selectedAssetDetails = assets.find(asset => asset.id === selectedAsset);

  // Update QR code when selected asset changes
  useEffect(() => {
    if (selectedAssetDetails && selectedAssetDetails.address) {
      setQrCodeUrl(getQRCodeUrl(selectedAssetDetails.address));
    }
  }, [selectedAssetDetails, getQRCodeUrl]);

  // Get address for selected asset
  const getAddress = () => {
    if (!selectedAssetDetails) return '';
    return selectedAssetDetails.address || '';
  };

  // Handle copy address
  const handleCopy = () => {
    const address = getAddress();
    if (address) {
      navigator.clipboard.writeText(address).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Handle simulated receiving assets
  const handleReceive = () => {
    if (!selectedAssetDetails || !receiveAmount || parseFloat(receiveAmount) <= 0) return;

    const newBalance = selectedAssetDetails.balance + parseFloat(receiveAmount);
    updateAssetBalance(selectedAssetDetails.id, newBalance);
    setShowReceiveConfirmation(true);

    setTimeout(() => {
      setShowReceiveConfirmation(false);
      setReceiveAmount('');
    }, 3000);
  };

  // Handle downloading QR code image
  const handleDownloadQR = () => {
    // Create an anchor element
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${selectedAssetDetails?.symbol || 'crypto'}-address-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle sharing address
  const handleShare = async () => {
    const address = getAddress();

    if (address && navigator.share) {
      try {
        await navigator.share({
          title: `${selectedAssetDetails?.name} Address`,
          text: `Here's my ${selectedAssetDetails?.name} address: ${address}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard if Web Share API is not available
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Confirmation message */}
      {showReceiveConfirmation && (
        <div className="bg-exodus-green bg-opacity-10 text-exodus-green p-6 rounded-xl flex items-center">
          <div className="w-12 h-12 rounded-full bg-exodus-green bg-opacity-20 flex items-center justify-center mr-4">
            <FiDownload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Assets Received!</h3>
            <p className="opacity-80">
              {receiveAmount} {selectedAssetDetails?.symbol} has been added to your wallet.
            </p>
          </div>
        </div>
      )}

      <div className="bg-exodus-backgroundLight rounded-xl p-6">
        <h2 className="text-xl font-semibold text-exodus-text mb-6">Receive</h2>

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
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-6">
            {qrCodeUrl ? (
              <div className="w-48 h-48 bg-white p-2 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-exodus-background rounded-lg flex items-center justify-center">
                <p className="text-exodus-textSecondary text-sm">No address available</p>
              </div>
            )}
            <p className="mt-4 text-exodus-textSecondary text-sm">
              Scan this QR code to receive {selectedAssetDetails?.name}
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-exodus-textSecondary text-sm mb-2">
              {selectedAssetDetails?.name} Address
            </label>
            <div className="flex">
              <input
                type="text"
                value={getAddress()}
                readOnly
                className="flex-1 bg-exodus-background rounded-l-md px-4 py-3 text-exodus-text focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`bg-exodus-accent bg-opacity-10 text-exodus-accent px-4 py-3 rounded-r-md hover:bg-opacity-20 transition-colors ${
                  copied ? 'bg-exodus-green bg-opacity-20 text-exodus-green' : ''
                }`}
              >
                {copied ? 'Copied!' : <FiCopy />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleDownloadQR}
              disabled={!qrCodeUrl}
              className={`flex-1 py-3 rounded-md border border-gray-700 text-exodus-text ${!qrCodeUrl ? 'opacity-50 cursor-not-allowed' : 'hover:bg-exodus-background'} transition-colors flex items-center justify-center`}
            >
              <FiDownload className="mr-2" />
              Save QR
            </button>
            <button
              onClick={handleShare}
              disabled={!getAddress()}
              className={`flex-1 py-3 rounded-md border border-gray-700 text-exodus-text ${!getAddress() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-exodus-background'} transition-colors flex items-center justify-center`}
            >
              <FiShare2 className="mr-2" />
              Share
            </button>
          </div>

          {/* Demo controls for simulating receiving assets */}
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-exodus-text mb-4">Demo: Simulate Receiving Assets</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-exodus-textSecondary text-sm mb-2">
                  Amount to Receive
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.00000001"
                    min="0"
                    className="flex-1 bg-exodus-background rounded-l-md px-4 py-3 text-exodus-text focus:outline-none focus:ring-1 focus:ring-exodus-accent"
                  />
                  <span className="bg-exodus-accent bg-opacity-10 text-exodus-accent px-4 py-3 rounded-r-md">
                    {selectedAssetDetails?.symbol}
                  </span>
                </div>
              </div>

              <button
                onClick={handleReceive}
                disabled={!receiveAmount || parseFloat(receiveAmount) <= 0}
                className={`w-full py-3 rounded-md ${
                  !receiveAmount || parseFloat(receiveAmount) <= 0
                    ? 'bg-exodus-accent bg-opacity-50 cursor-not-allowed'
                    : 'bg-exodus-accent hover:bg-opacity-90'
                } text-white font-medium transition-colors`}
              >
                Simulate Receiving {receiveAmount ? `${receiveAmount} ${selectedAssetDetails?.symbol}` : 'Assets'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receive;
