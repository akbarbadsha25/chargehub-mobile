import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeedbackType =
  'bug' | 'missing_charger' | 'wrong_charger_info' | 'suggestion';

export type FeedbackItem = {
  contact: string | null;
  createdAt: string;
  id: string;
  message: string;
  type: FeedbackType;
};

export type NewFeedback = {
  contact?: string;
  message: string;
  type: FeedbackType;
};

const feedbackStorageKey = 'chargehub:feedback';

type FeedbackListener = (feedback: FeedbackItem[]) => void;

const listeners = new Set<FeedbackListener>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeFeedback(value: unknown): FeedbackItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.message !== 'string' ||
    !isFeedbackType(value.type)
  ) {
    return null;
  }

  return {
    contact: typeof value.contact === 'string' ? value.contact : null,
    createdAt: value.createdAt,
    id: value.id,
    message: value.message,
    type: value.type
  };
}

function isFeedbackType(value: unknown): value is FeedbackType {
  return (
    value === 'bug' ||
    value === 'missing_charger' ||
    value === 'wrong_charger_info' ||
    value === 'suggestion'
  );
}

function notifyFeedback(feedback: FeedbackItem[]) {
  listeners.forEach((listener) => listener(feedback));
}

async function writeFeedback(feedback: FeedbackItem[]) {
  await AsyncStorage.setItem(feedbackStorageKey, JSON.stringify(feedback));
  notifyFeedback(feedback);
}

export function subscribeFeedback(listener: FeedbackListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export async function getSubmittedFeedback(): Promise<FeedbackItem[]> {
  const rawFeedback = await AsyncStorage.getItem(feedbackStorageKey);

  if (!rawFeedback) {
    return [];
  }

  try {
    const parsedFeedback = JSON.parse(rawFeedback) as unknown;

    if (!Array.isArray(parsedFeedback)) {
      return [];
    }

    return parsedFeedback.flatMap((feedback) => {
      const normalizedFeedback = normalizeFeedback(feedback);
      return normalizedFeedback ? [normalizedFeedback] : [];
    });
  } catch {
    return [];
  }
}

export async function submitFeedback(feedback: NewFeedback) {
  const submittedFeedback = await getSubmittedFeedback();
  const nextFeedback: FeedbackItem = {
    contact: feedback.contact?.trim() || null,
    createdAt: new Date().toISOString(),
    id: `${Date.now()}`,
    message: feedback.message.trim(),
    type: feedback.type
  };

  await writeFeedback([nextFeedback, ...submittedFeedback]);
}

export async function clearSubmittedFeedback() {
  await writeFeedback([]);
}
