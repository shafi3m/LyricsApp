// src/components/FeedbackForm.jsx
import { useState } from "react";

/** Formspree form ID (‘xyzgoqzw’ in your snippet) */
const FORMSPREE_ID = "xyzgoqzw";

export default function FeedbackForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  /** Submit handler */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const data = new FormData(e.target);

      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        e.target.reset();
      } else {
        // Formspree sends JSON with { errors:[{message:"…"}] }
        const { errors } = await res.json();
        setErrorMsg(errors?.[0]?.message || "Something went wrong.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <section className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Feedback
      </h2>

      {/* success banner */}
      {status === "success" && (
        <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/40 p-4 text-green-800 dark:text-green-200">
          🎉 Thank you for your feedback!
        </div>
      )}

      {/* error banner */}
      {status === "error" && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/40 p-4 text-red-800 dark:text-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       px-3 py-2 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       px-3 py-2 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            name="message"
            rows={4}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       px-3 py-2 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center gap-2
                     w-full rounded-md bg-purple-600 py-2 px-4 text-white
                     hover:bg-purple-700 focus:ring-2 focus:ring-purple-500
                     disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Submit"}
        </button>
      </form>
    </section>
  );
}
