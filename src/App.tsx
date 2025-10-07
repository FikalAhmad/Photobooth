import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "../src/routes";

const App = () => {
  const renderRoute = (route: (typeof routes)[number], index: number) => {
    const Component = route.component;

    const element = <Component />;
    return <Route key={index} path={route.path} element={element} />;
  };
  return (
    <Router>
      <Routes>{routes.map(renderRoute)}</Routes>
    </Router>
  );
};

export default App;
