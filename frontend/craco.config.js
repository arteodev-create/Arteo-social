const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@constants': path.resolve(__dirname, 'src/constants')
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^react-router-dom$': '<rootDir>/node_modules/react-router-dom/dist/index.js',
        '^react-router/dom$': '<rootDir>/node_modules/react-router/dist/development/dom-export.js',
        '^react-router$': '<rootDir>/node_modules/react-router/dist/development/index.js',
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
        '^@features/(.*)$': '<rootDir>/src/features/$1',
        '^@entities/(.*)$': '<rootDir>/src/entities/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@constants/(.*)$': '<rootDir>/src/constants/$1'
      }
    }
  }
};
