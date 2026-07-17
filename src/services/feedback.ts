import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { supabase } from '@/services/supabase';

export type FeedbackType =
  'bug' | 'missing_charger' | 'wrong_charger_info' | 'suggestion';

export type FeedbackSubmissionStatus = 'pending' | 'sent';

export type FeedbackItem = {
  appVersion: string;
  chargerId: string | null;
  chargerName: string | null;
  contact: string | null;
  createdAt: string;
  id: string;
  latitude: number | null;
  longitude: number | null;
  message: string;
  platform: string;
  submissionStatus: FeedbackSubmissionStatus;
  type: FeedbackType;
};

export type NewFeedback = {
  chargerId?: string | null;
  chargerName?: string | null;
  contact?: string;
  latitude?: number | null;
  longitude?: number | null;
  message: string;
  type: FeedbackType;
};

export type FeedbackSubmissionResult = {
  submissionStatus: FeedbackSubmissionStatus;
};

const feedbackStorageKey = 'chargehub:feedback';
const appVersion = '1.0.0';

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
    appVersion:
      typeof value.appVersion === 'string' ? value.appVersion : appVersion,
    chargerId: typeof value.chargerId === 'string' ? value.chargerId : null,
    chargerName:
      typeof value.chargerName === 'string' ? value.chargerName : null,
    contact: typeof value.contact === 'string' ? value.contact : null,
    createdAt: value.createdAt,
    id: value.id,
    latitude: typeof value.latitude === 'number' ? value.latitude : null,
    longitude: typeof value.longitude === 'number' ? value.longitude : null,
    message: value.message,
    platform: typeof value.platform === 'string' ? value.platform : Platform.OS,
    submissionStatus:
      value.submissionStatus === 'sent' || value.submissionStatus === 'pending'
        ? value.submissionStatus
        : 'pending',
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

function createFeedbackId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

function createFeedbackItem(feedback: NewFeedback): FeedbackItem {
  return {
    appVersion,
    chargerId: feedback.chargerId?.trim() || null,
    chargerName: feedback.chargerName?.trim() || null,
    contact: feedback.contact?.trim() || null,
    createdAt: new Date().toISOString(),
    id: createFeedbackId(),
    latitude: typeof feedback.latitude === 'number' ? feedback.latitude : null,
    longitude:
      typeof feedback.longitude === 'number' ? feedback.longitude : null,
    message: feedback.message.trim(),
    platform: Platform.OS,
    submissionStatus: 'pending',
    type: feedback.type
  };
}

function getSupabaseConfigError() {
  if (supabase) {
    return null;
  }

  return 'Supabase feedback submission is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.';
}

async function sendFeedbackReport(feedback: FeedbackItem) {
  const client = supabase;
  const configError = getSupabaseConfigError();

  if (!client || configError) {
    if (__DEV__) {
      console.error(
        configError ??
          'Supabase feedback submission is not configured correctly.'
      );
    }

    throw new Error(
      configError ?? 'Supabase feedback submission is not configured correctly.'
    );
  }

  const { error } = await client.from('feedback_reports').insert({
    app_version: feedback.appVersion,
    charger_id: feedback.chargerId,
    charger_name: feedback.chargerName,
    contact: feedback.contact,
    created_at: feedback.createdAt,
    feedback_type: feedback.type,
    id: feedback.id,
    latitude: feedback.latitude,
    longitude: feedback.longitude,
    message: feedback.message,
    platform: feedback.platform,
    submission_status: 'sent'
  });

  if (error) {
    throw error;
  }
}

function upsertFeedbackItem(
  feedback: FeedbackItem[],
  nextItem: FeedbackItem
): FeedbackItem[] {
  const existingIndex = feedback.findIndex((item) => item.id === nextItem.id);

  if (existingIndex === -1) {
    return [nextItem, ...feedback];
  }

  return feedback.map((item) => (item.id === nextItem.id ? nextItem : item));
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
  const nextFeedback = createFeedbackItem(feedback);

  try {
    await sendFeedbackReport(nextFeedback);

    const sentFeedback: FeedbackItem = {
      ...nextFeedback,
      submissionStatus: 'sent'
    };

    await writeFeedback(upsertFeedbackItem(submittedFeedback, sentFeedback));

    return { submissionStatus: 'sent' } satisfies FeedbackSubmissionResult;
  } catch {
    await writeFeedback(upsertFeedbackItem(submittedFeedback, nextFeedback));

    return { submissionStatus: 'pending' } satisfies FeedbackSubmissionResult;
  }
}

export async function retryPendingFeedback(): Promise<number> {
  const submittedFeedback = await getSubmittedFeedback();
  let syncedCount = 0;
  const nextFeedback: FeedbackItem[] = [];

  for (const item of submittedFeedback) {
    if (item.submissionStatus !== 'pending') {
      nextFeedback.push(item);
      continue;
    }

    try {
      await sendFeedbackReport(item);
      syncedCount += 1;
      nextFeedback.push({ ...item, submissionStatus: 'sent' });
    } catch {
      nextFeedback.push(item);
    }
  }

  if (syncedCount > 0) {
    await writeFeedback(nextFeedback);
  }

  return syncedCount;
}

export async function clearSubmittedFeedback() {
  await writeFeedback([]);
}
