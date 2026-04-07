export interface ChatItem {
  id: string; // The conversation ID natively
  title: string;
  url: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null means root level
  color?: string; // Optional folder color
  isOpen?: boolean; // UI state
  createdAt: number;
}

// In storage we will keep:
// gemini_folders: Folder[]
// gemini_chats: Record<string, string> // { [chatId]: folderId }
