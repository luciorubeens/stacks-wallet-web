import { useField } from 'formik';
import { color, Flex, Input } from '@stacks/ui';

import { Caption } from '@app/components/typography';
import { OnboardingSelectors } from '@tests/integration/onboarding/onboarding.selectors';

interface ConfirmPasswordFieldProps {
  matchResult: boolean;
}
export function ConfirmPasswordField({ matchResult }: ConfirmPasswordFieldProps) {
  const [field] = useField('confirmPassword');

  const matchText = (result: boolean) => (result ? 'Match' : 'Do not match');

  const matchColor = (result: boolean) =>
    result ? color('feedback-success') : color('feedback-error');

  return (
    <>
      <Input
        data-testid={OnboardingSelectors.ConfirmPasswordInput}
        height="64px"
        key="confirm-password-input"
        placeholder="Confirm password"
        type="password"
        width="100%"
        {...field}
      />
      <Flex alignItems="center">
        <Caption mx="extra-tight">Password match:</Caption>
        <Caption color={field.value === '' ? color('text-caption') : matchColor(matchResult)}>
          {field.value === '' ? '—' : matchText(matchResult)}
        </Caption>
      </Flex>
    </>
  );
}
