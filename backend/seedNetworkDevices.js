const pool = require('./config/db');
const ExcelJS = require('exceljs');
const path = require('path');

function parseDate(val) {
    if (!val) return { date: null, extra: null };
    if (val instanceof Date) {
        let year = val.getFullYear();
        if (year > 2400) year -= 543;
        const month = String(val.getMonth() + 1).padStart(2, '0');
        const day = String(val.getDate()).padStart(2, '0');
        return { date: `${year}-${month}-${day}`, extra: null };
    }
    const str = String(val).trim();
    const matchBE = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matchBE) {
        let year = parseInt(matchBE[1], 10);
        if (year > 2400) year -= 543;
        return { date: `${year}-${matchBE[2]}-${matchBE[3]}`, extra: null };
    }
    const matchDMY = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchDMY) {
        let year = parseInt(matchDMY[3], 10);
        if (year > 2400) year -= 543;
        const month = String(matchDMY[2]).padStart(2, '0');
        const day = String(matchDMY[1]).padStart(2, '0');
        return { date: `${year}-${month}-${day}`, extra: null };
    }
    return { date: null, extra: str };
}

function categorizeDevice(ip, device_name, brand_name, model, remark) {
    const combined = `${ip} ${device_name} ${brand_name} ${model} ${remark}`.toLowerCase();
    
    if (combined.includes('dc server') || combined.includes('dns') || combined.includes('idrac') || 
        combined.includes('nas') || combined.includes('qnap') || combined.includes('crm_server') || 
        combined.includes('server doc') || combined.includes('vmware')) {
        return 'Server';
    }
    if (combined.includes('firewall') || combined.includes('router') || combined.includes('switch') || 
        combined.includes('log analyzer') || combined.includes('fortigate') || combined.includes('trendnet') || 
        combined.includes('3com')) {
        return 'Network & Security';
    }
    if (combined.includes('access point') || combined.includes('ap ') || combined.includes('eap610') || 
        combined.includes('tl-wa1201') || combined.includes('wap300n') || combined.includes('dir-850l')) {
        return 'Access Point';
    }
    if (combined.includes('printer') || combined.includes('epson') || combined.includes('brother') || 
        combined.includes('hp laserjet') || combined.includes('canon') || combined.includes('kyocera')) {
        return 'Printer';
    }
    if (combined.includes('voip') || combined.includes('time access') || combined.includes('zkteco') || 
        combined.includes('nec') || combined.includes('zkt')) {
        return 'VoIP & Time Access';
    }
    if (combined.includes('cctv') || combined.includes('hikvision')) {
        return 'CCTV';
    }
    return 'Other';
}

