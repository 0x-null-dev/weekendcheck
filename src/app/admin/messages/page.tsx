import { listContactMessages } from "@/lib/contact";
import { MessageInbox } from "@/components/admin/message-inbox";
export default async function MessagesPage() { return <MessageInbox messages={await listContactMessages()} />; }
