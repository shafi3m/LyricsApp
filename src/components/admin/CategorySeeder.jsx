import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCategory } from "../../store/categoriesSlice";

const CategorySeeder = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const defaultCategories = [
    {
      name_en: "Naat Sharif",
      name_ur: "نعت شریف",
      slug: "naat-sharif",
    },
    {
      name_en: "Hamd",
      name_ur: "حمد",
      slug: "hamd",
    },
    {
      name_en: "Manqabat",
      name_ur: "منقبت",
      slug: "manqabat",
    },
    {
      name_en: "Qawwali",
      name_ur: "قوالی",
      slug: "qawwali",
    },
    {
      name_en: "Marsiya",
      name_ur: "مرثیہ",
      slug: "marsiya",
    },
  ];

  const seedCategories = async () => {
    setLoading(true);
    setMessage("");

    try {
      for (const category of defaultCategories) {
        await dispatch(addCategory(category)).unwrap();
      }
      setMessage("Categories added successfully!");
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-yellow-800 mb-2">
        Category Seeder (Development Only)
      </h3>
      <p className="text-yellow-700 mb-4">
        Click the button below to add default categories to your database.
      </p>

      {message && (
        <div
          className={`mb-4 p-2 rounded ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={seedCategories}
        disabled={loading}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? "Adding Categories..." : "Add Default Categories"}
      </button>
    </div>
  );
};

export default CategorySeeder;
