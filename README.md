# 36latinHAM

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Game Rules](#game-rules)
7. [Components](#components)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

## Introduction

36latinHAM is a web-based puzzle game inspired by the classic Latin Square puzzle. The game challenges players to fill a 6x6 grid with colors, ensuring that each color appears exactly once in each row and column. This project was developed using Next.js and React, incorporating modern web development practices and a sleek user interface.

## Features

- Interactive 6x6 game board
- Three difficulty levels: Easy, Medium, and Hard
- Color-based gameplay with optional number hints
- Move counter, timer, and hint system
- Personal top 10 leaderboard for each difficulty level
- Responsive design for various screen sizes
- Local storage for game state persistence
- New game confirmation dialog
- Reset and hint functionalities

## Technologies Used

- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/36latinHAM.git
   cd 36latinHAM
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

The project follows the Next.js 13 App Router structure:

```
36latinHAM/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DifficultySelector.tsx
│   ├── GameBoard.tsx
│   ├── LatinHamGame.tsx
│   ├── Leaderboard.tsx
│   └── ui/
│       └── (shadcn/ui components)
├── utils/
│   └── gameLogic.ts
├── public/
├── styles/
│   └── globals.css
├── next.config.js
├── package.json
└── tsconfig.json
```

## Game Rules

1. Fill the 6x6 grid with colors.
2. Each color must appear exactly once in each row and column.
3. The game starts with some pre-filled cells based on the chosen difficulty.
4. Click on a cell to cycle through colors.
5. Use the hint button to highlight conflicts (cells with the same color in the same row or column).
6. The game is won when the grid is correctly filled according to the rules.

## Components

### LatinHamGame

The main game component that manages the game state, difficulty selection, and overall game flow. It includes:
- Game initialization and state management
- Difficulty selection handling
- Move tracking and timer functionality
- Hint system implementation
- Win condition checking
- Leaderboard integration

### GameBoard

Renders the interactive 6x6 grid and handles cell interactions. Features include:
- Dynamic color rendering based on cell values
- Locked cell indication for pre-filled values
- Hint highlighting for conflicting cells
- Responsive grid layout

### DifficultySelector

Allows players to choose between Easy, Medium, and Hard difficulty levels. It affects:
- Number of pre-filled cells
- Complexity of the initial board state

### Leaderboard

Displays the player's top 10 scores for the current difficulty level. It includes:
- Sorting functionality for different score aspects (moves, time, hints)
- Persistent storage of scores using local storage
- Responsive design for various screen sizes

## Deployment

The game is deployed on Siteground and can be accessed at [36.willtajer.com](https://36.willtajer.com).

To deploy the game:

1. Build the project:
   ```
   npm run build
   ```

2. Create a production-ready Node.js server file (`server.js`) in your project root.

3. Update your `package.json` with a "start" script:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "NODE_ENV=production node server.js"
   }
   ```

4. Upload the following to your Siteground hosting:
   - The `.next` folder
   - The `public` folder
   - `package.json`
   - `server.js`
   - Any other necessary configuration files (e.g., `next.config.js`)

5. Set up Node.js in your Siteground control panel.

6. Install dependencies on the server:
   ```
   npm install --production
   ```

7. Start your application:
   ```
   npm start
   ```

8. Set up a reverse proxy in Nginx to direct traffic to your Node.js application.

For detailed Siteground-specific deployment instructions, refer to Siteground's documentation or support resources.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

# 36latinHAM

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Game Rules](#game-rules)
7. [Components](#components)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

## Introduction

36latinHAM is a web-based puzzle game inspired by the classic Latin Square puzzle. The game challenges players to fill a 6x6 grid with colors, ensuring that each color appears exactly once in each row and column. This project was developed using Next.js and React, incorporating modern web development practices and a sleek user interface.

## Features

- Interactive 6x6 game board
- Three difficulty levels: Easy, Medium, and Hard
- Color-based gameplay with optional number hints
- Move counter, timer, and hint system
- Personal top 10 leaderboard for each difficulty level
- Responsive design for various screen sizes
- Local storage for game state persistence
- New game confirmation dialog
- Reset and hint functionalities

## Technologies Used

- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/36latinHAM.git
   cd 36latinHAM
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

The project follows the Next.js 13 App Router structure:

```
36latinHAM/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DifficultySelector.tsx
│   ├── GameBoard.tsx
│   ├── LatinHamGame.tsx
│   ├── Leaderboard.tsx
│   └── ui/
│       └── (shadcn/ui components)
├── utils/
│   └── gameLogic.ts
├── public/
├── styles/
│   └── globals.css
├── next.config.js
├── package.json
└── tsconfig.json
```

## Game Rules

1. Fill the 6x6 grid with colors.
2. Each color must appear exactly once in each row and column.
3. The game starts with some pre-filled cells based on the chosen difficulty.
4. Click on a cell to cycle through colors.
5. Use the hint button to highlight conflicts (cells with the same color in the same row or column).
6. The game is won when the grid is correctly filled according to the rules.

## Components

### LatinHamGame

The main game component that manages the game state, difficulty selection, and overall game flow. It includes:
- Game initialization and state management
- Difficulty selection handling
- Move tracking and timer functionality
- Hint system implementation
- Win condition checking
- Leaderboard integration

### GameBoard

Renders the interactive 6x6 grid and handles cell interactions. Features include:
- Dynamic color rendering based on cell values
- Locked cell indication for pre-filled values
- Hint highlighting for conflicting cells
- Responsive grid layout

### DifficultySelector

Allows players to choose between Easy, Medium, and Hard difficulty levels. It affects:
- Number of pre-filled cells
- Complexity of the initial board state

### Leaderboard

Displays the player's top 10 scores for the current difficulty level. It includes:
- Sorting functionality for different score aspects (moves, time, hints)
- Persistent storage of scores using local storage
- Responsive design for various screen sizes

## Deployment

The game is deployed on Siteground and can be accessed at [36.willtajer.com](https://36.willtajer.com).

To deploy the game:

1. Build the project:
   ```
   npm run build
   ```

2. Create a production-ready Node.js server file (`server.js`) in your project root.

3. Update your `package.json` with a "start" script:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "NODE_ENV=production node server.js"
   }
   ```

4. Upload the following to your Siteground hosting:
   - The `.next` folder
   - The `public` folder
   - `package.json`
   - `server.js`
   - Any other necessary configuration files (e.g., `next.config.js`)

5. Set up Node.js in your Siteground control panel.

6. Install dependencies on the server:
   ```
   npm install --production
   ```

7. Start your application:
   ```
   npm start
   ```

8. Set up a reverse proxy in Nginx to direct traffic to your Node.js application.

For detailed Siteground-specific deployment instructions, refer to Siteground's documentation or support resources.

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

For licensing inquiries or permissions, please contact Will Tajer at https://willtajer.com/contact/.