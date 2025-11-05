// utils/getLanguage.ts
const supported = ["en-US", "de-DE", "fr-FR", "pl-PL"] as const;

export const getLanguage = (req: { headers: any }): typeof supported[number] => {
  const raw = (req.headers["accept-language"] as string) || "";
  /* take the first locale sent by the client, e.g. "de-DE,de;q=0.9" -> "de-DE" */
  const locale = raw.split(",")[0].trim();

  return (supported.includes(locale as any) ? locale : "en-US") as typeof supported[number];
};
