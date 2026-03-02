import "../../lib/MobileNavHandler.js";
import "../../lib/searchDashElements.js";
import "../../lib/clipboard.js";
import "../../lib/newResourceModals.js";
import Calendar from "../../components/Calendar.js";
import modal from "../../components/modal.js";
import renderLoadingWithMessage from "../../components/loadingWithMessage.js";
import { apiGet } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";
import { loadFrontendAuthState } from "../../lib/frontendAuthState.js";
import mountActivitySection from "./mountActivitySection.js";
import mountCommunitySection from "./mountCommunitySection.js";
import mountSettingsSection from "./mountSettingsSection.js";

function readSectionFromPathname() {
  const path = window.location.pathname;
  if (path === "/wyrld") return "overview";
  if (path.startsWith("/wyrld/")) {
    return path.slice("/wyrld/".length);
  }
  return "";
}

function openInNewTab(url) {
  const tab = window.open(url, "_blank");
  if (tab) {
    tab.focus();
  }
}

function mountGlobalActions(config, runtimeConfigPromise) {
  window.handleSheetClick = (id, projectId) => {
    if (!id || !projectId) return;
    openInNewTab(`/5eplayer?id=${id}&project=${projectId}`);
  };

  window.handleTableClick = (uuid, projectId) => {
    if (!uuid || !projectId) return;
    openInNewTab(`/vtt?uuid=${uuid}&project=${projectId}`);
  };

  window.handleRecordClick = (id, projectId) => {
    if (!id || !projectId) return;
    openInNewTab(`/record?id=${id}&project_id=${projectId}`);
  };

  window.openCalendar = async (id) => {
    if (!id) return;
    modal.show(renderLoadingWithMessage(""));

    const runtimeConfig = await runtimeConfigPromise;

    const result = await apiGet(`/api/get_calendar/${id}`);
    if (!result.ok || !result.data) {
      modal.hide();
      handleApiFailure(result, {
        fallbackMessage: "Failed to open calendar",
        includeResultMessage: true,
      });
      return;
    }

    const calendar = result.data;
    const elem = document.createElement("div");
    elem.className = "p-3 calendar";

    new Calendar({
      domElem: elem,
      projectAuth: !!runtimeConfig.projectAuth,
      id: calendar.id,
      projectId: calendar.project_id,
      year: calendar.year,
      currentMonthId: calendar.current_month_id,
      currentDay: calendar.current_day,
      title: calendar.title,
      months: calendar.months,
      daysOfTheWeek: calendar.days_of_the_week,
    });

    modal.show(elem);
  };
}

function readPageConfig() {
  const searchParams = new URLSearchParams(window.location.search);
  const projectId = searchParams.get("id");
  const titleElem = document.querySelector(".dashboard-sidebar-title");
  const projectTitle = titleElem ? titleElem.textContent.trim() : "Wyrld";
  const isOwnerFallback = !!document.getElementById("settings-delete-wyrld");
  const projectIsProFallback = !!document.getElementById("settings-banner-upload");
  const projectAuthFallback =
    isOwnerFallback ||
    !!document.querySelector("a[href^='/newwyrldcalendar']") ||
    !!document.getElementById("settings-public-save");

  return {
    section: readSectionFromPathname(),
    projectId: projectId || "",
    projectTitle,
    projectAuth: projectAuthFallback,
    projectIsPro: projectIsProFallback,
    isOwner: isOwnerFallback,
    defaultBannerAlt: `${projectTitle || "Wyrld"} banner`,
  };
}

async function loadRuntimeConfig(config) {
  if (!config.projectId) {
    return {
      ...config,
      defaultBannerAlt: `${config.projectTitle || "Wyrld"} banner`,
    };
  }

  const [authState, projectResult] = await Promise.all([
    loadFrontendAuthState(),
    apiGet(`/api/get_project/${config.projectId}`),
  ]);

  if (!projectResult.ok || !projectResult.data) {
    return {
      ...config,
      defaultBannerAlt: `${config.projectTitle || "Wyrld"} banner`,
    };
  }

  const project = projectResult.data;
  const isOwner =
    authState?.userId && String(authState.userId) === String(project.user_id);
  const projectAuth = !!(isOwner || project.is_editor);
  const projectTitle = project.title || config.projectTitle;
  const projectIsPro = !!project.is_pro;

  return {
    ...config,
    projectTitle,
    projectIsPro,
    isOwner: !!isOwner,
    projectAuth,
    defaultBannerAlt: `${projectTitle || "Wyrld"} banner`,
  };
}

function mountSection(config) {
  if (config.section === "community") {
    mountCommunitySection(config);
    return;
  }

  if (config.section === "settings") {
    mountSettingsSection(config);
    return;
  }

  if (config.section === "activity") {
    mountActivitySection(config);
  }
}

async function init() {
  const config = readPageConfig();
  const runtimeConfigPromise = loadRuntimeConfig(config);

  mountGlobalActions(config, runtimeConfigPromise);

  const runtimeConfig = await runtimeConfigPromise;
  mountSection(runtimeConfig);
}

init();
