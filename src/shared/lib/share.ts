export const shareLink = async (
  url: string,
  title: string,
  text: string,
): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({ url, title, text });
      return true;
    } catch {
      // fallback to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
};
