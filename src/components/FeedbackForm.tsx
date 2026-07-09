import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { FeedbackType, NewFeedback } from '@/services/feedback';

type FeedbackFormProps = {
  isSubmitting: boolean;
  onSubmit: (feedback: NewFeedback) => Promise<void>;
};

const feedbackTypeOptions: readonly {
  id: FeedbackType;
  label: string;
}[] = [
  { id: 'bug', label: 'Bug' },
  { id: 'missing_charger', label: 'Missing charger' },
  { id: 'wrong_charger_info', label: 'Wrong charger info' },
  { id: 'suggestion', label: 'Suggestion' }
];

export const feedbackTypeLabels = feedbackTypeOptions.reduce(
  (labels, option) => ({
    ...labels,
    [option.id]: option.label
  }),
  {} as Record<FeedbackType, string>
);

export function FeedbackForm({ isSubmitting, onSubmit }: FeedbackFormProps) {
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FeedbackType>('bug');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const normalizedMessage = message.trim();

  const handleSubmit = async () => {
    if (!normalizedMessage || isSubmitting) {
      setSubmitMessage(null);
      setValidationMessage('Please enter your feedback.');
      return;
    }

    setValidationMessage(null);
    await onSubmit({
      contact,
      message: normalizedMessage,
      type
    });
    setMessage('');
    setSubmitMessage('Feedback saved. Thank you.');
    setType('bug');
  };

  return (
    <View className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <Text className="text-lg font-semibold text-neutral-950">Feedback</Text>
      <View className="mt-3 flex-row flex-wrap">
        {feedbackTypeOptions.map((option) => {
          const isSelected = option.id === type;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={`mb-2 mr-2 min-h-11 justify-center rounded-full border px-4 py-2 ${
                isSelected
                  ? 'border-neutral-950 bg-neutral-950'
                  : 'border-neutral-200 bg-white'
              }`}
              onPress={() => setType(option.id)}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? 'text-white' : 'text-neutral-800'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        accessibilityLabel="Feedback message"
        className="mt-2 min-h-28 rounded-lg border border-neutral-200 px-3 py-3 text-base text-neutral-950"
        multiline
        onChangeText={setMessage}
        placeholder="What should we know?"
        placeholderTextColor="#737373"
        textAlignVertical="top"
        value={message}
      />
      <TextInput
        accessibilityLabel="Optional contact"
        autoCapitalize="none"
        className="mt-4 h-12 rounded-lg border border-neutral-200 px-3 text-base text-neutral-950"
        keyboardType="email-address"
        onChangeText={setContact}
        placeholder="Contact (optional)"
        placeholderTextColor="#737373"
        value={contact}
      />
      {validationMessage ? (
        <Text className="mt-2 text-sm text-red-700">{validationMessage}</Text>
      ) : null}
      {submitMessage ? (
        <Text className="mt-2 text-sm text-green-700">{submitMessage}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        className={`mt-4 h-12 items-center justify-center rounded-lg px-4 ${
          isSubmitting ? 'bg-neutral-400' : 'bg-neutral-950'
        }`}
        disabled={isSubmitting}
        onPress={() => void handleSubmit()}
      >
        <Text className="font-semibold text-white">
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Text>
      </Pressable>
    </View>
  );
}
