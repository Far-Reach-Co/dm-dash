/**
 * Safely evaluates simple arithmetic expressions containing only numbers and basic operators.
 * Does NOT use eval - parses and evaluates the expression manually.
 *
 * @param {string} expression - A string like "5+3-2" or "10*2/5"
 * @returns {number} The result, or NaN if invalid
 */
export default function safeMathEval(expression) {
  if (typeof expression !== "string" || !expression.length) {
    return NaN;
  }

  // Only allow digits, operators (+, -, *, /), decimal points, and whitespace
  if (!/^[\d+\-*/.\s]+$/.test(expression)) {
    return NaN;
  }

  // Remove whitespace
  expression = expression.replace(/\s/g, "");

  // Tokenize: split into numbers and operators
  const tokens = [];
  let currentNumber = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (/[\d.]/.test(char)) {
      currentNumber += char;
    } else if (/[+\-*/]/.test(char)) {
      // Handle negative numbers at start or after another operator
      if (char === "-" && (currentNumber === "" && tokens.length === 0 || tokens[tokens.length - 1]?.type === "operator")) {
        currentNumber += char;
      } else {
        if (currentNumber !== "") {
          tokens.push({ type: "number", value: parseFloat(currentNumber) });
          currentNumber = "";
        }
        tokens.push({ type: "operator", value: char });
      }
    }
  }

  // Push the last number
  if (currentNumber !== "") {
    tokens.push({ type: "number", value: parseFloat(currentNumber) });
  }

  // Validate tokens: should alternate between number and operator, starting and ending with number
  if (tokens.length === 0) return NaN;
  if (tokens[0].type !== "number" || tokens[tokens.length - 1].type !== "number") {
    return NaN;
  }

  // Check for any NaN numbers
  if (tokens.some((t) => t.type === "number" && isNaN(t.value))) {
    return NaN;
  }

  // First pass: handle * and /
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].type === "operator" && (tokens[i].value === "*" || tokens[i].value === "/")) {
      const left = tokens[i - 1].value;
      const right = tokens[i + 1].value;
      const result = tokens[i].value === "*" ? left * right : left / right;
      tokens.splice(i - 1, 3, { type: "number", value: result });
      i = i - 1;
    } else {
      i++;
    }
  }

  // Second pass: handle + and -
  let result = tokens[0].value;
  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i].value;
    const operand = tokens[i + 1].value;
    if (operator === "+") {
      result += operand;
    } else if (operator === "-") {
      result -= operand;
    }
  }

  return result;
}
