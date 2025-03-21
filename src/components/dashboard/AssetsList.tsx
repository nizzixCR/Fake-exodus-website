import React, { useState } from 'react';
import { FiArrowUpRight, FiArrowDownRight, FiSearch, FiFilter } from 'react-icons/fi';
import { useWallet } from '../../context/WalletContext';

const AssetsList: React.FC = () => {
  const { assets } = useWallet();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'price' | 'change'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort assets
  const filteredAssets = assets
    .filter(asset =>
      asset.name.toLowerCase().includes(filter.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.change24h - b.change24h;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (column: 'name' | 'value' | 'price' | 'change') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-exodus-backgroundLight rounded-xl">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-exodus-text">Assets</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search assets..."
                className="pl-9 pr-4 py-2 bg-exodus-background rounded-lg text-exodus-text text-sm focus:outline-none focus:ring-1 focus:ring-exodus-accent"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-exodus-textSecondary" />
            </div>
            <button className="p-2 bg-exodus-background rounded-lg text-exodus-textSecondary hover:text-exodus-text">
              <FiFilter />
            </button>
          </div>
        </div>

        <div className="flex text-exodus-textSecondary text-xs">
          <div className="w-1/6 p-2">
            <button
              className="flex items-center hover:text-exodus-text"
              onClick={() => handleSort('name')}
            >
              ASSET NAME
              {sortBy === 'name' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          </div>
          <div className="w-2/6 p-2"></div>
          <div className="w-1/6 p-2">
            <button
              className="hover:text-exodus-text"
              onClick={() => handleSort('price')}
            >
              PRICE
              {sortBy === 'price' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          </div>
          <div className="w-1/6 p-2">
            <button
              className="hover:text-exodus-text"
              onClick={() => handleSort('change')}
            >
              24H CHANGE
              {sortBy === 'change' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          </div>
          <div className="w-1/6 p-2 text-right">
            <button
              className="hover:text-exodus-text"
              onClick={() => handleSort('value')}
            >
              VALUE
              {sortBy === 'value' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-80">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center p-4 hover:bg-exodus-background transition-colors border-b border-gray-800 last:border-b-0"
          >
            <div className="w-1/6">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${asset.color}30` }}
                >
                  <img src={asset.icon} alt={asset.name} className="w-5 h-5" />
                </div>
                <span className="font-medium text-exodus-text">{asset.name}</span>
              </div>
            </div>
            <div className="w-2/6 text-sm text-exodus-textSecondary">
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 h-1 rounded-full overflow-hidden mr-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, asset.change24h * 2 + 50)}%`,
                      backgroundColor: asset.change24h >= 0 ? '#3dd598' : '#ff5c5c'
                    }}
                  ></div>
                </div>
                <span>{asset.balance} {asset.symbol}</span>
              </div>
            </div>
            <div className="w-1/6 text-exodus-text">
              ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
            </div>
            <div className="w-1/6">
              <span className={`flex items-center ${asset.change24h >= 0 ? 'text-exodus-green' : 'text-exodus-red'}`}>
                {asset.change24h >= 0 ?
                  <FiArrowUpRight className="mr-1" /> :
                  <FiArrowDownRight className="mr-1" />
                }
                {Math.abs(asset.change24h)}%
              </span>
            </div>
            <div className="w-1/6 text-right text-exodus-text font-medium">
              ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsList;
