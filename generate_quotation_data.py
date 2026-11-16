import json
import re
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parent
WORKBOOK = ROOT / "Quotation all clubed.xlsx"
OUTPUT = ROOT / "quotation-data.js"
COMPANY_COLUMNS = (4, 6, 8)


def parse_total(value):
    digits = re.sub(r"[^0-9.]", "", str(value or ""))
    total = float(digits) if digits else 0
    if total <= 0:
        raise ValueError(f"Invalid company project total: {value!r}")
    return round(total)


def main():
    if not WORKBOOK.is_file():
        raise FileNotFoundError(f"Quotation workbook not found: {WORKBOOK}")

    workbook = load_workbook(WORKBOOK, data_only=True, read_only=True)
    sheet = workbook.active
    companies = []
    for column in COMPANY_COLUMNS:
        name = str(sheet.cell(2, column).value or "").strip()
        total = parse_total(sheet.cell(3, column).value)
        rate_match = re.search(r"\(([^()]*)\)\s*$", name)
        rate = f"₹{rate_match.group(1).replace('/-', '')}/sq ft" if rate_match else ""
        display_name = name[:rate_match.start()].strip() if rate_match else name
        companies.append({"name": display_name, "rate": rate, "total": total})

    sections = []
    for row in range(4, sheet.max_row + 1):
        name = sheet.cell(row, 2).value
        if name is None:
            continue
        descriptions = [
            str(sheet.cell(row, column).value or "").strip()
            for column in COMPANY_COLUMNS
        ]
        if any(descriptions):
            sections.append({
                "row": row,
                "name": " ".join(str(name).split()),
                "descriptions": descriptions,
            })

    if len(companies) != 3 or not sections:
        raise ValueError("The workbook must contain three company totals and quotation scope rows.")

    payload = {"companies": companies, "sections": sections}
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(f"window.QUOTATION_DATA = {encoded};\n", encoding="utf-8")
    print(f"Wrote {len(sections)} quotation sections for {len(companies)} companies to {OUTPUT.name}.")


if __name__ == "__main__":
    main()
