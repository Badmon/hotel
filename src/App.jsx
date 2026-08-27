import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";

import { HomePage } from "./pages/public/HomePage";
import { RoomsPage } from "./pages/public/RoomsPage";
import { RoomDetailPage } from "./pages/public/RoomDetailPage";
import { ReservationRequestPage } from "./pages/public/ReservationRequestPage";
import { ReservationSuccessPage } from "./pages/public/ReservationSuccessPage";
import { FindReservationPage } from "./pages/public/FindReservationPage";
import { NotFoundPage } from "./pages/public/NotFoundPage";

import { LoginPage } from "./pages/admin/LoginPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { ReservationsListPage } from "./pages/admin/ReservationsListPage";
import { ReservationDetailPage } from "./pages/admin/ReservationDetailPage";
import { RoomsAdminPage } from "./pages/admin/RoomsAdminPage";
import { RoomTypesAdminPage } from "./pages/admin/RoomTypesAdminPage";
import { CalendarPage } from "./pages/admin/CalendarPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/habitaciones" element={<RoomsPage />} />
            <Route path="/habitaciones/:slug" element={<RoomDetailPage />} />
            <Route path="/habitaciones/:slug/reservar" element={<ReservationRequestPage />} />
            <Route path="/reserva/confirmada" element={<ReservationSuccessPage />} />
            <Route path="/reserva/buscar" element={<FindReservationPage />} />
          </Route>

          <Route path="/admin/login" element={<LoginPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="reservations" element={<ReservationsListPage />} />
            <Route path="reservations/:id" element={<ReservationDetailPage />} />
            <Route path="room-types" element={<RoomTypesAdminPage />} />
            <Route path="rooms" element={<RoomsAdminPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>

          <Route path="*" element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
