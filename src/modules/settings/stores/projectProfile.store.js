import { defineStore } from "pinia";

import projectProfileService from "@/modules/settings/services/projectProfile.service";

export const useProjectProfileStore = defineStore("projectProfile", {

  state: () => ({

    profile: null,

    configuration: null,

    loading: false,

    loaded: false,

  }),

  getters: {

    appearance: (state) =>
      ConfigurationService.get(state.configuration, "appearance", {}),

    logos: (state) =>
      ConfigurationService.get(state.configuration, "logos", {}),

    hero: (state) =>
      ConfigurationService.get(state.configuration, "hero", {}),

    homepage: (state) =>
      ConfigurationService.get(state.configuration, "homepage", {}),

    navigation: (state) =>
      state.configuration?.navigation ?? {},

    footer: (state) =>
      ConfigurationService.get(state.configuration, "footer", {}),

  },

  actions: {

    async load() {

      if (this.loaded) return;

      this.loading = true;

      try {

        this.profile = await projectProfileService.getActiveProfile();

        this.configuration = this.profile.configuration;

        this.loaded = true;

      } finally {

        this.loading = false;

      }

    },

    updateConfiguration(path, value) {

      this.configuration = ConfigurationService.set(

        this.configuration,

        path,

        value

      );

    },

    reset() {

      this.profile = null;

      this.configuration = null;

      this.loading = false;

      this.loaded = false;

    }

  }

});