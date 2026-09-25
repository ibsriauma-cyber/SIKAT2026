sed -i 's/const isStrictlyWalas = isWalas;/const isStrictlyWalas = isWalas \&\& !isGuru;/' src/pages/GuruPages.tsx

sed -i '/<button\n *type="button"\n *onClick={() => setReportType('\''analisis'\'')}/!b;n;n;s/Analisis/Analisis/' src/pages/GuruPages.tsx # just a placeholder

