/**
 * DalaalStreet - WhatsApp OTP & Signup Logger
 */

const BAILEYS_SERVER_URL = 'https://dalaalstreetss.alwaysdata.net'; 
const SPREADSHEET_ID = '1Jirb8fffEd0b7kD0-fF7u3MpAcvUuDH_nua661VKnzQ';

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    
    let data = e.parameter || {};
    if (e.postData && e.postData.contents) {
      try { data = Object.assign(data, JSON.parse(e.postData.contents)); } catch (f) {
        const contents = e.postData.contents;
        const pairs = contents.split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          data[decodeURIComponent(key)] = decodeURIComponent(value);
        });
      }
    }

    // --- PHASE 1: Check User (New Action) ---
    if (data.action === 'checkUser') {
      const rows = sheet.getDataRange().getValues();
      const searchPhone = data.phone.toString().replace(/\D/g, '');
      
      for (let i = 1; i < rows.length; i++) {
        const rowPhone = rows[i][1].toString().replace(/\D/g, '');
        if (rowPhone === searchPhone) {
          const userData = {
            status: 'found',
            name: rows[i][2],
            email: rows[i][3] || 'N/A',
            city: rows[i][4] || 'N/A',
            pincode: rows[i][5] || 'N/A'
          };
          return ContentService.createTextOutput(JSON.stringify(userData))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'not_found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- PHASE 2: WhatsApp OTP Dispatch ---
    if (data.message) {
      const url = `${BAILEYS_SERVER_URL}/send-otp?phone=${encodeURIComponent(data.phone)}&message=${encodeURIComponent(data.message)}`;
      UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
    }

    // --- PHASE 3: Signup Logging ---
    if (data.name) {
      let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      if (headers[0] === "") {
        headers = ['timestamp', 'phone', 'name', 'email', 'city', 'pincode'];
        sheet.getRange(1, 1, 1, 6).setValues([headers]);
      }
      const newRow = [new Date(), data.phone, data.name, data.email || '', data.city || '', data.pincode || ''];
      sheet.appendRow(newRow);
    }

    return ContentService.createTextOutput("success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    return ContentService.createTextOutput("error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
