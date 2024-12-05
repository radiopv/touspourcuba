import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthProvider";
import MainLayout from "@/components/Layout/MainLayout";
import PublicLayout from "@/components/Layout/PublicLayout";

// Page imports
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import Children from "@/pages/Children";
import ChildProfile from "@/pages/ChildProfile";
import AddChild from "@/pages/AddChild";
import Donations from "@/pages/Donations";
import Messages from "@/pages/Messages";
import SponsorSpace from "@/pages/SponsorSpace";
import Settings from "@/pages/Settings";
import Permissions from "@/pages/admin/Permissions";
import Translations from "@/pages/admin/Translations";
import Statistics from "@/pages/admin/Statistics";
import FAQ from "@/pages/admin/FAQ";
import ActivityLog from "@/pages/admin/ActivityLog";
import HomeContent from "@/pages/admin/HomeContent";
import Travels from "@/pages/sponsor/Travels";
import AvailableChildren from "@/pages/AvailableChildren";
import BecomeSponsor from "@/pages/BecomeSponsor";

export const Router = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/available-children" element={<AvailableChildren />} />
        <Route path="/become-sponsor/:childId" element={<BecomeSponsor />} />
      </Route>

      {/* Protected Routes */}
      {user && (
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/children" element={<Children />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/add-child" element={<AddChild />} />
          <Route path="/children/add" element={<AddChild />} />
          <Route path="/children/:id" element={<ChildProfile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/sponsor-space" element={<SponsorSpace />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/permissions" element={<Permissions />} />
          <Route path="/admin/translations" element={<Translations />} />
          <Route path="/admin/statistics" element={<Statistics />} />
          <Route path="/admin/faq" element={<FAQ />} />
          <Route path="/admin/activity" element={<ActivityLog />} />
          <Route path="/admin/home-content" element={<HomeContent />} />
          <Route path="/sponsor/travels" element={<Travels />} />
        </Route>
      )}
    </Routes>
  );
};
