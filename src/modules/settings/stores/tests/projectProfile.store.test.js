import assert from "node:assert/strict";

import { setActivePinia, createPinia } from "pinia";

import {
  useProjectProfileStore,
} from "../projectProfile.store.js";

import projectProfileService from "../../services/projectProfile.service.js";

/*
 * Helper: create a fresh store instance for each test block.
 */

function freshStore() {
  setActivePinia(createPinia());
  return useProjectProfileStore();
}

/*
 * Helper: replace the service's getActiveProfile with a controlled mock
 * that returns a deferred promise. Returns { promise, resolve, reject, callCount }.
 */

function mockService() {
  let callCount = 0;

  // Each call to getActiveProfile creates its own deferred promise.
  // Stored in order so tests can resolve/reject specific calls by index.
  const pending = [];

  const original = projectProfileService.getActiveProfile;

  projectProfileService.getActiveProfile = async () => {
    callCount += 1;
    let resolveFn;
    let rejectFn;
    const promise = new Promise((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });
    pending.push({ resolve: resolveFn, reject: rejectFn, promise });
    return promise;
  };

  return {
    // Resolve the most recent pending promise by call index (1-based).
    resolve: (value, callIndex = callCount) => {
      pending[callIndex - 1]?.resolve(value);
    },
    // Reject the most recent pending promise by call index (1-based).
    reject: (value, callIndex = callCount) => {
      pending[callIndex - 1]?.reject(value);
    },
    get callCount() {
      return callCount;
    },
    restore() {
      projectProfileService.getActiveProfile = original;
    },
  };
}

/*
 * ============================================================
 * Initial lifecycle state
 * ============================================================
 */

{
  const store = freshStore();

  assert.equal(
    store.status,
    "idle",
    "Initial status is idle."
  );

  assert.equal(
    store.loading,
    false,
    "Initial loading is false."
  );

  assert.equal(
    store.loaded,
    false,
    "Initial loaded is false."
  );

  assert.equal(
    store.profile,
    null,
    "Initial profile is null."
  );

  assert.equal(
    store.configuration,
    null,
    "Initial configuration is null."
  );

  assert.equal(
    store.error,
    null,
    "Initial error is null."
  );

  console.log("[Test] ✓ Initial lifecycle state is correct.");
}

/*
 * Getters with null configuration
 */

{
  const store = freshStore();

  assert.deepEqual(
    store.hero,
    {},
    "hero getter returns empty object when configuration is null."
  );

  assert.deepEqual(
    store.appearance,
    {},
    "appearance getter returns empty object when configuration is null."
  );

  assert.deepEqual(
    store.logos,
    {},
    "logos getter returns empty object when configuration is null."
  );

  assert.deepEqual(
    store.homepage,
    {},
    "homepage getter returns empty object when configuration is null."
  );

  assert.deepEqual(
    store.navigation,
    {},
    "navigation getter returns empty object when configuration is null."
  );

  assert.deepEqual(
    store.footer,
    {},
    "footer getter returns empty object when configuration is null."
  );

  console.log(
    "[Test] ✓ All getters return safe defaults with null configuration."
  );
}

/*
 * Getters with populated configuration
 */

{
  const store = freshStore();

  store.configuration = {
    hero: { title: "Welcome", primaryButtonLink: "/catalog" },
    appearance: { theme: "dark" },
    logos: { primary: "/logo.svg" },
    homepage: { featured: true },
    navigation: { public: [{ path: "/", name: "Home" }] },
    footer: { links: [] },
  };

  assert.deepEqual(
    store.hero,
    { title: "Welcome", primaryButtonLink: "/catalog" },
    "hero getter returns configured hero section."
  );

  assert.deepEqual(
    store.appearance,
    { theme: "dark" },
    "appearance getter returns configured appearance."
  );

  assert.deepEqual(
    store.logos,
    { primary: "/logo.svg" },
    "logos getter returns configured logos."
  );

  assert.deepEqual(
    store.homepage,
    { featured: true },
    "homepage getter returns configured homepage."
  );

  assert.deepEqual(
    store.navigation,
    { public: [{ path: "/", name: "Home" }] },
    "navigation getter returns configured navigation."
  );

  assert.deepEqual(
    store.footer,
    { links: [] },
    "footer getter returns configured footer."
  );

  console.log(
    "[Test] ✓ All getters return configured values."
  );
}

