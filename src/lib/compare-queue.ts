const KEY = "dh_compare_queue";
const MAX = 2;
export const COMPARE_QUEUE_EVENT = "dh-compare-queue";

export type CompareQueueItem = {
  id: string;
  name: string;
  image: string;
};

export function getCompareQueue(): CompareQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list
      .filter(
        (x): x is CompareQueueItem =>
          typeof x === "object" &&
          x !== null &&
          typeof (x as CompareQueueItem).id === "string" &&
          typeof (x as CompareQueueItem).name === "string",
      )
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function save(queue: CompareQueueItem[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(queue.slice(0, MAX)));
  window.dispatchEvent(new Event(COMPARE_QUEUE_EVENT));
}

export function addToCompareQueue(item: CompareQueueItem): CompareQueueItem[] {
  const queue = getCompareQueue().filter((x) => x.id !== item.id);
  queue.push(item);
  const next = queue.slice(-MAX);
  save(next);
  return next;
}

export function removeFromCompareQueue(productId: string): CompareQueueItem[] {
  const next = getCompareQueue().filter((x) => x.id !== productId);
  save(next);
  return next;
}

export function toggleCompareQueue(item: CompareQueueItem): {
  queue: CompareQueueItem[];
  added: boolean;
} {
  const current = getCompareQueue();
  if (current.some((x) => x.id === item.id)) {
    return { queue: removeFromCompareQueue(item.id), added: false };
  }
  if (current.length >= MAX) {
    const next = [current[1], item];
    save(next);
    return { queue: next, added: true };
  }
  return { queue: addToCompareQueue(item), added: true };
}

export function clearCompareQueue(): void {
  save([]);
}

export function isInCompareQueue(productId: string): boolean {
  return getCompareQueue().some((x) => x.id === productId);
}
