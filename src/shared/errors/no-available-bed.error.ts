export class NoAvailableBedError extends Error {
  constructor() {
    super("No available bed found.");
    this.name = "NoAvailableBedError";
  }
}