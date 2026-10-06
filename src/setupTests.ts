import '@testing-library/jest-dom';
import {TextDecoder, TextEncoder} from 'node:util';

// jsdom does not provide these, but react-router needs them
Object.assign(globalThis, { TextEncoder, TextDecoder });
