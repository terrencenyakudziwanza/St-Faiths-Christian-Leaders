export interface NavSection {
  id: string;
  label: string;
  sectionId: string;
}

export interface NavPage {
  id: string;
  label: string;
  path: string;
  sections?: NavSection[];
}
