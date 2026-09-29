export type StoryboardActionType =
  | 'navigate'
  | 'focus_element'
  | 'click_category'
  | 'open_product_modal'
  | 'select_variant'
  | 'toggle_extra'
  | 'add_to_cart_and_close'
  | 'open_cart_drawer'
  | 'click_checkout_button'
  | 'fill_checkout_form'
  | 'scroll_down'
  | 'scroll_up'
  | 'open_table_reservation_modal'
  | 'fill_table_reservation'
  | 'pause';

export interface StoryboardBlock {
  id: string;
  type: StoryboardActionType;
  title: string;
  description: string;
  durationMs: number;
  pauseAfterMs?: number;
  // Parameters
  targetSelector?: string;
  targetCategory?: string;
  targetProductName?: string;
  targetVariantName?: string;
  targetExtraName?: string;
  formValues?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    guests?: number;
    time?: string;
    area?: string;
  };
  scrollAmount?: number;
  speechText?: string; // Sottotitolo / Voce guida
}

export interface StoryboardConfig {
  id: string;
  name: string;
  description: string;
  targetFormat: '9:16' | '16:9' | '1:1';
  targetDevice: 'iPhone 14 Pro Max' | 'Samsung Galaxy S23' | 'Custom';
  viewportWidth: number;
  viewportHeight: number;
  deviceScaleFactor: number;
  language: 'IT' | 'EN' | 'TH' | 'DE';
  cursorSimulation: boolean;
  recordingSpeed: number; // 1.0 = standard, 1.2 = quick
  blocks: StoryboardBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface RunnerJobStatus {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentBlockIndex: number;
  totalBlocks: number;
  currentActionTitle: string;
  progressPercent: number;
  videoPath?: string;
  error?: string;
}
