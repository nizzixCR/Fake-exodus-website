// This service will handle API calls to get real-time crypto data
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  image: string;
  price_change_percentage_24h: number;
}

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
}

class CryptoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  // Get a list of all available cryptocurrencies
  async getCryptoCurrencies(): Promise<CryptoCurrency[]> {
    try {
      const response = await fetch(`${this.baseUrl}/coins/list`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
      return [];
    }
  }

  // Get current prices for multiple cryptocurrencies at once
  async getPrices(coinIds: string[], currency = 'usd'): Promise<Record<string, { usd: number, usd_24h_change?: number }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${currency}&include_24hr_change=true`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
    }
  }

  // Get detailed market data for a list of cryptocurrencies
  async getMarketData(
    coinIds: string[],
    currency = 'usd',
    perPage = 50,
    page = 1
  ): Promise<CryptoPrice[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=${currency}&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  // Get market data for top cryptocurrencies
  async getTopCoins(
    currency = 'usd',
    perPage = 100,
    page = 1
  ): Promise<CryptoPrice[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching top coins:', error);
      return [];
    }
  }

  // Search for cryptocurrencies by name, symbol, or ID
  async searchCoins(query: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching coins:', error);
      return { coins: [] };
    }
  }

  // Generate a QR code for a given address
  generateQRCode(address: string, size = 200): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(address)}`;
  }
}

export const cryptoService = new CryptoService();
export default cryptoService;
