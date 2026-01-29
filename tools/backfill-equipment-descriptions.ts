import fs from "fs";
import path from "path";
import db from "../src/api/dbconfig";

interface EquipmentData {
  index: string;
  name: string;
  desc?: string[];
  itemType?: 'equipment' | 'magic-items';
  equipment_category?: { index: string; name: string };
  weapon_category?: string;
  weapon_range?: string;
  damage?: {
    damage_dice: string;
    damage_type?: { name: string };
  };
  properties?: Array<{ name: string }>;
  range?: { normal: number; long?: number };
  throw_range?: { normal: number; long: number };
  armor_category?: string;
  armor_class?: {
    base: number;
    dex_bonus?: boolean;
    max_bonus?: number;
  };
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  cost?: { quantity: number; unit: string };
  [key: string]: any;
}

// Generate description from structured weapon data
function generateWeaponDescription(item: EquipmentData): string {
  const parts: string[] = [];

  // Weapon type
  if (item.weapon_category && item.weapon_range) {
    parts.push(`${item.weapon_category} ${item.weapon_range} Weapon`);
  }

  // Damage
  if (item.damage) {
    const damageType = item.damage.damage_type?.name || "";
    parts.push(`Damage: ${item.damage.damage_dice} ${damageType}`);
  }

  // Properties
  if (item.properties && item.properties.length > 0) {
    const propNames = item.properties.map((p) => p.name).join(", ");
    parts.push(`Properties: ${propNames}`);
  }

  // Range
  if (item.range) {
    let rangeStr = `Range: ${item.range.normal} ft`;
    if (item.range.long) {
      rangeStr += `/${item.range.long} ft`;
    }
    if (item.throw_range) {
      rangeStr += ` (thrown ${item.throw_range.normal}/${item.throw_range.long} ft)`;
    }
    parts.push(rangeStr);
  }

  // Cost
  if (item.cost) {
    parts.push(`Cost: ${item.cost.quantity} ${item.cost.unit}`);
  }

  return parts.join("\n");
}

// Generate description from structured armor data
function generateArmorDescription(item: EquipmentData): string {
  const parts: string[] = [];

  // Armor type
  if (item.armor_category) {
    parts.push(`${item.armor_category} Armor`);
  }

  // AC
  if (item.armor_class) {
    let acStr = `AC: ${item.armor_class.base}`;
    if (item.armor_class.dex_bonus) {
      if (item.armor_class.max_bonus) {
        acStr += ` + Dex modifier (max ${item.armor_class.max_bonus})`;
      } else {
        acStr += " + Dex modifier";
      }
    }
    parts.push(acStr);
  }

  // Strength requirement
  if (item.str_minimum && item.str_minimum > 0) {
    parts.push(`Strength Required: ${item.str_minimum}`);
  }

  // Stealth disadvantage
  if (item.stealth_disadvantage) {
    parts.push("Stealth: Disadvantage");
  }

  // Cost
  if (item.cost) {
    parts.push(`Cost: ${item.cost.quantity} ${item.cost.unit}`);
  }

  return parts.join("\n");
}

// Generate description from item data when desc field is missing
function generateItemDescription(item: EquipmentData): string | null {
  // Check if it's a weapon
  if (item.equipment_category?.index === "weapon" || item.weapon_category) {
    return generateWeaponDescription(item);
  }

  // Check if it's armor
  if (item.equipment_category?.index === "armor" || item.armor_category) {
    return generateArmorDescription(item);
  }

  return null;
}

interface DbEquipment {
  id: number;
  general_id: number;
  title: string;
  description: string | null;
  quantity: number;
  weight: number;
}

