export default function getChatHead(message, email) {
  if (email !== message.sender.email) {
    return { email: message.sender.email, name: message.sender.name };
  } else {
    return { email: message.receiver.email, name: message.receiver.name };
  }
}
