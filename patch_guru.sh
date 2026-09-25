sed -i 's/    \.\.\.subjectClasses/    ...subjectClasses,\n    ...subjects.map((s: any) => s.className || s.class_name)/' src/pages/GuruPages.tsx
