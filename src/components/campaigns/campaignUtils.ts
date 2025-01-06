export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'stopped':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};