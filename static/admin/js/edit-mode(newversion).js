/**
 * Main edit mode controller
 * Initializes and coordinates all editing functionality
 */

// Import editor modules
import { initEditableText } from './editors/text-editor.js';
import { initEditableImages } from './editors/image-editor.js';
import { initEditableVideos } from './editors/video-editor.js';
import { initEditableJson } from './editors/json-editor.js';
import { initEditableHighlights } from './editors/highlights-editor.js';
import { initEditableLinks } from './editors/links-editor.js';
import { initEditableNavbar } from './editors/navbar-editor.js';

// Import utilities
import { showNotification, getCookie } from './utils/ui-utils.js';

/**
 * Initialize all editing functionality when the DOM is loaded
 * This is the main entry point for the edit mode functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check if edit mode is active
  const editMode = document.body.classList.contains("edit-mode");
  if (!editMode) return;

  // Initialize all editable components
  initEditableText();
  initEditableImages();
  initEditableVideos();
  initEditableJson();
  initEditableHighlights();
  initEditableLinks();
  initEditableNavbar();

  // Add user-friendly UI enhancements
  addJsonEditButtons();
  
  // Add edit mode toggle button
  addEditModeToggle();

  // Add CSS for JSON editor if not already added
  if (!document.querySelector('link[href="/static/admin/css/json-editor.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/admin/css/json-editor.css";
    document.head.appendChild(link);
  }
});

/**
 * Adds a toggle button to exit edit mode
 */
function addEditModeToggle() {
  const toggleBtn = document.createElement("button");
  toggleBtn.innerHTML = '<i class="fas fa-edit"></i> Exit Edit Mode';
  toggleBtn.classList.add("edit-mode-toggle");
  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
    fetch("/dashboard/toggle-edit-mode/", {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.reload();
      });
  });
}

/**
 * Add edit buttons to all sections with JSON content
 * This improves discoverability of editable regions
 */
function addJsonEditButtons() {
  // Find all sections that might contain JSON content
  const sections = [
    { selector: ".services-item", title: "Edit Service" },
    { selector: ".facts-row", title: "Edit Facts" },
    { selector: ".booking-form", title: "Edit Booking Form" },
    { selector: ".contact-right", title: "Edit Contact Info" },
    { selector: ".test-item", title: "Edit Testimonial" },
  ];

  sections.forEach((section) => {
    const elements = document.querySelectorAll(section.selector);

    elements.forEach((element) => {
      // Check if this element or its child has data-editable="json"
      const jsonElement =
        element.querySelector('[data-editable="json"]') ||
        (element.hasAttribute("data-editable") && element.getAttribute("data-editable") === "json" ? element : null);

      if (jsonElement && !element.querySelector(".json-edit-btn")) {
        // Create edit button
        const editBtn = document.createElement("button");
        editBtn.innerHTML = '<i class="fas fa-edit"></i> ' + section.title;
        editBtn.classList.add("json-edit-btn");

        // Position the button
        editBtn.style.position = "absolute";
        editBtn.style.top = "10px";
        editBtn.style.right = "10px";
        editBtn.style.zIndex = "100";
        editBtn.style.backgroundColor = "#1ec6b6";
        editBtn.style.color = "white";
        editBtn.style.border = "none";
        editBtn.style.borderRadius = "4px";
        editBtn.style.padding = "5px 10px";
        editBtn.style.cursor = "pointer";

        // Make sure the parent has position relative for absolute positioning
        if (window.getComputedStyle(element).position === "static") {
          element.style.position = "relative";
        }

        // Add click event
        editBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Trigger the click on the JSON element
          jsonElement.click();
        });

        element.appendChild(editBtn);
      }
    });
  });
}

// Export utility functions to be used by other modules
export { showNotification, getCookie };