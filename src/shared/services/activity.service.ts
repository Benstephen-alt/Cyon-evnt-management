export async function logActivity(
  action: string,
  userId?: string
) {
  console.log(
    `[Activity] ${new Date().toISOString()} | ${userId ?? "SYSTEM"} | ${action}`
  );
}