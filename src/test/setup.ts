import '@testing-library/jest-dom/vitest';

// jsdom has no layout engine; CodeMirror measures text ranges, so provide empty geometry.
const emptyRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
const emptyRect = () => new DOMRect(0, 0, 0, 0);
Range.prototype.getClientRects = emptyRects;
Range.prototype.getBoundingClientRect = emptyRect;
