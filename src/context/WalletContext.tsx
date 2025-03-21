import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import cryptoService, { CryptoPrice } from '../services/CryptoService';

// Types for our assets
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  color: string;
  icon: string;
  address?: string; // Add an optional address field for receiving funds
}

// Types for our portfolio statistics
export interface PortfolioStats {
  totalBalance: number;
  change24h: number;
  change24hValue: number;
  highestBalance: number;
  portfolioAge: string;
  bestAsset: {
    name: string;
    change: number;
  };
  worstAsset: {
    name: string;
    change: number;
  };
  assetCount: number;
}

// Types for our wallet context
interface WalletContextType {
  assets: Asset[];
  portfolioStats: PortfolioStats;
  updateAssetBalance: (id: string, newBalance: number) => void;
  updateAssetPrice: (id: string, newPrice: number) => void;
  updateTotalBalance: (newBalance: number) => void;
  updatePortfolioStats: (key: keyof PortfolioStats, value: unknown) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  isSyncingPrices: boolean;
  syncPricesWithMarket: () => Promise<void>;
  searchCoin: (query: string) => Promise<any>;
  availableCryptos: { id: string; name: string; symbol: string }[];
  fetchAvailableCryptos: () => Promise<void>;
  updateAssetAddress: (id: string, address: string) => void;
  getQRCodeUrl: (address: string) => string;
}

// Create the context with default values
const WalletContext = createContext<WalletContextType>({
  assets: [],
  portfolioStats: {
    totalBalance: 0,
    change24h: 0,
    change24hValue: 0,
    highestBalance: 0,
    portfolioAge: '',
    bestAsset: { name: '', change: 0 },
    worstAsset: { name: '', change: 0 },
    assetCount: 0
  },
  updateAssetBalance: () => {},
  updateAssetPrice: () => {},
  updateTotalBalance: () => {},
  updatePortfolioStats: () => {},
  addAsset: () => {},
  removeAsset: () => {},
  isSyncingPrices: false,
  syncPricesWithMarket: async () => {},
  searchCoin: async () => ({}),
  availableCryptos: [],
  fetchAvailableCryptos: async () => {},
  updateAssetAddress: () => {},
  getQRCodeUrl: () => ''
});

// Sample data for our mock wallet
const initialAssets: Asset[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    balance: 0.37,
    price: 65300,
    value: 24161,
    change24h: 12.89,
    color: '#F7931A',
    icon: '/images/btc.png',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: 4.21,
    price: 3520,
    value: 14819.2,
    change24h: 3.45,
    color: '#627EEA',
    icon: '/images/eth.png',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    balance: 105.42,
    price: 143,
    value: 15075.06,
    change24h: -1.25,
    color: '#14F195',
    icon: '/images/sol.png',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    balance: 12500,
    price: 0.52,
    value: 6500,
    change24h: 0.78,
    color: '#0033AD',
    icon: '/images/ada.png',
    address: 'addr1q9jxsfd87g4u4cp42qajgqtj294w5mzj4wgxl6x6zpt77k5ynuyyc4cj5njdjuq3acag3fdj2xrxe67gwc26rggmj3psvxmzaa'
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    balance: 35200,
    price: 0.16,
    value: 5632,
    change24h: 8.23,
    color: '#C2A633',
    icon: '/images/doge.png',
    address: 'DFundmtrigzA6E25Swr2pRe4Eb79bGP8G1'
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    balance: 837,
    price: 7.82,
    value: 6545.34,
    change24h: -0.45,
    color: '#E6007A',
    icon: '/images/dot.png',
    address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    balance: 425,
    price: 15.92,
    value: 6766,
    change24h: 2.34,
    color: '#2A5ADA',
    icon: '/images/link.png',
    address: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520'
  },
  {
    id: 'avalanche-2',
    name: 'Avalanche',
    symbol: 'AVAX',
    balance: 212,
    price: 38.75,
    value: 8215,
    change24h: 4.52,
    color: '#E84142',
    icon: '/images/avax.png',
    address: '0x4A30a358A237E95930672D7944503B409973A28a'
  },
  {
    id: 'matic-network',
    name: 'Polygon',
    symbol: 'MATIC',
    balance: 8450,
    price: 0.78,
    value: 6591,
    change24h: 1.23,
    color: '#8247E5',
    icon: '/images/matic.png',
    address: '0x6a0B3899B6a65DeF39A195F4Bc395EF31394fa61'
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    symbol: 'UNI',
    balance: 980,
    price: 9.84,
    value: 9643.2,
    change24h: -0.87,
    color: '#FF007A',
    icon: '/images/uni.png',
    address: '0xFAD3fb3246644C5D6c7adf310E31eaDF7dFc2f7c'
  }
];

