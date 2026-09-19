type JsonLdProps = {
  data: unknown;
};

/** Server-rendered JSON-LD. Native script tag — not next/script. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
