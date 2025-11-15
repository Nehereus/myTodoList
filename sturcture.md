todo-frontend/
├── dist/                   # Compiled output (your web server serves this)
├── node_modules/           # Project dependencies
├── src/
│   ├── api/                # Functions for communicating with the backend
│   │   ├── authApi.ts      # (login, register)
│   │   └── todoApi.ts      # (fetchTodos, syncChanges, searchTodos)
│   │
│   ├── db/                 # All tinybase-related logic
│   │   ├── store.ts        # Initializes and exports the tinybase store instance
│   │   └── schema.ts       # Defines the tinybase StoreSchema (tables, values)
│   │
│   ├── services/           # Core application logic ("business logic")
│   │   ├── authService.ts  # Handles token storage, user state
│   │   ├── syncService.ts  # Orchestrates offline sync (pushing/pulling changes)
│   │   └── todoService.ts  # Main logic for UI to interact with the store
│   │                     # (e.g., createTodo, completeTodo, deleteTodo)
│   │
│   ├── types/              # All TypeScript interfaces and types
│   │   ├── api.ts          # (TodoDTO)
│   │   └── store.ts        # (FrontendTodo, StoreSchema)
│   │
│   ├── ui/                 # DOM manipulation and rendering
│   │   ├── components/     # Functions that render specific parts of the UI
│   │   │   ├── todoList.ts # (Renders the list from tinybase)
│   │   │   └── search.ts   # (Handles search input and results)
│   │   └── render.ts       # Main render function, sets up store listeners
│   │
│   ├── utils/              # Helper functions (e.g., date formatting)
│   │
│   └── main.ts             # Main entry point: initializes services, store, and UI
│
├── index.html              # The single HTML page
├── style.css               # All CSS styles
├── package.json            # Project dependencies (typescript, tinybase, vite/webpack)
└── tsconfig.json           # TypeScript configuration