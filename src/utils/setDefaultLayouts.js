// Utility helpers for working with default layouts.

export const DEFAULT_HOMEPAGE_LAYOUT = [
  {
    id: "split-amount",
    type: "split-amount",
    x: 478.2,
    y: 26.4,
    width: 561,
    height: 291,
    locked: false,
    pinned: true,
    settings: {
      amount: "",
    },
  },
  {
    id: "swish-details",
    type: "swish-details",
    x: 478.2,
    y: 341.4,
    width: 561,
    height: 201,
    locked: false,
    pinned: true,
    settings: {
      swishNumber: "0762832472",
      swishName: "Doruk Sasmaz",
      swishMessage: "",
    },
  },
  {
    id: "recipient-emails",
    type: "recipient-emails",
    x: 478.2,
    y: 566.4,
    width: 561,
    height: 246,
    locked: false,
    pinned: true,
    settings: {
      recipientOne: "info@doruksasmaz.com",
      recipientTwo: "info@blazitt.com",
    },
  },
];

export const DEFAULT_GAME_DETAIL_LAYOUT = [
  {
    id: "back-button",
    type: "back-button",
    x: 28.2,
    y: 26.4,
    width: 111,
    height: 66,
    locked: true,
    pinned: false,
  },
  {
    id: "game-info",
    type: "game-info",
    x: 163.2,
    y: 26.4,
    width: 1371,
    height: 66,
    locked: false,
    pinned: true,
  },
  {
    id: "game-description",
    type: "game-description",
    x: 28.2,
    y: 521.4,
    width: 516,
    height: 201,
    locked: false,
    pinned: true,
  },
  {
    id: "game-image",
    type: "game-image",
    x: 28.2,
    y: 116.4,
    width: 516,
    height: 381,
    locked: false,
    pinned: true,
  },
  {
    id: "game-development-info",
    type: "game-development-info",
    x: 568.2,
    y: 116.4,
    width: 966,
    height: 741,
    locked: false,
    pinned: true,
  },
  {
    id: "game-details",
    type: "game-details",
    x: 28.2,
    y: 746.4,
    width: 516,
    height: 111,
    locked: false,
    pinned: true,
  },
];

export const DEFAULT_HOMEPAGE_LAYOUT_MOBILE = [
  {
    id: "split-amount",
    type: "split-amount",
    x: 28.2,
    y: 26.4,
    width: 336,
    height: 291,
    locked: false,
    pinned: true,
    settings: {
      amount: "100",
    },
  },
  {
    id: "swish-details",
    type: "swish-details",
    x: 28.2,
    y: 341.4,
    width: 336,
    height: 291,
    locked: false,
    pinned: true,
    settings: {
      swishNumber: "0762832472",
      swishName: "Doruk Sasmaz",
      swishMessage: "",
    },
  },
  {
    id: "recipient-emails",
    type: "recipient-emails",
    x: 28.2,
    y: 656.4,
    width: 336,
    height: 291,
    locked: false,
    pinned: true,
    settings: {
      recipientOne: "info@doruksasmaz.com",
      recipientTwo: "info@blazitt.com",
    },
  },
];

export const DEFAULT_GAME_DETAIL_LAYOUT_MOBILE = [
  {
    id: "back-button",
    type: "back-button",
    x: 28.2,
    y: 26.4,
    width: 111,
    height: 66,
    locked: true,
    pinned: false,
  },
  {
    id: "game-info",
    type: "game-info",
    x: 28.2,
    y: 116.4,
    width: 336,
    height: 156,
    locked: false,
    pinned: true,
  },
  {
    id: "game-description",
    type: "game-description",
    x: 28.2,
    y: 656.4,
    width: 336,
    height: 201,
    locked: false,
    pinned: true,
  },
  {
    id: "game-image",
    type: "game-image",
    x: 28.2,
    y: 296.4,
    width: 336,
    height: 336,
    locked: false,
    pinned: true,
  },
  {
    id: "game-development-info",
    type: "game-development-info",
    x: 28.2,
    y: 881.4,
    width: 336,
    height: 741,
    locked: false,
    pinned: false,
  },
  {
    id: "game-details",
    type: "game-details",
    x: 28.2,
    y: 1646.4,
    width: 336,
    height: 156,
    locked: false,
    pinned: false,
  },
];

export const DEFAULT_CV_DETAIL_LAYOUT = [
  {
    id: "back-button",
    type: "back-button",
    x: 28.2,
    y: 26.4,
    width: 111,
    height: 21,
    locked: true,
    pinned: false,
    settings: {},
  },
  {
    id: "profile",
    type: "profile",
    x: 163.2,
    y: 26.4,
    width: 156,
    height: 156,
    locked: false,
    pinned: true,
    settings: {},
  },
  {
    id: "profile-picture",
    type: "profile-picture",
    x: 28.2,
    y: 71.4,
    width: 111,
    height: 111,
    locked: false,
    pinned: true,
    settings: {
      expandable: true,
      expandScaleX: 2,
      expandScaleY: 2,
      expanded: false,
      originalWidth: 111,
      originalHeight: 111,
      originalX: 28.2,
      originalY: 71.4,
    },
  },
  {
    id: "experience",
    type: "experience",
    x: 28.2,
    y: 206.4,
    width: 561,
    height: 291,
    locked: false,
    pinned: true,
    settings: {},
  },
  {
    id: "technical-skills",
    type: "technical-skills",
    x: 298.2,
    y: 746.4,
    width: 291,
    height: 111,
    locked: false,
    pinned: true,
    settings: {},
  },
  {
    id: "education",
    type: "education",
    x: 343.2,
    y: 26.4,
    width: 246,
    height: 156,
    locked: false,
    pinned: true,
    settings: {},
  },
  {
    id: "languages",
    type: "languages",
    x: 28.2,
    y: 746.4,
    width: 246,
    height: 111,
    locked: false,
    pinned: true,
    settings: {},
  },
  {
    id: "projects",
    type: "projects",
    x: 28.2,
    y: 521.4,
    width: 561,
    height: 201,
    locked: false,
    pinned: true,
    settings: {},
  },
];

/**
 * Set the default layouts for both main page and game detail page
 * This function can be called from the browser console or imported
 */
export const formatLayoutSnippet = (layout, exportName) => {
  const formatted = JSON.stringify(layout, null, 2);
  return `export const ${exportName} = ${formatted};`;
};

export const copyLayoutSnippet = async (layout, exportName) => {
  const snippet = formatLayoutSnippet(layout, exportName);
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(snippet);
  }
  return snippet;
};

// If running in browser console, expose the helpers
if (typeof window !== "undefined") {
  window.formatLayoutSnippet = formatLayoutSnippet;
  window.copyLayoutSnippet = copyLayoutSnippet;
}
