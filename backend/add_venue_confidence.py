import re
import sys

def num(text, key, default=0):
    m = re.search(rf'{key}=([0-9.]+)', text)
    return float(m.group(1)) if m else default

for line in sys.stdin:
    line = line.rstrip('\n')

    if not line.strip():
        continue

    matches = num(line, "Matches")

    if matches < 3:
        confidence = "VERY_LOW"
    elif matches < 5:
        confidence = "LOW"
    elif matches < 10:
        confidence = "MODERATE"
    elif matches < 20:
        confidence = "STRONG"
    else:
        confidence = "VERY_STRONG"

    print(line + f"\tVenueConfidence={confidence}")
