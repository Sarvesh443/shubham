# Pig Game

Version v2.0.0 of the game allows you to have a multiplayer experience.
You can play the game with your friend by launching a server.

## Installation Steps

```bash
# To install the dependencies 
> npm install

# Run the app 
> node server.js
```

Visiting `localhost:3001` will launch your game screen.
You can host this on any hosting platform supporting `ws` protocol.

## Directory structure

```bash
.
├── README.md
├── package-lock.json
├── package.json
├── public
│   ├── assets
│   │   └── images
│   │       ├── dice-1.png
│   │       ├── dice-2.png
│   │       ├── dice-3.png
│   │       ├── dice-4.png
│   │       ├── dice-5.png
│   │       └── dice-6.png
│   ├── index.html
│   ├── pig-game-flowchart.png
│   ├── script.js
│   └── style.css
└── server.js
```

The `public` directory contains the ui/client which can be accessed by calling the default route.
The `server.js` file contains the server codes that expose the public directory and establishes the WebSocket connection.
