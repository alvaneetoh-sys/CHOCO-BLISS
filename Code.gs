// Choco Bliss - Google Apps Script backend
// Spreadsheet ID supplied by the store owner:
const SPREADSHEET_ID = "1BZeDjPZ22Y9st8kW3JeEIeMp_8w5BBVQC6S-yvsKqTs";
const SHEET_ORDERS = "Orders";
const SHEET_ITEMS = "OrderItems";
const HEADERS_ORDERS = ["OrderID","CreatedAt","CustomerName","Phone","Address","Postcode","Note","Total","Status"];
const HEADERS_ITEMS = ["OrderID","SKU","ProductName","Quantity","UnitPrice","LineTotal"];

function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureSheet_(ss, SHEET_ORDERS, HEADERS_ORDERS);
  ensureSheet_(ss, SHEET_ITEMS, HEADERS_ITEMS);
  return "Ready: " + ss.getUrl();
}
function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
}
function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (!payload.customerName || !payload.phone || !payload.address || !payload.postcode || !Array.isArray(payload.items) || !payload.items.length) throw new Error("ข้อมูลคำสั่งซื้อไม่ครบ");
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    ensureSheet_(ss, SHEET_ORDERS, HEADERS_ORDERS);
    ensureSheet_(ss, SHEET_ITEMS, HEADERS_ITEMS);
    const orderId = "CB" + Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyyMMddHHmmss") + Math.floor(Math.random()*90+10);
    const orderSh = ss.getSheetByName(SHEET_ORDERS);
    const itemSh = ss.getSheetByName(SHEET_ITEMS);
    const items = payload.items;
    const total = items.reduce((s,x)=>s+(Number(x.qty)||0)*(Number(x.unitPrice)||0),0);
    orderSh.appendRow([orderId, new Date(), safe_(payload.customerName), safe_(payload.phone), safe_(payload.address), safe_(payload.postcode), safe_(payload.note||""), total, "รอหยิบสินค้า"]);
    items.forEach(x => itemSh.appendRow([orderId, safe_(x.sku), safe_(x.name), Number(x.qty)||0, Number(x.unitPrice)||0, (Number(x.qty)||0)*(Number(x.unitPrice)||0)]));
    return json_({ok:true,orderId:orderId});
  } catch(err) { return json_({ok:false,error:String(err)}); }
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== "list") return json_({ok:true,message:"Choco Bliss API ready"});
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureSheet_(ss, SHEET_ORDERS, HEADERS_ORDERS);
  ensureSheet_(ss, SHEET_ITEMS, HEADERS_ITEMS);
  const values = ss.getSheetByName(SHEET_ORDERS).getDataRange().getValues();
  const itemValues = ss.getSheetByName(SHEET_ITEMS).getDataRange().getValues();
  const orders = {};
  values.slice(1).forEach(r => {
    if (!r[0]) return;
    orders[r[0]] = {orderId:r[0],createdAt:r[1] instanceof Date ? r[1].toISOString() : r[1],customerName:r[2],phone:r[3],address:r[4],postcode:r[5],note:r[6],total:r[7],status:r[8],items:[]};
  });
  itemValues.slice(1).forEach(r => { if (orders[r[0]]) orders[r[0]].items.push({sku:r[1],name:r[2],qty:r[3],unitPrice:r[4],lineTotal:r[5]}); });
  const result = {orders:Object.values(orders).reverse()};
  if (p.callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(p.callback)) return ContentService.createTextOutput(p.callback+"("+JSON.stringify(result)+");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  return json_(result);
}
function safe_(v) { return String(v == null ? "" : v).replace(/[\r\n]/g," ").trim(); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
