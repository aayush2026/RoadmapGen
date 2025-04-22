# AI Roadmap Explorer UI

An interactive web application for exploring AI-generated roadmaps from documents.

## Features

- Browse and explore AI-generated roadmaps in a hierarchical structure
- Interactive navigation with expand/collapse functionality
- Sidebar summaries for detailed topic information
- PDF upload for automatic roadmap generation
- Responsive design for all screen sizes

## Prerequisites

- Node.js (v16 or later)
- Python 3.8+ (for document processing)
- OpenAI API key (for AI processing)
- Required Python packages:
  ```bash
  pip install openai python-dotenv docling
  ```
  If you encounter issues with docling, try:
  ```bash
  pip install git+https://github.com/agentydragon/docling.git
  ```

## Setup

1. Install the required Node.js dependencies:

```bash
npm install
```

2. Install the required Python packages:

```bash
pip install openai python-dotenv docling
```

3. Create a `.env` file in the root directory (not in roadmap-explorer-ui) with your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
QDRANT_API_KEY=your_qdrant_api_key_here
```

4. Test if the Python pipeline is working correctly:

```bash
npm run test-pipeline
```

## Running the Application

To run the application in development mode:

```bash
npm run dev
```

This command will:

- Copy available roadmaps to the public directory
- Start the Vite frontend development server
- Start the Express backend server for file uploads

The application will be available at http://localhost:5173

## Troubleshooting

### PDF Processing Errors

If you encounter errors when processing PDFs, check the following:

1. **OpenAI API Key**: Make sure your API key is correctly set in the `.env` file in the root directory (not in roadmap-explorer-ui).

2. **Python Environment**: Ensure Python is installed and in your PATH. Run `python --version` to check.

3. **Required Python Packages**: Install the necessary packages:

   ```bash
   pip install openai python-dotenv
   ```

4. **Test the Pipeline**: Run the test script to verify your setup:

   ```bash
   npm run test-pipeline
   ```

5. **Path Issues on Windows**: If you see path-related errors, check that the paths in server.js are correctly formatted for Windows.

6. **Server Logs**: Check the server console output for detailed error messages.

7. **Restart the Server**: Sometimes simply restarting the server can resolve issues:
   ```bash
   npm run dev
   ```

### Running Individual Components

If you need to troubleshoot further, you can run the client and server separately:

```bash
# In one terminal
cd roadmap-explorer-ui
npm run dev:client

# In another terminal
cd roadmap-explorer-ui
npm run dev:server
```

## How to Use

### Browsing Roadmaps

1. Navigate to the "Roadmaps" tab to see available roadmaps
2. Click on any roadmap to explore it
3. Use the expand/collapse buttons to navigate the hierarchical structure
4. Click on any topic to view its detailed summary in the sidebar

### Uploading PDFs for Roadmap Generation

1. Navigate to the "Upload PDF" tab
2. Drag and drop a PDF file or click to browse and select a file
3. Wait for the file to be uploaded and processed
4. Once processing is complete, go to the "Roadmaps" tab to find your new roadmap

## Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Project Structure

- `src/` - Frontend React application
  - `components/` - React components
  - `pages/` - Page components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `data/` - Sample data
- `public/` - Static assets
  - `roadmap/` - Generated roadmap JSON files
- `server.js` - Express backend for file uploads and processing
- `document_to_roadmap_pipeline.py` - Python script for document processing

## Technologies Used

- React + TypeScript
- Vite for frontend bundling
- Tailwind CSS for styling
- Express.js for backend API
- Multer for file uploads
- OpenAI API for document processing

## Roadmap Data Structure

The application expects roadmap data in the following JSON format:

```json
{
  "title": "Main Roadmap Title",
  "summary": "Overall roadmap summary",
  "sections": [
    {
      "topic_name": "Topic Name",
      "summary": "Topic summary text",
      "sections": [
        {
          "topic_name": "Subtopic Name",
          "summary": "Subtopic summary text",
          "sections": []
        }
      ]
    }
  ]
}
```

## User Interface

### Sidebar Summaries

The updated version displays topic summaries in an animated sidebar instead of inline, providing:

- More space for detailed content
- Cleaner visual hierarchy
- Interactive animations for a modern UX
- Focus on the current topic without losing context
- Keyboard navigation support

### Usage

1. **Navigate Topics**: Click the chevron icon to expand/collapse sections
2. **View Summaries**: Click on a topic name to open its summary in the sidebar
3. **Dismiss Sidebar**: Click the X button, click outside the sidebar, or press ESC
4. **Expand All**: Use the "Expand All" button to expand all sections at once

## License

[License information]

## Acknowledgements

[Any acknowledgements]
