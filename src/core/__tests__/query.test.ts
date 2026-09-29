import { query } from '../query';

const doc = JSON.stringify({
  store: {
    books: [
      { title: 'A', price: 5 },
      { title: 'B', price: 15 },
    ],
    bike: { price: 20 },
  },
});

describe('query (FR-09)', () => {
  it('selects by path', () => {
    expect(query(doc, '$.store.books[*].title')).toEqual(['A', 'B']);
  });
  it('supports recursive descent', () => {
    expect(query(doc, '$..price')).toEqual([5, 15, 20]);
  });
  it('supports filters in safe mode', () => {
    expect(query(doc, '$.store.books[?(@.price > 10)].title')).toEqual(['B']);
  });
  it('returns empty for no match', () => {
    expect(query(doc, '$.nothing')).toEqual([]);
  });
  it('rejects empty expressions', () => {
    expect(() => query(doc, ' ')).toThrow('JSONPath expression is empty');
  });
});
