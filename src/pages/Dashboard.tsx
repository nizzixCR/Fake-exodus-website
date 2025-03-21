import React from 'react';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import AssetsList from '../components/dashboard/AssetsList';
import DisclaimerBanner from '../components/ui/DisclaimerBanner';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <DisclaimerBanner />
      <PortfolioChart />
      <AssetsList />
    </div>
  );
};

export default Dashboard;
