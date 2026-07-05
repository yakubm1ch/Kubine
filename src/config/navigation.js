/**
 * Centralized navigation configuration.
 * NavBar, MobileMenu, and AdminSidebar read ONLY from this file.
 * Never hardcode navigation items inside components.
 */

// ─── Public navigation ────────────────────────────────────────────────────────
// Used by: NavBar.vue, MobileMenu.vue
export const publicNavigation = [
  { name: 'Home',      path: '/'          },
  { name: 'Catalog',   path: '/catalog'   },
  { name: 'Blog',      path: '/blog'      },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'About',     path: '/about'     },
  { name: 'Contacts',  path: '/contacts'  },
]

// ─── Admin navigation ─────────────────────────────────────────────────────────
// Used by: AdminSidebar.vue
// Grouped into sections for sidebar rendering.
// `exact: true` — active only on exact path match (for Dashboard /admin)
export const adminNavigation = [
  {
    section: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin',           exact: true, icon: '📊' },
    ],
  },
  {
    section: 'Catalog',
    items: [
      { name: 'Products',   path: '/admin/products',   icon: '📦' },
      { name: 'Categories', path: '/admin/categories', icon: '🗂' },
    ],
  },
  {
    section: 'Content',
    items: [
      { name: 'Blog',      path: '/admin/blog',      icon: '📝' },
      { name: 'Portfolio', path: '/admin/portfolio', icon: '🛠' },
    ],
  },
  {
    section: 'Sales',
    items: [
      { name: 'Orders', path: '/admin/orders', icon: '🛍' },
    ],
  },
  {
    section: 'System',
    items: [
      { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ],
  },
]
