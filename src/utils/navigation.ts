import { Linking, Platform } from 'react-native';

async function tryOpenUrl(url: string): Promise<boolean> {
  try {
    if (!(await Linking.canOpenURL(url))) {
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function openDirections(
  latitude: number,
  longitude: number
): Promise<void> {
  const destination = `${latitude},${longitude}`;
  const nativeUrl =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destination}&dirflg=d`
      : `google.navigation:q=${destination}`;
  const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  if ((await tryOpenUrl(nativeUrl)) || (await tryOpenUrl(fallbackUrl))) {
    return;
  }

  throw new Error('No compatible maps application is available.');
}
