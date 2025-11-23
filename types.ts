export enum SlideLayout {
  TITLE = 'TITLE',
  BULLET_POINTS_LEFT = 'BULLET_POINTS_LEFT',
  BULLET_POINTS_RIGHT = 'BULLET_POINTS_RIGHT',
  CENTERED_TEXT = 'CENTERED_TEXT',
  IMAGE_FEATURE = 'IMAGE_FEATURE'
}

export interface SlideData {
  title: string;
  subtitle?: string;
  content: string[]; // Bullet points or paragraphs
  layout: SlideLayout;
  imageDescription?: string; // Used to pick a placeholder or describe the image
}

export interface PresentationData {
  topic: string;
  slides: SlideData[];
}

export type GenerationStep = 'input' | 'generating_outline' | 'outline_review' | 'generating_slides' | 'viewing';

export interface GenerationStatus {
  isGenerating: boolean;
  message: string;
  error?: string;
}