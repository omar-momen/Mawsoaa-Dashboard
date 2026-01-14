export interface NotificationSender {
  name: string
  avatar: {
    src: string
    alt: string
  }
}

export interface Notification {
  id: string
  unread: boolean
  sender: NotificationSender
  date: string
  body: string
}
