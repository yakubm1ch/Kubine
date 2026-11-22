import {
  BootstrapStageFactory,
  bootstrapStageFactory,
} from "../factory/bootstrap-stage.factory.js";

import {
  initializeBootstrapStageFactory,
} from "../factory/bootstrap-stage.factory.initializer.js";

import {
  BootstrapContext,
} from "../context/bootstrap.context.js";

import {
  BootstrapStageRegistry,
} from "../registry/bootstrap-stage.registry.js";

import {
  initializeBootstrapStageRegistry,
} from "../registry/bootstrap-stage.registry.initializer.js";

import {
  BootstrapStageResolver,
} from "../resolver/bootstrap-stage.resolver.js";

import {
  BootstrapStageLoader,
} from "../loader/bootstrap-stage.loader.js";

import {
  BootstrapPipeline,
} from "../pipeline/bootstrap.pipeline.js";


export class BootstrapEngine {
  constructor({
    registry = new BootstrapStageRegistry(),

    registryInitializer =
      initializeBootstrapStageRegistry,

    resolver = null,

    factory = bootstrapStageFactory,

    factoryInitializer =
      initializeBootstrapStageFactory,

    loader = null,

    pipeline = null,
  } = {}) {

    if (!(registry instanceof BootstrapStageRegistry)) {
      throw new TypeError(
        "BootstrapEngine requires a BootstrapStageRegistry."
      );
    }

    if (typeof registryInitializer !== "function") {
      throw new TypeError(
        "BootstrapEngine requires a valid registry initializer."
      );
    }

    if (!(factory instanceof BootstrapStageFactory)) {
      throw new TypeError(
        "BootstrapEngine requires a BootstrapStageFactory."
      );
    }

    if (typeof factoryInitializer !== "function") {
      throw new TypeError(
        "BootstrapEngine requires a valid factory initializer."
      );
    }

    if (
      resolver !== null &&
      !(
        resolver instanceof BootstrapStageResolver
      )
    ) {
      throw new TypeError(
        "BootstrapEngine requires a valid BootstrapStageResolver."
      );
    }

    if (
      loader !== null &&
      !(
        loader instanceof BootstrapStageLoader
      )
    ) {
      throw new TypeError(
        "BootstrapEngine requires a valid BootstrapStageLoader."
      );
    }

    if (
      pipeline !== null &&
      !(
        pipeline instanceof BootstrapPipeline
      )
    ) {
      throw new TypeError(
        "BootstrapEngine requires a valid BootstrapPipeline."
      );
    }


    this.registry = registry;

    this.registryInitializer =
      registryInitializer;


    this.resolver =
      resolver ??
      new BootstrapStageResolver(
        this.registry
      );


    this.factory = factory;

    this.factoryInitializer =
      factoryInitializer;


    this.loader =
      loader ??
      new BootstrapStageLoader(
        this.factory
      );


    this.pipeline =
      pipeline ??
      new BootstrapPipeline();


    this.initialized = false;

    this.state = "idle";

    this.context = null;

    this.stages = [];
  }


