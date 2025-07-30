import XLSX from 'xlsx';

// Read Turkish database
console.log('=== TURKISH DATABASE ===');
const trWorkbook = XLSX.readFile('intern_tr_database.xlsx');
const trSheetName = trWorkbook.SheetNames[0];
const trSheet = trWorkbook.Sheets[trSheetName];
const trData = XLSX.utils.sheet_to_json(trSheet);

console.log('Columns:', Object.keys(trData[0] || {}));
console.log('First 5 rows:');
console.log(JSON.stringify(trData.slice(0, 5), null, 2));

// Read English database
console.log('\n=== ENGLISH DATABASE ===');
const enWorkbook = XLSX.readFile('intern_en_database.xlsx');
const enSheetName = enWorkbook.SheetNames[0];
const enSheet = enWorkbook.Sheets[enSheetName];
const enData = XLSX.utils.sheet_to_json(enSheet);

console.log('Columns:', Object.keys(enData[0] || {}));
console.log('First 5 rows:');
console.log(JSON.stringify(enData.slice(0, 5), null, 2)); 