import Database from "@/core/database/database.adapter";

class ProjectProfileService {

  async getActiveProfile() {

    const { data, error } = await Database.select(
      "project_profiles",
      "*",
      {
        is_active: true,
        single: true,
      }
    );

    if (error) {
      console.error("Failed to load active project profile:", error);
      throw error;
    }

    return data;

  }

  async getConfiguration() {

    const profile = await this.getActiveProfile();

    return profile.configuration;

  }

}

export default new ProjectProfileService();