  async initialize(context = null) {

    if (this.state === "initializing") {
      throw new Error(
        "BootstrapEngine is already initializing."
      );
    }

    if (this.state === "ready") {
      throw new Error(
        "BootstrapEngine has already been initialized."
      );
    }

    if (this.state === "shutting_down") {
      throw new Error(
        "BootstrapEngine cannot initialize while shutting down."
      );
    }


    /*
     * Context contract: accept a BootstrapContext instance, null,
     * or no argument. Reject anything else before any stage runs.
     */

    if (
      context !== null &&
      context !== undefined &&
      !(context instanceof BootstrapContext)
    ) {
      throw new TypeError(
        "BootstrapEngine.initialize() requires a BootstrapContext instance, null, or no argument."
      );
    }

    this.state = "initializing";

    this.context =
      context ?? new BootstrapContext();

    this.stages = [];


    console.log(
      "[Bootstrap] Engine initialization started."
    );


    try {

      /*
       * --------------------------------------------------
       * 1. Initialize stage registry
       * --------------------------------------------------
       */

      console.log(
        "[Bootstrap] Initializing stage registry."
      );

      this.registryInitializer(
        this.registry
      );

      console.log(
        "[Bootstrap] Stage registry ready."
      );


      /*
       * --------------------------------------------------
       * 2. Initialize stage factory
       * --------------------------------------------------
       */

      console.log(
        "[Bootstrap] Initializing stage factory."
      );

      this.factoryInitializer(
        this.factory
      );

      console.log(
        "[Bootstrap] Stage factory ready."
      );


      /*
       * --------------------------------------------------
       * 3. Resolve stage definitions
       * --------------------------------------------------
       */

      const definitions =
        this.resolver.resolve();


      console.log(
        "[Bootstrap] Stage order resolved:",
        definitions.map(
          (definition) =>
            definition.name
        )
      );


      /*
       * --------------------------------------------------
       * 4. Create stage instances
       * --------------------------------------------------
       */

      const stages =
        this.loader.load(
          definitions,
          this.context
        );


      this.stages = [
        ...stages,
      ];


      console.log(
        "[Bootstrap] Stage instances loaded:",
        this.stages.map(
          (stage) =>
            stage.name
        )
      );


      /*
       * --------------------------------------------------
       * 5. Build pipeline
       * --------------------------------------------------
       */

      for (const stage of this.stages) {

        if (this.pipeline.hasStage(stage.name)) {
          throw new Error(
            `BootstrapPipeline already contains stage "${stage.name}".`
          );
        }

        this.pipeline.add(stage);
      }


      console.log(
        "[Bootstrap] Pipeline constructed with stages:",
        this.pipeline
          .getStages()
          .map(
            (stage) =>
              stage.name
          )
      );


      /*
       * --------------------------------------------------
       * 6. Execute pipeline
       * --------------------------------------------------
       */

      const result =
        await this.pipeline.run(
          this.context
        );


      if (!result || result.success !== true) {

        const error =
          result?.error ??
          new Error(
            "Bootstrap pipeline failed."
          );

        throw error;
      }


      /*
       * --------------------------------------------------
       * 7. Engine is ready
       * --------------------------------------------------
       */

      this.initialized = true;

      this.state = "ready";


      console.log(
        "[Bootstrap] Engine initialization completed."
      );


      return Object.freeze({
        initialized: true,

        stages: Object.freeze(
          result.stages.map(
            (stage) =>
              stage.name
          )
        ),
      });

    } catch (error) {

      this.initialized = false;

      this.state = "failed";


      console.error(
        "[Bootstrap] Engine initialization failed.",
        error
      );


      /*
       * Pipeline is responsible for rolling back
       * stages that have already been initialized.
       *
       * Engine deliberately does not duplicate
       * pipeline rollback logic here.
       */

      throw error;
    }
  }


  async shutdown(context = this.context) {

    if (
      !this.initialized &&
      this.state !== "failed" &&
      this.state !== "ready"
    ) {
      return;
    }


    if (this.state === "shutting_down") {
      throw new Error(
        "BootstrapEngine is already shutting down."
      );
    }


    this.state = "shutting_down";


    console.log(
      "[Bootstrap] Engine shutdown started."
    );


    try {

      /*
       * Pipeline owns stage rollback order.
       */

      await this.pipeline.rollback(
        context
      );


      this.initialized = false;

      this.state = "shutdown";

      this.stages = [];

      this.context = null;


      console.log(
        "[Bootstrap] Engine shutdown completed."
      );

    } catch (error) {

      this.initialized = false;

      this.state = "shutdown_failed";


      console.error(
        "[Bootstrap] Engine shutdown failed.",
        error
      );


      throw error;
    }
  }


  getState() {

    return Object.freeze({

      initialized:
        this.initialized,

      state:
        this.state,

      stages: Object.freeze(
        this.registry
          .getOrdered()
          .map(
            (definition) =>
              definition.name
          )
      ),

      activeStages: Object.freeze(
        this.stages.map(
          (stage) =>
            stage.name
        )
      ),
    });
  }


  getStages() {

    return [
      ...this.stages,
    ];
  }


  getStage(name) {

    return (
      this.stages.find(
        (stage) =>
          stage.name === name
      ) ?? null
    );
  }


  isInitialized() {

    return (
      this.state === "ready"
    );
  }


  isInitializing() {

    return (
      this.state === "initializing"
    );
  }


  isFailed() {

    return (
      this.state === "failed"
    );
  }


  isShutdown() {

    return (
      this.state === "shutdown"
    );
  }
}


/*
 * Canonical application bootstrap engine.
 */

export const bootstrapEngine =
  new BootstrapEngine();


export default BootstrapEngine;