async function seedNetworkDevices() {
    console.log('🚀 Starting Network Devices DB setup and seed process...');

    // 1. Create network_devices Table
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS \`network_devices\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`ip_address\` VARCHAR(45) NOT NULL COMMENT 'หมายเลข IP Address',
      \`device_name\` VARCHAR(255) NOT NULL COMMENT 'ชื่ออุปกรณ์/หน้าที่',
      \`brand_name\` VARCHAR(100) DEFAULT NULL COMMENT 'ยี่ห้ออุปกรณ์',
      \`model\` VARCHAR(100) DEFAULT NULL COMMENT 'รุ่นอุปกรณ์',
      \`login_user\` VARCHAR(100) DEFAULT NULL COMMENT 'Username ผู้ดูแลระบบ',
      \`login_password\` VARCHAR(255) DEFAULT NULL COMMENT 'รหัสผ่านผู้ดูแลระบบ',
      \`manage_program\` VARCHAR(255) DEFAULT NULL COMMENT 'โปรแกรม/ช่องทางบริหารจัดการ',
      \`login_ssid\` VARCHAR(255) DEFAULT NULL COMMENT 'Login Account หรือ Wi-Fi SSID',
      \`access_key\` VARCHAR(255) DEFAULT NULL COMMENT 'Wi-Fi Key / Serial Number / Access Key',
      \`purchase_date\` DATE DEFAULT NULL COMMENT 'วันที่จัดซื้อ',
      \`category\` ENUM(
        'Server',
        'Network & Security',
        'Access Point',
        'Printer',
        'VoIP & Time Access',
        'CCTV',
        'Other'
      ) NOT NULL DEFAULT 'Other' COMMENT 'หมวดหมู่อุปกรณ์',
      \`remark\` TEXT DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติม',
      \`status\` ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active' COMMENT 'สถานะอุปกรณ์',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX \`idx_network_devices_ip\` (\`ip_address\`),
      INDEX \`idx_network_devices_category\` (\`category\`),
      INDEX \`idx_network_devices_status\` (\`status\`),
      INDEX \`idx_network_devices_brand\` (\`brand_name\`),
      FULLTEXT INDEX \`idx_network_devices_search\` (\`device_name\`, \`brand_name\`, \`model\`, \`remark\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลอุปกรณ์เครือข่ายและเซิร์ฟเวอร์';
    `;

    const createAuditTableSQL = `
    CREATE TABLE IF NOT EXISTS \`audit_logs\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT DEFAULT NULL,
      \`user_name\` VARCHAR(100) DEFAULT NULL,
      \`device_id\` INT DEFAULT NULL,
      \`action\` VARCHAR(100) NOT NULL,
      \`reason\` TEXT DEFAULT NULL,
      \`ip_address\` VARCHAR(45) DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createTableSQL);
    await pool.query(createAuditTableSQL);
    console.log('✅ Table network_devices and audit_logs checked/created successfully.');

    // 2. Clear existing data to avoid duplicates on re-run
    await pool.query('TRUNCATE TABLE network_devices');

    // 3. Read Book3.xlsx
    const workbook = new ExcelJS.Workbook();
    const excelPath = path.join(__dirname, '../Book3.xlsx');
    await workbook.xlsx.readFile(excelPath);
    const ws = workbook.getWorksheet('IP-Setting');

    const devices = [];
    ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
        if (rowNum <= 6) return;

        function getCellStr(col) {
            const v = row.getCell(col).value;
            if (v === null || v === undefined) return '';
            if (typeof v === 'object') {
                if (v.result !== undefined) return String(v.result).trim();
                if (v.text !== undefined) return String(v.text).trim();
                if (v.richText) return v.richText.map(rt => rt.text).join('').trim();
            }
            return String(v).trim();
        }

        const ip = getCellStr(1);
        const device_name = getCellStr(2);
        const brand_name = getCellStr(3);
        const model = getCellStr(4);
        const login_user = getCellStr(5);
        const login_password = getCellStr(6);
        const manage_program = getCellStr(7);
        const login_ssid = getCellStr(8);
        const access_key = getCellStr(9);
        const dateRaw = row.getCell(10).value;
        const remarkRaw = getCellStr(11);

        if (!ip && !device_name) return;

        const { date, extra } = parseDate(dateRaw);
        let remark = remarkRaw;
        if (extra) {
            remark = remark ? `${remark} (${extra})` : extra;
        }

        const cat = categorizeDevice(ip, device_name, brand_name, model, remark);
        
        let final_device_name = device_name;
        if (!final_device_name) {
            if (brand_name || model) {
                final_device_name = `${brand_name} ${model}`.trim();
            } else if (ip) {
                final_device_name = `Device ${ip}`;
            } else {
                final_device_name = 'Unspecified Device';
            }
        }

        devices.push([
            ip || 'N/A',
            final_device_name,
            brand_name || null,
            model || null,
            login_user || null,
            login_password || null,
            manage_program || null,
            login_ssid || null,
            access_key || null,
            date,
            cat,
            remark || null,
            'active'
        ]);
    });

    if (devices.length > 0) {
        const insertSQL = `
        INSERT INTO network_devices (
            ip_address, device_name, brand_name, model, login_user, login_password,
            manage_program, login_ssid, access_key, purchase_date, category, remark, status
        ) VALUES ?
        `;
        await pool.query(insertSQL, [devices]);
        console.log(`🎉 Successfully seeded ${devices.length} network devices into DB.`);
    }

    const [rows] = await pool.query(`
        SELECT category, COUNT(*) as count FROM network_devices GROUP BY category
    `);
    console.log('📊 Category breakdown in database:');
    rows.forEach(r => console.log(` - ${r.category}: ${r.count} items`));

    process.exit(0);
}

seedNetworkDevices().catch(err => {
    console.error('❌ Error seeding network devices:', err);
    process.exit(1);
});
