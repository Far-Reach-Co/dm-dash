import { Router } from "express";
import {
  getImage,
  removeImageByTableUser,
  removeImageByProject,
  removeImageByUser,
  newImageForProject,
  newImageForUser,
  editImageName,
  getSignedUrlsHandler,
  editImageNotes,
} from "../controllers/s3.js";
import {
  getLibraryImagesByUser,
  getLibraryImagesByProject,
  getLibraryImagesByUserInFolder,
  getLibraryImagesByProjectInFolder,
  getLibraryImageCountsByUser,
  getLibraryImageCountsByProject,
} from "../controllers/library.js";
import {
  addLibraryPackByProject,
  addLibraryPackByUser,
  addLibraryPackImage,
  discoverLibraryPacks,
  editLibraryPack,
  getInstalledLibraryPacksByProject,
  getInstalledLibraryPacksByUser,
  getOwnedLibraryPacksByProject,
  getOwnedLibraryPacksByUser,
  getLibraryPackMembershipsByImage,
  getLibraryPackImages,
  installLibraryPackByProject,
  installLibraryPackByUser,
  removeLibraryPack,
  removeLibraryPackImage,
  uninstallLibraryPackByProject,
  uninstallLibraryPackByUser,
} from "../controllers/libraryPacks.js";
import {
  addRecordByProject,
  addRecordByUser,
  editRecord,
  getRecord,
  getRecordsByProject,
  getRecordsByUser,
  removeRecord,
} from "../controllers/record.js";
import {
  addRecordImage,
  getRecordImage,
  getRecordImagesByImage,
  getRecordImagesByRecord,
  removeRecordImageByImage,
} from "../controllers/recordImage.js";
import { upload } from "../upload.js";

const router = Router();

// s3
router.get("/get_image/:id", getImage);
router.post("/signed_URL_download_multi", getSignedUrlsHandler);
router.post("/new_image_for_project", upload.single("file"), newImageForProject);
router.post("/new_image_for_user", upload.single("file"), newImageForUser);
router.post("/edit_image_name/:id", editImageName);
router.post("/edit_image_notes/:id", editImageNotes);
router.delete(
  "/remove_image_by_table_user/:image_id/:table_id",
  removeImageByTableUser,
);
router.delete(
  "/remove_image_by_project/:image_id/:project_id",
  removeImageByProject,
);
router.delete("/remove_image_by_user/:image_id", removeImageByUser);

// library
router.get("/get_library_images_by_user", getLibraryImagesByUser);
router.get(
  "/get_library_images_by_project/:project_id",
  getLibraryImagesByProject,
);
router.get("/get_library_image_counts_by_user", getLibraryImageCountsByUser);
router.get(
  "/get_library_image_counts_by_project/:project_id",
  getLibraryImageCountsByProject,
);
router.get(
  "/get_library_images_by_user_in_folder/:folder_id",
  getLibraryImagesByUserInFolder,
);
router.get(
  "/get_library_images_by_project_in_folder/:project_id/:folder_id",
  getLibraryImagesByProjectInFolder,
);
router.post("/add_library_pack_by_user", addLibraryPackByUser);
router.post(
  "/add_library_pack_by_project/:project_id",
  addLibraryPackByProject,
);
router.post("/edit_library_pack/:id", editLibraryPack);
router.delete("/remove_library_pack/:id", removeLibraryPack);
router.post("/add_library_pack_image", addLibraryPackImage);
router.delete("/remove_library_pack_image/:id", removeLibraryPackImage);
router.get("/get_library_pack_images/:pack_id", getLibraryPackImages);
router.get(
  "/get_library_pack_memberships_by_image/:image_id",
  getLibraryPackMembershipsByImage,
);
router.get("/discover_library_packs", discoverLibraryPacks);
router.post("/install_library_pack_by_user/:pack_id", installLibraryPackByUser);
router.post(
  "/install_library_pack_by_project/:project_id/:pack_id",
  installLibraryPackByProject,
);
router.delete(
  "/uninstall_library_pack_by_user/:pack_id",
  uninstallLibraryPackByUser,
);
router.delete(
  "/uninstall_library_pack_by_project/:project_id/:pack_id",
  uninstallLibraryPackByProject,
);
router.get(
  "/get_installed_library_packs_by_user",
  getInstalledLibraryPacksByUser,
);
router.get("/get_owned_library_packs_by_user", getOwnedLibraryPacksByUser);
router.get(
  "/get_installed_library_packs_by_project/:project_id",
  getInstalledLibraryPacksByProject,
);
router.get(
  "/get_owned_library_packs_by_project/:project_id",
  getOwnedLibraryPacksByProject,
);

// records
router.post("/add_record_by_user", addRecordByUser);
router.post("/add_record_by_project/:project_id", addRecordByProject);
router.get("/get_record/:id", getRecord);
router.get("/get_records_by_user", getRecordsByUser);
router.get("/get_records_by_project/:project_id", getRecordsByProject);
router.post("/edit_record/:id", editRecord);
router.delete("/remove_record/:id", removeRecord);

// record images
router.post("/add_record_image", addRecordImage);
router.get("/get_record_image/:id", getRecordImage);
router.get("/get_record_images_by_record/:record_id", getRecordImagesByRecord);
router.get("/get_record_images_by_image/:image_id", getRecordImagesByImage);
router.delete(
  "/remove_record_image_by_image/:image_id",
  removeRecordImageByImage,
);

export default router;
