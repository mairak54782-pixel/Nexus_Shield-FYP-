import * as AuthSession from 'expo-auth-session';

const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true, // mobile aur web dono ke liye safe
});

export default redirectUri;
