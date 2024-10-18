# latinHAM

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Game Rules](#game-rules)
7. [Components](#components)
8. [API Routes](#api-routes)
9. [Deployment](#deployment)
10. [Future Improvements](#future-improvements)
11. [Contributing](#contributing)
12. [License](#license)

## Introduction

latinHAM is a web-based puzzle game inspired by the classic Latin Square puzzle and HAMMING codes. The game challenges players to fill a 6x6 grid with colors, ensuring that each color appears exactly once in each row and column. This project was developed using Next.js and React, incorporating modern web development practices and a sleek user interface.

## Features

- Interactive 6x6 game board
- Three difficulty levels: Easy, Medium, and Hard
- Color-based gameplay with optional number hints
- Move counter, timer, and hint system
- Global leaderboard for each difficulty level
- User authentication and profile management
- Responsive design for various screen sizes
- Server-side game state persistence
- New game confirmation dialog
- Reset and hint functionalities
- Trash mode for easy cell clearing
- Progress bar showing current game state
- Confetti animation on puzzle completion
- Quote submission for completed puzzles
- Viewing and downloading of completed puzzles
- Pagination for leaderboard entries
- Dark mode support
- Learning mode for beginners
- Pattern detection and display
- Unique solve count tracking

## Technologies Used

- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- Framer Motion for animations
- react-confetti for celebration effects
- Clerk for authentication
- PostgreSQL (Neon) for database storage
- Vercel for deployment

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository:
```
git clone https://github.com/willtajer/latinHAM.git
cd latinHAM
```

2. Install dependencies:
```
npm install
```

3. Set up Clerk Authentication:
   - Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/) and create a new application
   - In your Clerk dashboard, navigate to the API Keys section
   - Copy your Publishable Key and Secret Key

4. Set up PostgreSQL Database:
   - Create a new PostgreSQL database for the project
   - Note down the database connection URL

5. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
```
DATABASE_URL=your_postgres_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```
   Replace `your_postgres_database_url`, `your_clerk_publishable_key`, and `your_clerk_secret_key` with your actual values.

6. Set up the database schema:
   Run the following command to set up your database schema:
```
npm run db:push
```

7. Run the development server:
```
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

Note: Make sure you have Node.js (version 14 or later) and npm installed on your machine before starting the setup process.

## Project Structure

The project follows the Next.js 14 App Router structure:

```
36SLICESGAME/
├── app/
│   ├── api/
│   │   ├── completed-puzzels/
│   │   ├── discovered/
│   │   ├── games/
│   │   ├── leaderboard/
│   │   ├── leaderboard-entries/
│   │   ├── save-game/
│   │   ├── unique-solves/
│   │   ├── user-profile/
│   │   └── webhooks/
│   ├── components/
│   ├── fonts/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── styles/
└── (configuration files)
```

## Game Rules

1. Fill the 6x6 grid with colors.
2. Each color must appear exactly once in each row and column.
3. The game starts with some pre-filled cells based on the chosen difficulty.
4. Click on a cell to cycle through colors.
5. Use the hint button to highlight conflicts.
6. Use the trash mode to easily clear filled cells.
7. The game is won when the grid is correctly filled according to the rules.

## Components

### Core Game Components

#### LatinHamGame.tsx
- Main game component that orchestrates the entire game flow
- Manages game state, including the grid, difficulty, timer, and move count
- Handles game initialization, reset, and win conditions
- Integrates with other components like GameBoard, GameControls, and GameHeader
- Manages user interactions and game logic
- Handles quote submission for completed puzzles
- Integrates with the leaderboard system

#### GameBoard.tsx
- Renders the 6x6 grid for the Latin HAM puzzle
- Handles cell interactions (clicking, color changes)
- Implements the visual representation of the game state
- Manages locked (pre-filled) cells and user-filled cells
- Implements trash mode for easy cell clearing
- Renders hint highlights for conflicting cells
- Adapts to different screen sizes for responsive design

#### GameControls.tsx
- Provides user interface for game control actions
- Includes buttons for reset, hint, and trash mode
- Manages the state of the trash mode
- Triggers hint functionality in the main game component

#### GameHeader.tsx
- Displays game information at the top of the game board
- Shows current difficulty level
- Displays move counter and timer
- May include additional game status information

#### GameContext.tsx
- Implements React Context for global game state management
- Provides game state and functions to child components
- Allows for easier state sharing between components without prop drilling

#### GameStats.tsx
- Displays detailed game statistics
- May include best scores, average completion time, etc.
- Potentially integrates with the leaderboard system

#### GamePreview.tsx
- Renders a small preview of a game board
- Used in leaderboard entries or completed puzzle views
- Provides a quick visual representation of a game state

### User Interface Components

#### DifficultySelector.tsx
- Allows users to choose between Easy, Medium, and Hard difficulty levels
- Updates the game state with the selected difficulty
- May trigger a new game initialization when difficulty changes

#### NewGameDialog.tsx
- Modal dialog for starting a new game
- Confirms with the user before resetting the current game
- May include options for selecting difficulty or other game parameters

#### WinDialog.tsx
- Modal dialog displayed when a player completes the puzzle
- Shows congratulatory message and game statistics
- Provides options for starting a new game or viewing the leaderboard

#### ProgressBar.tsx
- Visual indicator of game progress
- Updates as the player fills in the grid
- May show percentage of completion or other progress metrics

#### StickyButtonBar.tsx
- Persistent UI element with important game actions
- May include quick access to reset, hint, or other frequently used functions
- Stays visible as the user scrolls or on mobile devices

#### ThemeBackground.tsx
- Manages the visual theme of the game
- Implements dark mode support
- May handle dynamic background changes based on game state or user preferences

### Leaderboard and User Components

#### Leaderboard.tsx
- Displays the global leaderboard for each difficulty level
- Implements sorting functionality for different score aspects (moves, time)
- Integrates with server-side data fetching for leaderboard entries
- Implements pagination for browsing through entries

#### LatinHAMLeaderboard.tsx
- Specialized leaderboard component for Latin HAM puzzles
- May include additional Latin HAM specific metrics or display options

#### UserProfile.tsx
- Manages and displays user-specific data and settings
- Integrates with authentication system (Clerk)
- Shows user statistics, completed puzzles, and achievements

#### LoginHandler.tsx
- Manages user authentication flow
- Integrates with Clerk for user sign-in and sign-out processes
- Handles session management and protected routes

### Puzzle Viewing and Analysis

#### ViewCompletedPuzzleDialog.tsx
- Modal for viewing details of a completed puzzle
- Displays the completed grid, statistics, and any submitted quotes
- Provides functionality to download or share completed puzzles

#### CompletedPuzzleCard.tsx
- Card component for displaying a summary of a completed puzzle
- Used in user profiles or leaderboard entries
- Shows key statistics and a mini preview of the completed grid

#### PatternDetector.tsx
- Analyzes completed puzzles for common patterns or strategies
- May provide insights or tips based on detected patterns
- Enhances the learning experience for players

#### DiscoveredLatinHAMs.tsx
- Displays a collection of discovered Latin HAM configurations
- May be used for educational purposes or as a gallery of interesting puzzles

### Learning and Tutorial Components

#### LearningModeGame.tsx
- Implements a simplified version of the game for beginners
- Provides step-by-step guidance and explanations of game mechanics
- May include interactive tutorials or practice exercises

#### Patterns.tsx
- Displays and explains common patterns in Latin HAM puzzles
- Used as an educational tool to help players improve their skills
- May include interactive examples or exercises

### Utility Components

#### ModeToggle.tsx
- Toggles between different game modes (e.g., normal mode, learning mode)
- Updates the game state and UI based on the selected mode

#### SolveCountCalculator.tsx
- Calculates and displays the number of unique solutions for a given puzzle
- May be used in difficulty determination or as an interesting statistic for players

#### WillTajerButton.tsx
- Custom button component, possibly themed or styled specifically for the game
- May include special animations or interactions

### UI Components (from shadcn/ui)

#### ui/alert.tsx, ui/badge.tsx, ui/button.tsx, etc.
- Reusable UI components from the shadcn/ui library
- Styled consistently with the game's theme
- Used throughout the application for a cohesive look and feel

### Hooks

#### useGameLogic.ts
- Custom hook encapsulating core game logic
- Manages game state, move validation, and win condition checks
- Provides reusable game functionality across components

#### useLeaderboard.ts
- Hook for fetching and managing leaderboard data
- Handles pagination, sorting, and filtering of leaderboard entries

#### useLearningGameLogic.ts
- Specialized hook for the learning mode game
- Implements simplified game logic and tutorial steps

#### useLocalStorage.ts
- Manages local storage operations for persisting game state
- Handles saving and retrieving user preferences and game progress

## API Routes

- `/api/completed-puzzels/[id]`: Handles operations for specific completed puzzles
- `/api/discovered`: Manages discovered Latin HAMs
- `/api/games`: Handles game-related operations
- `/api/leaderboard`: Fetches and manages leaderboard data
- `/api/leaderboard-entries`: Handles individual leaderboard entries
- `/api/save-game`: Saves completed games
- `/api/unique-solves`: Tracks and manages unique puzzle solutions
- `/api/user-profile`: Manages user profile data
- `/api/webhooks/clerk`: Handles Clerk authentication webhooks

## Deployment

The game is deployed on Vercel and can be accessed at [latinham.willtajer.com](https://latinham.willtajer.com).

## Future Improvements

- Implement more advanced puzzle generation algorithms
- Add social sharing features for completed puzzles
- Introduce daily challenges and special events
- Optimize performance for larger grid sizes
- Enhance the learning mode with more interactive tutorials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

Copyright © 2024 Will Tajer. All rights reserved.

This project is proprietary and confidential. Unauthorized copying, transferring or reproduction of this project, via any medium, is strictly prohibited.

For licensing inquiries or permissions, please contact Will Tajer at https://willtajer.com/contact/.