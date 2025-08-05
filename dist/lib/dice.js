"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiceRollResponse = void 0;
function calculateDiceRollResponse(input) {
    input = input.trim().toLowerCase();
    const amountOfDice = parseInt(input.split("d", 2)[0].trim());
    let diceSides = input.split("d", 2)[1];
    if (diceSides.includes("+")) {
        diceSides = diceSides.split("+", 2)[0].trim();
    }
    diceSides = parseInt(diceSides);
    let modifiers;
    if (input.includes("+")) {
        modifiers = input.split("+");
        modifiers.shift();
        for (var i = 0; i < modifiers.length; i++) {
            modifiers[i] = parseInt(modifiers[i]);
        }
    }
    let diceRolls = [];
    for (var i = 0; i < amountOfDice; i++) {
        const newValue = Math.floor(Math.random() * diceSides + 1);
        diceRolls.push(newValue);
    }
    let total = 0;
    for (var i = 0; i < diceRolls.length; i++) {
        total += diceRolls[i];
    }
    if (modifiers) {
        for (var i = 0; i < modifiers.length; i++) {
            total += modifiers[i];
        }
    }
    let responseInfo = "";
    responseInfo += `"/roll" Input: ${input}`;
    diceRolls.forEach((roll, index) => {
        let diceInfoString = `\nRoll ${index + 1}: ${roll}`;
        if (roll === diceSides)
            diceInfoString += " - *CRITICAL*";
        responseInfo += diceInfoString;
    });
    responseInfo += `\nTOTAL = ${total}`;
    return responseInfo;
}
exports.calculateDiceRollResponse = calculateDiceRollResponse;
