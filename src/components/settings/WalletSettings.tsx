import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiAlertTriangle, FiSearch, FiCheck } from 'react-icons/fi';
import { useWallet, Asset, PortfolioStats } from '../../context/WalletContext';
import cryptoService from '../../services/CryptoService';

const WalletSettings: React.FC = () => {
  const {
    assets,
    portfolioStats,
    updateAssetBalance,
    updateAssetPrice,
    updateTotalBalance,
    updatePortfolioStats,
    addAsset,
    removeAsset,
    isSyncingPrices,
    syncPricesWithMarket,
    searchCoin,
    updateAssetAddress
  } = useWallet();

  const [selectedAsset, setSelectedAsset] = useState(assets[0]?.id || '');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetSymbol, setNewAssetSymbol] = useState('');
  const [newAssetBalance, setNewAssetBalance] = useState('');
  const [newAssetPrice, setNewAssetPrice] = useState('');
  const [newAssetChange, setNewAssetChange] = useState('');
  const [newAssetColor, setNewAssetColor] = useState('#3dd598');
  const [newAssetAddress, setNewAssetAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentAsset = assets.find(asset => asset.id === selectedAsset);

  useEffect(() => {
    if (currentAsset) {
      setNewAssetAddress(currentAsset.address || '');
    }
  }, [currentAsset]);

  // Handle updating asset balance
  const handleUpdateBalance = (id: string, newBalance: string) => {
    const balanceValue = parseFloat(newBalance);
    if (!isNaN(balanceValue)) {
      updateAssetBalance(id, balanceValue);
    }
  };

  // Handle updating asset price
  const handleUpdatePrice = (id: string, newPrice: string) => {
    const priceValue = parseFloat(newPrice);
    if (!isNaN(priceValue)) {
      updateAssetPrice(id, priceValue);
    }
  };

  // Handle updating portfolio stats
  const handleUpdateStat = (key: keyof PortfolioStats, value: string) => {
    if (key === 'totalBalance' || key === 'change24h' || key === 'change24hValue' || key === 'highestBalance') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updatePortfolioStats(key, numValue);
      }
    } else if (key === 'portfolioAge' || key === 'assetCount') {
      updatePortfolioStats(key, value);
    } else if (key === 'bestAsset' || key === 'worstAsset') {
      const [name, changeStr] = value.split(',');
      const change = parseFloat(changeStr);
      if (name && !isNaN(change)) {
        updatePortfolioStats(key, { name, change });
      }
    }
  };

  // Handle searching for coins
  const handleSearchCoins = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await searchCoin(searchQuery);
      setSearchResults(result.coins || []);
    } catch (error) {
      console.error('Error searching for coins:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a coin from search results
  const handleSelectCoin = (coin: any) => {
    setSelectedCoin(coin);
    setNewAssetName(coin.name);
    setNewAssetSymbol(coin.symbol.toUpperCase());
    setSearchResults([]);
    setSearchQuery('');

    // Set a random color based on the coin id
    const colors = ['#3dd598', '#5d65f6', '#ff5c5c', '#ffba49', '#4e7cff', '#9c6bff', '#38c6db', '#E6007A'];
    const randomIndex = Math.floor(Math.abs(coin.id.length % colors.length));
    setNewAssetColor(colors[randomIndex]);
  };

  // Handle adding a new asset
  const handleAddAsset = async () => {
    if (!selectedCoin) {
      setErrorMessage('Please search and select a cryptocurrency first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!newAssetBalance || parseFloat(newAssetBalance) <= 0) {
      setErrorMessage('Please enter a valid balance');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!newAssetPrice || parseFloat(newAssetPrice) <= 0) {
      setErrorMessage('Please enter a valid price');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const balance = parseFloat(newAssetBalance);
    const price = parseFloat(newAssetPrice);
    const change = parseFloat(newAssetChange || '0');

    if (!isNaN(balance) && !isNaN(price)) {
      const newAsset: Asset = {
        id: selectedCoin.id,
        name: newAssetName,
        symbol: newAssetSymbol,
        balance,
        price,
        value: balance * price,
        change24h: !isNaN(change) ? change : 0,
        color: newAssetColor,
        icon: selectedCoin.thumb || '/images/btc.png',
        address: newAssetAddress || generateRandomAddress(newAssetSymbol)
      };

      addAsset(newAsset);

      // Show success message
      setSuccessMessage(`${newAssetName} (${newAssetSymbol}) has been added to your wallet`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form
      setSelectedCoin(null);
      setNewAssetName('');
      setNewAssetSymbol('');
      setNewAssetBalance('');
      setNewAssetPrice('');
      setNewAssetChange('');
      setNewAssetAddress('');
    }
  };

  // Generate a random address for a given cryptocurrency symbol
  const generateRandomAddress = (symbol: string) => {
    const prefix = getAddressPrefix(symbol);
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let address = prefix;

    // The remaining length based on typical address length for the given cryptocurrency
    const remainingLength = getAddressLength(symbol) - prefix.length;

    for (let i = 0; i < remainingLength; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return address;
  };

  // Get address prefix based on cryptocurrency
  const getAddressPrefix = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case 'BTC': return '1';
      case 'ETH': case 'ERC20': return '0x';
      case 'SOL': return '';
      case 'ADA': return 'addr1';
      case 'DOGE': return 'D';
      case 'DOT': return '1';
      case 'AVAX': return '0x';
      case 'MATIC': return '0x';
      default: return '0x'; // Default to ERC20-style
    }
  };

  // Get typical address length for a cryptocurrency
  const getAddressLength = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case 'BTC': return 34;
      case 'ETH': case 'ERC20': case 'AVAX': case 'MATIC': return 42;
      case 'SOL': return 44;
      case 'ADA': return 103;
      case 'DOGE': return 34;
      case 'DOT': return 48;
      default: return 42;
    }
  };

  // Handle removing an asset
  const handleRemoveAsset = (id: string) => {
    removeAsset(id);
    if (selectedAsset === id) {
      setSelectedAsset(assets[0]?.id || '');
    }
  };

  // Handle updating asset address
  const handleUpdateAddress = (id: string, address: string) => {
    updateAssetAddress(id, address);
  };

  // Handle syncing prices with market
  const handleSyncPrices = async () => {
    await syncPricesWithMarket();
    setSuccessMessage('Prices have been synced with the market');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="bg-exodus-backgroundLight rounded-xl p-6">
      <h2 className="text-xl font-semibold text-exodus-text mb-6">Wallet Settings</h2>

      {/* Success message */}
      {successMessage && (
        <div className="bg-exodus-green bg-opacity-10 text-exodus-green p-4 rounded-xl mb-6 flex items-center">
          <FiCheck className="w-5 h-5 mr-2" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="bg-exodus-red bg-opacity-10 text-exodus-red p-4 rounded-xl mb-6 flex items-center">
          <FiAlertTriangle className="w-5 h-5 mr-2" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Portfolio stats section */}
        <div className="bg-exodus-background rounded-lg p-4">
          <h3 className="text-lg font-medium text-exodus-text mb-4">Portfolio Stats</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Total Balance ($)</label>
              <input
                type="number"
                value={portfolioStats.totalBalance}
                onChange={(e) => handleUpdateStat('totalBalance', e.target.value)}
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">24h Change (%)</label>
              <input
                type="number"
                value={portfolioStats.change24h}
                onChange={(e) => handleUpdateStat('change24h', e.target.value)}
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">24h Change Value ($)</label>
              <input
                type="number"
                value={portfolioStats.change24hValue}
                onChange={(e) => handleUpdateStat('change24hValue', e.target.value)}
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Highest Balance ($)</label>
              <input
                type="number"
                value={portfolioStats.highestBalance}
                onChange={(e) => handleUpdateStat('highestBalance', e.target.value)}
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Portfolio Age</label>
              <input
                type="text"
                value={portfolioStats.portfolioAge}
                onChange={(e) => handleUpdateStat('portfolioAge', e.target.value)}
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSyncPrices}
              disabled={isSyncingPrices}
              className={`flex items-center justify-center w-full py-3 rounded-md ${
                isSyncingPrices
                  ? 'bg-exodus-accent bg-opacity-50 cursor-not-allowed'
                  : 'bg-exodus-accent hover:bg-opacity-90'
              } text-white transition-colors`}
            >
              {isSyncingPrices ? (
                <>
                  <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing Prices...
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Sync Prices with Market
                </>
              )}
            </button>
          </div>
        </div>

        {/* Asset modification section */}
        <div className="bg-exodus-background rounded-lg p-4">
          <h3 className="text-lg font-medium text-exodus-text mb-4">Modify Assets</h3>

          <div className="mb-4">
            <label className="block text-exodus-textSecondary text-sm mb-1">Select Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
            >
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
          </div>

          {currentAsset && (
            <div className="space-y-4">
              <div>
                <label className="block text-exodus-textSecondary text-sm mb-1">Balance</label>
                <input
                  type="number"
                  value={currentAsset.balance}
                  onChange={(e) => handleUpdateBalance(currentAsset.id, e.target.value)}
                  className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
                />
              </div>

              <div>
                <label className="block text-exodus-textSecondary text-sm mb-1">Price ($)</label>
                <input
                  type="number"
                  value={currentAsset.price}
                  onChange={(e) => handleUpdatePrice(currentAsset.id, e.target.value)}
                  className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
                />
              </div>

              <div>
                <label className="block text-exodus-textSecondary text-sm mb-1">Wallet Address</label>
                <input
                  type="text"
                  value={newAssetAddress}
                  onChange={(e) => setNewAssetAddress(e.target.value)}
                  onBlur={() => handleUpdateAddress(currentAsset.id, newAssetAddress)}
                  className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
                />
              </div>

              <button
                onClick={() => handleRemoveAsset(currentAsset.id)}
                className="bg-exodus-red bg-opacity-20 text-exodus-red px-4 py-2 rounded-md hover:bg-opacity-30 transition-colors"
              >
                Remove Asset
              </button>
            </div>
          )}
        </div>

        {/* Add new asset section */}
        <div className="bg-exodus-background rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-medium text-exodus-text mb-4">Add New Cryptocurrency</h3>

          <div className="mb-6">
            <label className="block text-exodus-textSecondary text-sm mb-1">Search Cryptocurrency</label>
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or symbol..."
                className="flex-1 bg-exodus-backgroundLight rounded-l-md px-3 py-2 text-exodus-text"
              />
              <button
                onClick={handleSearchCoins}
                disabled={isSearching || !searchQuery.trim()}
                className={`px-4 py-2 rounded-r-md ${
                  isSearching || !searchQuery.trim()
                    ? 'bg-exodus-accent bg-opacity-50 cursor-not-allowed'
                    : 'bg-exodus-accent hover:bg-opacity-90'
                } text-white flex items-center`}
              >
                {isSearching ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiSearch className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-exodus-backgroundLight rounded-md overflow-hidden">
                <ul className="max-h-40 overflow-y-auto">
                  {searchResults.map((coin) => (
                    <li
                      key={coin.id}
                      onClick={() => handleSelectCoin(coin)}
                      className="px-3 py-2 hover:bg-exodus-background cursor-pointer flex items-center"
                    >
                      {coin.thumb && (
                        <img src={coin.thumb} alt={coin.name} className="w-5 h-5 mr-2" />
                      )}
                      <span className="text-exodus-text">{coin.name}</span>
                      <span className="text-exodus-textSecondary ml-2 text-xs">({coin.symbol})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {selectedCoin && (
            <div className="p-3 bg-exodus-accent bg-opacity-10 rounded-md mb-4 flex items-center">
              <img src={selectedCoin.thumb} alt={selectedCoin.name} className="w-6 h-6 mr-2" />
              <div>
                <p className="text-exodus-text">{selectedCoin.name}</p>
                <p className="text-exodus-textSecondary text-xs">ID: {selectedCoin.id}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Asset Name</label>
              <input
                type="text"
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
                placeholder="Bitcoin"
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Symbol</label>
              <input
                type="text"
                value={newAssetSymbol}
                onChange={(e) => setNewAssetSymbol(e.target.value)}
                placeholder="BTC"
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Balance</label>
              <input
                type="number"
                value={newAssetBalance}
                onChange={(e) => setNewAssetBalance(e.target.value)}
                placeholder="0.5"
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Price ($)</label>
              <input
                type="number"
                value={newAssetPrice}
                onChange={(e) => setNewAssetPrice(e.target.value)}
                placeholder="50000"
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">24h Change (%)</label>
              <input
                type="number"
                value={newAssetChange}
                onChange={(e) => setNewAssetChange(e.target.value)}
                placeholder="5.2"
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>

            <div>
              <label className="block text-exodus-textSecondary text-sm mb-1">Color</label>
              <input
                type="color"
                value={newAssetColor}
                onChange={(e) => setNewAssetColor(e.target.value)}
                className="w-full h-10 bg-exodus-backgroundLight rounded-md px-1 py-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-exodus-textSecondary text-sm mb-1">Custom Address (Optional)</label>
              <input
                type="text"
                value={newAssetAddress}
                onChange={(e) => setNewAssetAddress(e.target.value)}
                placeholder="Enter wallet address or leave blank for random address"
                className="w-full bg-exodus-backgroundLight rounded-md px-3 py-2 text-exodus-text"
              />
            </div>
          </div>

          <button
            onClick={handleAddAsset}
            disabled={!selectedCoin || !newAssetName || !newAssetSymbol || !newAssetBalance || !newAssetPrice}
            className={`mt-4 px-4 py-2 rounded-md flex items-center ${
              !selectedCoin || !newAssetName || !newAssetSymbol || !newAssetBalance || !newAssetPrice
                ? 'bg-exodus-accent bg-opacity-50 cursor-not-allowed'
                : 'bg-exodus-accent hover:bg-opacity-90'
            } text-white`}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;
