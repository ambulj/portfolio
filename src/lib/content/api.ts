import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  ProjectFrontmatterSchema,
  Project,
  SiteSchema,
  SiteConfig,
  StatusSchema,
  StatusConfig,
  CertSchema,
  Cert,
  TimelineEventSchema,
  TimelineEvent,
} from './schemas';
import { renderMarkdown } from './markdown';

const contentDir = path.join(process.cwd(), 'content');

export async function getAllProjects(): Promise<Project[]> {
  const projectsDir = path.join(contentDir, 'projects');
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith('.md'));
  const projects: Project[] = [];

  for (const file of files) {
    const filePath = path.join(projectsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const validated = ProjectFrontmatterSchema.parse({
      ...data,
      slug: data.slug || file.replace(/\.md$/, ''),
    });

    const contentHtml = await renderMarkdown(content);

    projects.push({
      ...validated,
      rawMarkdown: content,
      contentHtml,
    });
  }

  // Sort by order ascending
  return projects.sort((a, b) => a.order - b.order);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug) || null;
}

export function getSiteConfig(): SiteConfig {
  const filePath = path.join(contentDir, 'site.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return SiteSchema.parse(data);
}

export function getStatusConfig(): StatusConfig {
  const filePath = path.join(contentDir, 'status.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return StatusSchema.parse(data);
}

export function getCertifications(): Cert[] {
  const filePath = path.join(contentDir, 'certs.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data.map((item: unknown) => CertSchema.parse(item));
}

export function getTimeline(): TimelineEvent[] {
  const filePath = path.join(contentDir, 'timeline.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data.map((item: unknown) => TimelineEventSchema.parse(item));
}

export async function getAboutContent(): Promise<{ contentHtml: string; rawMarkdown: string }> {
  const filePath = path.join(contentDir, 'about.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(fileContent);
  const contentHtml = await renderMarkdown(content);
  return { contentHtml, rawMarkdown: content };
}