// Initial portfolio stats
const initialPortfolioStats: PortfolioStats = {
  totalBalance: 15084.59,
  change24h: 7.6,
  change24hValue: 2930.03,
  highestBalance: 17839.82,
  portfolioAge: '2 Year, 3 Month, 30 Days',
  bestAsset: { name: 'Bitcoin', change: 12.89 },
  worstAsset: { name: 'Solana', change: -1.25 },
  assetCount: 10
};

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    // Try to load assets from localStorage on initial load
    const savedAssets = localStorage.getItem('walletAssets');
    return savedAssets ? JSON.parse(savedAssets) : initialAssets;
  });

  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>(() => {
    // Try to load portfolio stats from localStorage on initial load
    const savedStats = localStorage.getItem('portfolioStats');
    return savedStats ? JSON.parse(savedStats) : initialPortfolioStats;
  });

  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [availableCryptos, setAvailableCryptos] = useState<{ id: string; name: string; symbol: string }[]>([]);

  // Save assets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('walletAssets', JSON.stringify(assets));
  }, [assets]);

  // Save portfolio stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('portfolioStats', JSON.stringify(portfolioStats));
  }, [portfolioStats]);

  // Calculate total value whenever assets change
  useEffect(() => {
    const total = assets.reduce((acc, asset) => acc + asset.value, 0);
    setPortfolioStats(prev => ({
      ...prev,
      totalBalance: parseFloat(total.toFixed(2)),
      assetCount: assets.length
    }));

    // Also find the best and worst performing assets
    if (assets.length > 0) {
      const sorted = [...assets].sort((a, b) => b.change24h - a.change24h);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];

      setPortfolioStats(prev => ({
        ...prev,
        bestAsset: { name: best.name, change: best.change24h },
        worstAsset: { name: worst.name, change: worst.change24h }
      }));
    }
  }, [assets]);

  // Fetch available cryptocurrencies
  const fetchAvailableCryptos = async () => {
    const cryptos = await cryptoService.getCryptoCurrencies();
    setAvailableCryptos(cryptos);
  };

  // Update asset balance and recalculate value
  const updateAssetBalance = (id: string, newBalance: number) => {
    setAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === id
          ? {
              ...asset,
              balance: newBalance,
              value: parseFloat((newBalance * asset.price).toFixed(2))
            }
          : asset
      )
    );
  };

  // Update asset price and recalculate value
  const updateAssetPrice = (id: string, newPrice: number) => {
    setAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === id
          ? {
              ...asset,
              price: newPrice,
              value: parseFloat((asset.balance * newPrice).toFixed(2))
            }
          : asset
      )
    );
  };

  // Update asset address
  const updateAssetAddress = (id: string, address: string) => {
    setAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === id
          ? {
              ...asset,
              address: address
            }
          : asset
      )
    );
  };

  // Update total balance directly
  const updateTotalBalance = (newBalance: number) => {
    setPortfolioStats(prev => ({
      ...prev,
      totalBalance: newBalance
    }));
  };

  // Update any portfolio stat
  const updatePortfolioStats = (key: keyof PortfolioStats, value: unknown) => {
    setPortfolioStats(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Add a new asset
  const addAsset = (asset: Asset) => {
    // Check if asset with this ID already exists
    const existingAsset = assets.find(a => a.id === asset.id);
    if (existingAsset) {
      // Update existing asset instead of adding a new one
      setAssets(prev =>
        prev.map(a =>
          a.id === asset.id
            ? { ...a, balance: a.balance + asset.balance, value: a.value + asset.value }
            : a
        )
      );
    } else {
      setAssets(prev => [...prev, asset]);
    }
  };

  // Remove an asset
  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  // Function to sync prices with market data
  const syncPricesWithMarket = async () => {
    if (assets.length === 0) return;

    setIsSyncingPrices(true);

    try {
      // Get all asset IDs
      const coinIds = assets.map(asset => asset.id);

      // Get current prices from CoinGecko
      const priceData = await cryptoService.getPrices(coinIds);

      // Update assets with new prices
      const updatedAssets = assets.map(asset => {
        const marketData = priceData[asset.id];

        if (marketData) {
          const newPrice = marketData.usd;
          const newChange = marketData.usd_24h_change || 0;
          const newValue = asset.balance * newPrice;

          return {
            ...asset,
            price: newPrice,
            change24h: parseFloat(newChange.toFixed(2)),
            value: parseFloat(newValue.toFixed(2))
          };
        }

        return asset;
      });

      setAssets(updatedAssets);

      // Calculate new 24h change value
      const oldTotal = portfolioStats.totalBalance;
      const newTotal = updatedAssets.reduce((acc, asset) => acc + asset.value, 0);
      const changeValue = newTotal - oldTotal;
      const changePercent = (changeValue / oldTotal) * 100;

      setPortfolioStats(prev => ({
        ...prev,
        totalBalance: parseFloat(newTotal.toFixed(2)),
        change24h: parseFloat(changePercent.toFixed(2)),
        change24hValue: parseFloat(changeValue.toFixed(2))
      }));
    } catch (error) {
      console.error('Error syncing prices with market:', error);
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // Search for coins
  const searchCoin = async (query: string) => {
    if (!query.trim()) return { coins: [] };
    return await cryptoService.searchCoins(query);
  };

  // Function to get QR code URL
  const getQRCodeUrl = (address: string) => {
    return cryptoService.generateQRCode(address);
  };

  return (
    <WalletContext.Provider
      value={{
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
        availableCryptos,
        fetchAvailableCryptos,
        updateAssetAddress,
        getQRCodeUrl
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);
