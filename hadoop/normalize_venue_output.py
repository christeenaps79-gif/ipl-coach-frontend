import sys

aliases = {}

with open("team_aliases.txt") as f:
    for line in f:
        old, new = line.strip().split("|")
        aliases[old] = new

def normalize(team):
    return aliases.get(team, team)

for line in sys.stdin:
    line = line.rstrip("\n")

    if not line:
        continue

    # Hadoop TextOutputFormat separates key and value with a tab.
    parts = line.split("\t", 3)

    if len(parts) < 4:
        continue

    venue = parts[0]
    team = normalize(parts[1])
    opponent = normalize(parts[2])
    stats = parts[3]

    print(f"{venue}\t{team}\t{opponent}\t{stats}")
