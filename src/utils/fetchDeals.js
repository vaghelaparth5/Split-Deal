const axios = require('axios');
const { google } = require('googleapis');
const serviceAccount = require('../config/googleServiceAccount'); // Load credentials from .js file

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount, //  Use credentials instead of keyFile
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


const SPREADSHEET_ID = '1Gxtwa1_iugpBHDslg5WrKVRg04Z0Mx8UsMRoqYd0DhI';

async function fetchAndWriteDeals() {
  try {
    const res = await axios.get('https://dummyjson.com/products?limit=5');
    const deals = res.data.products;

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const rows = deals.map(deal => [
      deal.title,
      deal.description,
      deal.price,
      deal.brand,
      deal.category
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      },
    });

    console.log(` Wrote ${rows.length} deals to Google Sheet`);
  } catch (err) {
    console.error(' Error fetching or writing deals:', err.message);
  }
}

fetchAndWriteDeals();

//Write into sheets