import { useCallback, useEffect, useState } from 'react';

import {
  clearSubmittedFeedback,
  FeedbackItem,
  NewFeedback,
  getSubmittedFeedback,
  submitFeedback,
  subscribeFeedback
} from '@/services/feedback';

export function useFeedback() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      await submitFeedback(newFeedback);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to save feedback.');
    } finally {
      setIsSubmitting(false);
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
    isSubmitting,
    reload: loadFeedback
  };
}
