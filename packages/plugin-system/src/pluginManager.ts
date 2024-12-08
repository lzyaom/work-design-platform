import EventEmitter from "share";

export class PluginManager extends EventEmitter {
  private app: any;
  private plugins: Map<string, any> = new Map();
  private content: any;

  constructor(app: any) {
    super();
    this.app = app;
    this.content = {};
  }

  public async load(url: string, options: any = {}) {
    try {
      const module = await import(/* @vite-ignore */ url);
      const plugin = module.default;
      if (plugin && typeof plugin.onLoad === "function") {
        plugin.onLoad(this.app, this.content);
        this.plugins.set(plugin.name, { plugin, state: "loaded", options });
        this.emit("plugin/loaded", plugin);
      } else {
        throw new Error("Plugin does not have a valid onLoad function");
      }
    } catch (error) {
      this.emit("plugin/load-error", error);
    }
  }

  public async unload(name: string) {
    const pluginData = this.plugins.get(name);
    try {
      if (pluginData && typeof pluginData.plugin.onUnload === "function") {
        if (pluginData.state === "active") {
          this.deactivate(name);
        }
        pluginData.plugin.onUnload(this.app, this.content);
        this.plugins.delete(name);
        this.emit("plugin/unloaded", pluginData);
      } else {
        throw new Error("Plugin does not have a valid onUnload function");
      }
    } catch (error) {
      this.emit("plugin/unload-error", error);
    }
  }

  public async activate(name: string) {
    const pluginData = this.plugins.get(name);
    try {
      if (pluginData && typeof pluginData.plugin.onActivate === "function") {
        pluginData.plugin.onActivate(this.app, this.content);
        pluginData.state = "active";
        this.emit("plugin/activated", pluginData);
      } else {
        throw new Error("Plugin does not have a valid onActivate function");
      }
    } catch (error) {
      this.emit("plugin/activate-error", error);
    }
  }

  public async deactivate(name: string) {
    const pluginData = this.plugins.get(name);
    try {
      if (pluginData && typeof pluginData.plugin.onDeactivate === "function") {
        pluginData.plugin.onDeactivate(this.app, this.content);
        pluginData.state = "inactive";
        this.emit("plugin/deactivated", pluginData);
      } else {
        throw new Error("Plugin does not have a valid onDeactivate function");
      }
    } catch (error) {
      this.emit("plugin/deactivate-error", error);
    }
  }
}
