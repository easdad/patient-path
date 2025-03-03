'use client';

import { useState } from 'react';
import AccountTypeOption from './AccountTypeOption';
import AmbulanceIcon from './AmbulanceIcon';

interface AccountTypeSelectorProps {
  onSelectionChange?: (selectedType: string | null) => void;
}

export default function AccountTypeSelector({ onSelectionChange }: AccountTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelect = (type: string, selected: boolean) => {
    // If this option is being selected, deselect the other one
    if (selected) {
      setSelectedType(type);
      if (onSelectionChange) {
        onSelectionChange(type);
      }
    } else if (selectedType === type) {
      // If this option is being deselected, clear the selection
      setSelectedType(null);
      if (onSelectionChange) {
        onSelectionChange(null);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AccountTypeOption 
        type="hospital"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        label="Hospital"
        color="purple"
        onSelect={(type, selected) => handleSelect(type, selected)}
        isSelected={selectedType === 'hospital'}
      />
      <AccountTypeOption 
        type="ambulance"
        icon={<AmbulanceIcon className="h-6 w-6 text-[#00CED1]" />}
        label="Ambulance Service"
        color="blue"
        onSelect={(type, selected) => handleSelect(type, selected)}
        isSelected={selectedType === 'ambulance'}
      />
    </div>
  );
} 