import React from 'react';
import { Filter } from 'lucide-react';

interface AlertFiltersProps {
  onFilterChange: (filters: {
    type: string;
    status: string;
  }) => void;
}

export default function AlertFilters({ onFilterChange }: AlertFiltersProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      type: e.target.value,
      status: 'all'
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      type: 'all',
      status: e.target.value
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          onChange={handleTypeChange}
        >
          <option value="all">All types</option>
          <option value="LOW_LEVEL">Low level</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="EMERGENCY">Emergency</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <select
          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          onChange={handleStatusChange}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
    </div>
  );
} 