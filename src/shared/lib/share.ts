export const shareLink = async (
  url: string,
  title: string,
  text: string,
): Promise<boolean> => {
  const normalizedUrl = url.trim();
  const normalizedText = text.trim();
  const textWithUrl = normalizedText.includes(normalizedUrl)
    ? normalizedText
    : `${normalizedText}\n${normalizedUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({
        url: normalizedUrl,
        title,
        text: textWithUrl,
      });
      return true;
    } catch {
      // fallback to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(normalizedUrl);
    return true;
  } catch {
    return false;
  }
};
