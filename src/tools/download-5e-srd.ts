import fs from "fs";
import path from "path";
import https from "https";

const REPO_BASE =
  "https://raw.githubusercontent.com/5e-bits/5e-database/main/src";

// Maps remote filename (capitalized) → local filename (lowercase)
const FILES: Record<string, string> = {
  "5e-SRD-Ability-Scores.json": "5e-srd-ability-scores.json",
  "5e-SRD-Alignments.json": "5e-srd-alignments.json",
  "5e-SRD-Backgrounds.json": "5e-srd-backgrounds.json",
  "5e-SRD-Classes.json": "5e-srd-classes.json",
  "5e-SRD-Conditions.json": "5e-srd-conditions.json",
  "5e-SRD-Damage-Types.json": "5e-srd-damage-types.json",
  "5e-SRD-Equipment-Categories.json": "5e-srd-equipment-categories.json",
  "5e-SRD-Equipment.json": "5e-srd-equipment.json",
  "5e-SRD-Feats.json": "5e-srd-feats.json",
  "5e-SRD-Features.json": "5e-srd-features.json",
  "5e-SRD-Languages.json": "5e-srd-languages.json",
  "5e-SRD-Levels.json": "5e-srd-levels.json",
  "5e-SRD-Magic-Items.json": "5e-srd-magic-items.json",
  "5e-SRD-Magic-Schools.json": "5e-srd-magic-schools.json",
  "5e-SRD-Monsters.json": "5e-srd-monsters.json",
  "5e-SRD-Proficiencies.json": "5e-srd-proficiencies.json",
  "5e-SRD-Races.json": "5e-srd-races.json",
  "5e-SRD-Rule-Sections.json": "5e-srd-rule-sections.json",
  "5e-SRD-Rules.json": "5e-srd-rules.json",
  "5e-SRD-Skills.json": "5e-srd-skills.json",
  "5e-SRD-Spells.json": "5e-srd-spells.json",
  "5e-SRD-Subclasses.json": "5e-srd-subclasses.json",
  "5e-SRD-Subraces.json": "5e-srd-subraces.json",
  "5e-SRD-Traits.json": "5e-srd-traits.json",
  "5e-SRD-Weapon-Properties.json": "5e-srd-weapon-properties.json",
};

function download(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return download(res.headers.location!).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  const edition = process.argv[2] || "2014";
  if (!["2014", "2024"].includes(edition)) {
    console.error(`Usage: npm run srd:download -- [2014|2024]`);
    process.exit(1);
  }

  const outDir = path.join(__dirname, `../../public/lib/data/${edition}`);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Downloading 5e SRD (${edition}) → ${outDir}\n`);

  let success = 0;
  let failed = 0;

  for (const [remoteFile, localFile] of Object.entries(FILES)) {
    const url = `${REPO_BASE}/${edition}/${remoteFile}`;
    process.stdout.write(`  ${localFile} ... `);
    try {
      const data = await download(url);
      JSON.parse(data);
      fs.writeFileSync(path.join(outDir, localFile), data);
      const sizeKB = (Buffer.byteLength(data) / 1024).toFixed(1);
      console.log(`OK (${sizeKB} KB)`);
      success++;
    } catch (err: any) {
      console.log(`FAILED - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} downloaded, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
