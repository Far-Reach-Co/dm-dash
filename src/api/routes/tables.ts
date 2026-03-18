import { Router } from "express";
import {
  addTableFolderByProject,
  addTableFolderByUser,
  editTableFolderTitle,
  getTableFoldersByProject,
  getTableFoldersByUser,
  removeTableFolder,
} from "../controllers/tableFolders.js";
import {
  getTableViewsByProject,
  removeTableView,
  getTableView,
  addTableViewByUser,
  getTableViewByUUID,
  getTableViewsByUser,
  addTableViewByProject,
  editTableViewData,
  editTableView,
} from "../controllers/tableViews.js";
import {
  addTableViewTemplateByProject,
  addTableViewTemplateByUser,
  applyTableViewTemplate,
  getTableViewTemplatesByProject,
  getTableViewTemplatesByUser,
  removeTableViewTemplate,
} from "../controllers/tableViewTemplates.js";
import {
  editGuestSandboxData,
  getGuestSandboxImageCounts,
  getGuestSandboxImages,
  getGuestSandboxView,
  startGuestSandbox,
} from "../controllers/guestSandbox.js";
import {
  getLocationPinsByTableView,
  addLocationPin,
  removeLocationPin,
  updateLocationPin,
} from "../controllers/locationPins.js";
import {
  editTableImage,
  addTableImageByProject,
  addTableImageByUser,
  getTableImagesWithSignedUrlsByTableProject,
  getTableImagesWithSignedUrlsByTableUser,
} from "../controllers/tableImages.js";
import { guestSandboxStartLimiter } from "../rateLimiters.js";

const router = Router();

// table folders
router.post("/add_table_folder_by_user", addTableFolderByUser);
router.post("/add_table_folder_by_project", addTableFolderByProject);
router.get("/get_table_folders_by_user", getTableFoldersByUser);
router.get(
  "/get_table_folders_by_project/:project_id",
  getTableFoldersByProject,
);
router.delete("/remove_table_folder/:id", removeTableFolder);
router.post("/edit_table_folder_title/:id", editTableFolderTitle);

// table views
router.get("/get_table_views_by_project/:project_id", getTableViewsByProject);
router.get("/get_table_views_by_user", getTableViewsByUser);
router.get("/get_table_view/:id", getTableView);
router.get("/get_table_view_by_uuid/:uuid", getTableViewByUUID);
router.post("/add_table_view_by_project/:project_id", addTableViewByProject);
router.post("/add_table_view_by_user", addTableViewByUser);
router.delete("/remove_table_view/:id", removeTableView);
router.post("/edit_table_view_data/:id", editTableViewData);
router.post("/edit_table_view/:id", editTableView);
router.get("/get_table_view_templates_by_user", getTableViewTemplatesByUser);
router.get(
  "/get_table_view_templates_by_project/:project_id",
  getTableViewTemplatesByProject,
);
router.post(
  "/add_table_view_template_by_user/:table_view_id",
  addTableViewTemplateByUser,
);
router.post(
  "/add_table_view_template_by_project/:project_id/:table_view_id",
  addTableViewTemplateByProject,
);
router.post("/apply_table_view_template/:id", applyTableViewTemplate);
router.delete("/remove_table_view_template/:id", removeTableViewTemplate);

// guest sandbox + location pins
router.post(
  "/start_guest_sandbox",
  guestSandboxStartLimiter,
  startGuestSandbox,
);
router.get("/get_guest_sandbox/:uuid", getGuestSandboxView);
router.post("/edit_guest_sandbox_data/:uuid", editGuestSandboxData);
router.get("/get_guest_sandbox_images/:uuid", getGuestSandboxImages);
router.get("/get_guest_sandbox_image_counts/:uuid", getGuestSandboxImageCounts);
router.get("/get_location_pins/:table_view_id", getLocationPinsByTableView);
router.post("/add_location_pin", addLocationPin);
router.delete("/remove_location_pin/:id", removeLocationPin);
router.post("/edit_location_pin/:id", updateLocationPin);

// table images
router.get(
  "/get_table_images_with_urls_by_table_project/:table_id",
  getTableImagesWithSignedUrlsByTableProject,
);
router.get(
  "/get_table_images_with_urls_by_table_user/:table_id",
  getTableImagesWithSignedUrlsByTableUser,
);
router.post("/add_table_image_by_project", addTableImageByProject);
router.post("/add_table_image_by_user", addTableImageByUser);
router.post("/edit_table_image/:id", editTableImage);

export default router;
