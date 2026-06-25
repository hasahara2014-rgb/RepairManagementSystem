/* ============================================================
   RMS Enterprise v3.1 — app.js
   ✅ GAS backend จริง (Code.gs v3.4 — single file)
   ✅ Field จริง: JOB_No, Work_Order, Equipment_ID, Damage_Code ฯลฯ
   ✅ 46 SAMPLE_JOBS ข้อมูลจริง
   ✅ Fallback localStorage เมื่อ GAS offline
   ✅ Design system v3 (Inter font, CSS vars, UI helpers)
   ✅ GAS_URL อ่านจาก localStorage (bootstrap) — ไม่ hardcode ใน code
   ============================================================ */
'use strict';

/* ── CONFIG ─────────────────────────────────────────────── */
// GAS_URL_DEFAULT คือ fallback สำรอง — เปลี่ยนได้โดยไม่กระทบ runtime
// เมื่อ bootstrap() ทำงานสำเร็จ จะเขียน URL ล่าสุดลง localStorage แทน
const GAS_URL_DEFAULT = 'https://script.google.com/macros/s/AKfycbys3dgS7s6rUtWqxk1jaSTpjeHcHEAE6NUcDeyRIJ9vna8Gl2SEZodMUAvlQvW9P-jWww/exec';
const GAS_URL_STORAGE = 'rms_gas_url';

function _resolveGasUrl() {
  try { return localStorage.getItem(GAS_URL_STORAGE) || GAS_URL_DEFAULT; } catch(e) { return GAS_URL_DEFAULT; }
}

const RMS = {
  get GAS_URL() { return _resolveGasUrl(); },
  SESSION_KEY: 'rms_v3_session',
  TIMEOUT_MS:  8 * 60 * 60 * 1000,
  USE_GAS:     true,   // true = GAS จริง | false = sample data
  VERSION:     '3.1',
};

