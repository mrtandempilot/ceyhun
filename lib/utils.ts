export function generateUniqueTicketId(): string {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const randomString = Math.random().toString(36).substring(2, 8); // Random alphanumeric string
  return `TICKET-${timestamp}-${randomString}`.toUpperCase();
}
