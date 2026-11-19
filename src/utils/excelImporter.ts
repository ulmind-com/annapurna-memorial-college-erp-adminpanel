import * as XLSX from 'xlsx';
import { Student } from '../types';

export interface ExcelImportResult<T> {
  success: boolean;
  importedCount: number;
  data: T[];
  errors: string[];
}

export class ExcelImporter {
  /**
   * Parse uploaded Excel/CSV file to Student records
   */
  public static async parseStudentFile(file: File): Promise<ExcelImportResult<Partial<Student>>> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          if (!buffer) {
            return resolve({ success: false, importedCount: 0, data: [], errors: ['Empty file payload'] });
          }

          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];

          const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

          if (!rawRows || rawRows.length === 0) {
            return resolve({
              success: false,
              importedCount: 0,
              data: [],
              errors: ['No rows detected in the uploaded spreadsheet.'],
            });
          }

          const students: Partial<Student>[] = [];
          const errors: string[] = [];

          rawRows.forEach((row, index) => {
            // Flexible column resolution (case-insensitive & space-tolerant)
            const getVal = (...keys: string[]) => {
              for (const k of keys) {
                for (const rowKey of Object.keys(row)) {
                  if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
                    return String(row[rowKey]).trim();
                  }
                }
              }
              return '';
            };

            const roll = getVal('roll_number', 'roll', 'roll no', 'roll number', 'student roll');
            const name = getVal('full_name', 'name', 'student name', 'trainee name', 'full name');
            const email = getVal('email', 'email address', 'mail');
            const phone = getVal('phone', 'phone number', 'contact', 'mobile');
            const course = getVal('course_code', 'course', 'program', 'degree') || 'BED';
            const session = getVal('academic_session', 'session', 'batch') || '2024-2026';
            const semester = Number(getVal('semester', 'sem')) || 1;
            const gender = (getVal('gender') || 'FEMALE').toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER';
            const category = getVal('category', 'caste') || 'GEN';
            const guardianName = getVal('guardian_name', 'guardian', 'father name', 'parent') || 'Guardian';
            const guardianPhone = getVal('guardian_phone', 'guardian contact') || phone || '+91 9876500000';

            if (!roll || !name) {
              errors.push(`Row ${index + 2}: Missing required Roll Number or Full Name.`);
              return;
            }

            students.push({
              id: `imported-st-${Date.now()}-${index}`,
              roll_number: roll,
              full_name: name,
              email: email || `${roll.toLowerCase()}@student.annapurnacollege.org`,
              phone: phone || '+91 9876543210',
              course_code: course.toUpperCase(),
              course_name:
                course.toUpperCase() === 'DELED'
                  ? 'Diploma in Elementary Education (D.El.Ed.)'
                  : 'Bachelor of Education (B.Ed.)',
              academic_session: session,
              semester: semester,
              section: 'A',
              gender: gender === 'MALE' ? 'MALE' : 'FEMALE',
              category: category.toUpperCase(),
              guardian_name: guardianName,
              guardian_phone: guardianPhone,
              guardian_relation: 'Parent',
              status: 'ACTIVE',
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${roll}`,
            });
          });

          resolve({
            success: students.length > 0,
            importedCount: students.length,
            data: students,
            errors,
          });
        } catch (err: any) {
          resolve({
            success: false,
            importedCount: 0,
            data: [],
            errors: [err.message || 'Failed to parse spreadsheet'],
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          importedCount: 0,
          data: [],
          errors: ['File reading error'],
        });
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Download pre-configured Excel Template with real columns
   */
  public static downloadSampleStudentTemplate(): void {
    const sampleData = [
      {
        'Roll Number': 'AMC-BED-2024-007',
        'Full Name': 'Pooja Mondal',
        Email: 'pooja.mondal@student.annapurnacollege.org',
        Phone: '+91 9876511223',
        Course: 'BED',
        Session: '2024-2026',
        Semester: 1,
        Gender: 'FEMALE',
        Category: 'GEN',
        'Guardian Name': 'Ratan Mondal',
        'Guardian Phone': '+91 9876500011',
      },
      {
        'Roll Number': 'AMC-BED-2024-008',
        'Full Name': 'Subrata Kayal',
        Email: 'subrata.k@student.annapurnacollege.org',
        Phone: '+91 9876522334',
        Course: 'BED',
        Session: '2024-2026',
        Semester: 1,
        Gender: 'MALE',
        Category: 'SC',
        'Guardian Name': 'Kartick Kayal',
        'Guardian Phone': '+91 9876500022',
      },
      {
        'Roll Number': 'AMC-DELED-2024-001',
        'Full Name': 'Madhurima Paul',
        Email: 'madhurima.p@student.annapurnacollege.org',
        Phone: '+91 9876533445',
        Course: 'DELED',
        Session: '2024-2026',
        Semester: 1,
        Gender: 'FEMALE',
        Category: 'OBC-B',
        'Guardian Name': 'Bikash Paul',
        'Guardian Phone': '+91 9876500033',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainees');

    XLSX.writeFile(workbook, 'Annapurna_Trainee_Import_Template.xlsx');
  }
}
