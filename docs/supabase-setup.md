# Supabase setup and remaining provider work

Verified October 25, 2026. Project: `rvjqwvkikciwpwbfspgp`, Smart AI Planner, fakhrushaik’s Org, US East.

## Public configuration

`website/config.js` contains the project URL and **publishable** key. This key is designed to be public; RLS provides authorization. Never add a secret/service-role key, database password, OAuth secret, or Apple private key to this repository. The pinned SDK is bundled locally; `npm ci && npm run vendor` rebuilds it. GitHub Pages serves the committed files without a build step.

## Verified dashboard settings

Email/password is enabled; new signups and email confirmation are on. Anonymous sign-in and manual identity linking are off. Minimum password length is 12. Secure email change and secure password change are on. Email links expire after 3,600 seconds. Leaked-password protection requires a paid plan and is not enabled. No plan upgrade was purchased.

Site URL: `https://fakhrushaik.github.io/Smart-AI-Planner/login.html`

The six exact redirect URLs are saved (no wildcards):

```text
https://fakhrushaik.github.io/Smart-AI-Planner/login.html
https://fakhrushaik.github.io/Smart-AI-Planner/login.html?flow=recovery
http://localhost:4173/login.html
http://localhost:4173/login.html?flow=recovery
http://127.0.0.1:4173/login.html
http://127.0.0.1:4173/login.html?flow=recovery
```

PKCE verification is tab-scoped. Open confirmation and recovery links in the same browser tab that requested them. Browser storage restrictions fall back to memory; navigating away can then lose the verifier. Do not disable email confirmation to work around email delivery. Configure and test a custom SMTP service before opening registration beyond the project's authorized test recipients; Supabase's default email service has recipient and rate limits.

## Google — owner setup required

1. In Google Cloud, select the team's project and configure the OAuth consent screen, app name, support contact and authorized domain. While in Testing, add the intended test accounts.
2. Create an OAuth client of type **Web application**. Use `https://fakhrushaik.github.io` as the production JavaScript origin where requested. Development origins are `http://localhost:4173` and `http://127.0.0.1:4173`.
3. Add this exact authorized redirect URI: `https://rvjqwvkikciwpwbfspgp.supabase.co/auth/v1/callback`.
4. Enter the client ID and secret directly in Supabase → Authentication → Sign In / Providers → Google. Enable and save. Keep nonce checks enabled.
5. Set `providers.google` to `true` in `website/config.js` only after testing a complete sign-in and cancellation. Review the diff and publish through a PR.

## Apple — owner setup required

1. In the team's Apple Developer account, configure a primary App ID with Sign in with Apple. Register a unique Services ID for the web application (for example `edu.uc.team59.smartplanner.web`, **only if available and owned by your team**). No Services ID has been registered by this change.
2. Enable Sign in with Apple for that Services ID, associate the primary App ID, and configure domain `rvjqwvkikciwpwbfspgp.supabase.co` with return URL `https://rvjqwvkikciwpwbfspgp.supabase.co/auth/v1/callback`.
3. Create the Sign in with Apple key. Keep the `.p8` private key outside the repository. Use the team's actual Team ID, Key ID and Services ID to generate the client-secret JWT following Supabase's Apple guide.
4. Enter the Services ID and generated secret directly in Supabase → Authentication → Sign In / Providers → Apple, then enable it. Schedule secret rotation before its expiration (Apple web secrets have a maximum six-month lifetime).
5. Test normal and hidden-email accounts, cancellation and return navigation. Configure Apple private email relay for your mail sender if needed. Only then set `providers.apple` to `true` and update the provider status copy.

Google and Apple are currently disabled in Supabase and hidden in the UI. Their OAuth code paths are implemented, but credentials cannot be invented and these flows are not verified.

Official references: [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [Apple](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
