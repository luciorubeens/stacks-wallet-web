import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'ts-debounce';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Box, Stack, Text } from '@stacks/ui';

import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useWallet } from '@app/common/hooks/use-wallet';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import {
  blankPasswordValidation,
  validatePassword,
} from '@app/common/validation/validate-password';
import { PrimaryButton } from '@app/components/primary-button';
import { Caption } from '@app/components/typography';
import { Header } from '@app/components/header';
import { PageTitle } from '@app/components/page-title';
import { CenteredPageContainer } from '@app/components/centered-page-container';
import { CENTERED_FULL_PAGE_MAX_WIDTH } from '@app/components/global-styles/full-page-styles';
import SetPassword from '@assets/images/onboarding/set-password.png';
import { HUMAN_REACTION_DEBOUNCE_TIME } from '@shared/constants';
import { RouteUrls } from '@shared/route-urls';
import { getWalletConfig } from '@shared/utils/wallet-config-helper';
import { OnboardingSelectors } from '@tests/integration/onboarding/onboarding.selectors';

import { ConfirmPasswordField } from './components/confirm-password-field';
import { PasswordField } from './components/password-field';

interface SetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
const setPasswordFormValues: SetPasswordFormValues = { password: '', confirmPassword: '' };

export const SetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [strengthResult, setStrengthResult] = useState(blankPasswordValidation);
  const [matchResult, setMatchResult] = useState(false);
  const { finishSignIn, setPassword, wallet } = useWallet();
  const navigate = useNavigate();
  const { decodedAuthRequest } = useOnboardingState();
  const analytics = useAnalytics();

  useRouteHeader(<Header hideActions onClose={() => navigate(RouteUrls.BackUpSecretKey)} />);

  useEffect(() => {
    void analytics.page('view', '/set-password');
  }, [analytics]);

  useEffect(() => {
    // Proactively fetch the gaia wallet config
    if (!wallet) return;
    void getWalletConfig(wallet);
  }, [wallet]);

  const submit = useCallback(
    async (password: string) => {
      setLoading(true);

      await setPassword(password);

      if (decodedAuthRequest) {
        if (!wallet) return;
        const { accounts } = wallet;
        if (accounts && accounts.length > 1) {
          navigate(RouteUrls.ChooseAccount);
        } else {
          await finishSignIn(0);
        }
      } else {
        navigate(RouteUrls.Fund, { state: { showSkipButton: true } });
      }
    },
    [setPassword, decodedAuthRequest, wallet, navigate, finishSignIn]
  );

  const onSubmit = useCallback(
    async ({ password }) => {
      if (!password) return;
      setLoading(true);
      if (strengthResult.meetsAllStrengthRequirements) {
        void analytics.track('submit_valid_password');
        await submit(password);
        return;
      }
      setLoading(false);
    },
    [strengthResult, submit, analytics]
  );

  const validationSchema = yup.object({
    password: yup
      .string()
      .required()
      .test({
        message: 'Weak',
        test: debounce((value: unknown) => {
          if (typeof value !== 'string') return false;
          const result = validatePassword(value);
          setStrengthResult(result);
          if (!result.meetsAllStrengthRequirements) {
            void analytics.track('submit_invalid_password');
          }
          return result.meetsAllStrengthRequirements;
        }, HUMAN_REACTION_DEBOUNCE_TIME) as unknown as yup.TestFunction<any, any>,
      }),
    confirmPassword: yup
      .string()
      .when('password', {
        is: (val: string | any[]) => val && val.length > 0,
        then: yup.string().required(),
      })
      .test({
        message: 'Do not match',
        test: debounce((value: unknown, context) => {
          if (typeof value !== 'string') return false;
          const result = context.options.parent.password === value;
          setMatchResult(result);
          return result;
        }, HUMAN_REACTION_DEBOUNCE_TIME) as unknown as yup.TestFunction<any, any>,
      }),
  });

  return (
    <CenteredPageContainer>
      <Formik
        initialValues={setPasswordFormValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnMount={false}
      >
        {({ dirty, isSubmitting, isValid }) => (
          <Form>
            <Stack
              maxWidth={CENTERED_FULL_PAGE_MAX_WIDTH}
              mb={['loose', 'unset']}
              px={['loose', 'unset']}
              spacing="loose"
              textAlign={['left', 'center']}
            >
              <Box alignSelf={['start', 'center']} width={['95px', '117px']}>
                <img src={SetPassword} />
              </Box>
              <PageTitle>Set a password</PageTitle>
              <Text lineHeight="1.5rem">
                Your password protects your Secret Key and is for this device only. To access your
                Stacks account on another device or wallet you’ll need just your Secret Key.
                <Caption fontSize={0} mt="base-loose" px={['unset', 'base']}>
                  Use a strong password. Longer than 12 characters, with symbols, numbers, and
                  words.
                </Caption>
              </Text>
              <Stack px={['unset', 'base-loose']} spacing="base">
                <PasswordField strengthResult={strengthResult} />
                <ConfirmPasswordField matchResult={matchResult} />
                <PrimaryButton
                  data-testid={OnboardingSelectors.SetPasswordBtn}
                  isDisabled={loading || !(dirty && isValid)}
                  isLoading={loading || isSubmitting}
                  mt="tight"
                >
                  Continue
                </PrimaryButton>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </CenteredPageContainer>
  );
};
