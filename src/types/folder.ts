export interface FolderChatItem {
  id: string; // url or unique id
  title: string;
  url: string;
  addedAt: number;
}

export interface ChatFolder {
  id: string;
  name: string;
  color?: string; // Optional color hex code
  createdAt: number;
  chats: FolderChatItem[];
}
