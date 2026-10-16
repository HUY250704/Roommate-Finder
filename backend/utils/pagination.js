const parsePagination = (query = {}) => {
  if (
    (query.page !== undefined && (typeof query.page !== 'string' || !/^\d+$/.test(query.page))) ||
    (query.limit !== undefined && (typeof query.limit !== 'string' || !/^\d+$/.test(query.limit)))
  ) {
    return null;
  }

  const page = query.page === undefined ? 1 : Number(query.page);
  const requestedLimit = query.limit === undefined ? 20 : Number(query.limit);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(requestedLimit) ||
    requestedLimit < 1
  ) {
    return null;
  }

  const limit = Math.min(requestedLimit, 100);
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) return null;

  return { page, limit, skip };
};

module.exports = { parsePagination };
