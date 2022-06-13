import { useField } from 'formik';
import { color, Flex, Input } from '@stacks/ui';

import { ValidatedPassword } from '@app/common/validation/validate-password';
import { Caption } from '@app/components/typography';
import { OnboardingSelectors } from '@tests/integration/onboarding/onboarding.selectors';

interface PasswordFieldProps {
  strengthResult: ValidatedPassword;
}
export function PasswordField({ strengthResult }: PasswordFieldProps) {
  const [field] = useField('password');

  const strengthText = (result: ValidatedPassword) =>
    result.meetsAllStrengthRequirements ? 'Strong' : 'Weak';

  const strengthColor = (result: ValidatedPassword) =>
    result.meetsAllStrengthRequirements ? color('feedback-success') : color('feedback-error');

  return (
    <>
      <Input
        autoFocus
        data-testid={OnboardingSelectors.NewPasswordInput}
        height="64px"
        key="password-input"
        placeholder="Set a password"
        type="password"
        {...field}
      />
      <Flex alignItems="center">
        <Caption mx="extra-tight">Password strength:</Caption>
        <Caption color={field.value === '' ? color('text-caption') : strengthColor(strengthResult)}>
          {field.value === '' ? '—' : strengthText(strengthResult)}
        </Caption>
      </Flex>
    </>
  );
}
