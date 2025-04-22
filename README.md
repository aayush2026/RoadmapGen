# AI Roadmap Explorer

A React component for visualizing hierarchical roadmap data with a collapsible UI, allowing users to select from multiple available roadmaps.

## Features

- Browse and select from multiple roadmap files
- Hierarchical display of roadmap items with unlimited nesting
- Collapsible sections with expand/collapse functionality
- Summary display for each roadmap item
- Responsive design using Tailwind CSS
- Visual indicators for expanded/collapsed sections
- Color-coding based on hierarchy depth
- Proper indentation to highlight parent-child relationships

## Project Structure

- `RoadmapTree.jsx`: The main component for displaying a hierarchical roadmap
- `LoadRoadmapData.jsx`: Utility component to load and parse roadmap JSON
- `RoadmapSelector.jsx`: Component to browse and select from available roadmaps
- `server.js`: Express server to serve roadmap files and provide API endpoints
- `App.jsx`: Main application component

## Setup Instructions

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ai-roadmap-explorer
   ```

2. Install server dependencies:

   ```bash
   npm install
   ```

3. Create a client folder and install React dependencies:

   ```bash
   mkdir -p client/src
   cd client
   npm init -y
   npm install react react-dom react-scripts tailwindcss @tailwindcss/forms
   ```

4. Set up Tailwind CSS in the client folder:

   ```bash
   npx tailwindcss init
   ```

5. Configure Tailwind CSS by updating `client/tailwind.config.js`:

   ```js
   module.exports = {
     content: ["./src/**/*.{js,jsx,ts,tsx}"],
     theme: {
       extend: {},
     },
     plugins: [require("@tailwindcss/forms")],
   };
   ```

6. Create or update `client/src/index.css`:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

7. Place your roadmap JSON files in the `roadmap` folder at the root of the project.

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to http://localhost:3000

### Adding New Roadmaps

To add new roadmaps to the application:

1. Create a JSON file following the schema structure (see example below)
2. Place the file in the `roadmap` folder
3. The file will automatically appear in the roadmap selector

## JSON Structure

The component expects data in the following JSON structure:

```json
{
  "title": "Main Title",
  "summary": "Main summary",
  "sections": [
    {
      "topic_name": "Section name",
      "summary": "Section summary",
      "sections": [
        // Nested sections with the same structure
      ]
    }
  ]
}
```

## Component Features

- **Browse Roadmaps**: View and select from all available roadmap files
- **Expand/Collapse**: Click the chevron icon to expand or collapse a section
- **Show/Hide Summary**: Click the section title or info icon to display its summary
- **Depth-based Styling**: Sections are color-coded based on their depth in the hierarchy
- **Back Navigation**: Return to the roadmap selection from any roadmap view

## Deployment

To deploy the application:

1. Build the React client:

   ```bash
   cd client
   npm run build
   ```

2. Start the server:
   ```bash
   cd ..
   npm start
   ```

The application will be available at http://localhost:3001

## Customization

You can customize the appearance by modifying the Tailwind CSS classes in the component files.
