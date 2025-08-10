export const formatNumber = (n) => {
  if (typeof n !== 'number') return n;
  return n.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

export const formatCurrency = (n) => {
  if (typeof n !== 'number') return n;
  return `₹ ${n.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};
