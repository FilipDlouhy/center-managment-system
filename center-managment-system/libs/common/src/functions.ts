function generateRandomId() {
  const min = 1;
  const max = 99999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function transformToCamelCase(url) {
  const parts = url.split('/');
  const cammelCasedString = kebabToCamel(parts[2]);
  let number = null;
  if (parts.length > 3) {
    number = isNumeric(parts[3]) ? parseInt(parts[3]) : null;
  }
  return {
    camelCasedString: cammelCasedString,
    number: number,
  };
}

function isNumeric(str) {
  return /^\d+$/.test(str);
}
function kebabToCamel(kebabString) {
  return kebabString.replace(/-([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}

export { generateRandomId, transformToCamelCase };
