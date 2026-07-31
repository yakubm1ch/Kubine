import "@/core/database/providers/provider.bootstrap.js";

import { useProjectProfileStore } from "@/modules/settings/stores/projectProfile.store";
import { useSettingsStore } from "@/modules/settings/stores/settings.store";

import { applyTheme } from "@/core/theme/engine/theme.engine";
import { applyProjectMetadata } from "@/core/content/document/document.engine";

export async function bootstrap() {

  console.log("🚀 Engine initialization...");

  const projectProfile = useProjectProfileStore();
  const settings = useSettingsStore();

  await Promise.all([
    projectProfile.load(),
    settings.loadSettings(),
  ]);

  console.log("📦 Project configuration loaded.");

  applyProjectMetadata(projectProfile.configuration);

  console.log("📝 Project metadata applied.");

  applyTheme(projectProfile.configuration);

  console.log("🎨 Theme applied.");

  console.log("✅ Engine ready.");

}