async function backfillEquipmentDescriptions() {
  console.log("🔍 Starting equipment description backfill...\n");

  try {
    // Load 5e SRD equipment data
    const equipmentDataPath = path.join(
      __dirname,
      "../public/lib/data/5e-srd-equipment.json"
    );
    const equipmentJsonData: EquipmentData[] = JSON.parse(
      fs.readFileSync(equipmentDataPath, "utf-8")
    );

    // Load 5e SRD magic items data
    const magicItemsDataPath = path.join(
      __dirname,
      "../public/lib/data/5e-srd-magic-items.json"
    );
    const magicItemsJsonData: EquipmentData[] = JSON.parse(
      fs.readFileSync(magicItemsDataPath, "utf-8")
    );

    // Helper function to normalize item names for better matching
    const normalizeItemName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/['']/g, "") // Remove all apostrophes
        .replace(/[^\w\s-]/g, "") // Remove special chars except hyphens and alphanumeric
        .replace(/\s+/g, " ") // Normalize multiple spaces to single space
        .trim();
    };

    // Create a case-insensitive lookup map with normalized names
    const equipmentMap = new Map<string, EquipmentData>();
    equipmentJsonData.forEach((item) => {
      const normalizedName = normalizeItemName(item.name);
      equipmentMap.set(normalizedName, { ...item, itemType: 'equipment' });
    });
    magicItemsJsonData.forEach((item) => {
      const normalizedName = normalizeItemName(item.name);
      equipmentMap.set(normalizedName, { ...item, itemType: 'magic-items' });
    });

    console.log(`📚 Loaded ${equipmentJsonData.length} equipment items from 5e SRD data`);
    console.log(`✨ Loaded ${magicItemsJsonData.length} magic items from 5e SRD data`);
    console.log(`📚 Total items available: ${equipmentMap.size}`);

    // Debug: Show a few sample normalized names
    const sampleNames = Array.from(equipmentMap.keys()).slice(0, 10);
    console.log(`\n🔍 Sample normalized names: ${sampleNames.join(", ")}\n`);

    // Get all equipment from database
    const query = {
      text: `SELECT * FROM public."dnd_5e_character_equipment" ORDER BY id`,
    };
    const result = await db.query<DbEquipment>(query);
    const allEquipment = result.rows;

    console.log(`📦 Found ${allEquipment.length} equipment items in database\n`);

    let matchCount = 0;
    let updateCount = 0;
    let noMatchCount = 0;
    let alreadyHasDescCount = 0;

    // Process each equipment item
    for (const dbItem of allEquipment) {
      const normalizedTitle = normalizeItemName(dbItem.title);

      // Skip if already has description
      if (dbItem.description && dbItem.description.trim().length > 0) {
        alreadyHasDescCount++;
        continue;
      }

      // Try to find match in 5e SRD data
      const srdItem = equipmentMap.get(normalizedTitle);

      // Debug output for first few items
      if (allEquipment.indexOf(dbItem) < 3) {
        console.log(`🔍 Debug: "${dbItem.title}" → normalized: "${normalizedTitle}" → match: ${srdItem ? '✓' : '✗'}`);
      }

      if (srdItem) {
        // Try to get description from desc field, or generate from structured data
        let descriptionText: string | null = null;

        if (srdItem.desc && srdItem.desc.length > 0) {
          descriptionText = srdItem.desc.join("\n\n");
        } else {
          // Generate description from structured data (weapons, armor, etc.)
          descriptionText = generateItemDescription(srdItem);
        }

        if (descriptionText) {
          matchCount++;

          // Add link to SRD page
          const itemType = srdItem.itemType || 'equipment';
          const srdLink = `\n\nView full details: https://farreachco.com/dnd/5e/srd/${itemType}/${srdItem.index}`;
          const description = descriptionText + srdLink;

          // Update database
          const updateQuery = {
            text: `UPDATE public."dnd_5e_character_equipment"
                   SET description = $1
                   WHERE id = $2`,
            values: [description, dbItem.id],
          };

          await db.query(updateQuery);
          updateCount++;

          const itemTypeLabel = itemType === 'magic-items' ? '✨' : '⚔️';
          console.log(
            `✅ ${itemTypeLabel} Updated: "${dbItem.title}" (ID: ${dbItem.id}) - ${descriptionText.substring(0, 50)}...`
          );
        } else {
          noMatchCount++;
          console.log(`⚠️  No description available: "${dbItem.title}" (ID: ${dbItem.id})`);
        }
      } else {
        noMatchCount++;
        console.log(`⚠️  No match: "${dbItem.title}" (ID: ${dbItem.id})`);
      }
    }

    // Print summary
    console.log("\n📊 Backfill Summary:");
    console.log("━".repeat(50));
    console.log(`Total equipment items:        ${allEquipment.length}`);
    console.log(`Already had descriptions:     ${alreadyHasDescCount}`);
    console.log(`Matched with 5e SRD data:     ${matchCount}`);
    console.log(`Successfully updated:         ${updateCount}`);
    console.log(`No match found:               ${noMatchCount}`);
    console.log("━".repeat(50));

    console.log("\n✨ Backfill complete!");
  } catch (error) {
    console.error("❌ Error during backfill:", error);
    throw error;
  }
}

// Run the backfill
backfillEquipmentDescriptions()
  .then(() => {
    console.log("🎉 Script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
