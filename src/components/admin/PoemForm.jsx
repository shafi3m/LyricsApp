import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addPoem } from "../../store/poemsSlice";
import {
  databases,
  DATABASE_ID,
  POEMS_COLLECTION_ID,
} from "../../services/appwrite";

const PoemForm = ({ categories, editingPoem, onEditComplete }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title_en: "",
    title_ur: "",
    content_en: "",
    content_ur: "",
    category: "",
    language: "both",
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editingPoem) {
      setFormData({
        title_en: editingPoem.title_en || "",
        title_ur: editingPoem.title_ur || "",
        content_en: editingPoem.content_en || "",
        content_ur: editingPoem.content_ur || "",
        category: editingPoem.category || "",
        language: editingPoem.language || "both",
        featured: editingPoem.featured || false,
      });
    } else {
      setFormData({
        title_en: "",
        title_ur: "",
        content_en: "",
        content_ur: "",
        category: "",
        language: "both",
        featured: false,
      });
    }
  }, [editingPoem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (editingPoem) {
        // Update existing poem
        await databases.updateDocument(
          DATABASE_ID,
          POEMS_COLLECTION_ID,
          editingPoem.$id,
          formData
        );
        setSuccess(true);
        if (onEditComplete) {
          setTimeout(() => {
            onEditComplete();
          }, 1000);
        }
      } else {
        // Add new poem
        await dispatch(addPoem(formData)).unwrap();
        setSuccess(true);
        setFormData({
          title_en: "",
          title_ur: "",
          content_en: "",
          content_ur: "",
          category: "",
          language: "both",
          featured: false,
        });
      }
    } catch (err) {
      setError(
        err.message || `Failed to ${editingPoem ? "update" : "add"} poem`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Poem {editingPoem ? "updated" : "added"} successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            English Title *
          </label>
          <input
            type="text"
            name="title_en"
            value={formData.title_en}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter English title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Urdu Title *
          </label>
          <input
            type="text"
            name="title_ur"
            value={formData.title_ur}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent urdu-text"
            placeholder="اردو عنوان درج کریں"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600
+            rounded-md px-3 py-2
+            bg-white dark:bg-gray-700
+            text-gray-900 dark:text-gray-100
+            focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.$id} value={category.slug}>
                {category.name_en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Language *
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600
+            rounded-md px-3 py-2
+            bg-white dark:bg-gray-700
+            text-gray-900 dark:text-gray-100
+            focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="en">English Only</option>
            <option value="ur">Urdu Only</option>
            <option value="both">Both Languages</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center text-gray-500">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">Featured Poem</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          English Content *
        </label>
        <textarea
          name="content_en"
          value={formData.content_en}
          onChange={handleChange}
          required
          rows={8}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter the poem content in English..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          Urdu Content *
        </label>
        <textarea
          name="content_ur"
          value={formData.content_ur}
          onChange={handleChange}
          required
          rows={8}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent urdu-text"
          placeholder="یہاں اردو میں نظم کا متن لکھیں..."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading
            ? `${editingPoem ? "Updating" : "Adding"} Poem...`
            : `${editingPoem ? "Update" : "Add"} Poem`}
        </button>
      </div>
    </form>
  );
};

export default PoemForm;
