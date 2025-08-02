import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getTranslation } from "../../utils/translations";
import PoemCard from "./PoemCard";
import LoadingSpinner from "../common/LoadingSpinner";

const PoemGrid = ({ poems, loading }) => {
  const { language } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!poems || poems.length === 0) {
    return (
      <div className="text-center py-8">
        <p
          className={`text-gray-500 dark:text-gray-400 text-lg ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("noPoems", language)}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 animate-fade-in">
      {poems.map((poem) => (
        <div key={poem.$id} className="animate-slide-up">
          <PoemCard poem={poem} />
        </div>
      ))}
    </div>
  );
};

export default PoemGrid;