/*
 * updateConfiguration action
 */

{
  const store = freshStore();

  store.updateConfiguration("hero.title", "New Welcome");

  assert.deepEqual(
    store.configuration,
    { hero: { title: "New Welcome" } },
    "updateConfiguration sets nested value by dot path."
  );

  console.log("[Test] ✓ updateConfiguration works without ConfigurationService.");
}

/*
 * reset action
 */

{
  const store = freshStore();

  store.status = "loaded";
  store.profile = { configuration: { hero: { title: "Old" } } };
  store.configuration = { hero: { title: "Old" } };
  store.error = { message: "boom", code: "500" };

  store.reset();

  assert.equal(
    store.profile,
    null,
    "reset clears profile."
  );

  assert.equal(
    store.configuration,
    null,
    "reset clears configuration."
  );

  assert.equal(
    store.status,
    "idle",
    "reset restores status to idle."
  );

  assert.equal(
    store.error,
    null,
    "reset clears error."
  );

  console.log("[Test] ✓ reset action restores complete initial lifecycle state.");
}

/*
 * ============================================================
 * Async lifecycle tests (service mocked)
 * ============================================================
 */

/*
 * 1. Two concurrent calls produce exactly one service invocation.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    const p1 = store.load();

    // Capture the internal promise reference after the first call.
    const internalPromise1 = store._loadPromise;

    // Second concurrent call must share the same internal promise.
    const p2 = store.load();
    const internalPromise2 = store._loadPromise;

    assert.equal(
      mock.callCount,
      1,
      "Exactly one service invocation for two concurrent calls."
    );

    assert.equal(
      internalPromise1,
      internalPromise2,
      "Both concurrent calls share the same internal promise."
    );

    // Verify both callers await the same completion by resolving the mock.
    mock.resolve({
      id: "profile-1",
      configuration: { hero: { title: "Concurrent" } },
    });

    await Promise.all([p1, p2]);

    assert.equal(
      store.status,
      "loaded",
      "Store reaches loaded state after concurrent calls complete."
    );

    assert.deepEqual(
      store.configuration,
      { hero: { title: "Concurrent" } },
      "Configuration is set from the shared result."
    );

    console.log(
      "[Test] ✓ Two concurrent calls produce exactly one service invocation and share the result."
    );
  } finally {
    mock.restore();
  }
}

/*
 * 2 & 3. Both callers wait for the same completion and observe the same result.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    const results = [];

    const p1 = (async () => {
      await store.load();
      results.push({ caller: 1, status: store.status, config: store.configuration });
    })();

    const p2 = (async () => {
      await store.load();
      results.push({ caller: 2, status: store.status, config: store.configuration });
    })();

    mock.resolve({
      id: "profile-2",
      configuration: { hero: { title: "Shared" } },
    });

    await Promise.all([p1, p2]);

    assert.equal(
      results.length,
      2,
      "Both callers completed."
    );

    assert.equal(
      results[0].status,
      "loaded",
      "Caller 1 observes loaded status."
    );

    assert.equal(
      results[1].status,
      "loaded",
      "Caller 2 observes loaded status."
    );

    assert.deepEqual(
      results[0].config,
      { hero: { title: "Shared" } },
      "Caller 1 observes the same configuration."
    );

    assert.deepEqual(
      results[1].config,
      { hero: { title: "Shared" } },
      "Caller 2 observes the same configuration."
    );

    console.log(
      "[Test] ✓ Both callers wait for the same completion and observe the same result."
    );
  } finally {
    mock.restore();
  }
}

/*
 * 4. Repeated load after empty result does not call service again.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    // First load: empty result.
    const p1 = store.load();
    mock.resolve(null);
    await p1;

    assert.equal(
      store.status,
      "empty",
      "First load yields empty state."
    );

    assert.equal(
      mock.callCount,
      1,
      "First load invoked the service once."
    );

    // Second load: should be idempotent, no new service call.
    await store.load();

    assert.equal(
      store.status,
      "empty",
      "Second load preserves empty state."
    );

    assert.equal(
      mock.callCount,
      1,
      "Repeated load after empty does not call the service again."
    );

    console.log(
      "[Test] ✓ Repeated load after empty result does not call service again."
    );
  } finally {
    mock.restore();
  }
}

/*
 * 5. reset() during a pending request prevents stale success from modifying state.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    const p = store.load();

    assert.equal(
      store.status,
      "loading",
      "Store is loading after load() starts."
    );

    // Reset while the request is pending.
    store.reset();

    assert.equal(
      store.status,
      "idle",
      "Store is idle after reset during pending request."
    );

    // The pending request now resolves with a profile.
    mock.resolve({
      id: "profile-stale",
      configuration: { hero: { title: "Stale" } },
    });

    await p;

    // The stale success must not modify state.
    assert.equal(
      store.status,
      "idle",
      "Stale success does not change status from idle."
    );

    assert.equal(
      store.profile,
      null,
      "Stale success does not set profile."
    );

    assert.equal(
      store.configuration,
      null,
      "Stale success does not set configuration."
    );

    console.log(
      "[Test] ✓ reset() during a pending request prevents stale success from modifying state."
    );
  } finally {
    mock.restore();
  }
}

/*
 * 6. reset() during a pending request prevents stale failure from modifying state.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    const p = store.load();

    store.reset();

    assert.equal(
      store.status,
      "idle",
      "Store is idle after reset during pending request."
    );

    // The pending request now rejects.
    mock.reject(new Error("stale failure"));

    await p;

    // The stale failure must not modify state.
    assert.equal(
      store.status,
      "idle",
      "Stale failure does not change status from idle."
    );

    assert.equal(
      store.error,
      null,
      "Stale failure does not set error."
    );

    console.log(
      "[Test] ✓ reset() during a pending request prevents stale failure from modifying state."
    );
  } finally {
    mock.restore();
  }
}

/*
 * 7. A new request after reset can run while the old request is unresolved.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    const p1 = store.load();

    assert.equal(
      store.status,
      "loading",
      "First load starts loading."
    );

    // Reset while the first request is pending.
    store.reset();

    assert.equal(
      store.status,
      "idle",
      "Store is idle after reset."
    );

    // Start a new request while the old one is still unresolved.
    const p2 = store.load();

    assert.equal(
      store.status,
      "loading",
      "New request starts loading after reset."
    );

    // Resolve the OLD request first (call #1, should be discarded as stale).
    mock.resolve(
      {
        id: "old-profile",
        configuration: { hero: { title: "Old" } },
      },
      1
    );

    // The old promise resolves but state should not change (stale).
    await p1;

    assert.equal(
      store.status,
      "loading",
      "Old stale resolution does not change status from loading."
    );

    assert.equal(
      store.configuration,
      null,
      "Old stale resolution does not set configuration."
    );

    // Now resolve the NEW request (call #2).
    mock.resolve(
      {
        id: "new-profile",
        configuration: { hero: { title: "New" } },
      },
      2
    );

    await p2;

    assert.equal(
      store.status,
      "loaded",
      "New request reaches loaded state."
    );

    assert.deepEqual(
      store.configuration,
      { hero: { title: "New" } },
      "New request configuration is set."
    );

    console.log(
      "[Test] ✓ A new request after reset can run while the old request is unresolved."
    );
  } finally {
    mock.restore();
  }
}

/*
 * 8. The old request's finally handler cannot affect the new request.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    const p1 = store.load();

    store.reset();

    const p2 = store.load();

    // Capture the current _loadPromise (belongs to p2's request).
    const currentLoadPromise = store._loadPromise;

    // Resolve the old request first (call #1).
    mock.resolve({ id: "old", configuration: {} }, 1);

    await p1;

    // _loadPromise should still point to p2's request, not cleared by p1's finally.
    assert.equal(
      store._loadPromise,
      currentLoadPromise,
      "Old request's finally does not clear _loadPromise for the new request."
    );

    // Resolve the new request (call #2).
    mock.resolve(
      { id: "new", configuration: { hero: { title: "OK" } } },
      2
    );

    await p2;

    assert.equal(
      store.status,
      "loaded",
      "New request completes successfully."
    );

    assert.equal(
      store._loadPromise,
      null,
      "_loadPromise is cleared after the current request completes."
    );

    console.log(
      "[Test] ✓ The old request's finally handler cannot affect the new request."
    );
  } finally {
    mock.restore();
  }
}

/*
 * 9. Normal retry after error remains functional.
 */

