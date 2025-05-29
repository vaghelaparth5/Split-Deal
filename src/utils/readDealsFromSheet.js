const { google } = require('googleapis');
const path = require('path');
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1Gxtwa1_iugpBHDslg5WrKVRg04Z0Mx8UsMRoqYd0DhI';

async function readAndLoopDeals() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Read all rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1',
  });

  const rows = response.data.values;

  if (!rows || rows.length < 2) {
    console.log("No data rows found.");
    return;
  }

  // First row is the header
  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Loop through each deal
  for (const row of dataRows) {
    const deal = {};
    headers.forEach((key, index) => {
      deal[key.trim()] = row[index] || ''; // Assign empty string if missing
    });

    console.log("Parsed Deal:", deal);
    // You can later insert into MongoDB here
  }
}

readAndLoopDeals().catch(console.error);

//Reag Deals from Sheets
