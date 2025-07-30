import XLSX from 'xlsx';
import fs from 'fs';

// Read Turkish database
const trWorkbook = XLSX.readFile('intern_tr_database.xlsx');
const trSheetName = trWorkbook.SheetNames[0];
const trSheet = trWorkbook.Sheets[trSheetName];
const trData = XLSX.utils.sheet_to_json(trSheet);

// Read English database
const enWorkbook = XLSX.readFile('intern_en_database.xlsx');
const enSheetName = enWorkbook.SheetNames[0];
const enSheet = enWorkbook.Sheets[enSheetName];
const enData = XLSX.utils.sheet_to_json(enSheet);

// Convert to lookup format
const trStudents = {};
const enStudents = {};

trData.forEach(student => {
  const studentNumber = student['Numara']?.toString();
  const fullName = student['Adı Soyadı'];
  if (studentNumber && fullName) {
    trStudents[studentNumber] = fullName.trim();
  }
});

enData.forEach(student => {
  const studentNumber = student['Numara']?.toString();
  const fullName = student['Adı Soyadı'];
  if (studentNumber && fullName) {
    enStudents[studentNumber] = fullName.trim();
  }
});

// Save as JSON files
fs.writeFileSync('src/data/tr-students.json', JSON.stringify(trStudents, null, 2));
fs.writeFileSync('src/data/en-students.json', JSON.stringify(enStudents, null, 2));

console.log(`Turkish students: ${Object.keys(trStudents).length}`);
console.log(`English students: ${Object.keys(enStudents).length}`);
console.log('JSON files created in src/data/'); 