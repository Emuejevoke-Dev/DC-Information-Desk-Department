import React from 'react';
import { InformationHandbookModule } from './InformationHandbookModule';

interface ChurchInformationHandbookModuleProps {
  initialSubTab?: 'handbook' | 'cells' | 'satellites';
}

export const ChurchInformationHandbookModule: React.FC<ChurchInformationHandbookModuleProps> = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <InformationHandbookModule />
    </div>
  );
};
