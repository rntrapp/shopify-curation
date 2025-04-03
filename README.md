# Product Data Viewer 🛍️ 

This app fetches and displays product data from a Google Spreadsheet in a beautiful, organized layout! ✨

## Features 🌟

- 📊 Reads data directly from Google Sheets
- 🔍 Groups products by handle
- 🖼️ Shows product images (main + cropped views)
- 📝 Displays product details:
  - Title
  - Description (HTML)
  - Type
  - Tags
- 📦 Lists all variants with:
  - SKU
  - Size/Color options
  - Inventory quantity

## Getting Started 🚀

1. Set up your Google Sheets API key:
   ```bash
   # Create a .env.local file with:
   NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
   ```

2. Run the development server 💻:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see your products! 🎉

## Tech Stack 🛠️

- ⚛️ Next.js
- 📈 Google Sheets API
- 🎨 Tailwind CSS
- 📱 Fully responsive design

## Environment Variables 🔐

Required environment variables:
- `NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY`: Your Google Sheets API key

## Data Structure 📋

The app expects a spreadsheet with the following columns:
- Handle
- Title
- Body (HTML)
- Type
- Tags
- Image Src
- Variant SKU
- Option1 Value (Size)
- Option2 Value (Color)
- Variant Inventory Quantity

## Contributing 🤝

Feel free to contribute to this project! All feedback and contributions are welcome! 💕

---

Built with ❤️ using [Next.js](https://nextjs.org)
