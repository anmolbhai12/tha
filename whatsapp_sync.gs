/**
 * DalaalStreet - WhatsApp OTP & Signup Logger
 * 
 * 1. Open a Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Update the BAILEYS_SERVER_URL and SPREADSHEET_ID.
 * 5. Deploy as Web App (Me, Anyone).
 */

const BAILEYS_SERVER_URL = 'https://aurelio-bot.alwaysdata.net'; 
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
        // Fallback for form-data
        const contents = e.postData.contents;
        const pairs = contents.split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          data[decodeURIComponent(key)] = decodeURIComponent(value);
        });
      }
    }

    // --- PHASE 1: WhatsApp OTP Dispatch ---
    if (data.message) {
      const url = `${BAILEYS_SERVER_URL}/send-otp?phone=${encodeURIComponent(data.phone)}&message=${encodeURIComponent(data.message)}`;
      UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
    }

    // --- PHASE 2: Signup Logging (Only if Name is provided) ---
    if (data.name) {
      let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      if (headers[0] === "") {
        headers = ['timestamp', 'phone', 'name'];
        sheet.getRange(1, 1, 1, 3).setValues([headers]);
      }

      const newRow = [new Date(), data.phone, data.name];
      sheet.appendRow(newRow);
    }

    return ContentService.createTextOutput("success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    return ContentService.createTextOutput("error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
