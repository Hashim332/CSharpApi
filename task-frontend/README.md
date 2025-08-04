# Task Manager Frontend

A modern React application built with Vite, TypeScript, Tailwind CSS, and shadcn/ui for managing tasks.

## Features

- ✨ **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🔄 **Real-time Updates**: Automatic refresh and state management
- 📊 **Task Statistics**: Visual dashboard with task counts by status
- ✏️ **Full CRUD Operations**: Create, read, update, and delete tasks
- 🎯 **Status Management**: Track task progress (Pending, In Progress, Completed, Cancelled)
- ⚡ **Priority Levels**: Organize tasks by priority (Low, Medium, High, Critical)
- 📅 **Due Date Support**: Set and track task deadlines
- 🎨 **Beautiful Design**: Clean, modern interface with smooth animations

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **Lucide React** for icons
- **pnpm** for package management

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.

## API Integration

This frontend is designed to work with the C# ASP.NET Core backend API. Make sure your backend is running on `http://localhost:5000` and has the following endpoints:

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task
- `GET /api/tasks/health` - Health check

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── TaskCard.tsx  # Individual task display
│   └── TaskForm.tsx  # Create/edit task form
├── services/
│   └── api.ts        # API service layer
├── types/
│   └── task.ts       # TypeScript interfaces
├── App.tsx           # Main application component
└── index.css         # Global styles
```

## Features in Detail

### Task Management
- Create new tasks with title, description, status, priority, and due date
- Edit existing tasks inline
- Delete tasks with confirmation
- View task details in a clean card layout

### Status Tracking
- **Pending**: New tasks awaiting action
- **In Progress**: Tasks currently being worked on
- **Completed**: Finished tasks
- **Cancelled**: Cancelled or abandoned tasks

### Priority Levels
- **Low**: Non-urgent tasks
- **Medium**: Standard priority tasks
- **High**: Important tasks
- **Critical**: Urgent tasks requiring immediate attention

### Dashboard
- Real-time statistics showing task counts by status
- Visual indicators for different task states
- Quick refresh functionality

## Development

### Adding New Components

To add new shadcn/ui components:

```bash
pnpm dlx shadcn@latest add [component-name]
```

### Styling

The project uses Tailwind CSS with custom utilities. Add new styles in `src/index.css` under the appropriate `@layer` directive.

### Type Safety

All API interactions are fully typed with TypeScript interfaces that match the backend C# models.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
