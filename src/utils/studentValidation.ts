import trStudents from '../data/tr-students.json';
import enStudents from '../data/en-students.json';

interface StudentValidationResult {
  isValid: boolean;
  studentName?: string;
  language?: 'tr' | 'en';
  error?: string;
}

export const validateStudent = (
  studentNumber: string, 
  fullName: string
): StudentValidationResult => {
  // Clean inputs
  const cleanStudentNumber = studentNumber.trim();
  const cleanFullName = fullName.trim().toUpperCase();

  // Check Turkish students first
  if (trStudents[cleanStudentNumber]) {
    const expectedName = trStudents[cleanStudentNumber];
    if (expectedName.toUpperCase() === cleanFullName) {
      return {
        isValid: true,
        studentName: expectedName,
        language: 'tr'
      };
    } else {
      return {
        isValid: false,
        error: `Öğrenci numarası doğru ancak isim uyuşmuyor. İsminizi büyük harflerle yazdığınızdan emin olun.`
      };
    }
  }

  // Check English students
  if (enStudents[cleanStudentNumber]) {
    const expectedName = enStudents[cleanStudentNumber];
    if (expectedName.toUpperCase() === cleanFullName) {
      return {
        isValid: true,
        studentName: expectedName,
        language: 'en'
      };
    } else {
      return {
        isValid: false,
        error: `Student number is correct but name doesn't match. Please write your name in capital letters.`
      };
    }
  }

  // Student not found
  return {
    isValid: false,
    error: 'Bu öğrenci numarası sistemde bulunamadı. Lütfen numaranızı kontrol edin.'
  };
};

export const getStudentCount = () => {
  return {
    turkish: Object.keys(trStudents).length,
    english: Object.keys(enStudents).length,
    total: Object.keys(trStudents).length + Object.keys(enStudents).length
  };
}; 