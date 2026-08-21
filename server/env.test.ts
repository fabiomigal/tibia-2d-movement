import { describe, it, expect } from 'vitest';

describe('Environment Variables', () => {
  it('should have VITE_APP_TITLE set to expansion title', () => {
    expect(process.env.VITE_APP_TITLE).toBe('Vale de Âmbar - Expansão');
  });
});
