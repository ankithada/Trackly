const TODAY_ISO = new Date().toISOString().slice(0, 10);
const DASHBOARD_DEFAULT_FROM_ISO = (() => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
})();

const state = {
  user: null,
  config: null,
  entries: [],
  owners: [],
  fleetDetails: [],
  nextReceiptNumber: "",
  users: [],
  debitEntries: [],
  consolidatedEntries: [],
  ownerAdvances: [],
  view: "entry",
  selectedEntry: null,
  selectedReviewIds: [],
  consolidatedCreditDraft: null,
  debitDraft: null,
  ownerDraft: null,
  fleetDraft: null,
  ownerAdvanceDraft: null,
  adminTab: "users",
  ownerSearch: "",
  ownerAdvanceFilterOwner: "",
  ownerAdvanceFilterFrom: "",
  ownerAdvanceFilterTo: "",
  ownerAdvancePage: 1,
  activeOwnerName: "",
  dashboardMonth: "all",
  dashboardDateFrom: DASHBOARD_DEFAULT_FROM_ISO,
  dashboardDateTo: TODAY_ISO,
  dashboardOwnerFilterOwner: "",
  dashboardOwnerFilterCategory: "all",
  dashboardOwnerFilterTransactions: "all",
  dashboardOwnerFilterRevenue: "all",
  dashboardOwnerPage: 1,
  reviewSidebarOpen: true,
  hrData: null,
  reviewOwnerFilter: "",
  reviewPaymentFilter: "",
  reviewVehicleCategoryFilter: "",
  reviewPage: 1,
  reviewPageSize: 10,
  reviewDate: TODAY_ISO,
  reviewFilter: "Unreviewed"
};

const roleViews = {
  staff: ["entry"],
  reviewer: ["entry", "review", "admin"],
  analyst: ["dashboard"],
  admin: ["dashboard", "entry", "review", "admin", "hr"]
};

const titles = {
  dashboard: "Revenue Dashboard",
  entry: "Daily Loading Entry",
  review: "Reviewer Queue",
  admin: "User Administration",
  hr: "HR Module"
};

const contractBrandLines = [
  "Marketing, Sieving & Transportation Contract",
  "of S&G Pvt. Ltd.",
  "GSTN: 08AANCA9021D1ZS"
];

const REVIEW_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const PHOTO_UPLOAD_CONFIG = {
  maxFileBytes: 15 * 1024 * 1024,
  maxCompressedBytes: 3 * 1024 * 1024,
  maxPayloadBytes: 22 * 1024 * 1024,
  maxImageDimension: 1200,
  minCompressQuality: 0.35,
  qualityStep: 0.1
};

export {
  TODAY_ISO,
  DASHBOARD_DEFAULT_FROM_ISO,
  state,
  roleViews,
  titles,
  contractBrandLines,
  REVIEW_PAGE_SIZE_OPTIONS,
  PHOTO_UPLOAD_CONFIG
};
