import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft } from "lucide-react";
import { successGuides } from "@/lib/builderGuides";

const NAVY = "#1B2B4B";

function renderArticle(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold mt-6 mb-2" style={{ color: NAVY }}>
          {line.replace("#### ", "")}
        </h4>
      );
    } else if (line.startsWith("#### ") || line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold mt-7 mb-2" style={{ color: NAVY }}>
          {line.replace(/^#{3,4} /, "")}
        </h3>
      );
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      const listItems = [];
      while (i < lines.length && (lines[i].startsWith("* ") || lines[i].startsWith("- "))) {
        listItems.push(<li key={i}>{lines[i].replace(/^[*-] /, "")}</li>);
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="list-disc list-outside ml-5 space-y-1 text-sm leading-relaxed my-3" style={{ color: "#4A4A4A" }}>
          {listItems}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: "#4A4A4A" }}>
          {line}
        </p>
      );
    }
    i++;
  }

  return elements;
}

export default function BuilderGuideArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("guide");
  const guide = successGuides.find(g => g.slug === slug);

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: "#6B6B6B" }}>Guide not found.</p>
          <Link to={createPageUrl("BuilderResources")} className="text-sm font-medium underline" style={{ color: NAVY }}>
            Back to Builder Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={createPageUrl("BuilderResources")}
            className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: NAVY }}
          >
            <ChevronLeft className="w-4 h-4" /> Builder Resources
          </Link>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8A9BB0" }}>
            Builder Success Guide
          </p>
          <h1 className="text-3xl font-bold leading-snug mb-3" style={{ color: "#1A1A1A" }}>
            {guide.title}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>
            {guide.description}
          </p>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t pt-10" style={{ borderColor: "#E8E5E0" }}>
          {renderArticle(guide.article)}
        </div>

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t" style={{ borderColor: "#E8E5E0" }}>
          <Link
            to={createPageUrl("BuilderResources")}
            className="inline-flex items-center gap-1 text-sm font-medium transition-opacity opacity-70 hover:opacity-100"
            style={{ color: NAVY }}
          >
            <ChevronLeft className="w-4 h-4" /> Back to Builder Resources
          </Link>
        </div>
      </div>
    </div>
  );
}