import postgres from 'postgres';
import { 
  menuItems, 
  pagesData, 
  navItems, 
  mainPages, 
  othermenuItems, 
  icons, 
  features, 
  homeLinks, 
  links,
  featurePageLinks,
  sections,
  sections2,
  sections3,
  sections4,
  categories
} from '../../data/menu';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedMenuItems() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      menu_id INT NOT NULL,
      label VARCHAR(255) NOT NULL,
      href VARCHAR(255),
      parent_id UUID,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedMenuItems = [];
  
  for (const menuItem of menuItems) {
    // Insert main menu item
    const [mainItem] = await sql`
      INSERT INTO menu_items (menu_id, label, href)
      VALUES (${menuItem.id}, ${menuItem.label}, ${menuItem.href || null})
      ON CONFLICT DO NOTHING
      RETURNING id;
    `;

    // Insert sub items if they exist
    if (menuItem.subItems) {
      for (const subItem of menuItem.subItems) {
        if (typeof subItem === 'object' && subItem.href) {
          await sql`
            INSERT INTO menu_items (menu_id, label, href, parent_id)
            VALUES (${menuItem.id}, ${subItem.label}, ${subItem.href}, ${mainItem?.id || null})
            ON CONFLICT DO NOTHING;
          `;
        } else if (typeof subItem === 'object' && subItem.subItems) {
          // Handle nested sub items
          const [subParent] = await sql`
            INSERT INTO menu_items (menu_id, label, parent_id)
            VALUES (${menuItem.id}, ${subItem.label}, ${mainItem?.id || null})
            ON CONFLICT DO NOTHING
            RETURNING id;
          `;
          
          for (const nestedItem of subItem.subItems) {
            await sql`
              INSERT INTO menu_items (menu_id, label, href, parent_id)
              VALUES (${menuItem.id}, ${nestedItem.label}, ${nestedItem.href}, ${subParent?.id || null})
              ON CONFLICT DO NOTHING;
            `;
          }
        }
      }
    }
    
    insertedMenuItems.push(mainItem);
  }

  return insertedMenuItems;
}

async function seedPages() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS pages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      page_id INT NOT NULL,
      header VARCHAR(255) NOT NULL,
      href VARCHAR(255) NOT NULL,
      label VARCHAR(255) NOT NULL,
      badge_text VARCHAR(50),
      badge_class VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedPages = [];
  
  for (const pageGroup of pagesData) {
    for (const item of pageGroup.items) {
      const [page] = await sql`
        INSERT INTO pages (page_id, header, href, label, badge_text, badge_class)
        VALUES (
          ${pageGroup.id}, 
          ${pageGroup.header}, 
          ${item.href}, 
          ${item.label},
          ${item.badge?.text || null},
          ${item.badge?.className || null}
        )
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;
      insertedPages.push(page);
    }
  }

  return insertedPages;
}

async function seedNavItems() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS nav_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      href VARCHAR(255) NOT NULL,
      label VARCHAR(255) NOT NULL,
      active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedNavItems = await Promise.all(
    navItems.map(
      (item) => sql`
        INSERT INTO nav_items (href, label, active)
        VALUES (${item.href}, ${item.label}, ${item.active || false})
        ON CONFLICT DO NOTHING;
      `,
    ),
  );

  return insertedNavItems;
}

async function seedMainPages() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS main_pages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      href VARCHAR(255) NOT NULL,
      alt VARCHAR(255) NOT NULL,
      src VARCHAR(500) NOT NULL,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedMainPages = await Promise.all(
    mainPages.map(
      (page) => sql`
        INSERT INTO main_pages (href, alt, src, title)
        VALUES (${page.href}, ${page.alt}, ${page.src}, ${page.title})
        ON CONFLICT DO NOTHING;
      `,
    ),
  );

  return insertedMainPages;
}

async function seedFeatures() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS features (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      feature_id INT NOT NULL,
      icon_class VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedFeatures = await Promise.all(
    features.map(
      (feature) => sql`
        INSERT INTO features (feature_id, icon_class, title, description)
        VALUES (${feature.id}, ${feature.iconClass}, ${feature.title}, ${feature.description})
        ON CONFLICT DO NOTHING;
      `,
    ),
  );

  return insertedFeatures;
}

async function seedHomeLinks() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS home_links (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      link_id INT NOT NULL,
      href VARCHAR(255) NOT NULL,
      img_alt VARCHAR(255) NOT NULL,
      img_src VARCHAR(500) NOT NULL,
      label VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedHomeLinks = await Promise.all(
    homeLinks.map(
      (link) => sql`
        INSERT INTO home_links (link_id, href, img_alt, img_src, label)
        VALUES (${link.id}, ${link.href}, ${link.imgAlt}, ${link.imgSrc}, ${link.label})
        ON CONFLICT DO NOTHING;
      `,
    ),
  );

  return insertedHomeLinks;
}

async function seedOtherMenuItems() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS other_menu_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      href VARCHAR(255) NOT NULL,
      icon VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedOtherMenuItems = await Promise.all(
    othermenuItems.map(
      (item) => sql`
        INSERT INTO other_menu_items (href, icon, title)
        VALUES (${item.href}, ${item.icon}, ${item.title})
        ON CONFLICT DO NOTHING;
      `,
    ),
  );

  return insertedOtherMenuItems;
}

async function seedSocialIcons() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS social_icons (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      href VARCHAR(255) NOT NULL,
      icon_class VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedSocialIcons = await Promise.all(
    icons.map(
      (icon) => sql`
        INSERT INTO social_icons (href, icon_class)
        VALUES (${icon.href}, ${icon.iconClass})
        ON CONFLICT DO NOTHING;
      `,
    ),
  );

  return insertedSocialIcons;
}

async function seedSections() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS sections (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      link_text VARCHAR(255) NOT NULL,
      link_href VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedSections = [];
  
  for (const section of sections) {
    for (const link of section.links) {
      const [sectionItem] = await sql`
        INSERT INTO sections (title, link_text, link_href)
        VALUES (${section.title}, ${link.text}, ${link.href})
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;
      insertedSections.push(sectionItem);
    }
  }

  return insertedSections;
}

export async function GET() {
  try {
    await sql.begin(async (sql) => {
      await seedMenuItems();
      await seedPages();
      await seedNavItems();
      await seedMainPages();
      await seedFeatures();
      await seedHomeLinks();
      await seedOtherMenuItems();
      await seedSocialIcons();
      await seedSections();
    });

    return Response.json({ message: 'Navigation database seeded successfully' });
  } catch (error) {
    console.error('Database seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}