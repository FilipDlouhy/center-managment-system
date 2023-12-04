function generateRandomId() {
  const min = 1;
  const max = 99999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function transformToCamelCase(inputString) {
  // First, extract the number if present
  const numberMatch = inputString.match(/\/(\d+)$/);
  const number = numberMatch ? numberMatch[1] : null;

  // Camel case the string part
  const stringPart = inputString.replace(/\/\d+$/, ''); // Remove the number part
  const camelCasedString = stringPart.replace(
    /-([a-z])/g,
    function (match, letter) {
      return letter.toUpperCase();
    },
  );

  // Return both the camelCased string and the extracted number (if any)
  return { camelCasedString, number };
}

export { generateRandomId, transformToCamelCase };
