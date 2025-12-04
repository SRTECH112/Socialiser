export type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  roomId: string;
  user: {
    id: string;
    email: string;
  };
};
