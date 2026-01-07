export type SiteConfig = {
  name: string;
  description: string;
  url: string;
};

export const evrydayarchiveConfig: SiteConfig = {
  name: 'Evryday Archive',
  description: 'A living archive of daily artifacts and stories.',
  url: 'https://evrydayarchive.local'
};

export const adminConfig: SiteConfig = {
  name: 'Evryday Admin',
  description: 'Operational tools for managing the archive.',
  url: 'https://admin.evrydayarchive.local'
};

export const reedConfig: SiteConfig = {
  name: 'Reed',
  description: 'A minimal site shell for the Reed experience.',
  url: 'https://reed.local'
};
