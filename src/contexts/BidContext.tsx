import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BidItem } from '../types/bid';

interface BidContextType {
  selectedBid: BidItem | null;
  setSelectedBid: (bid: BidItem | null) => void;
}

const BidContext = createContext<BidContextType | undefined>(undefined);

export const useBid = () => {
  const context = useContext(BidContext);
  if (context === undefined) {
    throw new Error('useBid must be used within a BidProvider');
  }
  return context;
};

interface BidProviderProps {
  children: ReactNode;
}

export const BidProvider: React.FC<BidProviderProps> = ({ children }) => {
  const [selectedBid, setSelectedBid] = useState<BidItem | null>(null);

  return (
    <BidContext.Provider value={{ selectedBid, setSelectedBid }}>
      {children}
    </BidContext.Provider>
  );
};
