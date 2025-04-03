import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { GaxiosResponse } from 'gaxios';
import { sheets_v4 } from 'googleapis';

const SPREADSHEET_ID = '1v0aOYbjRTz-Pse3AS5y5jLUu34PdNhx0fPvN0w6zqiA';
const SHEET_NAME = 'Shopify product import';

type SheetResponse = GaxiosResponse<sheets_v4.Schema$ValueRange>;
type SheetRowValue = string | number | null;

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Sheets API key is not configured');
      return NextResponse.json(
        { error: 'API key configuration missing' },
        { status: 500 }
      );
    }

    // Initialize the Sheets API
    const sheets = google.sheets({ 
      version: 'v4', 
      auth: apiKey
    });

    // Get the data from the spreadsheet
    const response: SheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`, // Get all columns
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in spreadsheet' },
        { status: 404 }
      );
    }

    // Convert the data to a more usable format
    const headers = rows[0];
    const items = rows.slice(1).map(row => {
      const item: Record<string, SheetRowValue> = {};
      headers.forEach((header: string, index: number) => {
        item[header] = row[index] || null; // Handle empty cells
      });
      return item;
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 