// bootstrap: อ่าน GAS URL จาก GAS เองแล้วบันทึกลง localStorage
// เรียกครั้งเดียวตอนโหลดหน้าแรก (login.html) — หน้าอื่น ๆ จะใช้ URL ที่บันทึกไว้
async function bootstrapGasUrl() {
  try {
    const res = await fetch(GAS_URL_DEFAULT + '?action=getPublicConfig', { redirect: 'follow' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.gasUrl) {
      try { localStorage.setItem(GAS_URL_STORAGE, data.gasUrl); } catch(e) {}
    }
  } catch(e) { /* ไม่ต้องทำอะไร — ใช้ default URL */ }
}

/* ── MASTER DATA (จาก Code.gs / app.js เดิม) ────────────── */
const VENDORS = [
  { Vendor_ID:'V001', Vendor_Name:'TechFix Solutions',    Email:'tech@techfix.com',          Rating:4.5, Status:'ACTIVE' },
  { Vendor_ID:'V002', Vendor_Name:'Precision Repair Co',  Email:'info@precisionrepair.com',  Rating:4.2, Status:'ACTIVE' },
  { Vendor_ID:'V003', Vendor_Name:'Elite Service Center', Email:'elite@service.com',         Rating:4.8, Status:'ACTIVE' },
];

const DAMAGE_CODES = [
  'สายพานตก','Belt Loose','Belt ตก','Belt หลุดบ่อย',
  'Belt loode ( สายพานตก )','BNA Failure','BNA Belt Loose',
  'BNA  ไม่ทำงาน','BNA Out Of Service กินเงินและเงินติดบ่อย',
  'Bank Note Jam  ที่ Note Box / เปลี่ยน Note Box  ไม่หาย',
  'Out Of Service','Extract','Extract ไม่ถีบ Notebox','Disconnect',
  'ไม่ถีบ NoteBox','ไม่ถีบ Notebox','ไม่อ่านแบ็งค์',
  'มีเสียงทำงานผิดปกติ','เฟืองตัวเขียวหมุนไม่ได้',
  'ตีวเปิดปิดลูกปืนหาย 1 ข้อและกินเงินบ่อย',
  'สายพานหลุด ลูกกลิ้งสีดำที่ใช้ฟรีซแบงค์เสื่อมสภาพ',
  'ใช้งานได้ไม่ถึง 5 นาที เสีย','ไม่ถีบ Note Box ไม่ Initial',
];

const EQUIPMENT_IDS = [
  '97155','129465','207567','207575','214933','219541','279269',
  '287489','287490','287493','287496','287497','287498','287501',
  '287504','287507','287510','287511','287512','287513','287519',
  '287520','287531','287534','287536','293817','293818','293820',
  '301455','304150','304151','304157','306779','337290','800330',
  '802910','802912','870355','872834',
];

const MATERIAL_IDS = ['10010041'];

/* ── SAMPLE JOBS (46 jobs จาก forceSeedRepairData) ──────── */
const SAMPLE_JOBS = [
  { JOB_No:'JOB-0001', Work_Order:'90176727', Refurbishment_Order:'90176756', Receive_No:'RCV-20260426-012119-821-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'287536', Damage_Code:'สายพานตก',                                          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-01', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0002', Work_Order:'90176724', Refurbishment_Order:'90176755', Receive_No:'RCV-20260426-012119-821-2',  Material_ID:'10010041', Qty:1, Equipment_ID:'287497', Damage_Code:'สายพานตก',                                          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-02', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0003', Work_Order:'90176700', Refurbishment_Order:'90176752', Receive_No:'RCV-20260426-012119-821-3',  Material_ID:'10010041', Qty:1, Equipment_ID:'301455', Damage_Code:'Belt loode ( สายพานตก )',                           Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-03', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0004', Work_Order:'90176715', Refurbishment_Order:'90176753', Receive_No:'RCV-20260426-012119-821-4',  Material_ID:'10010041', Qty:1, Equipment_ID:'800330', Damage_Code:'Bank Note Jam  ที่ Note Box / เปลี่ยน Note Box  ไม่หาย', Cause:'', Repair_Action:'Clean All',        Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-04', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0005', Work_Order:'90176790', Refurbishment_Order:'90176833', Receive_No:'RCV-20260426-012119-821-5',  Material_ID:'10010041', Qty:1, Equipment_ID:'287507', Damage_Code:'ใช้งานได้ไม่ถึง 5 นาที เสีย',                        Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-05', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0006', Work_Order:'90176850', Refurbishment_Order:'90176994', Receive_No:'RCV-20260426-012119-821-6',  Material_ID:'10010041', Qty:1, Equipment_ID:'872834', Damage_Code:'BNA Failure',                                        Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-06', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0007', Work_Order:'90176859', Refurbishment_Order:'90176997', Receive_No:'RCV-20260426-012119-821-7',  Material_ID:'10010041', Qty:1, Equipment_ID:'304150', Damage_Code:'Extract',                                            Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-07', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0008', Work_Order:'90176858', Refurbishment_Order:'90176996', Receive_No:'RCV-20260426-012119-821-8',  Material_ID:'10010041', Qty:1, Equipment_ID:'293820', Damage_Code:'สายพานตก',                                          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-08', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0009', Work_Order:'90176891', Refurbishment_Order:'90176999', Receive_No:'RCV-20260426-012119-821-9',  Material_ID:'10010041', Qty:1, Equipment_ID:'287504', Damage_Code:'สายพานตก',                                          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-09', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0010', Work_Order:'90177075', Refurbishment_Order:'90177249', Receive_No:'RCV-20260426-012119-821-10', Material_ID:'10010041', Qty:1, Equipment_ID:'287534', Damage_Code:'Extract ไม่ถีบ Notebox',                             Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-10', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0011', Work_Order:'90176739', Refurbishment_Order:'90176758', Receive_No:'RCV-20260426-012119-821-11', Material_ID:'10010041', Qty:1, Equipment_ID:'287496', Damage_Code:'ไม่ถีบ Notebox',                                    Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-11', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0012', Work_Order:'90176934', Refurbishment_Order:'90177000', Receive_No:'RCV-20260426-012119-821-12', Material_ID:'10010041', Qty:1, Equipment_ID:'287501', Damage_Code:'Out Of Service',                                     Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-12', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0013', Work_Order:'90177748', Refurbishment_Order:'90177954', Receive_No:'RCV-20260426-012119-821-13', Material_ID:'10010041', Qty:1, Equipment_ID:'287513', Damage_Code:'มีเสียงทำงานผิดปกติ',                              Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-13', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0014', Work_Order:'90177615', Refurbishment_Order:'90177948', Receive_No:'RCV-20260426-012119-821-14', Material_ID:'10010041', Qty:1, Equipment_ID:'207567', Damage_Code:'ไม่ถีบ NoteBox',                                   Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-14', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0015', Work_Order:'90177528', Refurbishment_Order:'90177958', Receive_No:'RCV-20260426-012119-821-15', Material_ID:'10010041', Qty:1, Equipment_ID:'214933', Damage_Code:'สายพานหลุด ลูกกลิ้งสีดำที่ใช้ฟรีซแบงค์เสื่อมสภาพ', Cause:'', Repair_Action:'Clean All',            Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-15', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0016', Work_Order:'90177672', Refurbishment_Order:'90177942', Receive_No:'RCV-20260426-012119-821-16', Material_ID:'10010041', Qty:1, Equipment_ID:'287510', Damage_Code:'BNA  ไม่ทำงาน',                                    Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-16', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0017', Work_Order:'90177921', Refurbishment_Order:'90178732', Receive_No:'RCV-20260426-012119-821-17', Material_ID:'10010041', Qty:1, Equipment_ID:'304151', Damage_Code:'BNA  ไม่ทำงาน',                                    Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-17', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0018', Work_Order:'90178331', Refurbishment_Order:'90178724', Receive_No:'RCV-20260426-012119-821-18', Material_ID:'10010041', Qty:1, Equipment_ID:'293818', Damage_Code:'เฟืองตัวเขียวหมุนไม่ได้',                          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-18', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0019', Work_Order:'90178564', Refurbishment_Order:'90178726', Receive_No:'RCV-20260426-012119-821-19', Material_ID:'10010041', Qty:1, Equipment_ID:'287531', Damage_Code:'BNA Out Of Service กินเงินและเงินติดบ่อย',            Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-19', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0020', Work_Order:'90178232', Refurbishment_Order:'90178722', Receive_No:'RCV-20260426-012119-821-20', Material_ID:'10010041', Qty:1, Equipment_ID:'287498', Damage_Code:'ไม่ถีบ Note Box ไม่ Initial',                       Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-20', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0021', Work_Order:'90178667', Refurbishment_Order:'90178925', Receive_No:'RCV-20260426-012119-821-21', Material_ID:'10010041', Qty:1, Equipment_ID:'97155',  Damage_Code:'Belt Loose',                                        Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-21', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0022', Work_Order:'90178002', Refurbishment_Order:'90178727', Receive_No:'RCV-20260426-012119-821-22', Material_ID:'10010041', Qty:1, Equipment_ID:'337290', Damage_Code:'Belt Loose',                                        Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-22', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0023', Work_Order:'90177204', Refurbishment_Order:'90178733', Receive_No:'RCV-20260426-012119-821-23', Material_ID:'10010041', Qty:1, Equipment_ID:'870355', Damage_Code:'Belt Loose',                                        Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-23', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0024', Work_Order:'90179025', Refurbishment_Order:'90179135', Receive_No:'RCV-20260426-013115-817-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'306779', Damage_Code:'ตีวเปิดปิดลูกปืนหาย 1 ข้อและกินเงินบ่อย',          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-01', Close_Date:'2026-06-11' },
  { JOB_No:'JOB-0025', Work_Order:'90179336', Refurbishment_Order:'90179412', Receive_No:'RCV-20260426-013115-817-2',  Material_ID:'10010041', Qty:1, Equipment_ID:'287520', Damage_Code:'Out Of Service',                                     Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-25', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0026', Work_Order:'90178966', Refurbishment_Order:'90179141', Receive_No:'RCV-20260426-013115-817-3',  Material_ID:'10010041', Qty:1, Equipment_ID:'287519', Damage_Code:'Out Of Service',                                     Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-25', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0027', Work_Order:'90178739', Refurbishment_Order:'90179140', Receive_No:'RCV-20260426-013115-817-4',  Material_ID:'10010041', Qty:1, Equipment_ID:'219541', Damage_Code:'สายพานตก',                                          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-25', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0028', Work_Order:'90179083', Refurbishment_Order:'90179411', Receive_No:'RCV-20260426-013115-817-5',  Material_ID:'10010041', Qty:1, Equipment_ID:'287489', Damage_Code:'ไม่อ่านแบ็งค์',                                    Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-25', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0029', Work_Order:'90179370', Refurbishment_Order:'90179568', Receive_No:'RCV-20260426-013115-817-6',  Material_ID:'10010041', Qty:1, Equipment_ID:'287511', Damage_Code:'Belt หลุดบ่อย',                                    Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-04-25', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0030', Work_Order:'90179505', Refurbishment_Order:'90179658', Receive_No:'RCV-20260426-013115-817-7',  Material_ID:'10010041', Qty:1, Equipment_ID:'293817', Damage_Code:'สายพานตก',                                          Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-01', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0031', Work_Order:'90179687', Refurbishment_Order:'90179911', Receive_No:'RCV-20260426-013115-817-8',  Material_ID:'10010041', Qty:1, Equipment_ID:'129465', Damage_Code:'Belt ตก',                                           Cause:'', Repair_Action:'Clean All',             Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-01', Close_Date:'2026-05-01' },
  { JOB_No:'JOB-0032', Work_Order:'90178802', Refurbishment_Order:'90178927', Receive_No:'RCV-20260504-140120-095-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'287496', Damage_Code:'Belt ตก',                                           Cause:'', Repair_Action:'Adjust Alignment Belt',  Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-04', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0033', Work_Order:'90177695', Refurbishment_Order:'90177952', Receive_No:'RCV-20260504-140620-527-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'287507', Damage_Code:'Belt ตก',                                           Cause:'', Repair_Action:'Adjust Alignment Belt',  Vendor_ID:'V001', Status:'RETURNED',    Create_Date:'2026-05-04', Close_Date:'' },
  { JOB_No:'JOB-0034', Work_Order:'90178787', Refurbishment_Order:'90178931', Receive_No:'RCV-20260504-141753-385-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'287534', Damage_Code:'Belt ตก',                                           Cause:'', Repair_Action:'Adjust Alignment Belt',  Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-04', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0035', Work_Order:'90179421', Refurbishment_Order:'90179660', Receive_No:'RCV-20260504-142037-222-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'287496', Damage_Code:'Belt ตก',                                           Cause:'', Repair_Action:'Adjust Alignment Belt',  Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-04', Close_Date:'2026-05-04' },
  { JOB_No:'JOB-0036', Work_Order:'90179944', Refurbishment_Order:'90180315', Receive_No:'RCV-20260504-143951-253-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'207575', Damage_Code:'Out Of Service',          Cause:'', Repair_Action:'Clean All',              Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-06', Close_Date:'2026-05-06' },
  { JOB_No:'JOB-0037', Work_Order:'90180295', Refurbishment_Order:'90180459', Receive_No:'RCV-20260504-143951-253-2',  Material_ID:'10010041', Qty:1, Equipment_ID:'802910', Damage_Code:'BNA Failure',             Cause:'', Repair_Action:'Inspect & Test BNA',     Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-05-04', Close_Date:'' },
  { JOB_No:'JOB-0038', Work_Order:'90179987', Refurbishment_Order:'90180316', Receive_No:'RCV-20260504-143951-253-3',  Material_ID:'10010041', Qty:1, Equipment_ID:'287489', Damage_Code:'Belt ตก',                Cause:'', Repair_Action:'Adjust Alignment Belt',  Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-05-04', Close_Date:'' },
  { JOB_No:'JOB-0039', Work_Order:'90180273', Refurbishment_Order:'90180456', Receive_No:'RCV-20260504-143951-253-4',  Material_ID:'10010041', Qty:1, Equipment_ID:'287512', Damage_Code:'Electrical Fault',       Cause:'', Repair_Action:'Replace Power Module',   Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-03', Close_Date:'2026-06-17' },
  { JOB_No:'JOB-0040', Work_Order:'90179751', Refurbishment_Order:'90179913', Receive_No:'RCV-20260504-143951-253-5',  Material_ID:'10010041', Qty:1, Equipment_ID:'802912', Damage_Code:'มีเสียงทำงานผิดปกติ',  Cause:'', Repair_Action:'Lubricate & Adjust',    Vendor_ID:'V001', Status:'CLOSED',      Create_Date:'2026-05-06', Close_Date:'2026-05-06' },
  { JOB_No:'JOB-0041', Work_Order:'90180361', Refurbishment_Order:'90180462', Receive_No:'RCV-20260504-143951-253-6',  Material_ID:'10010041', Qty:1, Equipment_ID:'287511', Damage_Code:'Belt ตก',                Cause:'', Repair_Action:'Adjust Alignment Belt',  Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-05-04', Close_Date:'' },
  { JOB_No:'JOB-0042', Work_Order:'',         Refurbishment_Order:'90181199', Receive_No:'RCV-20260531-102534-435-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'870355', Damage_Code:'BNA Belt Loose',         Cause:'', Repair_Action:'Replace Belt & Align',   Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-06-07', Close_Date:'' },
  { JOB_No:'JOB-0043', Work_Order:'',         Refurbishment_Order:'90181329', Receive_No:'RCV-20260531-102534-435-2',  Material_ID:'10010041', Qty:1, Equipment_ID:'287493', Damage_Code:'BNA Belt Loose',         Cause:'', Repair_Action:'Replace Belt & Align',   Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-06-07', Close_Date:'' },
  { JOB_No:'JOB-0044', Work_Order:'',         Refurbishment_Order:'90181172', Receive_No:'RCV-20260531-102534-435-3',  Material_ID:'10010041', Qty:1, Equipment_ID:'304157', Damage_Code:'Disconnect',             Cause:'', Repair_Action:'Check Cable & Connector', Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-06-07', Close_Date:'' },
  { JOB_No:'JOB-0045', Work_Order:'',         Refurbishment_Order:'',         Receive_No:'RCV-20260613-165709-948-1',  Material_ID:'10010041', Qty:1, Equipment_ID:'279269', Damage_Code:'Out Of Service',         Cause:'', Repair_Action:'Inspect & Test BNA',     Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-06-11', Close_Date:'' },
  { JOB_No:'JOB-0046', Work_Order:'',         Refurbishment_Order:'',         Receive_No:'RCV-20260613-165709-948-2',  Material_ID:'10010041', Qty:1, Equipment_ID:'287490', Damage_Code:'สายพานตก',             Cause:'', Repair_Action:'Adjust Alignment Belt',  Vendor_ID:'V001', Status:'SEND_REPAIR', Create_Date:'2026-06-11', Close_Date:'' },
];

/* ── LOCAL STATE ─────────────────────────────────────────── */
let _localJobs = (function(){
  try {
    const s = localStorage.getItem('rms_v3_jobs');
    return s ? JSON.parse(s) : [...SAMPLE_JOBS];
  } catch(e) { return [...SAMPLE_JOBS]; }
})();

function _saveLocal() {
  try { localStorage.setItem('rms_v3_jobs', JSON.stringify(_localJobs)); } catch(e) {}
}

/* ── AUTH ────────────────────────────────────────────────── */
const Auth = {
  getUser() {
    try {
      const raw = sessionStorage.getItem(RMS.SESSION_KEY) || localStorage.getItem(RMS.SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (Date.now() - (s.loginTime||0) > RMS.TIMEOUT_MS) { this.logout(false); return null; }
      return s;
    } catch(e) { return null; }
  },
  setUser(data) {
    const payload = JSON.stringify({ ...data, loginTime: Date.now() });
    try { sessionStorage.setItem(RMS.SESSION_KEY, payload); } catch(e) {}
    try { localStorage.setItem(RMS.SESSION_KEY, payload); } catch(e) {}
  },
  isLoggedIn()  { return !!this.getUser(); },
  isAdmin()     { const u = this.getUser(); return u && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'); },
  isManager()   { const u = this.getUser(); return u && ['ADMIN','SUPER_ADMIN','MANAGER'].includes(u.role); },
  getUsername() { return (this.getUser() || {}).name || '—'; },
  getRole()     { return (this.getUser() || {}).role || 'USER'; },
  logout(redirect = true) {
    try { sessionStorage.removeItem(RMS.SESSION_KEY); } catch(e) {}
    try { localStorage.removeItem(RMS.SESSION_KEY); } catch(e) {}
    if (redirect) window.location.href = 'login.html';
  },
  guard() {
    const page = location.pathname.split('/').pop() || '';
    if (['login.html','index.html',''].includes(page)) return;
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  },
};

/* ── GAS CALLER ─────────────────────────────────────────── */
async function callGAS(action, payload) {
  payload = payload || {};
  try {
    UI.loading(true);
    const u = Auth.getUser();
    const params = new URLSearchParams({
      action,
      token:   u ? (u.token || '') : '',
      payload: encodeURIComponent(JSON.stringify(payload)),
    });
    const res = await fetch(RMS.GAS_URL + '?' + params, { method:'GET', redirect:'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch(err) {
    console.warn('callGAS(' + action + ') failed:', err.message);
    return { success: false, error: err.message, _offline: true };
  } finally {
    UI.loading(false);
  }
}

/* ── DATASTORE ───────────────────────────────────────────── */
const DataStore = {

  async getJobs(filter) {
    filter = filter || {};
    if (RMS.USE_GAS) {
      const res = await callGAS('getJobs', filter);
      if (res.success && res.data) {
        _localJobs = res.data;
        _saveLocal();
        return res.data;
      }
    }
    // fallback local
    let jobs = [..._localJobs];
    const { status, vendorId, damageCode, dateFrom, dateTo, search } = filter;
    if (status && status !== 'ALL') jobs = jobs.filter(j => j.Status === status);
    if (vendorId)   jobs = jobs.filter(j => j.Vendor_ID === vendorId);
    if (damageCode) jobs = jobs.filter(j => j.Damage_Code === damageCode);
    if (dateFrom)   jobs = jobs.filter(j => String(j.Create_Date) >= dateFrom);
    if (dateTo)     jobs = jobs.filter(j => String(j.Create_Date) <= dateTo);
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        String(j.JOB_No).toLowerCase().includes(q) ||
        String(j.Work_Order).toLowerCase().includes(q) ||
        String(j.Equipment_ID).toLowerCase().includes(q) ||
        String(j.Receive_No).toLowerCase().includes(q) ||
        String(j.Damage_Code).toLowerCase().includes(q)
      );
    }
    return jobs;
  },

  async getJobById(jobNo) {
    if (RMS.USE_GAS) {
      const res = await callGAS('getJobById', { jobNo });
      if (res.success) return res.data;
    }
    return _localJobs.find(j => j.JOB_No === jobNo) || null;
  },

  async createJob(data) {
    if (RMS.USE_GAS) {
      const res = await callGAS('createJob', { data });
      if (res.success) { _localJobs.unshift(data); _saveLocal(); return res; }
    }
    _localJobs.unshift({ ...data, Created_By: Auth.getUsername() });
    _saveLocal();
    return { success: true };
  },

  async updateJob(jobNo, data) {
    if (RMS.USE_GAS) {
      const res = await callGAS('updateJob', { jobNo, data });
      if (res.success) {
        const idx = _localJobs.findIndex(j => j.JOB_No === jobNo);
        if (idx >= 0) { _localJobs[idx] = { ..._localJobs[idx], ...data }; _saveLocal(); }
        return res;
      }
    }
    const idx = _localJobs.findIndex(j => j.JOB_No === jobNo);
    if (idx >= 0) { _localJobs[idx] = { ..._localJobs[idx], ...data }; _saveLocal(); }
    return { success: true };
  },

  async deleteJob(jobNo) {
    if (RMS.USE_GAS) {
      const res = await callGAS('deleteJob', { jobNo });
      if (res.success) { _localJobs = _localJobs.filter(j => j.JOB_No !== jobNo); _saveLocal(); return res; }
    }
    _localJobs = _localJobs.filter(j => j.JOB_No !== jobNo);
    _saveLocal();
    return { success: true };
  },

  async generateJobNo() {
    if (RMS.USE_GAS) {
      const res = await callGAS('generateJobNo');
      if (res.success) return res.jobNo;
    }
    const nums = _localJobs.map(j => parseInt(String(j.JOB_No).replace('JOB-','')) || 0);
    return 'JOB-' + String(Math.max(0, ...nums) + 1).padStart(4, '0');
  },

  async generateReceiveNo() {
    if (RMS.USE_GAS) {
      const res = await callGAS('generateReceiveNo');
      if (res.success) return res.receiveNo;
    }
    const now = new Date();
    const d = now.toISOString().slice(0,10).replace(/-/g,'');
    const t = now.toTimeString().slice(0,8).replace(/:/g,'');
    return 'RCV-' + d + '-' + t + '-' + (Math.floor(Math.random()*900)+100) + '-' + (_localJobs.length+1);
  },

  async getDashboard() {
    if (RMS.USE_GAS) {
      const res = await callGAS('getDashboard');
      if (res.success) return res;
    }
    // local fallback — สร้าง dashboard จาก _localJobs
    const jobs = [..._localJobs];
    const cnt  = { total:jobs.length, open:0, send:0, returned:0, closed:0 };
    jobs.forEach(j => {
      const s = (j.Status||'').toLowerCase();
      if (s === 'open')        cnt.open++;
      if (s === 'send_repair') cnt.send++;
      if (s === 'returned')    cnt.returned++;
      if (s === 'closed')      cnt.closed++;
    });
    // Monthly trend
    const y = new Date().getFullYear();
    const monthlyTrend = Array(12).fill(0);
    jobs.forEach(j => { const d = new Date(j.Create_Date); if(!isNaN(d)&&d.getFullYear()===y) monthlyTrend[d.getMonth()]++; });
    // MTTR
    const cl = jobs.filter(j => j.Status==='CLOSED'&&j.Create_Date&&j.Close_Date);
    const mttr = cl.length ? parseFloat((cl.reduce((a,j)=>a+(new Date(j.Close_Date)-new Date(j.Create_Date))/86400000,0)/cl.length).toFixed(1)) : 0;
    // MTBF = เฉลี่ยวันระหว่าง failure ต่อเครื่อง แล้ว avg ข้ามทุกเครื่อง
    const equipJobs = {};
    jobs.filter(j => j.Equipment_ID && j.Create_Date).forEach(j => {
      if (!equipJobs[j.Equipment_ID]) equipJobs[j.Equipment_ID] = [];
      equipJobs[j.Equipment_ID].push(new Date(j.Create_Date).getTime());
    });
    const equipMtbfs = [];
    Object.values(equipJobs).forEach(dates => {
      if (dates.length < 2) return;
      dates.sort((a, b) => a - b);
      let sum = 0;
      for (let i = 1; i < dates.length; i++) sum += (dates[i] - dates[i-1]) / 86400000;
      equipMtbfs.push(sum / (dates.length - 1));
    });
    const mtbf = equipMtbfs.length
      ? parseFloat((equipMtbfs.reduce((a, v) => a + v, 0) / equipMtbfs.length).toFixed(1))
      : 0;
    // Top damage
    const dmgMap = {};
    jobs.forEach(j => { if(j.Damage_Code) dmgMap[j.Damage_Code]=(dmgMap[j.Damage_Code]||0)+1; });
    const topDamage = Object.entries(dmgMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([code,count])=>({code,count}));
    return { success:true, stats:cnt, monthlyTrend, topDamage, kpis:{ mttr, mtbf, closeRate: cnt.total?Math.round(cnt.closed/cnt.total*100):0 } };
  },

  async getVendors() {
    if (RMS.USE_GAS) {
      const res = await callGAS('getVendors');
      if (res.success) return res.data;
    }
    return [...VENDORS];
  },

  async getDamageCodes() {
    if (RMS.USE_GAS) {
      const res = await callGAS('getDamageCodes');
      if (res.success) return res.data;
    }
    return [...DAMAGE_CODES];
  },

  async getUsers() {
    if (RMS.USE_GAS) return await callGAS('getUsers');
    return { success: true, data: [] };
  },

  async exportReport(params) {
    if (RMS.USE_GAS) return await callGAS('exportReport', params);
    return { success: false, error: 'ต้องเชื่อมต่อ GAS ก่อน export' };
  },
};

/* ── UI HELPERS ──────────────────────────────────────────── */
const UI = {

  statusBadge(status) {
    const s = (status || '').toUpperCase().replace(/ /g,'_');
    const M = {
      OPEN:        { bg:'rgba(243,156,18,.12)',  color:'#b7770d',  label:'OPEN'        },
      SEND_REPAIR: { bg:'rgba(27,154,170,.12)',  color:'#0e7490',  label:'SEND REPAIR' },
      RETURNED:    { bg:'rgba(15,76,129,.12)',   color:'#0F4C81',  label:'RETURNED'    },
      CLOSED:      { bg:'rgba(46,204,113,.12)',  color:'#16a34a',  label:'CLOSED'      },
    };
    const c = M[s] || { bg:'rgba(100,116,139,.12)', color:'#475569', label: status };
    return '<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:.65rem;font-weight:700;letter-spacing:.3px;background:' + c.bg + ';color:' + c.color + '">' + c.label + '</span>';
  },

  toast(msg, type, duration) {
    type = type || 'success'; duration = duration || 3500;
    const ICON  = { success:'fa-check-circle', danger:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
    const COLOR = { success:'#16a34a', danger:'#dc2626', warning:'#d97706', info:'#0284c7' };
    const icon  = ICON[type]  || ICON.info;
    const color = COLOR[type] || COLOR.info;

    let tc = document.getElementById('_rmsTC');
    if (!tc) {
      tc = document.createElement('div');
      tc.id = '_rmsTC';
      tc.style.cssText = 'position:fixed;bottom:22px;right:22px;z-index:99999;display:flex;flex-direction:column;gap:7px;pointer-events:none;';
      document.body.appendChild(tc);
    }
    if (!document.getElementById('_rmsKF')) {
      const s = document.createElement('style');
      s.id = '_rmsKF';
      s.textContent = '@keyframes _tIn{from{opacity:0;transform:translateX(16px) scale(.96)}to{opacity:1;transform:none}}@keyframes _tOut{from{opacity:1;transform:none}to{opacity:0;transform:translateX(16px) scale(.96)}}';
      document.head.appendChild(s);
    }
    const t = document.createElement('div');
    t.style.cssText = 'background:#1e293b;color:#f1f5f9;padding:11px 16px;border-radius:9px;font-size:.82rem;font-weight:500;display:flex;align-items:center;gap:9px;box-shadow:0 12px 32px rgba(0,0,0,.2);animation:_tIn .2s ease;pointer-events:all;max-width:310px;border-left:3px solid ' + color + ';font-family:"Inter","Noto Sans Thai",sans-serif;';
    t.innerHTML = '<i class="fas ' + icon + '" style="color:' + color + ';font-size:.82rem;flex-shrink:0"></i><span>' + msg + '</span>';
    tc.appendChild(t);
    setTimeout(function() { t.style.animation = '_tOut .18s ease forwards'; setTimeout(function(){ try{t.remove();}catch(e){} },200); }, duration);
  },

  confirm(msg, onOk) {
    const ex = document.getElementById('_rmsCD'); if(ex) ex.remove();
    const ov = document.createElement('div');
    ov.id = '_rmsCD';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = '<div style="background:#fff;border-radius:16px;padding:26px 24px;max-width:360px;width:100%;box-shadow:0 20px 56px rgba(0,0,0,.2);font-family:\'Inter\',\'Noto Sans Thai\',sans-serif">'
      + '<p style="font-size:.86rem;color:#334155;font-weight:500;margin-bottom:20px;line-height:1.6">' + msg + '</p>'
      + '<div style="display:flex;gap:8px">'
      + '<button id="_rmsCC" style="flex:1;padding:9px;border:1.5px solid #e2e8f0;border-radius:7px;background:#f8fafc;color:#64748b;font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit">ยกเลิก</button>'
      + '<button id="_rmsCO" style="flex:1;padding:9px;border:none;border-radius:7px;background:#0F4C81;color:#fff;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit">ยืนยัน</button>'
      + '</div></div>';
    document.body.appendChild(ov);
    document.