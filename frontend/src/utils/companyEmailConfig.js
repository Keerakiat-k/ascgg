import aepLogo from '../assets/AEP.png';
import agcLogo from '../assets/AGC.png';
import aiaLogo from '../assets/AIA.png';
import aicLogo from '../assets/AIC.png';
import cstLogo from '../assets/CST.png';
import qpmLogo from '../assets/QPM.png';
import sqtLogo from '../assets/SQT.jpg';

export const COMPANY_EMAIL_CONFIGS = {
  'AEP': {
    nameEn: 'ASCG Engineering Products CO.,LTD.',
    nameTh: 'บริษัท เอเอสซีจี เอ็นจิเนียริ่ง โปรดักส์ จำกัด',
    domain: 'ascgengineering.com',
    pop3: { server: 'pop.ascgengineering.com', port: '110', ssl: 'No SSL' },
    smtp: { server: 'smtp.ascgengineering.com', port: '465', ssl: 'TLS/SSL' },
    logo: aepLogo
  },
  'AGC': {
    nameEn: 'ASCG Global Group CO.,LTD.',
    nameTh: 'บริษัท เอเอสซีจี โกลบอล กรุ๊ป จำกัด',
    domain: 'ascggroup.com',
    pop3: { server: 'pop.ascggroup.com', port: '110', ssl: 'No SSL' },
    smtp: { server: 'smtp.ascggroup.com', port: '587', ssl: 'No SSL' },
    logo: agcLogo
  },
  'AIA': {
    nameEn: 'ASCG Interpro (Asia) CO.,LTD.',
    nameTh: 'บริษัท เอเอสซีจี อินเตอร์โปร (เอเชีย) จำกัด',
    domain: 'interprocorp.com',
    pop3: { server: 'pop.interprocorp.com', port: '110', ssl: 'No SSL' },
    smtp: { server: 'smtp.interprocorp.com', port: '587', ssl: 'No SSL' },
    logo: aiaLogo
  },
  'AIC': {
    nameEn: 'ASCG Invention (1991) CO.,LTD.',
    nameTh: 'บริษัท เอเอสซีจี อินเวนชั่น (1991) จำกัด',
    domain: 'ascggroup.com',
    pop3: { server: 'pop.ascggroup.com', port: '110', ssl: 'No SSL' },
    smtp: { server: 'smtp.ascggroup.com', port: '587', ssl: 'No SSL' },
    logo: aicLogo
  },
  'CST': {
    nameEn: 'CST Intergroup CO.,LTD.',
    nameTh: 'บริษัท ซีเอสที อินเตอร์กรุ๊ป จำกัด',
    domain: 'cstintergroup.com',
    pop3: { server: 'pop.cstintergroup.com', port: '110', ssl: 'No SSL' },
    smtp: { server: 'smtp.cstintergroup.com', port: '587', ssl: 'No SSL' },
    logo: cstLogo
  },
  'QPM': {
    nameEn: 'QPM Prevention Technology CO.,LTD.',
    nameTh: 'บริษัท คิวพีเอ็ม พรีเวนชั่น เทคโนโลยี จำกัด',
    domain: 'qpmprevention.com',
    pop3: { server: 'mail.qpmprevention.com', port: '110', ssl: 'No SSL' },
    smtp: { server: 'mail.qpmprevention.com', port: '587', ssl: 'No SSL' },
    logo: qpmLogo
  },
  'SQT': {
    nameEn: 'Synergy Q (Thailand) CO.,LTD.',
    nameTh: 'บริษัท ซินเนอจี้ คิว (ประเทศไทย) จำกัด',
    domain: 'synergyqthai.com',
    pop3: { server: 'pop.synergyqthai.com', port: '110', ssl: 'No SSL' },
    smtp: { server: 'smtp.synergyqthai.com', port: '587', ssl: 'No SSL' },
    logo: sqtLogo
  }
};

const phoneticMap = {
  'A': 'เอใหญ่', 'B': 'บีใหญ่', 'C': 'ซีใหญ่', 'D': 'ดีใหญ่', 'E': 'อีใหญ่', 'F': 'เอฟใหญ่', 'G': 'จีใหญ่', 'H': 'เอชใหญ่', 'I': 'ไอใหญ่', 'J': 'เจใหญ่', 'K': 'เคใหญ่', 'L': 'แอลใหญ่', 'M': 'เอ็มใหญ่', 'N': 'เอ็นใหญ่', 'O': 'โอใหญ่', 'P': 'พีใหญ่', 'Q': 'คิวใหญ่', 'R': 'อาร์ใหญ่', 'S': 'เอสใหญ่', 'T': 'ทีใหญ่', 'U': 'ยูใหญ่', 'V': 'วีใหญ่', 'W': 'ดับบลิวใหญ่', 'X': 'เอ็กซ์ใหญ่', 'Y': 'วายใหญ่', 'Z': 'แซดใหญ่',
  'a': 'เอ', 'b': 'บี', 'c': 'ซี', 'd': 'ดี', 'e': 'อี', 'f': 'เอฟ', 'g': 'จี', 'h': 'เอช', 'i': 'ไอ', 'j': 'เจ', 'k': 'เค', 'l': 'แอล', 'm': 'เอ็ม', 'n': 'เอ็น', 'o': 'โอ', 'p': 'พี', 'q': 'คิว', 'r': 'อาร์', 's': 'เอส', 't': 'ที', 'u': 'ยู', 'v': 'วี', 'w': 'ดับบลิว', 'x': 'เอ็กซ์', 'y': 'วาย', 'z': 'แซด',
  '0': 'ศูนย์', '1': 'หนึ่ง', '2': 'สอง', '3': 'สาม', '4': 'สี่', '5': 'ห้า', '6': 'หก', '7': 'เจ็ด', '8': 'แปด', '9': 'เก้า',
  '@': 'แอดไซต์', '!': 'ตกใจ', '#': 'ชาร์ป', '$': 'ดอลลาร์', '%': 'เปอร์เซ็นต์', '&': 'แอนด์', '*': 'ดอกจัน'
};

export const getPhoneticThai = (text) => {
  if (!text) return '';
  let result = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result.push(phoneticMap[char] || char);
  }
  return result.join(' ');
};

export const generateEmail = (firstNameEn, lastNameEn, companyPrefix) => {
  if (!firstNameEn || !lastNameEn || !companyPrefix) return '';
  const domain = COMPANY_EMAIL_CONFIGS[companyPrefix]?.domain;
  if (!domain) return '';
  
  const fName = firstNameEn.trim().toLowerCase();
  const lInitial = lastNameEn.trim().charAt(0).toLowerCase();
  
  return `${fName}.${lInitial}@${domain}`;
};

export const generatePassword = (firstNameEn, lastNameEn) => {
  if (!firstNameEn || !lastNameEn) return 'P@ssw0rd';
  const fInitial = firstNameEn.trim().charAt(0).toUpperCase();
  const lInitial = lastNameEn.trim().charAt(0).toUpperCase();
  
  return `P@ssw0rd${fInitial}${lInitial}`;
};
