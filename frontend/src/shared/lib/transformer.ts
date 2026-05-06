/**
 * Arteo Standard Protocol (FSP) - Frontend Transformer
 * Shared utility for bidirectional case conversion (camelCase <-> snake_case)
 */

/**
 * Convert string from camelCase to snake_case
 */
export const toSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Convert string from snake_case to camelCase
 */
export const toCamel = (str: string): string => {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

/**
 * Recursively convert object keys to snake_case
 * Handles Nested Objects, Arrays, and FormData
 */
export const toSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof File || obj instanceof Blob) {
    return obj;
  }

  if (obj instanceof FormData) {
    const newFormData = new FormData();
    obj.forEach((value, key) => {
      newFormData.append(toSnake(key), value);
    });
    return newFormData;
  }

  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  }

  return Object.keys(obj).reduce((acc: any, key: string) => {
    const snakeKey = toSnake(key);
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {});
};

/**
 * Recursively convert object keys to camelCase
 */
export const toCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof File || obj instanceof Blob) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  }

  return Object.keys(obj).reduce((acc: any, key: string) => {
    const camelKey = toCamel(key);
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

