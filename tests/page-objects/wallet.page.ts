import { Page } from 'playwright-core';

import { RouteUrls } from '@shared/route-urls';
import { OnboardingSelectors } from '@tests/integration/onboarding/onboarding.selectors';
import { HomePageSelectors } from '@tests/page-objects/home.selectors';
import { SettingsSelectors } from '@tests/integration/settings.selectors';

import {
  createTestSelector,
  wait,
  BrowserDriver,
  randomString,
  timeDifference,
} from '../integration/utils';
import { WalletPageSelectors } from './wallet.selectors';
import { FundPageSelectors } from './fund.selectors';

// TODO: This Page needs to be cleaned up -> create a HomePage?
// Should we create one Page for each route?
export class WalletPage {
  static url = 'http://localhost:8081/index.html#';
  $signUpButton = createTestSelector(OnboardingSelectors.SignUpBtn);
  $signInButton = createTestSelector(OnboardingSelectors.SignInLink);
  $analyticsAllowButton = createTestSelector(OnboardingSelectors.AnalyticsAllowBtn);
  $analyticsDenyButton = createTestSelector(OnboardingSelectors.AnalyticsDenyBtn);
  $homePageContainer = createTestSelector(HomePageSelectors.HomePageContainer);
  $secretKey = createTestSelector(OnboardingSelectors.SecretKey);
  $buttonSignInKeyContinue = createTestSelector(OnboardingSelectors.SignInBtn);
  setPasswordDone = createTestSelector(OnboardingSelectors.SetPasswordBtn);
  $passwordInput = createTestSelector(SettingsSelectors.EnterPasswordInput);
  $newPasswordInput = createTestSelector(OnboardingSelectors.NewPasswordInput);
  $confirmPasswordInput = createTestSelector(OnboardingSelectors.ConfirmPasswordInput);
  $sendTokenBtn = createTestSelector(HomePageSelectors.BtnSendTokens);
  $fundAccountBtn = createTestSelector(HomePageSelectors.BtnFundAccount);
  $confirmBackedUpSecretKey = createTestSelector(OnboardingSelectors.BackUpSecretKeyBtn);
  $password = 'mysecretreallylongpassword';
  $settingsButton = createTestSelector(SettingsSelectors.MenuBtn);
  $contractCallButton = createTestSelector('btn-contract-call');
  $settingsViewSecretKey = createTestSelector(SettingsSelectors.ViewSecretKeyListItem);
  $homePageBalancesList = createTestSelector(HomePageSelectors.BalancesList);
  $createAccountButton = createTestSelector(SettingsSelectors.CreateAccountBtn);
  $statusMessage = createTestSelector(WalletPageSelectors.StatusMessage);
  $hiroWalletLogo = createTestSelector(OnboardingSelectors.HiroWalletLogoRouteToHome);
  $signOutConfirmHasBackupCheckbox = createTestSelector(
    SettingsSelectors.SignOutConfirmHasBackupCheckbox
  );
  $signOutDeleteWalletBtn = createTestSelector(SettingsSelectors.BtnSignOutActuallyDeleteWallet);
  $enterPasswordInput = createTestSelector(SettingsSelectors.EnterPasswordInput);
  $unlockWalletBtn = createTestSelector(SettingsSelectors.UnlockWalletBtn);
  $magicRecoveryMessage = createTestSelector(WalletPageSelectors.MagicRecoveryMessage);
  $hideStepsBtn = createTestSelector(OnboardingSelectors.HideStepsBtn);
  $suggestedStepsList = createTestSelector(OnboardingSelectors.StepsList);
  $suggestedStepStartBtn = createTestSelector(OnboardingSelectors.StepItemStart);
  $suggestedStepDoneBadge = createTestSelector(OnboardingSelectors.StepItemDone);
  $noAssetsFundAccountLink = createTestSelector(OnboardingSelectors.NoAssetsFundAccountLink);
  $skipFundAccountBtn = createTestSelector(FundPageSelectors.BtnSkipFundAccount);

  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  static async init(browser: BrowserDriver, path?: RouteUrls) {
    const background = browser.context.backgroundPages()[0];
    const pageUrl: string = await background.evaluate(`openOptionsPage("${path || ''}")`);
    const page = await browser.context.newPage();
    await page.goto(pageUrl);
    page.on('pageerror', (event: { message: any }) => {
      console.log('Error in wallet:', event.message);
    });
    return new this(page);
  }

  static async getAllPages(browser: BrowserDriver) {
    const pages = await browser.context.pages();
    return pages;
  }

  async clickAllowAnalytics() {
    await this.page.click(this.$analyticsAllowButton);
  }

  async clickDenyAnalytics() {
    await this.page.click(this.$analyticsDenyButton);
  }

  async clickSignUp() {
    await this.page.click(this.$signUpButton);
  }

  async clickSignIn() {
    await this.page.click(this.$signInButton);
  }

  async clickSettingsButton() {
    await this.page.click(this.$settingsButton);
  }

  async clickContractCall() {
    await this.page.click(this.$contractCallButton);
  }

  async clickHideSteps() {
    await this.page.click(this.$hideStepsBtn);
  }

