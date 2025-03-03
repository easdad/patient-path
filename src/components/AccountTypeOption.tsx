'use client';

import { useState, useEffect } from 'react';

interface AccountTypeOptionProps {
  type: 'hospital' | 'ambulance';
  icon: React.ReactNode;
  label: string;
  color: string;
  onSelect?: (type: string, selected: boolean) => void;
  isSelected?: boolean;
}

export default function AccountTypeOption({ 
  type, 
  icon, 
  label, 
  color, 
  onSelect,
  isSelected: controlledIsSelected 
}: AccountTypeOptionProps) {
  const [internalSelected, setInternalSelected] = useState(false);
  
  // If component is controlled externally, update internal state
  useEffect(() => {
    if (controlledIsSelected !== undefined) {
      setInternalSelected(controlledIsSelected);
    }
  }, [controlledIsSelected]);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledIsSelected !== undefined;
  const selected = isControlled ? controlledIsSelected : internalSelected;
  
  const baseClasses = "border rounded-lg p-4 cursor-pointer transition-all duration-200";
  const selectedClasses = {
    hospital: "border-purple-500 bg-purple-50 shadow-md",
    ambulance: "border-blue-500 bg-blue-50 shadow-md"
  };
  const hoverClasses = {
    hospital: "hover:border-purple-500 hover:bg-purple-50",
    ambulance: "hover:border-blue-500 hover:bg-blue-50"
  };
  
  const handleClick = () => {
    const newSelected = !selected;
    
    // Only update internal state if uncontrolled
    if (!isControlled) {
      setInternalSelected(newSelected);
    }
    
    if (onSelect) {
      onSelect(type, newSelected);
    }
  };
  
  return (
    <div 
      className={`${baseClasses} ${selected ? selectedClasses[type] : `border-gray-200 ${hoverClasses[type]}`}`}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center">
        <div className={`bg-${color}-100 p-2 rounded-full mb-2`}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
} 