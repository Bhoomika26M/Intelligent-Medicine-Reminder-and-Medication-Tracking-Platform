import os
import sys
import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_PATH = BASE_DIR / "app" / "data" / "medicine_database.json"

DOCTOR_ABBREVIATIONS = {
    "Paracetamol": ["PCM", "Para", "Paracet", "Acetaminophen"],
    "Azithromycin": ["AZM", "Azithro", "Azee"],
    "Levocetirizine": ["Levocet", "L-Cet"],
    "Amoxicillin": ["Amoxy", "Amox"],
    "Metformin": ["Metform"],
    "Pantoprazole": ["Panto", "Pantop"],
    "Atorvastatin": ["Atorva"],
    "Cetirizine": ["Cetriz"],
    "Aceclofenac": ["Aceclo"],
    "Diclofenac Sodium": ["Diclo"],
    "Dicyclomine + Paracetamol": ["Spasmo"],
    "Phenylephrine + Chlorpheniramine": ["CPM"],
    "Telmisartan": ["Telmi"],
    "Rosuvas": ["Rosu"]
}

OCR_CONFUSIONS = {
    'O': '0', '0': 'O',
    'I': 'l', 'l': 'I', '1': 'I',
    'S': '5', '5': 'S',
    'B': '8', '8': 'B',
    'Z': '2', '2': 'Z'
}

FORM_PREFIXES = [
    "Tab", "Tablet", "Cap", "Capsule", "Syp", "Syrup",
    "Susp", "Drops", "Inj", "Injection", "Respule", "Nebule"
]


def generate_aliases_for_name(base_name: str, dosages: list) -> set:
    aliases = set()
    base_name = base_name.strip()
    if not base_name or len(base_name) < 2:
        return aliases

    # Rule 1: Case Variations
    aliases.add(base_name)
    aliases.add(base_name.upper())
    aliases.add(base_name.lower())
    aliases.add(base_name.title())

    # Rule 2: Space & Hyphen Variations
    if " " in base_name:
        aliases.add(base_name.replace(" ", "-"))
        aliases.add(base_name.replace(" ", ""))
    elif "-" in base_name:
        aliases.add(base_name.replace("-", " "))
        aliases.add(base_name.replace("-", ""))

    # Rule 6: Punctuation Variations
    current_list = list(aliases)
    for b in current_list:
        if "-" in b:
            aliases.add(b.replace("-", " "))
            aliases.add(b.replace("-", "/"))
            aliases.add(b.replace("-", "."))
        elif " " in b:
            aliases.add(b.replace(" ", "-"))
            aliases.add(b.replace(" ", "/"))
            aliases.add(b.replace(" ", "."))

    base_variations = list(aliases)

    # Rule 3: Strength Variations
    for b in base_variations:
        for dose in dosages:
            dose_clean = dose.strip()
            num_match = re.search(r'\d+', dose_clean)
            if num_match:
                val = num_match.group(0)
                aliases.add(f"{b} {val}")
                aliases.add(f"{b} {dose_clean}")
                aliases.add(f"{b} {val}/5")
        aliases.add(f"{b} DS")
        aliases.add(f"{b} Forte")

    # Rule 4: Formulation Variations
    for b in base_variations:
        for prefix in FORM_PREFIXES:
            aliases.add(f"{prefix} {b}")

    # Rule 5: OCR Character Confusions
    for b in base_variations:
        b_upper = b.upper()
        for idx, char in enumerate(b_upper):
            if char in OCR_CONFUSIONS:
                subbed = b_upper[:idx] + OCR_CONFUSIONS[char] + b_upper[idx+1:]
                aliases.add(subbed)
        if b_upper.endswith("L"):
            aliases.add(b_upper[:-1] + "I")
            aliases.add(b_upper + "L")

    return aliases


def main():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        database = json.load(f)

    total_medicines = len(database)
    total_aliases_before = sum(len(item.get("aliases", [])) for item in database)

    generic_alias_map = {}  # alias_lower -> set of generic_names
    medicine_generated_aliases = {}  # generic_name -> set of candidate aliases

    # Track pre-existing aliases
    for item in database:
        gen = item["generic_name"]
        medicine_generated_aliases[gen] = set(item.get("aliases", []))

        # Rule 7: Doctor writing abbreviations
        if gen in DOCTOR_ABBREVIATIONS:
            for abbr in DOCTOR_ABBREVIATIONS[gen]:
                medicine_generated_aliases[gen].add(abbr)

        # Generate rule-based aliases for generic name and brand names
        names_to_expand = [gen] + item.get("brand_names", [])
        dosages = item.get("dosages", [])

        for name in names_to_expand:
            new_aliases = generate_aliases_for_name(name, dosages)
            medicine_generated_aliases[gen].update(new_aliases)

    # Rule 8, 9, 14: Conflict Detection & Disambiguation across generic medicines
    alias_to_generics = {}
    for gen, aliases in medicine_generated_aliases.items():
        for alias in aliases:
            a_clean = alias.strip()
            if not a_clean or len(a_clean) < 2:
                continue
            a_lower = a_clean.lower()
            if a_lower not in alias_to_generics:
                alias_to_generics[a_lower] = set()
            alias_to_generics[a_lower].add((gen, a_clean))

    conflicting_aliases = set()
    final_generic_aliases = {item["generic_name"]: [] for item in database}
    invalid_skipped = 0

    for a_lower, matches in alias_to_generics.items():
        generics = set(m[0] for m in matches)
        if len(generics) > 1:
            # Ambiguity conflict! Skip this alias
            conflicting_aliases.add(a_lower)
            invalid_skipped += len(matches)
        else:
            gen, orig_alias = list(matches)[0]
            # Avoid adding alias identical to generic_name
            if orig_alias.lower() != gen.lower():
                final_generic_aliases[gen].append(orig_alias)

    total_aliases_after = 0
    generated_count = 0
    duplicate_removed_count = 0

    for item in database:
        gen = item["generic_name"]
        # Rule 10: Preserve existing structure, only update aliases
        raw_aliases = final_generic_aliases.get(gen, [])
        # Deduplicate case-insensitively while maintaining clean representation
        unique_aliases = []
        seen_lower = set()
        for a in raw_aliases:
            if a.lower() not in seen_lower:
                seen_lower.add(a.lower())
                unique_aliases.append(a)

        item["aliases"] = unique_aliases
        total_aliases_after += len(unique_aliases)

    # Save back updated database
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(database, f, indent=2)

    avg_aliases = total_aliases_after / total_medicines if total_medicines > 0 else 0

    # Top 20 medicines with highest alias count
    top20 = sorted(database, key=lambda x: len(x.get("aliases", [])), reverse=True)[:20]

    print("=" * 80)
    print("INTELLIGENT OCR ALIAS GENERATION REPORT")
    print("=" * 80)
    print(f"Total Medicines: {total_medicines}")
    print(f"Total Aliases Before: {total_aliases_before}")
    print(f"Total Aliases After: {total_aliases_after}")
    print(f"Net New Aliases Generated: {total_aliases_after - total_aliases_before}")
    print(f"Conflicting Ambiguous Aliases Filtered: {len(conflicting_aliases)}")
    print(f"Invalid / Conflict Instances Skipped: {invalid_skipped}")
    print(f"Average Aliases per Medicine: {avg_aliases:.1f}")
    print("\nTop 20 Medicines by Alias Count:")
    for idx, item in enumerate(top20, 1):
        print(f"  {idx:2d}. {item['generic_name']}: {len(item.get('aliases', []))} aliases")

if __name__ == "__main__":
    main()
