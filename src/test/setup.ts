/**
 * Test setup file
 *
 * Configures testing-library and jest-dom matchers.
 */

import '@testing-library/jest-dom/vitest';

// Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:mock-url';
}

if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = () => {};
}
