// Minimal template-matcher stub. Real implementation should score candidate templates.
export type Template = {
  filename: string;
  storageUrl?: string;
  [key: string]: any;
};

export function matchTemplate(story: string, style?: string, templates?: any[]) {
  if (!templates || templates.length === 0) return null;
  // Very small heuristic: prefer templates that mention the style in filename
  const match = templates.find((t: any) => style && t.filename?.toLowerCase().includes(style.toLowerCase()));
  return match ? { template: match, score: 1 } : { template: templates[0], score: 0 };
}

export default { matchTemplate };
