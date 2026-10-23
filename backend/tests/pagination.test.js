const { parsePagination } = require('../utils/pagination');

describe('parsePagination', () => {
  it('defaults to page 1 and limit 20', () => {
    expect(parsePagination()).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('caps the requested limit at 100', () => {
    expect(parsePagination({ page: '3', limit: '500' })).toEqual({
      page: 3,
      limit: 100,
      skip: 200,
    });
  });

  it.each([
    { page: '0' },
    { page: '-1' },
    { page: 'abc' },
    { page: '1.5' },
    { page: '9007199254740992' },
    { limit: '0' },
    { limit: '-4' },
    { limit: 'abc' },
    { limit: '1.2' },
    { page: '9007199254740991', limit: '100' },
  ])('returns null for invalid query values: %j', (query) => {
    expect(parsePagination(query)).toBeNull();
  });
});
