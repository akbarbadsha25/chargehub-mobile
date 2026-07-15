import { useCallback, useEffect, useState } from 'react';

import {
  clearSubmittedFeedback,
  FeedbackItem,
  NewFeedback,
  getSubmittedFeedback,
  retryPendingFeedback,
  submitFeedback,
  subscribeFeedback
} from '@/services/feedback';

export function useFeedback() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);

    try {
      setFeedback(await getSubmittedFeedback());
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to load submitted feedback.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeedback();

    return subscribeFeedback((nextFeedback) => {
      setFeedback(nextFeedback);
      setErrorMessage(null);
    });
  }, [loadFeedback]);

  const addFeedback = useCallback(async (newFeedback: NewFeedback) => {
    setIsSubmitting(true);

    try {
      const result = await submitFeedback(newFeedback);
      setErrorMessage(null);

      return result;
    } catch {
      setErrorMessage('Unable to save feedback.');
      return { submissionStatus: 'pending' as const };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const retryPending = useCallback(async () => {
    setIsRetrying(true);

    try {
      const syncedCount = await retryPendingFeedback();
      setErrorMessage(null);

      return syncedCount;
    } catch {
      setErrorMessage('Unable to retry pending feedback.');
      return 0;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  const clearFeedback = useCallback(async () => {
    try {
      await clearSubmittedFeedback();
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to clear submitted feedback.');
    }
  }, []);

  return {
    addFeedback,
    clearFeedback,
    errorMessage,
    feedback,
    isLoading,
    isRetrying,
    isSubmitting,
    reload: loadFeedback,
    retryPending
  };
}
