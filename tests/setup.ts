/**
 * Jest setup file for configuring test environment
 */
import '@testing-library/jest-dom'
import 'whatwg-fetch';
import { ReadableStream } from 'web-streams-polyfill';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill web streams for Node.js test environment
global.ReadableStream = ReadableStream as any;

// Use Node.js native TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

// Mock Next.js server components for tests
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: any, init?: any) => {
      const response = {
        json: async () => body,
        status: init?.status || 200,
        headers: new Headers(init?.headers || {}),
      };
      return response;
    },
  },
}));
