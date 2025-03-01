import { reactive } from "vue";

const events = reactive<{ [key: string]: Function[] }>({});

export function useEventBus() {
  return {
    emit(event: string, payload?: any) {
      if (events[event]) {
        events[event].forEach((callback) => callback(payload));
      }
    },
    on(event: string, callback: Function) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(callback);
    },
    off(event: string, callback: Function) {
      if (events[event]) {
        events[event] = events[event].filter((cb) => cb !== callback);
      }
    },
  };
}
