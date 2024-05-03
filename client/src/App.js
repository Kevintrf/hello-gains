import React from "react";
// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";

// Import components
import Home from "./components/home";
import Exercises from "./components/exercises";
import ExerciseDetails from "./components/exerciseDetails";
import Workout from "./components/workout";
import WorkoutHistory from "./components/workout/workoutHistory";
import Community from "./components/community";
import Settings from "./components/settings";
import Profile from "./components/profile";

const App = () => {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/exercises/:id" element={<ExerciseDetails />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/workout/history" element={<WorkoutHistory />} />
        <Route path="/community" element={<Community />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
};
export default App;
