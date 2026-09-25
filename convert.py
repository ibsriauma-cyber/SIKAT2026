import re

with open('database.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# 1. Remove SET FOREIGN_KEY_CHECKS
sql = re.sub(r'SET FOREIGN_KEY_CHECKS\s*=\s*0;', '', sql)
sql = re.sub(r'SET FOREIGN_KEY_CHECKS\s*=\s*1;', '', sql)

# 2. DROP TABLE ... CASCADE
sql = re.sub(r'(DROP TABLE IF EXISTS `?\w+`?);', r'\1 CASCADE;', sql)

# 3. Remove backticks
sql = sql.replace('`', '"')

# 4. AUTO_INCREMENT -> SERIAL
# e.g. "id" int(11) NOT NULL AUTO_INCREMENT
sql = re.sub(r'(?i)int\(\d+\)\s+NOT\s+NULL\s+AUTO_INCREMENT', 'SERIAL', sql)
# e.g. "id" int NOT NULL AUTO_INCREMENT
sql = re.sub(r'(?i)int\s+NOT\s+NULL\s+AUTO_INCREMENT', 'SERIAL', sql)

# 5. int(11) -> INTEGER
sql = re.sub(r'(?i)int\(\d+\)', 'INTEGER', sql)

# 6. tinyint(1) -> BOOLEAN
sql = re.sub(r'(?i)tinyint\(\d+\)', 'BOOLEAN', sql)

# 7. datetime -> TIMESTAMP
sql = re.sub(r'(?i)datetime', 'TIMESTAMP', sql)

# 8. json -> JSONB
# Beware of things like JSON inside comments, but okay
sql = re.sub(r'(?i)\bjson\b', 'JSONB', sql)

# 9. ENUM(...) -> TEXT
# enum('L', 'P') -> TEXT
sql = re.sub(r'(?i)enum\([^)]+\)', 'TEXT', sql)

# 10. ENGINE=InnoDB ...
sql = re.sub(r'(?i)\)\s*ENGINE=InnoDB.*?;', ');', sql)

# 11. Handle boolean values in inserts (0 -> false, 1 -> true if they were tinyint)
# MySQL allows 0/1 for booleans. PostgreSQL sometimes prefers true/false for BOOLEAN, 
# but if the insert has integers, it might fail. Let's cast them or hope PG accepts 0/1.
# PG actually accepts '0'/'1' or just 0/1 for smallint, but for boolean it might complain if not cast.
# We changed tinyint to BOOLEAN.
# Actually, changing tinyint to SMALLINT is safer for compatibility with MySQL dumps!
sql = sql.replace('BOOLEAN', 'SMALLINT')

# Remove duplicate commas before closing parenthesis if any
sql = re.sub(r',\s*\)', '\n)', sql)

# Write to supabase.sql
with open('supabase.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print("Conversion done.")
