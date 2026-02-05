exports.calculateTotalPrice = (startDate, endDate, pricePerDay) => {
  const days =
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
  return days * pricePerDay;
};