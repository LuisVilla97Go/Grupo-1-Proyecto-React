export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
  isRead: boolean;
  date: string;
}
