export class EventEmitter {
  private events: Record<string, any[]> = {};

  /**
   * Register an event listener
   * @param event - The event name
   * @param callback - The callback function
   */
  subscribe(event: string, callback: (...args: any[]) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Unregister an event listener
   * @param event - The event name
   * @param callback - The callback function
   * */
  unsubscribe(event: string, callback: (...args: any[]) => void) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  }

  /**
   * Emit an event
   * @param event - The event name
   * @param args - The arguments to pass to the callback functions
   */
  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(...args));
    }
  }

  /**
   * Only emit an event once
   * @param event - The event name
   * @param callback - The callback function
   */
  once(event: string, callback: (...args: any[]) => void) {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.unsubscribe(event, onceCallback);
    };
    this.subscribe(event, onceCallback);
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.events = {};
  }
}
