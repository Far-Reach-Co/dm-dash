export function calculateDiceRollResponse(input: string) {
  // INIT Input and clean
  input = input.trim().toLowerCase();

  // get amount of dice
  const amountOfDice = parseInt(input.split("d", 2)[0].trim());
  // get dice sides
  let diceSides: any = input.split("d", 2)[1];
  if (diceSides.includes("+")) {
    diceSides = diceSides.split("+", 2)[0].trim();
  }
  diceSides = parseInt(diceSides);
  // get modifiers
  let modifiers: any;
  if (input.includes("+")) {
    modifiers = input.split("+");
    modifiers.shift();
    for (var i = 0; i < modifiers.length; i++) {
      modifiers[i] = parseInt(modifiers[i]);
    }
  }
  // get dice rolls
  let diceRolls = [];
  for (var i = 0; i < amountOfDice; i++) {
    const newValue = Math.floor(Math.random() * diceSides + 1);
    diceRolls.push(newValue);
  }

  // CALCULATE TOTAL
  // Add modifiers
  let total = 0; // ******************** TOTAL ******************************
  for (var i = 0; i < diceRolls.length; i++) {
    total += diceRolls[i];
  }
  if (modifiers) {
    for (var i = 0; i < modifiers.length; i++) {
      total += modifiers[i];
    }
  }
  // Display Information
  let responseInfo = "";
  responseInfo += `"/roll" Input: ${input}`;
  diceRolls.forEach((roll, index) => {
    let diceInfoString = `\nRoll ${index + 1}: ${roll}`;
    if (roll === diceSides) diceInfoString += " - *CRITICAL*";
    responseInfo += diceInfoString;
  });
  responseInfo += `\nTOTAL = ${total}`;
  return responseInfo;
}
