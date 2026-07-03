/**
 * Admin CMS feature. Import everything admin-related from here:
 *   import { StudybookTable, adminListStudybooks } from "@/features/admin";
 */
export { AdminLogoutButton } from "./components/AdminLogoutButton";
export { AdminPager } from "./components/AdminPager";
export { AdminSidebar } from "./components/AdminSidebar";
export { AdminTopbar } from "./components/AdminTopbar";
export { CardEditor } from "./components/CardEditor";
export { SearchParamInput } from "./components/SearchParamInput";
export { StudybookFilters } from "./components/StudybookFilters";
export { StudybookForm } from "./components/StudybookForm";
export { StudybookRowActions } from "./components/StudybookRowActions";
export { StudybookTable } from "./components/StudybookTable";

export {
  adminGetStudybook,
  adminListStudybooks,
  adminListSubjects,
  adminListUsers,
  adminStats,
} from "./data";
export type { AdminStats, AdminSubjectRow, AdminUser, StudybookPage, StudybookQuery } from "./data";

export { gradeLabel, subjectName } from "./format";
export { cardsSchema, studybookSchema, studyCardSchema } from "./schemas";
export type { CardInput, StudybookInput } from "./schemas";
