import { ComponentType, lazy } from "react";

interface RouteInterface {
  path: string;
  component: ComponentType;
  isProtected?: boolean;
}

export const routes: RouteInterface[] = [
  {
    path: "/",
    component: lazy(() => import("../pages/homepage")),
  },
  {
    path: "/capture",
    component: lazy(() => import("../pages/capture")),
  },
  {
    path: "/photostrip",
    component: lazy(() => import("../pages/photostrip")),
  },
];
