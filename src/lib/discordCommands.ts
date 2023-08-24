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
                  {
                    name: "Spells",
                    value: "spells",
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
                name: "name",
                description: "Type the name to remove from the tracker",
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
