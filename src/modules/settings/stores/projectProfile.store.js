import { defineStore } from "pinia";

import projectProfileService from "@/modules/settings/services/projectProfile.service.js";

export const useProjectProfileStore = defineStore("projectProfile", {

  state: () => ({

    profile: null,

    configuration: null,

    status: "idle",

    error: null,

    // Internal request tracking. Not part of the public application state;
    // used for concurrent-request deduplication and stale-response protection.
    _loadPromise: null,

    _requestId: 0,

  }),

  getters: {

    loading: (state) => state.status === "loading",

    loaded: (state) => state.status === "loaded",

    appearance: (state) =>
      state.configuration?.appearance ?? {},

    logos: (state) =>
      state.configuration?.logos ?? {},

    hero: (state) =>
      state.configuration?.hero ?? {},

    homepage: (state) =>
      state.configuration?.homepage ?? {},

    navigation: (state) =>
      state.configuration?.navigation ?? {},

    footer: (state) =>
      state.configuration?.footer ?? {},

  },

  actions: {

    load() {

      // Idempotent: successfully resolved states must not repeat.
      // Both "loaded" and "empty" are terminal success states.
      if (this.status === "loaded" || this.status === "empty") return;

      // Share the same in-flight promise for concurrent callers.
      if (this.status === "loading" && this._loadPromise) {
        return this._loadPromise;
      }

      // New generation for this request.
      const requestId = ++this._requestId;

      this.status = "loading";
      this.error = null;
      this.configuration = null;
      this.profile = null;

      this._loadPromise = projectProfileService
        .getActiveProfile()
        .then((profile) => {

          // Stale result protection: discard if a newer request superseded this one.
          if (requestId !== this._requestId) return;

          if (!profile) {

            // No active profile exists — this is a valid empty state.
            this.status = "empty";
            this.configuration = null;
            this.profile = null;

          } else {

            // Active profile retrieved successfully.
            this.status = "loaded";
            this.profile = profile;
            this.configuration = profile?.configuration ?? null;

          }

        })
        .catch((err) => {

          // Stale rejection protection: discard if superseded.
          if (requestId !== this._requestId) return;

          // Request failed — expose diagnostic information without
          // credentials or sensitive database details.
          this.status = "error";
          this.error = {
            message: err?.message || String(err),
            code: err?.code || null,
          };

        })
        .finally(() => {

          // Only clear the shared promise reference if this is still current.
          // A stale finally handler must not clear tracking for a newer request.
          if (requestId === this._requestId) {
            this._loadPromise = null;
          }

        });

      return this._loadPromise;

    },

    updateConfiguration(path, value) {

      const keys = String(path).split(".");

      this.configuration = keys.reduceRight(
        (acc, key) => ({ [key]: acc }),
        value,
      );

    },

    reset() {

      this.profile = null;

      this.configuration = null;

      this.status = "idle";

      this.error = null;

      // Invalidate any pending request so its late result cannot overwrite
      // the reset state.
      this._requestId++;

      this._loadPromise = null;

    },

  }

});
