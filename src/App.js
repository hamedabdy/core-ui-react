import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Typography } from "@mui/material";

import Home from "./components/Home";
const DynamicForm = lazy(() => import("./components/dynamicForm/DynamicForm"));
const DynamicList = lazy(() => import("./components/dynamicList/DynamicList"));
const PaperBase = lazy(() => import("./newHome/Paperbase.js"));

function App() {
  useEffect(() => {}, []); // Empty dependency array to ensure the effect runs only once on mount

  return (
    <Router>
      <Suspense fallback={<Typography variant="h5">Loading...</Typography>}>
        <div id="container">
          {/* Content will be dynamically replaced based on the route */}

          <Routes>
            <Route path="/*" element={<Home />}>
              <Route path=":tableName.list" element={<DynamicList />} />
              <Route path=":tableName.form" element={<DynamicForm />} />
            </Route>
            <Route path="/nav/*" element={<Home />}>
              <Route path=":tableName.list" element={<DynamicList />} />
              <Route path=":tableName.form" element={<DynamicForm />} />
            </Route>
            <Route path="/home/*" element={<PaperBase />} >
              <Route path=":tableName.list" element={<DynamicList />} />
              <Route path=":tableName.form" element={<DynamicForm />} />
            </Route>
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
}

export default App;
