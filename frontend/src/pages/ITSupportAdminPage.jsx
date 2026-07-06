import { useState, useEffect } from 'react';
import { ArrowLeft, Search, CheckCircle, X, User, Plus, FileText, Download, Calendar as CalendarIcon, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ITSupportAdminPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', admin_note: '', assigned_to: '' });

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/it-support');
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setTickets(result.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'รอรับเรื่อง': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'กำลังดำเนินการ': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'แก้ไขเสร็จสิ้น': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateData({ 
      status: ticket.status, 
      admin_note: ticket.admin_note || '',
      assigned_to: ticket.assigned_to || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/it-support/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        Swal.fire('บันทึกสำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว', 'success');
        setSelectedTicket(null);
        fetchTickets(); 
      }
    } catch (error) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  // กรองข้อมูล
  const filteredTickets = tickets.filter(ticket => {
    const matchSearch = 
      ticket.ticket_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.department.toLowerCase().includes(searchTerm.toLowerCase());

    let matchDate = true;
    const ticketDate = ticket.created_at ? ticket.created_at.split('T')[0] : '';
    if (startDate && endDate) {
      matchDate = ticketDate >= startDate && ticketDate <= endDate;
    }

    return matchSearch && matchDate;
  });

  // 🌟 1. ฟังก์ชันออกรายงาน PDF 🌟
  const handleExportPDF = () => {
    if (!startDate || !endDate) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือก "จากวันที่" และ "ถึงวันที่" ให้ครบถ้วนก่อนออกรายงาน', 'warning');
      return;
    }
    window.print(); // เรียกหน้าต่าง Print ของเบราว์เซอร์
  };

// 🌟 2. ฟังก์ชันดาวน์โหลด Excel (พร้อมเส้นตารางและจัดฟอร์แมตสวยงาม) 🌟
  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือก "จากวันที่" และ "ถึงวันที่" ให้ครบถ้วนก่อนดาวน์โหลด', 'warning');
      return;
    }
    if (filteredTickets.length === 0) {
      Swal.fire('แจ้งเตือน', 'ไม่พบข้อมูลในช่วงเวลาที่เลือก', 'warning');
      return;
    }

    // 1. สร้างไฟล์และแผ่นงาน (Workbook & Worksheet)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('สรุปแจ้งซ่อม IT');

    // 2. กำหนดหัวตาราง (Headers) และความกว้างของคอลัมน์
    worksheet.columns = [
      { header: 'รหัสทิกเก็ต', key: 'ticket_no', width: 15 },
      { header: 'วันที่แจ้ง', key: 'created_at', width: 15 },
      { header: 'ผู้แจ้ง', key: 'name', width: 20 },
      { header: 'แผนก', key: 'department', width: 15 },
      { header: 'หมวดหมู่', key: 'category', width: 25 },
      { header: 'ความเร่งด่วน', key: 'urgency', width: 20 },
      { header: 'รายละเอียดปัญหา', key: 'description', width: 40 },
      { header: 'ผู้รับผิดชอบ', key: 'assigned_to', width: 20 },
      { header: 'สถานะ', key: 'status', width: 15 },
      { header: 'บันทึกของ IT', key: 'admin_note', width: 40 }
    ];

    // 3. ใส่ข้อมูลลงตาราง
    filteredTickets.forEach(ticket => {
      worksheet.addRow({
        ticket_no: ticket.ticket_no,
        created_at: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('th-TH') : '',
        name: ticket.name,
        department: ticket.department,
        category: ticket.category,
        urgency: ticket.urgency,
        description: ticket.description,
        assigned_to: ticket.assigned_to || 'ยังไม่ระบุ',
        status: ticket.status,
        admin_note: ticket.admin_note || ''
      });
    });

    // 4. 🌟 จัดรูปแบบ (ใส่เส้นตาราง, ทำตัวหนา, จัดกึ่งกลาง) 🌟
    // แต่งหัวตาราง (แถวที่ 1)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // วนลูปตีเส้นตารางให้ "ทุกช่อง" ที่มีข้อมูล
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        // จัดให้ข้อความอยู่ตรงกลางแนวตั้ง และปัดบรรทัดอัตโนมัติ (Wrap Text)
        cell.alignment = { vertical: 'middle', wrapText: true };
        
        // ตีเส้นขอบตาราง (Borders) ทั้ง 4 ด้าน
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // 5. สั่งดาวน์โหลดไฟล์
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `IT_Support_Report_${startDate}_ถึง_${endDate}.xlsx`);

      Swal.fire({
        title: 'สร้างรายงานสำเร็จ',
        text: 'ดาวน์โหลดไฟล์ Excel พร้อมเส้นตารางเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Excel Export Error:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถสร้างไฟล์ Excel ได้', 'error');
    }
  };

  // คำนวณสถิติสำหรับผู้บริหาร
  const stats = {
    total: filteredTickets.length,
    completed: filteredTickets.filter(t => t.status === 'แก้ไขเสร็จสิ้น').length,
    pending: filteredTickets.filter(t => t.status === 'รอรับเรื่อง' || t.status === 'กำลังดำเนินการ').length
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* ========================================== */}
      {/* 🌟 ส่วนหน้าจอปกติ (ซ่อนตอนปริ้น PDF) 🌟 */}
      {/* ========================================== */}
      <div className="print:hidden pb-12">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-slate-900">ระบบจัดการแจ้งซ่อม IT (Admin)</h1>
            </div>
            
            <button 
              onClick={() => navigate('/it-support', { state: { fromAdmin: true } })} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} /> แจ้งงานใหม่
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 mt-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            
            {/* แถบค้นหา */}
            <div className="relative w-full lg:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="ค้นหารหัส ชื่อ หรือแผนก..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* แถบเลือกวันที่ + ปุ่ม Export */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <CalendarIcon size={16} className="text-slate-500 ml-2" />
                <input 
                  type="date" 
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-indigo-500"
                  value={startDate} onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-slate-500 text-sm">ถึง</span>
                <input 
                  type="date" 
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-indigo-500"
                  value={endDate} onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              {/* 🌟 เพิ่มปุ่มเป็น 2 ปุ่ม: Excel และ PDF 🌟 */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
                  title="ดาวน์โหลดเป็นไฟล์ Excel (CSV)"
                >
                  <Download size={16} /> Excel
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
                  title="พิมพ์หน้าจอเป็น PDF สรุปสำหรับผู้บริหาร"
                >
                  <FileText size={16} /> PDF
                </button>
              </div>
            </div>

          </div>

          {/* ตารางข้อมูล */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                    <th className="px-6 py-4 font-medium">รหัสทิกเก็ต</th>
                    <th className="px-6 py-4 font-medium">วันที่แจ้ง</th>
                    <th className="px-6 py-4 font-medium">ผู้แจ้ง (แผนก)</th>
                    <th className="px-6 py-4 font-medium">ปัญหา</th>
                    <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                    <th className="px-6 py-4 font-medium text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-indigo-600">{ticket.ticket_no}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('th-TH') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{ticket.name}</div>
                          <div className="text-xs text-slate-500">{ticket.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-800 line-clamp-1">{ticket.description}</div>
                          <div className="text-xs text-slate-500">{ticket.category}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openUpdateModal(ticket)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-indigo-100"
                          >
                            ตรวจสอบ
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-500">ไม่พบข้อมูล</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================== */}
      {/* 🌟 ส่วนหน้ากระดาษ PDF (แสดงเฉพาะตอนปริ้น) 🌟 */}
      {/* ========================================== */}
      <div className="hidden print:block print:bg-white print:text-black p-8 font-sans">
        
        <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-wider mb-2">ASCG Group</h1>
          <h2 className="text-xl font-bold text-slate-700">รายงานสรุปการแจ้งซ่อมและปัญหา IT (Executive Summary)</h2>
          <p className="text-slate-500 mt-2 font-medium">
            ข้อมูลตั้งแต่วันที่ {startDate ? new Date(startDate).toLocaleDateString('th-TH') : '-'} 
            &nbsp;ถึง&nbsp; 
            {endDate ? new Date(endDate).toLocaleDateString('th-TH') : '-'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="border border-slate-300 rounded-lg p-5 text-center bg-slate-50">
            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">เคสทั้งหมด</div>
            <div className="text-4xl font-black text-slate-900">{stats.total}</div>
          </div>
          <div className="border border-green-300 rounded-lg p-5 text-center bg-green-50">
            <div className="text-green-700 text-sm font-bold uppercase tracking-wider mb-2">แก้ไขเสร็จสิ้น</div>
            <div className="text-4xl font-black text-green-700">{stats.completed}</div>
          </div>
          <div className="border border-orange-300 rounded-lg p-5 text-center bg-orange-50">
            <div className="text-orange-700 text-sm font-bold uppercase tracking-wider mb-2">กำลังดำเนินการ / รอรับเรื่อง</div>
            <div className="text-4xl font-black text-orange-700">{stats.pending}</div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PieChart size={20} /> รายละเอียดทิกเก็ต
        </h3>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300">
              <th className="py-3 px-2 font-bold text-slate-700">รหัส</th>
              <th className="py-3 px-2 font-bold text-slate-700">วันที่</th>
              <th className="py-3 px-2 font-bold text-slate-700">ผู้แจ้ง (แผนก)</th>
              <th className="py-3 px-2 font-bold text-slate-700">หมวดหมู่ปัญหา</th>
              <th className="py-3 px-2 font-bold text-slate-700">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="py-3 px-2 font-semibold">{ticket.ticket_no}</td>
                <td className="py-3 px-2 text-slate-600">
                  {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('th-TH') : '-'}
                </td>
                <td className="py-3 px-2">
                  <div className="font-bold">{ticket.name}</div>
                  <div className="text-xs text-slate-500">{ticket.department}</div>
                </td>
                <td className="py-3 px-2 text-slate-700">{ticket.category}</td>
                <td className="py-3 px-2">
                  <span className={`font-bold ${ticket.status === 'แก้ไขเสร็จสิ้น' ? 'text-green-600' : 'text-orange-500'}`}>
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>


      </div>

      {/* ========================================== */}
      {/* 🌟 MODAL ป๊อปอัป (ซ่อนตอนปริ้นเช่นกัน) 🌟 */}
      {/* ========================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                จัดการรายการ: <span className="text-indigo-600">{selectedTicket.ticket_no}</span>
              </h2>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-slate-500">ปัญหาที่แจ้ง: ({selectedTicket.category})</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedTicket.urgency?.includes('สูง') ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                    ด่วน: {selectedTicket.urgency?.split(' ')[0]}
                  </span>
                </div>
                <p className="font-medium text-slate-900">{selectedTicket.description}</p>
                <p className="text-xs text-slate-400 mt-2">แจ้งโดย: {selectedTicket.name} ({selectedTicket.department})</p>
              </div>

              <form id="update-ticket-form" onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">มอบหมายผู้รับผิดชอบ (Assign To)</label>
                  <input 
                    type="text"
                    value={updateData.assigned_to} 
                    onChange={(e) => setUpdateData({...updateData, assigned_to: e.target.value})}
                    placeholder="พิมพ์ชื่อเจ้าหน้าที่ผู้รับผิดชอบ..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">สถานะงาน</label>
                  <select 
                    value={updateData.status} 
                    onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="แก้ไขเสร็จสิ้น">แก้ไขเสร็จสิ้น</option>
                    <option value="ยกเลิก">ยกเลิกรายการ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">บันทึกการซ่อม / สาเหตุการแก้ไข (Admin Note)</label>
                  <textarea 
                    value={updateData.admin_note} 
                    onChange={(e) => setUpdateData({...updateData, admin_note: e.target.value})}
                    rows="3"
                    placeholder="พิมพ์บันทึกการซ่อม หรือสาเหตุการแก้ไขที่นี่..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                type="button" onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" form="update-ticket-form"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <CheckCircle size={18} /> บันทึกการอัปเดต
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}