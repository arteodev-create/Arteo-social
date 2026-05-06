import '@testing-library/jest-dom';

const { TextDecoder, TextEncoder } = require('util');

Object.assign(global, {
  TextDecoder,
  TextEncoder,
});
