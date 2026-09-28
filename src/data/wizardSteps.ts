export interface StepDefinition {
  step: number;
  label: string;
  fullTitle: string;
  desc: string;
}

export const WIZARD_STEPS: StepDefinition[] = [
  {
    step: 1,
    label: 'Product',
    fullTitle: 'Tell us about your food',
    desc: 'Start with the basic characteristics of the product.'
  },
  {
    step: 2,
    label: 'Storage',
    fullTitle: 'How will it be stored?',
    desc: 'Tell us how long the product needs to stay usable and under what conditions.'
  },
  {
    step: 3,
    label: 'Transportation',
    fullTitle: 'How will it be transported?',
    desc: 'Tell us about the conditions the package may experience during distribution.'
  },
  {
    step: 4,
    label: 'Packaging',
    fullTitle: 'What does the packaging need to protect against?',
    desc: 'Choose the main packaging requirement for your product.'
  }
];
