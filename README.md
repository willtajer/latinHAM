Here's an updated version of your README.md that reflects the current state of the latinHAM application:

```markdown
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

latinHAM is a web-based puzzle game inspired by the classic Latin Square puzzle. The game challenges players to fill a 6x6 grid with colors, ensuring that each color appears exactly once in each row and column. This project was developed using Next.js and React, incorporating modern web development practices and a sleek user interface.

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

git clone [https://github.com/willtajer/latinHAM.git](https://github.com/willtajer/latinHAM.git)
cd latinHAM

```plaintext

2. Install dependencies:
```

npm install

```plaintext

3. Set up environment variables:
Create a `.env.local` file in the root directory and add the following variables:
```

DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

```plaintext

4. Run the development server:
```

npm run dev

```plaintext

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

The project follows the Next.js 14 App Router structure:

```

latinHAM/
├── app/
│   ├── api/
│   │   ├── get-leaderboard/
│   │   ├── save-game/
│   │   └── sync-games/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DifficultySelector.tsx
│   ├── GameBoard.tsx
│   ├── LatinHamGame.tsx
│   ├── Leaderboard.tsx
│   └── ui/
│       └── (shadcn/ui components)
├── lib/
│   ├── db.ts
│   └── schema.ts
├── utils/
│   └── gameLogic.ts
├── public/
├── styles/
│   └── globals.css
├── next.config.js
├── package.json
└── tsconfig.json

```plaintext

## Game Rules

1. Fill the 6x6 grid with colors.
2. Each color must appear exactly once in each row and column.
3. The game starts with some pre-filled cells based on the chosen difficulty.
4. Click on a cell to cycle through colors.
5. Use the hint button to highlight conflicts (cells with the same color in the same row or column).
6. Use the trash mode to easily clear filled cells.
7. The game is won when the grid is correctly filled according to the rules.

## Components

### LatinHamGame

The main game component that manages the game state, difficulty selection, and overall game flow. It includes:
- Game initialization and state management
- Difficulty selection handling
- Move tracking and timer functionality
- Hint system implementation
- Win condition checking
- Leaderboard integration
- Quote submission for completed puzzles
- Viewing and downloading completed puzzles
- User authentication state management

### GameBoard

Renders the interactive 6x6 grid and handles cell interactions. Features include:
- Dynamic color rendering based on cell values
- Locked cell indication for pre-filled values
- Hint highlighting for conflicting cells
- Responsive grid layout
- Support for trash mode

### DifficultySelector

Allows players to choose between Easy, Medium, and Hard difficulty levels. It affects:
- Number of pre-filled cells
- Complexity of the initial board state

### Leaderboard

Displays the global scores for the current difficulty level. It includes:
- Sorting functionality for different score aspects (moves, time)
- Server-side persistence of scores
- Responsive design for various screen sizes
- Pagination for browsing through entries
- Mini preview of completed boards
- Download functionality for completed puzzles

## API Routes

- `/api/get-leaderboard`: Fetches the leaderboard data for a specific difficulty
- `/api/save-game`: Saves a completed game to the leaderboard
- `/api/sync-games`: Synchronizes locally stored games with the server for authenticated users

## Deployment

The game is deployed on Vercel and can be accessed at [latinham.willtajer.com](https://latinham.willtajer.com).

To deploy the game:

1. Ensure you have the Vercel CLI installed:
```

npm install -g vercel

```plaintext

2. Deploy the application:
```

vercel

```plaintext

Follow the prompts to deploy your application.

## Future Improvements

- Implement more advanced puzzle generation algorithms
- Add social sharing features for completed puzzles
- Introduce daily challenges and special events
- Optimize performance for larger grid sizes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Copyright © 2024 Will Tajer. All rights reserved.

This project is proprietary and confidential. Unauthorized copying, transferring or reproduction of this project, via any medium, is strictly prohibited.

For licensing inquiries or permissions, please contact Will Tajer at https://willtajer.com/contact/. Knaht Uoy 3113***
```