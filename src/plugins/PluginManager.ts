/**
 * PluginManager.ts
 *
 * Orchestrates plugin lifecycles (init, destroy) and injects the EditorAPI.
 */

import { editorAPI, EditorAPI } from './EditorAPI';
import { usePluginStore, PluginMetadata } from '@/stores/plugin.store';

export interface IPlugin {
  metadata: PluginMetadata;
  /** Called when the plugin is enabled by the user */
  onActivate: (api: EditorAPI) => void;
  /** Called when the plugin is disabled */
  onDeactivate: () => void;
}

class PluginManagerClass {
  private registeredPlugins: Map<string, IPlugin> = new Map();

  /**
   * Registers a plugin into the system but does not activate it.
   */
  public register(plugin: IPlugin) {
    if (this.registeredPlugins.has(plugin.metadata.id)) {
      console.warn(`Plugin ${plugin.metadata.id} is already registered.`);
      return;
    }
    
    this.registeredPlugins.set(plugin.metadata.id, plugin);
    usePluginStore.getState().registerPlugin(plugin.metadata);
  }

  /**
   * Activates a plugin, injecting the EditorAPI.
   */
  public activate(id: string) {
    const plugin = this.registeredPlugins.get(id);
    if (!plugin) return;

    try {
      plugin.onActivate(editorAPI);
      usePluginStore.getState().enablePlugin(id);
      console.log(`[PluginManager] Activated: ${plugin.metadata.name}`);
    } catch (e) {
      console.error(`[PluginManager] Failed to activate plugin ${id}`, e);
    }
  }

  /**
   * Deactivates a plugin.
   */
  public deactivate(id: string) {
    const plugin = this.registeredPlugins.get(id);
    if (!plugin) return;

    try {
      plugin.onDeactivate();
      usePluginStore.getState().disablePlugin(id);
      console.log(`[PluginManager] Deactivated: ${plugin.metadata.name}`);
    } catch (e) {
      console.error(`[PluginManager] Failed to deactivate plugin ${id}`, e);
    }
  }
}

export const PluginManager = new PluginManagerClass();
