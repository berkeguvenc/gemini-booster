# Enhancer for Gemini

Enhancer for Gemini is a powerful Chrome Extension that enhances your experience on [Google Gemini](https://gemini.google.com). It seamlessly integrates into the Gemini sidebar, providing a dedicated space to save, manage, and access your favorite answers, custom prompts, and personal notes.

Read this in other languages: [Türkçe](README.tr.md)

## Features

- **Favorite Answers:** Save your favorite Gemini responses to access them later instantly.
- **Prompt Library:** Build and manage your own library of frequently used prompts.
- **My Notes:** Keep personal notes directly within the Gemini interface.
- **Chat Folders:** Organize your chats by moving them into folders.
- **Search Functionality:** Easily search through all your saved prompts, favorites, and notes from the extension popup.
- **Data Export & Import:** Backup your data by exporting it to a JSON file and restore it on any device.
- **Bilingual Support:** Fully supports both English and Turkish languages.

## Installation

### Download

- **Google Chrome:** [Chrome Web Store](YOUR_CHROME_STORE_LINK_HERE)
- **Firefox:** [Firefox Add-ons](YOUR_FIREFOX_ADDONS_LINK_HERE)

### Developer Mode (Local Installation)

1. Clone or download this repository to your local machine.
2. Install the dependencies:
   ```bash
   pnpm install
   ```
3. Build the extension:
   ```bash
   pnpm run build
   ```
4. Open Google Chrome and navigate to `chrome://extensions/`.
5. Enable **"Developer mode"** in the top right corner.
6. Click on **"Load unpacked"** and select the `build/chrome-mv3-prod` folder (or the generated build directory).
7. The extension is now installed! Pin it to your toolbar for easy access.

## Development

This project is built using [Plasmo](https://docs.plasmo.com/) and React.

- **Start development server:**
  ```bash
  pnpm run dev
  ```
- **Build for production:**
  ```bash
  pnpm run build
  ```
- **Package the extension:**
  ```bash
  pnpm run package
  ```

## Technologies Used
- React
- TypeScript
- Plasmo Framework
- i18next

## License
MIT License
