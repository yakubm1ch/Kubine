import { providerManager } from "../engine/provider.manager.js"

export async function installDatabase() {
  const provider = providerManager.get()

  if (!(await provider.isInstalled())) {
    await provider.install()
  }

  await provider.upgrade()
}