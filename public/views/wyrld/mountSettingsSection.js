import WyrldSettingsSectionController from "./settingsSectionController.js";

export default function mountSettingsSection(config) {
  const controller = new WyrldSettingsSectionController(config);
  controller.mount();
  return controller;
}