  async clickSkipFundAccountButton() {
    await this.page.click(this.$skipFundAccountBtn);
  }

  async waitForSettingsButton() {
    await this.page.waitForSelector(this.$settingsButton, { timeout: 30000 });
  }

  async waitForHomePage() {
    await this.page.waitForSelector(this.$homePageContainer, { timeout: 30000 });
  }

  async waitForNewPasswordInput() {
    await this.page.waitForSelector(this.$newPasswordInput, { timeout: 30000 });
  }

  async waitForConfirmPasswordInput() {
    await this.page.waitForSelector(this.$confirmPasswordInput, { timeout: 30000 });
  }

  async waitForEnterPasswordInput() {
    await this.page.waitForSelector(this.$enterPasswordInput, { timeout: 30000 });
  }

  async waitForHiroWalletLogo() {
    await this.page.waitForSelector(this.$hiroWalletLogo, { timeout: 3000 });
  }

  async waitForWelcomePage() {
    await this.page.waitForSelector(this.$signInButton, { timeout: 3000 });
  }

  async waitForStatusMessage() {
    await this.page.waitForSelector(this.$statusMessage, { timeout: 20000 });
  }

  async waitForHideOnboardingsStepsButton() {
    await this.page.waitForSelector(this.$hideStepsBtn, { timeout: 30000 });
  }

  async waitForsuggestedStepsList() {
    await this.page.waitForSelector(this.$suggestedStepsList, { timeout: 30000 });
  }

  async loginWithPreviousSecretKey(secretKey: string) {
    await this.enterSecretKey(secretKey);
    await this.enterNewPassword();
    await this.enterConfirmPasswordAndClickDone();
  }

  async enterSecretKey(secretKey: string) {
    await this.page.waitForSelector('textarea');
    await this.page.fill('textarea', secretKey);
    await this.page.click(this.$buttonSignInKeyContinue);
  }

  async getSecretKey() {
    await this.goToSecretKey();
    await this.page.waitForSelector(this.$secretKey);
    const secretKeyWords = await this.page.locator(this.$secretKey).allInnerTexts();
    return secretKeyWords.join(' ');
  }

  async backUpKeyAndSetPassword() {
    await this.page.click(this.$confirmBackedUpSecretKey);
    await this.enterNewPassword();
    await this.enterConfirmPasswordAndClickDone();
    await wait(1000);
  }

  async goTo(path: RouteUrls) {
    await this.page.evaluate(`location.hash = '${path}'`);
  }

  async goToSecretKey() {
    await this.clickSettingsButton();
    await this.page.click(this.$settingsViewSecretKey);
  }

  async enterNewPassword(password?: string) {
    await this.page.fill(
      `input[data-testid=${OnboardingSelectors.NewPasswordInput}]`,
      password ?? this.$password
    );
  }

  async enterConfirmPasswordAndClickDone(password?: string) {
    await this.page.fill(
      `input[data-testid=${OnboardingSelectors.ConfirmPasswordInput}]`,
      password ?? this.$password
    );
    await this.page.click(this.setPasswordDone);
  }

  async enterPasswordAndUnlockWallet(password?: string) {
    await this.page.fill(
      `input[data-testid=${SettingsSelectors.EnterPasswordInput}]`,
      password ?? this.$password
    );
    await this.page.click(this.$unlockWalletBtn);
  }

  async decryptRecoveryCode(password: string) {
    await this.page.fill('input[type="password"]', password);
    await this.page.click(createTestSelector('decrypt-recovery-button'));
  }

  async goToSendForm() {
    await this.page.click(this.$sendTokenBtn);
  }

  async goToFundPage() {
    await this.page.click(this.$fundAccountBtn);
  }

  async waitForMagicRecoveryMessage() {
    await this.page.waitForSelector(this.$magicRecoveryMessage, { timeout: 30000 });
  }

  async waitForSendButton() {
    await this.page.waitForSelector(this.$sendTokenBtn, { timeout: 30000 });
  }

  /** Sign up with a randomly generated seed phrase */
  async signUp() {
    await this.clickDenyAnalytics();
    await this.clickSignUp();
    await this.backUpKeyAndSetPassword();
    await this.clickSkipFundAccountButton();
    await this.waitForHomePage();
  }

  async signIn(secretKey: string) {
    await this.clickDenyAnalytics();
    await this.clickSignIn();
    let startTime = new Date();
    await this.enterSecretKey(secretKey);
    await this.waitForNewPasswordInput();
    await this.waitForConfirmPasswordInput();
    console.log(
      `Page load time for 12 or 24 word Secret Key: ${timeDifference(
        startTime,
        new Date()
      )} seconds`
    );
    const password = randomString(15);
    startTime = new Date();
    await this.enterNewPassword(password);
    await this.enterConfirmPasswordAndClickDone(password);
    await this.waitForHomePage();
    console.log(
      `Page load time for sign in with password: ${timeDifference(startTime, new Date())} seconds`
    );
    startTime = new Date();
    await this.waitForHomePage();
    console.log(
      `Page load time for mainnet account: ${timeDifference(startTime, new Date())} seconds`
    );
  }
}
