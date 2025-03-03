# Organization Chart Editor

<img width="1557" alt="image" src="https://github.com/user-attachments/assets/1ed2cc1d-90b0-482e-83b2-23a547bd44eb" />


A web application for importing, visualizing, editing, and exporting organizational chart data. This tool allows you to:

- Import organization data from CSV files
- Visualize the organization hierarchy as a tree
- Edit and modify the organizational structure
- Add, update, or delete nodes in the organization
- Export the modified organization data back to CSV

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd org0chart
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run the development server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Application

### Importing Data

You can import organization data from a CSV file. The CSV file should have the following columns:
- `id`: Unique identifier for each node
- `name`: Name of the person or role
- `title`: Job title (optional)
- `department`: Department name (optional)
- `parentId`: ID of the parent node (leave empty for root nodes)

A sample CSV file is available at `/sample.csv` for reference.

### Visualizing the Organization Chart

Once data is imported, the application will display an interactive organization chart. You can:
- Click on nodes to select and edit them
- Pan and zoom to navigate larger charts

### Editing Nodes

- Click on any node in the chart to edit its details
- Click "Add Node" to create a new node in the organization
- When editing a node, you can change its name, title, department, and parent
- You can also delete nodes (which will also remove all their children)

### Exporting Data

After making changes, you can export the updated organization data back to CSV by clicking the "Export to CSV" button.

## CSV File Format

The expected CSV format has the following columns:

```
id,name,title,department,parentId
1,John Smith,CEO,Executive,
2,Sarah Johnson,CTO,Technology,1
3,Michael Brown,CFO,Finance,1
...
```

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [PapaParse](https://www.papaparse.com/) - CSV parsing library
- [React D3 Tree](https://github.com/bkrem/react-d3-tree) - Tree visualization library

## License

[MIT License](LICENSE)
