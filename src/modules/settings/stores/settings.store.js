import { defineStore } from "pinia";
import { getSettings } from "../services/settings.service";

export const useSettingsStore = defineStore("settings", {

  state: () => ({

    settings: null,

    loading: false,

    error: null,

  }),

  actions: {

    async loadSettings() {

      this.loading = true;
      this.error = null;

      try {

        const data = await getSettings();

        this.settings = data;

      } catch (err) {

        this.error = err.message;
        console.error(err);

      } finally {

        this.loading = false;

      }

    },

  },

});