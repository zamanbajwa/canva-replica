# Canva Replica

A web-based design tool inspired by Canva, built with SvelteKit and Konva.js. This application allows users to create and edit designs in a user-friendly interface.

## Features

- Interactive canvas editing
- Support for basic shapes and elements
- Real-time design manipulation
- Responsive design interface
- Built with modern web technologies

## Tech Stack

- **Frontend Framework**: SvelteKit 2.x with Svelte 5
- **Canvas Manipulation**: Konva.js 9.x
- **Language**: TypeScript
- **Build Tool**: Vite 6.x

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd canva-replica
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   To open the application in a new browser tab automatically:
   ```bash
   npm run dev -- --open
   ```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Creates a production build
- `npm run preview` - Previews the production build locally
- `npm run check` - Runs type checking and SvelteKit sync
- `npm run check:watch` - Runs type checking in watch mode

## Building for Production

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with:
```bash
npm run preview
```

## Project Structure

- `/src` - Source code directory
- `/static` - Static assets
- `/src/routes` - SvelteKit routes and pages
- `/src/components` - Reusable Svelte components

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with SvelteKit
- Uses Konva.js for canvas manipulation
- Inspired by Canva's user interface and functionality
