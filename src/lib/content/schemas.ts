import { z } from 'zod';

export const MetricSchema = z.object({
  measure: z.string(),
  value: z.string(),
  data: z.string(),
  hardware: z.string(),
  method: z.string(),
  verified: z.boolean().optional().default(false),
});

export type Metric = z.infer<typeof MetricSchema>;

export const ProjectFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  order: z.number(),
  summary: z.string(),
  status: z.string(),
  data_note: z.string().optional(),
  repo_url: z.string().nullable().optional(),
  repo_private: z.boolean().optional().default(false),
  demo_url: z.string().nullable().optional(),
  demo_status: z.string().optional(),
  demo_note: z.string().optional(),
  diagram_verified: z.boolean().optional().default(false),
  stack: z.array(z.string()),
  metrics: z.array(MetricSchema).optional().default([]),
  changes: z.array(z.string()).optional(),
  hardening_status: z.string().optional(),
  authorship_note: z.string().optional(),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
  contentHtml: string;
  rawMarkdown: string;
}

export const CertSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().nullable().optional(),
  credential_id: z.string().nullable().optional(),
  featured: z.boolean().optional().default(false),
  attach_to: z.array(z.string()).nullable().optional(),
  verified: z.boolean().optional().default(false),
});

export type Cert = z.infer<typeof CertSchema>;

export const SiteSchema = z.object({
  name: z.string(),
  short_name: z.string(),
  tag: z.string(),
  location: z.string(),
  work_mode: z.string(),
  email_parts: z.tuple([z.string(), z.string()]),
  calendar_url: z.string(),
  domain: z.string(),
  linkedin: z.string(),
  github: z.string(),
});

export type SiteConfig = z.infer<typeof SiteSchema>;

export const StatusSchema = z.object({
  open_to_internships: z.boolean(),
  available_from: z.string(),
  role_targets: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  note: z.string().optional(),
});

export type StatusConfig = z.infer<typeof StatusSchema>;

export const TimelineEventSchema = z.object({
  date: z.string(),
  title: z.string(),
  type: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  verified: z.boolean().optional().default(false),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