{
  const store = freshStore();
  const mock = mockService();

  try {
    // First load: error.
    const p1 = store.load();
    mock.reject(new Error("network failure"));
    await p1;

    assert.equal(
      store.status,
      "error",
      "First load yields error state."
    );

    assert.equal(
      store.error.message,
      "network failure",
      "Error message is preserved."
    );

    // Retry: success.
    const p2 = store.load();
    mock.resolve(
      {
        id: "profile-retry",
        configuration: { hero: { title: "Retry" } },
      },
      2
    );
    await p2;

    assert.equal(
      store.status,
      "loaded",
      "Retry after error reaches loaded state."
    );

    assert.equal(
      store.error,
      null,
      "Error is cleared after successful retry."
    );

    console.log("[Test] ✓ Normal retry after error remains functional.");
  } finally {
    mock.restore();
  }
}

/*
 * 10. Normal success and empty-state behavior remain correct.
 */

{
  // Success case.
  {
    const store = freshStore();
    const mock = mockService();

    try {
      const p = store.load();
      mock.resolve({
        id: "profile-success",
        configuration: {
          hero: { title: "Success", primaryButtonLink: "/catalog" },
          navigation: { public: [{ path: "/", name: "Home" }] },
        },
      });
      await p;

      assert.equal(
        store.status,
        "loaded",
        "Success case reaches loaded state."
      );

      assert.equal(
        store.loading,
        false,
        "Loading is false after success."
      );

      assert.deepEqual(
        store.configuration,
        {
          hero: { title: "Success", primaryButtonLink: "/catalog" },
          navigation: { public: [{ path: "/", name: "Home" }] },
        },
        "Configuration is set from profile."
      );

      assert.deepEqual(
        store.hero,
        { title: "Success", primaryButtonLink: "/catalog" },
        "hero getter reflects configuration."
      );

      console.log("[Test] ✓ Normal success behavior remains correct.");
    } finally {
      mock.restore();
    }
  }

  // Empty case.
  {
    const store = freshStore();
    const mock = mockService();

    try {
      const p = store.load();
      mock.resolve(null);
      await p;

      assert.equal(
        store.status,
        "empty",
        "Empty case reaches empty state."
      );

      assert.equal(
        store.loading,
        false,
        "Loading is false after empty result."
      );

      assert.equal(
        store.loaded,
        false,
        "Loaded is false after empty result."
      );

      assert.deepEqual(
        store.hero,
        {},
        "Getters return safe defaults in empty state."
      );

      console.log("[Test] ✓ Normal empty-state behavior remains correct.");
    } finally {
      mock.restore();
    }
  }
}
