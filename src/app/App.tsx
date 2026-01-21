import { useState } from "react";
import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRouteWithContext,
  Outlet,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useAuthStore } from "../stores/authStore";
import { LoginDialog } from "./components/LoginDialog";
import { SignupDialog } from "./components/SignupDialog";
import { MyPage } from "./components/MyPage";
import { ServiceRegistration } from "./components/ServiceRegistration";
import { ServiceEdit } from "./components/ServiceEdit";
import { ServiceDetail } from "./components/ServiceDetail";
import { PaymentSuccessPage } from "./components/PaymentSuccessPage";
import { LessonApplication } from "./components/LessonApplication";
import Home from "./components/Home";
import { LegalDocs } from "./components/LegalDocs";
import { RequiredAuth } from "./components/RequiredAuth";

// 라우터 컨텍스트 타입 정의
interface RouterContext {
  openLogin: () => void;
  openSignup: () => void;
}

// Root 라우트 생성 (컨텍스트 포함)
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

// 라우트 정의
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): { search?: string; page?: number; sort?: string; categoryId?: number; lessonType?: string } => {
    return {
      search: (search.search as string) || "",
      page: Number(search.page) || 1,
      sort: (search.sort as string) || "popular",
      categoryId: (search.categoryId && !isNaN(Number(search.categoryId))) ? Number(search.categoryId) : undefined,
      lessonType: (search.lessonType as string) || "all",
    };
  },
  component: () => {
    const context = rootRoute.useRouteContext();
    const { search, page, sort, categoryId, lessonType } = useSearch({ from: indexRoute.id });
    return (
      <Home
        onLoginClick={context.openLogin}
        onSignupClick={context.openSignup}
        searchQuery={search}
        page={page}
        sort={sort}
        categoryId={categoryId}
        lessonType={lessonType}
      />
    );
  },
});

const myPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mypage",
  component: () => {
    return (
      <RequiredAuth>
        <MyPage />
      </RequiredAuth>
    );
  },
});

const serviceRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service/register",
  component: () => {
    return (
      <RequiredAuth>
        <ServiceRegistration onBack={() => window.history.back()} />
      </RequiredAuth>
    );
  },
});

const serviceEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service/$id/edit",
  component: () => {
    const { id } = useParams({ from: serviceEditRoute.id });
    return <ServiceEdit lessonId={id} onBack={() => window.history.back()} />;
  },
});

const serviceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service/$id",
  component: () => {
    const { id } = useParams({ from: serviceDetailRoute.id });
    const navigate = useNavigate();
    return (
      <ServiceDetail
        serviceId={id}
        onBack={() => navigate({ to: "/" })}
        onNavigateToApplication={() =>
          navigate({ to: "/service/$id/apply", params: { id } })
        }
      />
    );
  },
});

const serviceApplyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service/$id/apply",
  component: () => {
    const { id } = useParams({ from: serviceApplyRoute.id });
    const navigate = useNavigate();
    return (
      <LessonApplication
        lessonId={id}
        onBack={() => navigate({ to: "/service/$id", params: { id } })}
      />
    );
  },
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/success",
  validateSearch: (search: Record<string, unknown>) => ({
    paymentKey: (search.paymentKey as string) || "",
    orderId: (search.orderId as string) || "",
    amount: (search.amount as string) || "",
  }),
  component: PaymentSuccessPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: () => <LegalDocs type="terms" />,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: () => <LegalDocs type="privacy" />,
});

// 라우트 트리 구성
const routeTree = rootRoute.addChildren([
  indexRoute,
  myPageRoute,
  serviceRegisterRoute,
  serviceEditRoute,
  serviceDetailRoute,
  serviceApplyRoute,
  paymentSuccessRoute,
  termsRoute,
  privacyRoute,
]);

// 라우터 생성
const router = createRouter({
  routeTree,
  context: {
    openLogin: () => { },
    openSignup: () => { },
  },
});

// 타입 안전성을 위한 라우터 등록
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  // const user = useAuthStore((state) => state.user); // No longer needed here for context
  const logout = useAuthStore((state) => state.logout);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);

  return (
    <>
      <RouterProvider
        router={router}
        context={{
          openLogin: () => setIsLoginDialogOpen(true),
          openSignup: () => setIsSignupDialogOpen(true),
        }}
      />

      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      />
      <SignupDialog
        open={isSignupDialogOpen}
        onOpenChange={setIsSignupDialogOpen}
        onSwitchToLogin={() => {
          setIsSignupDialogOpen(false);
          setIsLoginDialogOpen(true);
        }}
      />
    </>
  );
}
