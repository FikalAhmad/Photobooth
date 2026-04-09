import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";

const App = () => {
  const renderRoute = (route: (typeof routes)[number], index: number) => {
    const Component = route.component;

    const element = <Component />;
    return <Route key={index} path={route.path} element={element} />;
  };
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <div className="text-xl font-bold text-maroon animate-pulse">
                  Loading Photostrip Experience... 📸
                </div>
              </div>
            }
          >
            <Routes>{routes.map(renderRoute)}</Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
};

export default App;
