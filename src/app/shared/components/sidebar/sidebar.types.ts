export interface SidebarNavItem {
  label: string;
  /** PrimeIcon class without the 'pi ' prefix, e.g. 'pi-ticket' */
  icon: string;
  route?: string;
  badge?: number;
  children?: SidebarNavItem[];
}

export interface SidebarUser {
  name: string;
  role: string;
  avatarUrl?: string;
}
