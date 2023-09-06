export default async function discordCommands(slashCommandName: string) {
  switch (slashCommandName) {
    case "help":
      return {
        name: "help",
        description: "Returns help info",
        type: 1,
        options: [],
      };
    case "character_sheet":
      return {
        name: "cs",
        description: "Get and edit details for your character sheets",
        type: 1,
        options: [
          {
            name: "list",
            description: "Show a list of your registered character sheets",
            type: 1,
          },
          {
            name: "get",
            description: "Show specific details on your character sheet",
            type: 1,
            options: [
              {
                name: "id",
                description:
                  "Enter the ID of the character sheet you want to access",
                type: 3,
                required: true,
              },
              {
                name: "details",
                description: "Choose the info you would like to view",
                type: 3,
                required: true,
                choices: [
                  {
                    name: "General Info",
                    value: "general-info",
                  },
                  {
                    name: "Saving Throws",
                    value: "saving-throws",
                  },
                  {
                    name: "Skills",
                    value: "skills",
                  },
                  {
                    name: "Other Proficiencies & Languages",
                    value: "other-proficiencies-and-languages",
                  },
                  {
                    name: "Death Saves",
                    value: "death-saves",
                  },
                  {
                    name: "Equipment",
                    value: "equipment",
                  },
                  {
                    name: "Currency",
                    value: "currency",
                  },
                  {
                    name: "Attacks & Spellcasting",
                    value: "attacks-and-spellcasting",
                  },
                  {
                    name: "Feats & Traits",
                    value: "feats-and-traits",
                  },
                  {
                    name: "Background",
                    value: "background",
                  },
                ],
              },
            ],
          },
          {
            name: "spells",
            description: "Show a list of spells from your character sheet",
            type: 1,
            options: [
              {
                name: "id",
                description:
                  "Enter the ID of the character sheet you want to access",
                type: 3,
                required: true,
              },
              {
                name: "type",
                description: "Choose the type of spells",
                type: 3,
                required: true,
                choices: [
                  {
                    name: "Cantrips",
                    value: "cantrips",
                  },
                  {
                    name: "First Level",
                    value: "first-level",
                  },
                  {
                    name: "Second Level",
                    value: "second-level",
                  },
                  {
                    name: "Third Level",
                    value: "third-level",
                  },
                  {
                    name: "Fourth Level",
                    value: "fourth-level",
                  },
                  {
                    name: "Fifth Level",
                    value: "fifth-level",
                  },
                  {
                    name: "Sixth Level",
                    value: "sixth-level",
                  },
                  {
                    name: "Seventh Level",
                    value: "seventh-level",
                  },
                  {
                    name: "Eighth Level",
                    value: "eighth-level",
                  },
                  {
                    name: "Nineth Level",
                    value: "nineth-level",
                  },
                ],
              },
            ],
          },
          {
            name: "add",
            description: "Add a character sheet by invite link",
            type: 1,
            options: [
              {
                name: "link",
                description:
                  "Paste the invite link to your character sheet here",
                type: 3,
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove a registered character sheet",
            type: 1,
            options: [
              {
                name: "id",
                description: "The ID of the character sheet to be removed",
                type: 3,
                required: true,
              },
            ],
          },
        ],
      };
    default:
      return null;
  }
}
