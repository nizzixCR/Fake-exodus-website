import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useWallet } from '../../context/WalletContext';

interface TimeRange {
  id: string;
  label: string;
}

const PortfolioChart: React.FC = () => {
  const { portfolioStats } = useWallet();

  const [selectedRange, setSelectedRange] = useState('NOW');

  const timeRanges: TimeRange[] = [
    { id: 'NOW', label: 'NOW' },
    { id: '1M', label: '1M' },
    { id: '6M', label: '6M' },
    { id: '1Y', label: '1Y' },
    { id: 'ALL', label: 'ALL' },
  ];

  // Stats displayed under the chart
  const statsItems = [
    {
      label: '24h Change',
      value: `$${portfolioStats.change24hValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      isPositive: portfolioStats.change24hValue > 0
    },
    {
      label: 'Highest Balance',
      value: `$${portfolioStats.highestBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      isPositive: true
    },
    {
      label: 'Portfolio Age',
      value: portfolioStats.portfolioAge,
      isPositive: true
    },
    {
      label: 'Best 24H Asset',
      value: `${portfolioStats.bestAsset.name} +${portfolioStats.bestAsset.change}%`,
      isPositive: true
    },
    {
      label: 'Worst 24H Asset',
      value: `${portfolioStats.worstAsset.name} ${portfolioStats.worstAsset.change}%`,
      isPositive: false
    },
  ];

  return (
    <div className="bg-exodus-backgroundLight p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-exodus-text">Portfolio</h2>
        <div className="flex space-x-1 bg-exodus-background rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedRange === range.id
                  ? 'bg-exodus-accent text-white'
                  : 'text-exodus-textSecondary hover:text-exodus-text'
              }`}
              onClick={() => setSelectedRange(range.id)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center my-8">
        <div className="relative">
          {/* Circular chart background */}
          <div className="w-64 h-64 crypto-chart-gradient rounded-full"></div>

          {/* Inner circle with value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-48 h-48 bg-exodus-backgroundLight rounded-full flex flex-col items-center justify-center">
              <h3 className="text-3xl font-bold text-exodus-text">
                ${portfolioStats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-exodus-textSecondary text-sm mt-1">
                {portfolioStats.assetCount} Assets
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mt-8">
        {statsItems.map((item, index) => (
          <div key={index} className="text-center">
            <h4 className="text-exodus-textSecondary text-xs mb-1">{item.label}</h4>
            <p className={`text-sm font-medium ${item.isPositive ? 'text-exodus-green' : 'text-exodus-red'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioChart;
