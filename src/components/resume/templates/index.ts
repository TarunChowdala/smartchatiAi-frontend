import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import type { ResumeData } from './ModernTemplate';

export { ModernTemplate, MinimalTemplate, ClassicTemplate };
export type { ResumeData };

export type TemplateType = 'modern' | 'minimal' | 'classic';

export const TEMPLATES = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  classic: ClassicTemplate,
} as const;

export const TEMPLATE_METADATA = {
  modern: {
    name: 'Modern',
    description: 'Clean, professional design with blue accents',
    icon: '🎨',
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple serif typography with minimal styling',
    icon: '📝',
  },
  classic: {
    name: 'Classic',
    description: 'Traditional design with dark header',
    icon: '💼',
  },
} as const;

export const getTemplate = (templateType: TemplateType) => {
  return TEMPLATES[templateType] || TEMPLATES.modern;
};
