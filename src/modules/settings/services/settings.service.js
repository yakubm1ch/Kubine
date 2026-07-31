import ProviderManager from "@/core/database/engine/manager/provider.manager";

const TABLE = "site_settings";

/*
 * Get site settings
 */

export async function getSettings() {

  const { data, error } = await Database.select(
    TABLE,
    "*",
    {
      single: true,
    }
  );

  if (error) throw error;

  return data;

}

/*
 * Update site settings
 */

export async function updateSettings(settings) {

  const { data, error } = await Database.update(
    TABLE,
    settings,
    {
      id: settings.id,
    }
  );

  if (error) throw error;

  return data[0];

}