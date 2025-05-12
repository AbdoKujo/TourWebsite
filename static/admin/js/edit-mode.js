document.addEventListener("DOMContentLoaded", () => {
  // Check if edit mode is active
  const editMode = document.body.classList.contains("edit-mode")
  if (!editMode) return

  // Initialize editable elements
  initEditableText()
  initEditableImages()
  initEditableVideos()
  initEditableJson()
  initEditableHighlights()
  initEditableLinks()
  initEditableNavbar() // Add navbar editing
  initUserFriendlyJsonEditors() // Add this new function call

  // Add edit mode toggle button
  addEditModeToggle()

  // Add CSS for JSON editor if not already added
  if (!document.querySelector('link[href="/static/admin/css/json-editor.css"]')) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "/static/admin/css/json-editor.css"
    document.head.appendChild(link)
  }
})

// Update the sendUpdate function to handle errors better and check if element exists
function sendUpdate(elementId, fieldName, newValue, originalText, element) {
  // For JSON content, we need special handling to update only the specific part
  if (fieldName === "json_content") {
    // Fetch the current complete JSON content first
    fetch(`/dashboard/element/${elementId}/get/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then((data) => {
        let jsonData = {}

        try {
          // Parse existing complete JSON
          jsonData = JSON.parse(data.json_content || "{}")
        } catch (error) {
          console.error("Error parsing JSON:", error)
          jsonData = {}
        }

        // Try to parse the new value as JSON
        let newJsonValue
        try {
          newJsonValue = JSON.parse(newValue)

          // If the new value is a complete JSON object, use it directly
          if (typeof newJsonValue === "object" && newJsonValue !== null) {
            jsonData = newJsonValue
          }
        } catch (error) {
          // If not valid JSON, it might be a specific field update
          // The specific field updates are handled in the click handlers
          // This block is for direct JSON edits
          console.log("Not updating complete JSON object")
        }

        // Send the updated JSON to the server
        const formData = new FormData()
        formData.append("field", fieldName)
        formData.append("value", JSON.stringify(jsonData))

        fetch(`/dashboard/element/${elementId}/update/`, {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Server returned ${response.status}: ${response.statusText}`)
            }
            return response.json()
          })
          .then((data) => {
            if (data.success) {
              // Update the element with new text if it's displayed
              if (!element.dataset.highlightItem && !element.dataset.submitText && !element.dataset.formField) {
                element.innerHTML = newValue
              } else {
                element.innerHTML = originalText
              }
              showNotification("Content updated successfully")
            } else {
              showNotification("Error updating content", "error")
              element.innerHTML = originalText
            }
          })
          .catch((error) => {
            console.error("Error updating content:", error)
            showNotification("Error updating content", "error")
            element.innerHTML = originalText
          })
      })
      .catch((error) => {
        console.error("Error fetching element data:", error)
        showNotification(`Error fetching element data: ${error.message}`, "error")
        element.innerHTML = originalText
      })
  } else {
    // Regular text update (non-JSON fields)
    const formData = new FormData()
    formData.append("field", fieldName)
    formData.append("value", newValue)

    fetch(`/dashboard/element/${elementId}/update/`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          // Update the element with new text
          element.innerHTML = newValue
          showNotification("Content updated successfully")
        } else {
          showNotification("Error updating content", "error")
          element.innerHTML = originalText
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showNotification("Error updating content", "error")
        element.innerHTML = originalText
      })
  }
}

// Fix the image editing functionality to preserve CSS classes
function initEditableImages() {
  // Find all elements with data-editable="image" attribute
  const editableImages = document.querySelectorAll('[data-editable="image"]');

  editableImages.forEach((imgContainer) => {
    // Add edit indicator
    imgContainer.classList.add("editable-image");

    // Get the actual img element
    const img = imgContainer.querySelector("img");
    if (!img) return;

    const elementId = imgContainer.dataset.elementId;
    
    // Store original styles and classes
    const originalStyles = {
      width: img.style.width,
      height: img.style.height,
      objectFit: img.style.objectFit,
      objectPosition: img.style.objectPosition,
      cssText: img.style.cssText
    };
    const originalClasses = img.className;

    // Create edit button
    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.classList.add("image-edit-btn");
    imgContainer.appendChild(editBtn);

    // Edit button click handler
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Create file input
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";

      // Trigger file selection
      fileInput.click();

      // File selection handler
      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files[0]) {
          const formData = new FormData();
          formData.append("image", fileInput.files[0]);

          // Show loading indicator
          imgContainer.classList.add("loading");

          // Upload image to server
          fetch(`/dashboard/element/${elementId}/upload-image/`, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              imgContainer.classList.remove("loading");

              if (data.success) {
                // Update image source while preserving styles
                img.src = data.src + "?v=" + new Date().getTime();
                
                // Restore original styling
                img.className = originalClasses;
                img.style.cssText = originalStyles.cssText;
                
                showNotification("Image updated successfully");
              } else {
                showNotification("Error updating image", "error");
              }
            })
            .catch((error) => {
              imgContainer.classList.remove("loading");
              console.error("Error:", error);
              showNotification("Error updating image", "error");
            });
        }
      });
    });
  });
}

// Fix the contact form editor to allow editing the entire form structure
function initEditableJson() {
  // Find all elements with data-editable="json" attribute
  const editableJsonElements = document.querySelectorAll('[data-editable="json"]')

  editableJsonElements.forEach((element) => {
    // Add edit indicator
    element.classList.add("editable-json")

    // Add click event to make JSON editable
    element.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // If already in edit state, return
      if (element.querySelector(".json-editor-modal")) return

      const elementId = element.dataset.elementId
      const fieldName = element.dataset.field || "json_content"

      // Check if this is a contact form
      const isContactForm =
        element.closest(".contact-form") !== null ||
        element.classList.contains("contact-form") ||
        element.querySelector(".contact-form") !== null

      if (isContactForm) {
        // For contact forms, always use the full form editor
        openJsonEditor(elementId)
      } else {
        // For other JSON content, use the standard editor
        openJsonEditor(elementId)
      }
    })
  })
}

// Add this new function to open the modern JSON editor
async function openJsonEditor(elementId) {
  try {
    // Show loading indicator
    const loadingIndicator = document.createElement("div")
    loadingIndicator.className = "json-editor-loading"
    loadingIndicator.innerHTML = '<div class="json-editor-spinner"></div>'
    document.body.appendChild(loadingIndicator)

    // Fetch the element data
    const response = await fetch(`/dashboard/element/${elementId}/get/`)

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const jsonContent = data.json_content || "{}"

    let jsonData
    try {
      jsonData = JSON.parse(jsonContent)
    } catch (error) {
      console.error("Error parsing JSON:", error)
      jsonData = {}
    }

    // Remove loading indicator
    document.body.removeChild(loadingIndicator)

    // Determine the JSON type
    const jsonType = determineJsonType(jsonData)

    // Create the editor modal
    createJsonEditorModal(elementId, jsonData, jsonType)
  } catch (error) {
    console.error("Error fetching element data:", error)
    showNotification(`Error fetching element data: ${error.message}`, "error")

    // Remove loading indicator if it exists
    const loadingIndicator = document.querySelector(".json-editor-loading")
    if (loadingIndicator) {
      document.body.removeChild(loadingIndicator)
    }
  }
}

// Improve the function to determine JSON type to better detect contact forms
function determineJsonType(jsonData) {
  if (jsonData.form && jsonData.contact_info) {
    return "form" // Contact form with contact info
  } else if (jsonData.form) {
    return "form" // Regular form
  } else if (jsonData.items) {
    return "facts"
  } else if (jsonData.contact_info) {
    return "contact"
  } else if (jsonData.icone) {
    return "icon"
  } else if (jsonData.price) {
    return "price"
  } else if (jsonData.link) {
    return "link"
  } else if (jsonData.type === "social_link") {
    return "social"
  } else if (jsonData.highlights) {
    return "highlights"
  } else if (Array.isArray(jsonData)) {
    return "navbar"
  } else {
    return "generic"
  }
}

// Function to create the JSON editor modal
function createJsonEditorModal(elementId, jsonData, jsonType) {
  // Remove any existing editor
  const existingEditor = document.querySelector(".json-editor-modal")
  if (existingEditor) {
    existingEditor.remove()
  }

  // Create the modal container
  const modal = document.createElement("div")
  modal.className = "json-editor-modal"

  // Create the editor container
  const container = document.createElement("div")
  container.className = "json-editor-container"

  // Create the header
  const header = document.createElement("div")
  header.className = "json-editor-header"

  const title = document.createElement("h3")
  title.className = "json-editor-title"
  title.textContent = getEditorTitle(jsonType)

  const closeBtn = document.createElement("button")
  closeBtn.className = "json-editor-close"
  closeBtn.innerHTML = "&times;"
  closeBtn.addEventListener("click", () => closeJsonEditor(modal))

  header.appendChild(title)
  header.appendChild(closeBtn)

  // Create the body
  const body = document.createElement("div")
  body.className = "json-editor-body"

  // Create the content based on JSON type
  let content
  switch (jsonType) {
    case "form":
      content = createFormEditor(elementId, jsonData)
      break
    case "facts":
      content = createFactsEditor(elementId, jsonData)
      break
    case "contact":
      content = createContactEditor(elementId, jsonData)
      break
    case "icon":
      content = createIconEditor(elementId, jsonData)
      break
    case "price":
      content = createPriceEditor(elementId, jsonData)
      break
    case "link":
      content = createLinkEditor(elementId, jsonData)
      break
    case "social":
      content = createSocialEditor(elementId, jsonData)
      break
    case "highlights":
      content = createHighlightsEditor(elementId, jsonData)
      break
    case "navbar":
      content = createNavbarEditor(elementId, jsonData)
      break
    default:
      content = createGenericEditor(elementId, jsonData)
  }

  body.appendChild(content)

  // Create footer
  const footer = document.createElement("div")
  footer.className = "json-editor-footer"

  const cancelBtn = document.createElement("button")
  cancelBtn.className = "json-editor-btn secondary"
  cancelBtn.textContent = "Cancel"
  cancelBtn.addEventListener("click", () => closeJsonEditor(modal))

  const saveBtn = document.createElement("button")
  saveBtn.className = "json-editor-btn primary"
  saveBtn.textContent = "Save Changes"
  saveBtn.addEventListener("click", () => saveJsonChanges(modal, elementId, jsonType))

  footer.appendChild(cancelBtn)
  footer.appendChild(saveBtn)

  // Assemble the modal
  container.appendChild(header)
  container.appendChild(body)
  container.appendChild(footer)
  modal.appendChild(container)

  // Add to the document
  document.body.appendChild(modal)

  // Initialize any special components
  initializeSpecialComponents(jsonType)
}

// Function to initialize special components after the modal is created
function initializeSpecialComponents(jsonType) {
  if (jsonType === "icon") {
    // Initialize icon search
    const searchInput = document.querySelector(".json-icon-search input")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase()
        const iconItems = document.querySelectorAll(".json-icon-item")

        iconItems.forEach((item) => {
          const iconName = item.getAttribute("data-icon").toLowerCase()
          if (iconName.includes(searchTerm)) {
            item.style.display = "flex"
          } else {
            item.style.display = "none"
          }
        })
      })
    }
  }
}

// Function to get the appropriate title for the editor
function getEditorTitle(jsonType) {
  const titles = {
    form: "Edit Form",
    facts: "Edit Facts",
    contact: "Edit Contact Information",
    icon: "Edit Icon",
    price: "Edit Price",
    link: "Edit Link",
    social: "Edit Social Link",
    highlights: "Edit Highlights",
    navbar: "Edit Navigation Menu",
    generic: "Edit Content",
  }

  return titles[jsonType] || "Edit Content"
}

// Function to close the JSON editor
function closeJsonEditor(modal) {
  document.body.removeChild(modal)
}

// Function to save JSON changes
async function saveJsonChanges(modal, elementId, jsonType) {
  try {
    // Show loading indicator
    const loading = document.createElement("div")
    loading.className = "json-editor-loading"
    loading.innerHTML = '<div class="json-editor-spinner"></div>'
    modal.appendChild(loading)

    // Get the updated JSON data based on the editor type
    let jsonData
    switch (jsonType) {
      case "form":
        jsonData = getFormEditorData()
        break
      case "facts":
        jsonData = getFactsEditorData()
        break
      case "contact":
        jsonData = getContactEditorData()
        break
      case "icon":
        jsonData = getIconEditorData()
        break
      case "price":
        jsonData = getPriceEditorData()
        break
      case "link":
        jsonData = getLinkEditorData()
        break
      case "social":
        jsonData = getSocialEditorData()
        break
      case "highlights":
        jsonData = getHighlightsEditorData()
        break
      case "navbar":
        jsonData = getNavbarEditorData()
        break
      default:
        jsonData = getGenericEditorData()
    }

    // Send update to server
    const formData = new FormData()
    formData.append("field", "json_content")
    formData.append("value", JSON.stringify(jsonData))

    const response = await fetch(`/dashboard/element/${elementId}/update/`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success) {
      showNotification("Content updated successfully")
      // Reload the page to reflect changes
      setTimeout(() => window.location.reload(), 1000)
    } else {
      throw new Error("Server returned success: false")
    }
  } catch (error) {
    console.error("Error:", error)
    showNotification(`Error: ${error.message}`, "error")

    // Remove loading indicator
    const loadingIndicator = modal.querySelector(".json-editor-loading")
    if (loadingIndicator) {
      modal.removeChild(loadingIndicator)
    }
  }
}

// Improve the form editor to handle the complete form structure
function createFormEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "form")

  // Form message
  const formMessage = document.createElement("div")
  formMessage.className = "json-form-message"
  formMessage.innerHTML =
    "<strong>Form Editor</strong><br>Edit your form settings and fields below. Changes will be applied when you save."
  container.appendChild(formMessage)

  // Form settings section
  const settingsSection = document.createElement("div")
  settingsSection.innerHTML = `
    <div class="json-section-title">Form Settings</div>
    <div class="json-form-group">
      <label class="json-form-label">Submit Button Text</label>
      <input type="text" class="json-form-input" id="form-submit-text" value="${jsonData.form?.submit_text || "Submit"}">
    </div>
    <div class="json-form-group">
      <label class="json-form-label">WhatsApp Number</label>
      <input type="tel" class="json-form-input" id="form-whatsapp" value="${jsonData.form?.whatsapp_number || "212643562320"}">
      <div class="json-help-text">Include country code without + (e.g., 212643562320)</div>
    </div>
  `
  container.appendChild(settingsSection)

  // Form fields section
  const fieldsSection = document.createElement("div")
  fieldsSection.innerHTML = `
    <div class="json-section-title">Form Fields</div>
    <div class="json-array-container" id="form-fields-container"></div>
    <button type="button" class="json-add-item-btn" id="add-form-field">
      <i class="fas fa-plus"></i> Add New Field
    </button>
  `
  container.appendChild(fieldsSection)

  // Add the fields container to the DOM first
  const fieldsContainer = fieldsSection.querySelector("#form-fields-container")

  // Add existing fields
  const fields = jsonData.form?.fields || []
  fields.forEach((field, index) => {
    addFormFieldItem(fieldsContainer, field, index)
  })

  // Add field button handler
  setTimeout(() => {
    document.getElementById("add-form-field").addEventListener("click", () => {
      const newField = {
        name: "",
        type: "text",
        label: "",
        required: false,
        options: [],
      }
      addFormFieldItem(fieldsContainer, newField, fields.length)
    })
  }, 0)

  // Add contact info section if it exists in the data
  if (jsonData.contact_info) {
    const contactSection = document.createElement("div")
    contactSection.innerHTML = `
      <div class="json-section-title">Contact Information</div>
      <div class="json-array-container" id="contact-items-container"></div>
      <button type="button" class="json-add-item-btn" id="add-contact-item">
        <i class="fas fa-plus"></i> Add Contact Item
      </button>
    `
    container.appendChild(contactSection)

    // Add the contact items container to the DOM
    const contactContainer = contactSection.querySelector("#contact-items-container")

    // Add existing contact items
    const contactItems = jsonData.contact_info || []
    contactItems.forEach((item, index) => {
      addContactItem(contactContainer, item, index)
    })

    // Add contact item button handler
    setTimeout(() => {
      document.getElementById("add-contact-item").addEventListener("click", () => {
        const newItem = {
          icon: "fas fa-phone-alt",
          title: "Phone",
          content: "+212 643-562-320",
          link: "",
        }
        addContactItem(contactContainer, newItem, contactItems.length)
      })
    }, 0)
  }

  return container
}

// Add a form field item to the container
function addFormFieldItem(container, field, index) {
  const fieldItem = document.createElement("div")
  fieldItem.className = "json-array-item"
  fieldItem.setAttribute("data-field-index", index)

  // Field header
  const header = document.createElement("div")
  header.className = "json-array-item-header"

  const title = document.createElement("h4")
  title.className = "json-array-item-title"
  title.textContent = field.label || `Field ${index + 1}`

  const actions = document.createElement("div")
  actions.className = "json-array-actions"

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "json-array-btn delete"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.addEventListener("click", () => {
    container.removeChild(fieldItem)
  })

  const moveUpBtn = document.createElement("button")
  moveUpBtn.className = "json-array-btn move-up"
  moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  moveUpBtn.addEventListener("click", () => {
    const prev = fieldItem.previousElementSibling
    if (prev) {
      container.insertBefore(fieldItem, prev)
    }
  })

  const moveDownBtn = document.createElement("button")
  moveDownBtn.className = "json-array-btn move-down"
  moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>'
  moveDownBtn.addEventListener("click", () => {
    const next = fieldItem.nextElementSibling
    if (next) {
      container.insertBefore(next, fieldItem)
    }
  })

  actions.appendChild(moveUpBtn)
  actions.appendChild(moveDownBtn)
  actions.appendChild(deleteBtn)

  header.appendChild(title)
  header.appendChild(actions)

  fieldItem.appendChild(header)

  // Field content
  const content = document.createElement("div")
  content.className = "json-array-item-content"

  content.innerHTML = `
    <div class="json-form-group">
      <label class="json-form-label">Field Name (ID)</label>
      <input type="text" class="json-form-input field-name" value="${field.name || ""}">
      <div class="json-help-text">Used as the field identifier (e.g., name, email, message)</div>
    </div>
    
    <div class="json-form-group">
      <label class="json-form-label">Field Type</label>
      <select class="json-form-select field-type">
        <option value="text" ${field.type === "text" ? "selected" : ""}>Text</option>
        <option value="email" ${field.type === "email" ? "selected" : ""}>Email</option>
        <option value="tel" ${field.type === "tel" ? "selected" : ""}>Phone</option>
        <option value="date" ${field.type === "date" ? "selected" : ""}>Date</option>
        <option value="textarea" ${field.type === "textarea" ? "selected" : ""}>Text Area</option>
        <option value="select" ${field.type === "select" ? "selected" : ""}>Dropdown</option>
      </select>
    </div>
    
    <div class="json-form-group">
      <label class="json-form-label">Field Label</label>
      <input type="text" class="json-form-input field-label" value="${field.label || ""}">
      <div class="json-help-text">Displayed as placeholder text</div>
    </div>
    
    <div class="json-form-group">
      <label class="json-form-checkbox">
        <input type="checkbox" class="field-required" ${field.required ? "checked" : ""}>
        Required Field
      </label>
    </div>
    
    <div class="json-form-group field-options-group" style="display: ${field.type === "select" ? "block" : "none"}">
      <label class="json-form-label">Options (comma separated)</label>
      <input type="text" class="json-form-input field-options" value="${field.options ? field.options.join(", ") : ""}">
      <div class="json-help-text">Example: Option 1, Option 2, Option 3</div>
    </div>
  `

  fieldItem.appendChild(content)

  // Show/hide options based on field type
  setTimeout(() => {
    const typeSelect = content.querySelector(".field-type")
    const optionsGroup = content.querySelector(".field-options-group")

    typeSelect.addEventListener("change", () => {
      optionsGroup.style.display = typeSelect.value === "select" ? "block" : "none"
    })

    // Update title when label changes
    const labelInput = content.querySelector(".field-label")
    labelInput.addEventListener("input", () => {
      title.textContent = labelInput.value || `Field ${index + 1}`
    })
  }, 0)

  container.appendChild(fieldItem)
}

// Update the getFormEditorData function to include contact info
function getFormEditorData() {
  const formData = {
    form: {
      submit_text: document.getElementById("form-submit-text").value,
      whatsapp_number: document.getElementById("form-whatsapp").value,
      fields: [],
    },
  }

  // Get fields
  const fieldItems = document.querySelectorAll("#form-fields-container .json-array-item")
  fieldItems.forEach((item) => {
    const name = item.querySelector(".field-name").value
    const type = item.querySelector(".field-type").value
    const label = item.querySelector(".field-label").value
    const required = item.querySelector(".field-required").checked

    let options = []
    if (type === "select") {
      const optionsText = item.querySelector(".field-options").value
      options = optionsText
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt)
    }

    formData.form.fields.push({
      name,
      type,
      label,
      required,
      options,
    })
  })

  // Get contact info if it exists
  const contactItems = document.querySelectorAll("#contact-items-container .json-array-item")
  if (contactItems.length > 0) {
    formData.contact_info = []

    contactItems.forEach((item) => {
      const icon = item.querySelector(".contact-icon").value
      const title = item.querySelector(".contact-title").value
      const content = item.querySelector(".contact-content").value
      const link = item.querySelector(".contact-link").value

      formData.contact_info.push({
        icon,
        title,
        content,
        link,
      })
    })
  }

  return formData
}

// Create facts editor
function createFactsEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "facts")

  // Facts message
  const factsMessage = document.createElement("div")
  factsMessage.className = "json-form-message"
  factsMessage.innerHTML =
    "<strong>Facts Editor</strong><br>Edit your facts items below. You can add, remove, or reorder items."
  container.appendChild(factsMessage)

  // Facts items section
  const itemsSection = document.createElement("div")
  itemsSection.innerHTML = `
    <div class="json-section-title">Facts Items</div>
    <div class="json-array-container" id="facts-items-container"></div>
    <button type="button" class="json-add-item-btn" id="add-fact-item">
      <i class="fas fa-plus"></i> Add New Fact
    </button>
  `
  container.appendChild(itemsSection)

  // Add the items container to the DOM first
  const itemsContainer = itemsSection.querySelector("#facts-items-container")

  // Add existing items
  const items = jsonData.items || []
  items.forEach((item, index) => {
    addFactItem(itemsContainer, item, index)
  })

  // Add item button handler
  setTimeout(() => {
    document.getElementById("add-fact-item").addEventListener("click", () => {
      const newItem = {
        icon: "fas fa-check",
        title: "New Fact",
        text: "Fact description goes here.",
      }
      addFactItem(itemsContainer, newItem, items.length)
    })
  }, 0)

  return container
}

// Add a fact item to the container
function addFactItem(container, item, index) {
  const factItem = document.createElement("div")
  factItem.className = "json-array-item"
  factItem.setAttribute("data-item-index", index)

  // Item header
  const header = document.createElement("div")
  header.className = "json-array-item-header"

  const title = document.createElement("h4")
  title.className = "json-array-item-title"
  title.textContent = item.title || `Fact ${index + 1}`

  const actions = document.createElement("div")
  actions.className = "json-array-actions"

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "json-array-btn delete"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.addEventListener("click", () => {
    container.removeChild(factItem)
  })

  const moveUpBtn = document.createElement("button")
  moveUpBtn.className = "json-array-btn move-up"
  moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  moveUpBtn.addEventListener("click", () => {
    const prev = factItem.previousElementSibling
    if (prev) {
      container.insertBefore(factItem, prev)
    }
  })

  const moveDownBtn = document.createElement("button")
  moveDownBtn.className = "json-array-btn move-down"
  moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>'
  moveDownBtn.addEventListener("click", () => {
    const next = factItem.nextElementSibling
    if (next) {
      container.insertBefore(next, factItem)
    }
  })

  actions.appendChild(moveUpBtn)
  actions.appendChild(moveDownBtn)
  actions.appendChild(deleteBtn)

  header.appendChild(title)
  header.appendChild(actions)

  factItem.appendChild(header)

  // Item content
  const content = document.createElement("div")
  content.className = "json-array-item-content"

  content.innerHTML = `
    <div class="json-form-group">
      <label class="json-form-label">Icon</label>
      <input type="text" class="json-form-input fact-icon" value="${item.icon || ""}">
      <div class="json-help-text">Font Awesome icon class (e.g., fas fa-check)</div>
    </div>
    
    <div class="json-icon-preview">
      <i class="${item.icon || "fas fa-check"}"></i>
    </div>
    
    <div class="json-form-group">
      <label class="json-form-label">Title</label>
      <input type="text" class="json-form-input fact-title" value="${item.title || ""}">
    </div>
    
    <div class="json-form-group">
      <label class="json-form-label">Text</label>
      <textarea class="json-form-textarea fact-text">${item.text || ""}</textarea>
    </div>
  `

  factItem.appendChild(content)

  // Update icon preview when icon input changes
  setTimeout(() => {
    const iconInput = content.querySelector(".fact-icon")
    const iconPreview = content.querySelector(".json-icon-preview")

    iconInput.addEventListener("input", () => {
      iconPreview.innerHTML = `<i class="${iconInput.value}"></i>`
    })

    // Update title when title input changes
    const titleInput = content.querySelector(".fact-title")
    titleInput.addEventListener("input", () => {
      title.textContent = titleInput.value || `Fact ${index + 1}`
    })
  }, 0)

  container.appendChild(factItem)
}

// Get facts editor data
function getFactsEditorData() {
  const factsData = {
    items: [],
  }

  // Get items
  const factItems = document.querySelectorAll("#facts-items-container .json-array-item")
  factItems.forEach((item) => {
    const icon = item.querySelector(".fact-icon").value
    const title = item.querySelector(".fact-title").value
    const text = item.querySelector(".fact-text").value

    factsData.items.push({
      icon,
      title,
      text,
    })
  })

  return factsData
}

// Create contact editor
function createContactEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "contact")

  // Contact message
  const contactMessage = document.createElement("div")
  contactMessage.className = "json-form-message"
  contactMessage.innerHTML = "<strong>Contact Information Editor</strong><br>Edit your contact information items below."
  container.appendChild(contactMessage)

  // Contact items section
  const itemsSection = document.createElement("div")
  itemsSection.innerHTML = `
    <div class="json-section-title">Contact Information</div>
    <div class="json-array-container" id="contact-items-container"></div>
    <button type="button" class="json-add-item-btn" id="add-contact-item">
      <i class="fas fa-plus"></i> Add Contact Item
    </button>
  `
  container.appendChild(itemsSection)

  // Add the items container to the DOM first
  const itemsContainer = itemsSection.querySelector("#contact-items-container")

  // Add existing items
  const contactInfo = jsonData.contact_info || []
  contactInfo.forEach((item, index) => {
    addContactItem(itemsContainer, item, index)
  })

  // Add item button handler
  setTimeout(() => {
    document.getElementById("add-contact-item").addEventListener("click", () => {
      const newItem = {
        icon: "fas fa-phone-alt",
        title: "Phone",
        content: "+212 643-562-320",
        link: "",
      }
      addContactItem(itemsContainer, newItem, contactInfo.length)
    })
  }, 0)

  return container
}

// Add a contact item to the container
function addContactItem(container, item, index) {
  const contactItem = document.createElement("div")
  contactItem.className = "json-array-item"
  contactItem.setAttribute("data-item-index", index)

  // Item header
  const header = document.createElement("div")
  header.className = "json-array-item-header"

  const title = document.createElement("h4")
  title.className = "json-array-item-title"
  title.textContent = item.title || `Contact ${index + 1}`

  const actions = document.createElement("div")
  actions.className = "json-array-actions"

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "json-array-btn delete"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.addEventListener("click", () => {
    container.removeChild(contactItem)
  })

  const moveUpBtn = document.createElement("button")
  moveUpBtn.className = "json-array-btn move-up"
  moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  moveUpBtn.addEventListener("click", () => {
    const prev = contactItem.previousElementSibling
    if (prev) {
      container.insertBefore(contactItem, prev)
    }
  })

  const moveDownBtn = document.createElement("button")
  moveDownBtn.className = "json-array-btn move-down"
  moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>'
  moveDownBtn.addEventListener("click", () => {
    const next = contactItem.nextElementSibling
    if (next) {
      container.insertBefore(next, contactItem)
    }
  })

  actions.appendChild(moveUpBtn)
  actions.appendChild(moveDownBtn)
  actions.appendChild(deleteBtn)

  header.appendChild(title)
  header.appendChild(actions)

  contactItem.appendChild(header)

  // Item content
  const content = document.createElement("div")
  content.className = "json-array-item-content"

  content.innerHTML = `
    <div class="json-form-group">
      <label class="json-form-label">Icon</label>
      <input type="text" class="json-form-input contact-icon" value="${item.icon || ""}">
      <div class="json-help-text">Font Awesome icon class (e.g., fas fa-phone-alt)</div>
    </div>
    
    <div class="json-icon-preview">
      <i class="${item.icon || "fas fa-phone-alt"}"></i>
    </div>
    
    <div class="json-form-group">
      <label class="json-form-label">Title</label>
      <input type="text" class="json-form-input contact-title" value="${item.title || ""}">
    </div>
    
    <div class="json-form-group">
      <label class="json-form-label">Content</label>
      <input type="text" class="json-form-input contact-content" value="${item.content || ""}">
    </div>
    
    <div class="json-form-group">
      <label class="json-form-label">Link (optional)</label>
      <input type="text" class="json-form-input contact-link" value="${item.link || ""}">
      <div class="json-help-text">URL for this contact item (e.g., tel:+212643562320, mailto:email@example.com)</div>
    </div>
  `

  contactItem.appendChild(content)

  // Update icon preview when icon input changes
  setTimeout(() => {
    const iconInput = content.querySelector(".contact-icon")
    const iconPreview = content.querySelector(".json-icon-preview")

    iconInput.addEventListener("input", () => {
      iconPreview.innerHTML = `<i class="${iconInput.value}"></i>`
    })

    // Update title when title input changes
    const titleInput = content.querySelector(".contact-title")
    titleInput.addEventListener("input", () => {
      title.textContent = titleInput.value || `Contact ${index + 1}`
    })
  }, 0)

  container.appendChild(contactItem)
}

// Get contact editor data
function getContactEditorData() {
  const contactData = {
    contact_info: [],
  }

  // Get items
  const contactItems = document.querySelectorAll("#contact-items-container .json-array-item")
  contactItems.forEach((item) => {
    const icon = item.querySelector(".contact-icon").value
    const title = item.querySelector(".contact-title").value
    const content = item.querySelector(".contact-content").value
    const link = item.querySelector(".contact-link").value

    contactData.contact_info.push({
      icon,
      title,
      content,
      link,
    })
  })

  return contactData
}

// Create icon editor
function createIconEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "icon")

  // Icon message
  const iconMessage = document.createElement("div")
  iconMessage.className = "json-form-message"
  iconMessage.innerHTML =
    "<strong>Icon Editor</strong><br>Choose an icon from the list below or enter a custom icon class."
  container.appendChild(iconMessage)

  // Icon input
  const iconInputGroup = document.createElement("div")
  iconInputGroup.className = "json-form-group"
  iconInputGroup.innerHTML = `
    <label class="json-form-label">Icon Class</label>
    <input type="text" class="json-form-input" id="icon-class" value="${jsonData.icone || ""}">
    <div class="json-help-text">Font Awesome icon class (e.g., fas fa-map-marker-alt)</div>
  `
  container.appendChild(iconInputGroup)

  // Icon preview
  const iconPreview = document.createElement("div")
  iconPreview.className = "json-icon-preview"
  iconPreview.innerHTML = `<i class="${jsonData.icone || ""}"></i>`
  container.appendChild(iconPreview)

  // Icon search
  const iconSearch = document.createElement("div")
  iconSearch.className = "json-icon-search"
  iconSearch.innerHTML = `
    <i class="fas fa-search"></i>
    <input type="text" placeholder="Search icons...">
  `
  container.appendChild(iconSearch)

  // Icon grid
  const iconGrid = document.createElement("div")
  iconGrid.className = "json-icon-grid"

  // Common icons
  const commonIcons = [
    { icon: "fas fa-map-marker-alt", name: "Location" },
    { icon: "fas fa-phone-alt", name: "Phone" },
    { icon: "fas fa-envelope", name: "Email" },
    { icon: "fas fa-calendar", name: "Calendar" },
    { icon: "fas fa-user", name: "User" },
    { icon: "fas fa-car", name: "Car" },
    { icon: "fas fa-plane", name: "Plane" },
    { icon: "fas fa-hotel", name: "Hotel" },
    { icon: "fas fa-utensils", name: "Food" },
    { icon: "fas fa-hiking", name: "Hiking" },
    { icon: "fas fa-mountain", name: "Mountain" },
    { icon: "fas fa-umbrella-beach", name: "Beach" },
    { icon: "fas fa-sun", name: "Sun" },
    { icon: "fas fa-moon", name: "Moon" },
    { icon: "fas fa-star", name: "Star" },
    { icon: "fas fa-heart", name: "Heart" },
    { icon: "fas fa-camera", name: "Camera" },
    { icon: "fas fa-video", name: "Video" },
    { icon: "fas fa-music", name: "Music" },
    { icon: "fas fa-book", name: "Book" },
    { icon: "fas fa-map", name: "Map" },
    { icon: "fas fa-compass", name: "Compass" },
    { icon: "fas fa-globe", name: "Globe" },
    { icon: "fas fa-bus", name: "Bus" },
    { icon: "fas fa-train", name: "Train" },
    { icon: "fas fa-bicycle", name: "Bicycle" },
    { icon: "fas fa-walking", name: "Walking" },
    { icon: "fas fa-swimmer", name: "Swimming" },
    { icon: "fas fa-skiing", name: "Skiing" },
    { icon: "fas fa-snowboarding", name: "Snowboarding" },
    { icon: "fas fa-ship", name: "Ship" },
    { icon: "fas fa-anchor", name: "Anchor" },
    { icon: "fas fa-fish", name: "Fish" },
    { icon: "fas fa-tree", name: "Tree" },
    { icon: "fas fa-leaf", name: "Leaf" },
    { icon: "fas fa-seedling", name: "Seedling" },
    { icon: "fas fa-coffee", name: "Coffee" },
    { icon: "fas fa-glass-martini", name: "Drink" },
    { icon: "fas fa-beer", name: "Beer" },
    { icon: "fas fa-wine-glass", name: "Wine" },
  ]

  commonIcons.forEach((iconData) => {
    const iconItem = document.createElement("div")
    iconItem.className = "json-icon-item"
    iconItem.setAttribute("data-icon", iconData.icon)

    if (iconData.icon === jsonData.icone) {
      iconItem.classList.add("selected")
    }

    iconItem.innerHTML = `
      <i class="${iconData.icon}"></i>
      <span>${iconData.name}</span>
    `

    iconItem.addEventListener("click", () => {
      // Update input value
      document.getElementById("icon-class").value = iconData.icon

      // Update preview
      iconPreview.innerHTML = `<i class="${iconData.icon}"></i>`

      // Update selected state
      document.querySelectorAll(".json-icon-item").forEach((item) => {
        item.classList.remove("selected")
      })
      iconItem.classList.add("selected")
    })

    iconGrid.appendChild(iconItem)
  })

  container.appendChild(iconGrid)

  // Update preview when input changes
  setTimeout(() => {
    const iconInput = document.getElementById("icon-class")

    iconInput.addEventListener("input", () => {
      iconPreview.innerHTML = `<i class="${iconInput.value}"></i>`

      // Update selected state in grid
      document.querySelectorAll(".json-icon-item").forEach((item) => {
        if (item.getAttribute("data-icon") === iconInput.value) {
          item.classList.add("selected")
        } else {
          item.classList.remove("selected")
        }
      })
    })
  }, 0)

  return container
}

// Get icon editor data
function getIconEditorData() {
  const iconData = {
    icone: document.getElementById("icon-class").value,
  }

  return iconData
}

// Create price editor
function createPriceEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "price")

  // Price message
  const priceMessage = document.createElement("div")
  priceMessage.className = "json-form-message"
  priceMessage.innerHTML = "<strong>Price Editor</strong><br>Edit the price information below."
  container.appendChild(priceMessage)

  // Price input
  const priceInputGroup = document.createElement("div")
  priceInputGroup.className = "json-form-group"
  priceInputGroup.innerHTML = `
    <label class="json-form-label">Price</label>
    <input type="text" class="json-form-input" id="price-value" value="${jsonData.price || ""}">
    <div class="json-help-text">Enter the price (e.g., $99, €199, From $299)</div>
  `
  container.appendChild(priceInputGroup)

  return container
}

// Get price editor data
function getPriceEditorData() {
  const priceData = {
    price: document.getElementById("price-value").value,
  }

  return priceData
}

// Create link editor
function createLinkEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "link")

  // Link message
  const linkMessage = document.createElement("div")
  linkMessage.className = "json-form-message"
  linkMessage.innerHTML = "<strong>Link Editor</strong><br>Edit the link text and URL below."
  container.appendChild(linkMessage)

  // Link text input
  const linkTextGroup = document.createElement("div")
  linkTextGroup.className = "json-form-group"
  linkTextGroup.innerHTML = `
    <label class="json-form-label">Link Text</label>
    <input type="text" class="json-form-input" id="link-text" value="${jsonData.link_text || "Read More"}">
  `
  container.appendChild(linkTextGroup)

  // Link URL input
  const linkUrlGroup = document.createElement("div")
  linkUrlGroup.className = "json-form-group"
  linkUrlGroup.innerHTML = `
    <label class="json-form-label">Link URL</label>
    <input type="text" class="json-form-input" id="link-url" value="${jsonData.link || ""}">
    <div class="json-help-text">Enter the full URL  id="link-url" value="${jsonData.link || ""}">
    <div class="json-help-text">Enter the full URL (e.g., https://example.com/page)</div>
  `
  container.appendChild(linkUrlGroup)

  return container
}

// Get link editor data
function getLinkEditorData() {
  const linkData = {
    link_text: document.getElementById("link-text").value,
    link: document.getElementById("link-url").value,
  }

  return linkData
}

// Create social editor
function createSocialEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "social")

  // Social message
  const socialMessage = document.createElement("div")
  socialMessage.className = "json-form-message"
  socialMessage.innerHTML = "<strong>Social Link Editor</strong><br>Edit the social media link below."
  container.appendChild(socialMessage)

  // Platform input (disabled)
  const platformGroup = document.createElement("div")
  platformGroup.className = "json-form-group"
  platformGroup.innerHTML = `
    <label class="json-form-label">Platform</label>
    <input type="text" class="json-form-input" id="social-platform" value="${jsonData.type || "social_link"}" disabled>
  `
  container.appendChild(platformGroup)

  // Icon input
  const iconGroup = document.createElement("div")
  iconGroup.className = "json-form-group"
  iconGroup.innerHTML = `
    <label class="json-form-label">Icon</label>
    <input type="text" class="json-form-input" id="social-icon" value="${jsonData.icon || ""}">
    <div class="json-help-text">Font Awesome icon class (e.g., fab fa-facebook, fab fa-instagram)</div>
  `
  container.appendChild(iconGroup)

  // Icon preview
  const iconPreview = document.createElement("div")
  iconPreview.className = "json-icon-preview"
  iconPreview.innerHTML = `<i class="${jsonData.icon || ""}"></i>`
  container.appendChild(iconPreview)

  // Common social icons
  const socialIcons = document.createElement("div")
  socialIcons.className = "json-icon-grid"

  const commonSocialIcons = [
    { icon: "fab fa-facebook", name: "Facebook" },
    { icon: "fab fa-twitter", name: "Twitter" },
    { icon: "fab fa-instagram", name: "Instagram" },
    { icon: "fab fa-linkedin", name: "LinkedIn" },
    { icon: "fab fa-youtube", name: "YouTube" },
    { icon: "fab fa-pinterest", name: "Pinterest" },
    { icon: "fab fa-snapchat", name: "Snapchat" },
    { icon: "fab fa-tiktok", name: "TikTok" },
    { icon: "fab fa-whatsapp", name: "WhatsApp" },
    { icon: "fab fa-telegram", name: "Telegram" },
    { icon: "fab fa-discord", name: "Discord" },
    { icon: "fab fa-reddit", name: "Reddit" },
  ]

  commonSocialIcons.forEach((iconData) => {
    const iconItem = document.createElement("div")
    iconItem.className = "json-icon-item"
    iconItem.setAttribute("data-icon", iconData.icon)

    if (iconData.icon === jsonData.icon) {
      iconItem.classList.add("selected")
    }

    iconItem.innerHTML = `
      <i class="${iconData.icon}"></i>
      <span>${iconData.name}</span>
    `

    iconItem.addEventListener("click", () => {
      // Update input value
      document.getElementById("social-icon").value = iconData.icon

      // Update preview
      iconPreview.innerHTML = `<i class="${iconData.icon}"></i>`

      // Update selected state
      document.querySelectorAll(".json-icon-item").forEach((item) => {
        item.classList.remove("selected")
      })
      iconItem.classList.add("selected")
    })

    socialIcons.appendChild(iconItem)
  })

  container.appendChild(socialIcons)

  // Update preview when input changes
  setTimeout(() => {
    const iconInput = document.getElementById("social-icon")

    iconInput.addEventListener("input", () => {
      iconPreview.innerHTML = `<i class="${iconInput.value}"></i>`

      // Update selected state in grid
      document.querySelectorAll(".json-icon-item").forEach((item) => {
        if (item.getAttribute("data-icon") === iconInput.value) {
          item.classList.add("selected")
        } else {
          item.classList.remove("selected")
        }
      })
    })
  }, 0)

  return container
}

// Get social editor data
function getSocialEditorData() {
  const socialData = {
    type: "social_link",
    icon: document.getElementById("social-icon").value,
  }

  return socialData
}

// Create highlights editor
function createHighlightsEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-form-editor"
  container.setAttribute("data-editor-type", "highlights")

  // Highlights message
  const highlightsMessage = document.createElement("div")
  highlightsMessage.className = "json-form-message"
  highlightsMessage.innerHTML =
    "<strong>Highlights Editor</strong><br>Edit the highlights list below. You can add, remove, or reorder items."
  container.appendChild(highlightsMessage)

  // Highlights items section
  const itemsSection = document.createElement("div")
  itemsSection.innerHTML = `
    <div class="json-section-title">Highlights</div>
    <div class="json-array-container" id="highlights-items-container"></div>
    <button type="button" class="json-add-item-btn" id="add-highlight-item">
      <i class="fas fa-plus"></i> Add Highlight
    </button>
  `
  container.appendChild(itemsSection)

  // Add the items container to the DOM first
  const itemsContainer = itemsSection.querySelector("#highlights-items-container")

  // Add existing items
  const highlights = jsonData.highlights || []
  highlights.forEach((highlight, index) => {
    addHighlightItem(itemsContainer, highlight, index)
  })

  // Add item button handler
  setTimeout(() => {
    document.getElementById("add-highlight-item").addEventListener("click", () => {
      const newHighlight = "New highlight item"
      addHighlightItem(itemsContainer, newHighlight, highlights.length)
    })
  }, 0)

  return container
}

// Add a highlight item to the container
function addHighlightItem(container, highlight, index) {
  const highlightItem = document.createElement("div")
  highlightItem.className = "json-array-item"
  highlightItem.setAttribute("data-item-index", index)

  // Item header
  const header = document.createElement("div")
  header.className = "json-array-item-header"

  const title = document.createElement("h4")
  title.className = "json-array-item-title"
  title.textContent = `Highlight ${index + 1}`

  const actions = document.createElement("div")
  actions.className = "json-array-actions"

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "json-array-btn delete"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.addEventListener("click", () => {
    container.removeChild(highlightItem)
  })

  const moveUpBtn = document.createElement("button")
  moveUpBtn.className = "json-array-btn move-up"
  moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  moveUpBtn.addEventListener("click", () => {
    const prev = highlightItem.previousElementSibling
    if (prev) {
      container.insertBefore(highlightItem, prev)
    }
  })

  const moveDownBtn = document.createElement("button")
  moveDownBtn.className = "json-array-btn move-down"
  moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>'
  moveDownBtn.addEventListener("click", () => {
    const next = highlightItem.nextElementSibling
    if (next) {
      container.insertBefore(next, highlightItem)
    }
  })

  actions.appendChild(moveUpBtn)
  actions.appendChild(moveDownBtn)
  actions.appendChild(deleteBtn)

  header.appendChild(title)
  header.appendChild(actions)

  highlightItem.appendChild(header)

  // Item content
  const content = document.createElement("div")
  content.className = "json-array-item-content"

  content.innerHTML = `
    <div class="json-form-group">
      <label class="json-form-label">Highlight Text</label>
      <textarea class="json-form-textarea highlight-text">${highlight || ""}</textarea>
    </div>
  `

  highlightItem.appendChild(content)

  container.appendChild(highlightItem)
}

// Get highlights editor data
function getHighlightsEditorData() {
  const highlightsData = {
    highlights: [],
  }

  // Get items
  const highlightItems = document.querySelectorAll("#highlights-items-container .json-array-item")
  highlightItems.forEach((item) => {
    const text = item.querySelector(".highlight-text").value
    highlightsData.highlights.push(text)
  })

  return highlightsData
}

// Create navbar editor
function createNavbarEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "navbar-editor"
  container.setAttribute("data-editor-type", "navbar")

  // Navbar message
  const navbarMessage = document.createElement("div")
  navbarMessage.className = "json-form-message"
  navbarMessage.innerHTML =
    "<strong>Navigation Menu Editor</strong><br>Edit your navigation menu items below. You can add, remove, or reorder items."
  container.appendChild(navbarMessage)

  // Navbar items section
  const itemsSection = document.createElement("div")
  itemsSection.innerHTML = `
    <div class="json-section-title">Menu Items</div>
    <div class="navbar-items-container" id="navbar-items-container"></div>
    <button type="button" class="json-add-item-btn" id="add-navbar-item">
      <i class="fas fa-plus"></i> Add Menu Item
    </button>
  `
  container.appendChild(itemsSection)

  // Add the items container to the DOM first
  const itemsContainer = itemsSection.querySelector("#navbar-items-container")

  // Add existing items
  const navItems = Array.isArray(jsonData) ? jsonData : []
  navItems.forEach((item, index) => {
    addNavbarItem(itemsContainer, item, index)
  })

  // Add item button handler
  setTimeout(() => {
    document.getElementById("add-navbar-item").addEventListener("click", () => {
      const newItem = {
        title: "New Page",
        src: "#",
      }
      addNavbarItem(itemsContainer, newItem, navItems.length)
    })
  }, 0)

  return container
}

// Add a navbar item to the container
function addNavbarItem(container, item, index) {
  const navbarItem = document.createElement("div")
  navbarItem.className = "navbar-item"
  navbarItem.setAttribute("data-item-index", index)

  // Item content
  navbarItem.innerHTML = `
    <div class="navbar-item-drag">
      <i class="fas fa-grip-vertical"></i>
    </div>
    <div class="navbar-item-inputs">
      <div class="json-form-group" style="margin-bottom: 0; flex: 1;">
        <label class="json-form-label">Menu Text</label>
        <input type="text" class="json-form-input navbar-item-text" value="${item.title || ""}">
      </div>
      <div class="json-form-group" style="margin-bottom: 0; flex: 1;">
        <label class="json-form-label">Link URL</label>
        <input type="text" class="json-form-input navbar-item-url" value="${item.src || "#"}">
      </div>
    </div>
    <div class="navbar-item-actions">
      <button type="button" class="json-array-btn delete navbar-item-delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `

  // Add event listeners
  setTimeout(() => {
    const deleteBtn = navbarItem.querySelector(".navbar-item-delete")
    deleteBtn.addEventListener("click", () => {
      container.removeChild(navbarItem)
    })

    // Add drag functionality here if needed
  }, 0)

  container.appendChild(navbarItem)
}

// Get navbar editor data
function getNavbarEditorData() {
  const navbarData = []

  // Get items
  const navbarItems = document.querySelectorAll("#navbar-items-container .navbar-item")
  navbarItems.forEach((item) => {
    const title = item.querySelector(".navbar-item-text").value
    const src = item.querySelector(".navbar-item-url").value

    navbarData.push({
      title,
      src,
    })
  })

  return navbarData
}

// Create generic editor (fallback for unknown JSON types)
function createGenericEditor(elementId, jsonData) {
  const container = document.createElement("div")
  container.className = "json-raw-editor"
  container.setAttribute("data-editor-type", "generic")

  // Generic message
  const genericMessage = document.createElement("div")
  genericMessage.className = "json-form-message"
  genericMessage.innerHTML =
    "<strong>Content Editor</strong><br>Edit the content below. Be careful to maintain the correct JSON format."
  container.appendChild(genericMessage)

  // JSON textarea
  const textarea = document.createElement("textarea")
  textarea.className = "json-raw-textarea"
  textarea.id = "generic-json-content"
  textarea.value = JSON.stringify(jsonData, null, 2)
  container.appendChild(textarea)

  // Validation error message
  const validationError = document.createElement("div")
  validationError.className = "json-validation-error"
  validationError.id = "json-validation-error"
  container.appendChild(validationError)

  // Add validation on input
  setTimeout(() => {
    textarea.addEventListener("input", () => {
      try {
        JSON.parse(textarea.value)
        validationError.classList.remove("visible")
        validationError.textContent = ""
      } catch (error) {
        validationError.classList.add("visible")
        validationError.textContent = `Invalid JSON: ${error.message}`
      }
    })
  }, 0)

  return container
}

// Get generic editor data
function getGenericEditorData() {
  try {
    const jsonContent = document.getElementById("generic-json-content").value
    return JSON.parse(jsonContent)
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`)
  }
}

// Add this new function to initialize editable navbar
function initEditableNavbar() {
  // Find the navbar element
  const navbar = document.querySelector(".navbar")
  if (!navbar) return

  // Add editable class
  navbar.classList.add("editable-navbar")

  // Add edit button
  const editBtn = document.createElement("button")
  editBtn.className = "navbar-edit-btn"
  editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Menu'
  navbar.appendChild(editBtn)

  // Get the navbar element ID
  const navbarElements = document.querySelectorAll('[data-editable="json"]')
  let navbarElementId = null

  navbarElements.forEach((element) => {
    // Check if this is a navbar element
    if (element.closest(".navbar")) {
      navbarElementId = element.dataset.elementId
    }
  })

  if (!navbarElementId) {
    // If no navbar element found, try to find it by checking all JSON elements
    navbarElements.forEach(async (element) => {
      const elementId = element.dataset.elementId
      try {
        const response = await fetch(`/dashboard/element/${elementId}/get/`)
        if (response.ok) {
          const data = await response.json()
          try {
            const jsonContent = JSON.parse(data.json_content || "{}")
            if (Array.isArray(jsonContent)) {
              // This might be a navbar
              navbarElementId = elementId
            }
          } catch (error) {
            console.error("Error parsing JSON:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching element data:", error)
      }
    })
  }

  // Add click event to edit button
  if (navbarElementId) {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      openJsonEditor(navbarElementId)
    })
  } else {
    editBtn.style.display = "none"
  }
}

// Add this new function to initialize user-friendly JSON editors
function initUserFriendlyJsonEditors() {
  // Add edit buttons to all sections with JSON content
  addJsonEditButtons()

  // Find all elements with data-editable="json" attribute
  const editableJsonElements = document.querySelectorAll('[data-editable="json"]')

  editableJsonElements.forEach((element) => {
    // Add edit indicator
    element.classList.add("editable-json")

    // Add click event to make JSON editable
    element.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // If already in edit state, return
      if (element.querySelector(".json-editor-form")) return

      const elementId = element.dataset.elementId

      // Open the modern JSON editor
      openJsonEditor(elementId)
    })
  })
}

// Add edit buttons to all sections with JSON content
function addJsonEditButtons() {
  // Find all sections that might contain JSON content
  const sections = [
    { selector: ".services-item", title: "Edit Service" },
    { selector: ".facts-row", title: "Edit Facts" },
    { selector: ".booking-form", title: "Edit Booking Form" },
    { selector: ".contact-right", title: "Edit Contact Info" },
    { selector: ".test-item", title: "Edit Testimonial" },
  ]

  sections.forEach((section) => {
    const elements = document.querySelectorAll(section.selector)

    elements.forEach((element) => {
      // Check if this element or its child has data-editable="json"
      const jsonElement =
        element.querySelector('[data-editable="json"]') ||
        (element.hasAttribute("data-editable") && element.getAttribute("data-editable") === "json" ? element : null)

      if (jsonElement && !element.querySelector(".json-edit-btn")) {
        // Create edit button
        const editBtn = document.createElement("button")
        editBtn.innerHTML = '<i class="fas fa-edit"></i> ' + section.title
        editBtn.classList.add("json-edit-btn")

        // Position the button
        editBtn.style.position = "absolute"
        editBtn.style.top = "10px"
        editBtn.style.right = "10px"
        editBtn.style.zIndex = "100"
        editBtn.style.backgroundColor = "#1ec6b6"
        editBtn.style.color = "white"
        editBtn.style.border = "none"
        editBtn.style.borderRadius = "4px"
        editBtn.style.padding = "5px 10px"
        editBtn.style.cursor = "pointer"

        // Make sure the parent has position relative for absolute positioning
        if (window.getComputedStyle(element).position === "static") {
          element.style.position = "relative"
        }

        // Add click event
        editBtn.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()

          // Trigger the click on the JSON element
          jsonElement.click()
        })

        element.appendChild(editBtn)
      }
    })
  })
}

function initEditableText() {
  // Find all elements with data-editable="text" attribute
  const editableElements = document.querySelectorAll('[data-editable="text"]')

  editableElements.forEach((element) => {
    // Add edit indicator
    element.classList.add("editable-text")

    // Add click event to make text editable
    element.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // If already in edit state, return
      if (element.querySelector("textarea")) return

      const originalText = element.innerText
      const elementId = element.dataset.elementId
      const fieldName = element.dataset.field || "description"
      const highlightItem = element.dataset.highlightItem || null
      const submitText = element.dataset.submitText || null
      const formField = element.dataset.formField || null

      // Create textarea for editing
      const textarea = document.createElement("textarea")
      textarea.value = originalText
      textarea.classList.add("editable-textarea")

      // Replace content with textarea
      element.innerText = ""
      element.appendChild(textarea)
      textarea.focus()

      // Add save button
      const saveBtn = document.createElement("button")
      saveBtn.innerText = "Save"
      saveBtn.classList.add("edit-save-btn")
      element.appendChild(saveBtn)

      // Add cancel button
      const cancelBtn = document.createElement("button")
      cancelBtn.innerText = "Cancel"
      cancelBtn.classList.add("edit-cancel-btn")
      element.appendChild(cancelBtn)

      // Save button click handler
      saveBtn.addEventListener("click", () => {
        const newText = textarea.value

        // Handle special cases for JSON content
        if (fieldName === "json_content") {
          // Fetch the current complete JSON content first
          fetch(`/dashboard/element/${elementId}/get/`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`)
              }
              return response.json()
            })
            .then((data) => {
              let jsonData = {}

              try {
                // Parse the COMPLETE existing JSON
                jsonData = JSON.parse(data.json_content || "{}")
              } catch (error) {
                console.error("Error parsing JSON:", error)
                jsonData = {}
              }

              // Update specific parts of JSON based on data attributes
              // while preserving all other data
              if (highlightItem) {
                // Update a highlight item in the highlights array
                if (!jsonData.highlights) jsonData.highlights = []
                const index = jsonData.highlights.indexOf(highlightItem)
                if (index !== -1) {
                  jsonData.highlights[index] = newText
                } else {
                  jsonData.highlights.push(newText)
                }
              } else if (submitText) {
                // Update submit text in form
                if (!jsonData.form) jsonData.form = {}
                jsonData.form.submit_text = newText
                // Preserve other form data
              } else if (formField) {
                // Update form field label
                if (!jsonData.form) jsonData.form = {}
                if (!jsonData.form.fields) jsonData.form.fields = []

                const fieldIndex = jsonData.form.fields.findIndex((f) => f.name === formField)
                if (fieldIndex !== -1) {
                  // Update just the label while preserving other field properties
                  jsonData.form.fields[fieldIndex].label = newText
                }
              }

              // Send the COMPLETE updated JSON to the server
              const formData = new FormData()
              formData.append("field", fieldName)
              formData.append("value", JSON.stringify(jsonData))

              fetch(`/dashboard/element/${elementId}/update/`, {
                method: "POST",
                body: formData,
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    // Update the element with new text
                    element.innerHTML = newText
                    showNotification("Content updated successfully")
                  } else {
                    showNotification("Error updating content", "error")
                    element.innerHTML = originalText
                  }
                })
                .catch((error) => {
                  console.error("Error:", error)
                  showNotification("Error updating content", "error")
                  element.innerHTML = originalText
                })
            })
            .catch((error) => {
              console.error("Error fetching element data:", error)
              showNotification("Error fetching element data", "error")
              element.innerHTML = originalText
            })
        } else {
          // Regular text update
          const formData = new FormData()
          formData.append("field", fieldName)
          formData.append("value", newText)

          fetch(`/dashboard/element/${elementId}/update/`, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                // Update the element with new text
                element.innerHTML = newText
                showNotification("Content updated successfully")
              } else {
                showNotification("Error updating content", "error")
                element.innerHTML = originalText
              }
            })
            .catch((error) => {
              console.error("Error:", error)
              showNotification("Error updating content", "error")
              element.innerHTML = originalText
            })
        }
      })

      // Cancel button click handler
      cancelBtn.addEventListener("click", () => {
        element.innerHTML = originalText
      })
    })
  })
}

function initEditableVideos() {
  // Find all elements with data-editable="video" attribute
  const editableVideos = document.querySelectorAll('[data-editable="video"]')

  editableVideos.forEach((videoContainer) => {
    // Add edit indicator
    videoContainer.classList.add("editable-video")

    const elementId = videoContainer.dataset.elementId

    // Create edit button
    const editBtn = document.createElement("button")
    editBtn.innerHTML = '<i class="fas fa-edit"></i>'
    editBtn.classList.add("video-edit-btn")
    videoContainer.appendChild(editBtn)

    // Edit button click handler
    editBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // Create modal for video URL input
      const modal = document.createElement("div")
      modal.classList.add("edit-modal")

      const modalContent = document.createElement("div")
      modalContent.classList.add("edit-modal-content")

      const urlInput = document.createElement("input")
      urlInput.type = "text"
      urlInput.placeholder = "Enter video URL"
      urlInput.value = videoContainer.dataset.src || ""

      const saveBtn = document.createElement("button")
      saveBtn.innerText = "Save"
      saveBtn.classList.add("edit-save-btn")

      const cancelBtn = document.createElement("button")
      cancelBtn.innerText = "Cancel"
      cancelBtn.classList.add("edit-cancel-btn")

      modalContent.appendChild(urlInput)
      modalContent.appendChild(saveBtn)
      modalContent.appendChild(cancelBtn)
      modal.appendChild(modalContent)
      document.body.appendChild(modal)

      // Save button click handler
      saveBtn.addEventListener("click", () => {
        const newUrl = urlInput.value

        // Send update to server
        const formData = new FormData()
        formData.append("field", "src")
        formData.append("value", newUrl)

        fetch(`/dashboard/element/${elementId}/update/`, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Update video source
              const video = videoContainer.querySelector("video")
              if (video) {
                const source = video.querySelector("source")
                if (source) {
                  source.src = newUrl
                  video.load()
                }
              }
              videoContainer.dataset.src = newUrl
              showNotification("Video updated successfully")
            } else {
              showNotification("Error updating video", "error")
            }

            // Remove modal
            document.body.removeChild(modal)
          })
          .catch((error) => {
            console.error("Error:", error)
            showNotification("Error updating video", "error")
            document.body.removeChild(modal)
          })
      })

      // Cancel button click handler
      cancelBtn.addEventListener("click", () => {
        document.body.removeChild(modal)
      })
    })
  })
}

function initEditableHighlights() {
  // Find all elements with data-highlight-item attribute
  const editableHighlights = document.querySelectorAll("[data-highlight-item]")

  editableHighlights.forEach((element) => {
    // Add edit indicator
    element.classList.add("editable-text")

    // Add click event to make highlight editable
    element.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // If already in edit state, return
      if (element.querySelector("textarea")) return

      const originalText = element.innerText
      const elementId = element.dataset.elementId
      const fieldName = element.dataset.field || "json_content"
      const highlightItem = element.dataset.highlightItem

      // Create textarea for editing
      const textarea = document.createElement("textarea")
      textarea.value = originalText
      textarea.classList.add("editable-textarea")

      // Replace content with textarea
      element.innerText = ""
      element.appendChild(textarea)
      textarea.focus()

      // Add save button
      const saveBtn = document.createElement("button")
      saveBtn.innerText = "Save"
      saveBtn.classList.add("edit-save-btn")
      element.appendChild(saveBtn)

      // Add cancel button
      const cancelBtn = document.createElement("button")
      cancelBtn.innerText = "Cancel"
      cancelBtn.classList.add("edit-cancel-btn")
      element.appendChild(cancelBtn)

      // Save button click handler
      saveBtn.addEventListener("click", () => {
        const newText = textarea.value

        // Fetch the current JSON content
        fetch(`/dashboard/element/${elementId}/get/`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Server returned ${response.status}: ${response.statusText}`)
            }
            return response.json()
          })
          .then((data) => {
            let jsonData = {}

            try {
              // Parse the COMPLETE existing JSON
              jsonData = JSON.parse(data.json_content || "{}")
            } catch (error) {
              console.error("Error parsing JSON:", error)
              jsonData = {}
            }

            // Update ONLY the specific highlight in the highlights array
            // while preserving all other data
            if (!jsonData.highlights) jsonData.highlights = []

            const index = jsonData.highlights.indexOf(highlightItem)
            if (index !== -1) {
              // Replace the specific highlight at its original position
              jsonData.highlights[index] = newText
            } else {
              // If not found (shouldn't happen), add it
              jsonData.highlights.push(newText)
            }

            // Send the COMPLETE updated JSON to the server
            const formData = new FormData()
            formData.append("field", fieldName)
            formData.append("value", JSON.stringify(jsonData))

            fetch(`/dashboard/element/${elementId}/update/`, {
              method: "POST",
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  // Update the element with new text
                  element.innerHTML = newText
                  // Update the data attribute
                  element.dataset.highlightItem = newText
                  showNotification("Highlight updated successfully")
                } else {
                  showNotification("Error updating highlight", "error")
                  element.innerHTML = originalText
                }
              })
              .catch((error) => {
                console.error("Error:", error)
                showNotification("Error updating highlight", "error")
                element.innerHTML = originalText
              })
          })
          .catch((error) => {
            console.error("Error fetching element data:", error)
            showNotification("Error fetching element data", "error")
            element.innerHTML = originalText
          })
      })

      // Cancel button click handler
      cancelBtn.addEventListener("click", () => {
        element.innerHTML = originalText
      })
    })
  })
}

// Add this new function to handle editable links
function initEditableLinks() {
  // Find all elements with data-editable="link" attribute
  const editableLinks = document.querySelectorAll('[data-editable="link"]')

  editableLinks.forEach((element) => {
    // Add edit indicator
    element.classList.add("editable-link")

    // Add click event to make link editable
    element.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // If already in edit state, return
      if (element.querySelector("input")) return

      const originalHref = element.getAttribute("href")
      const originalText = element.innerText
      const elementId = element.dataset.elementId
      const fieldName = element.dataset.field || "src"
      const textField = element.dataset.textField || "title"

      // Create modal for link editing
      const modal = document.createElement("div")
      modal.classList.add("edit-modal")

      const modalContent = document.createElement("div")
      modalContent.classList.add("edit-modal-content")

      const urlLabel = document.createElement("label")
      urlLabel.innerText = "Link URL:"

      const urlInput = document.createElement("input")
      urlInput.type = "text"
      urlInput.value = originalHref
      urlInput.style.width = "100%"
      urlInput.style.marginBottom = "10px"

      const textLabel = document.createElement("label")
      textLabel.innerText = "Link Text:"

      const textInput = document.createElement("input")
      textInput.type = "text"
      textInput.value = originalText
      textInput.style.width = "100%"
      textInput.style.marginBottom = "20px"

      const saveBtn = document.createElement("button")
      saveBtn.innerText = "Save"
      saveBtn.classList.add("edit-save-btn")

      const cancelBtn = document.createElement("button")
      cancelBtn.innerText = "Cancel"
      cancelBtn.classList.add("edit-cancel-btn")

      modalContent.appendChild(urlLabel)
      modalContent.appendChild(urlInput)
      modalContent.appendChild(textLabel)
      modalContent.appendChild(textInput)
      modalContent.appendChild(saveBtn)
      modalContent.appendChild(cancelBtn)
      modal.appendChild(modalContent)
      document.body.appendChild(modal)

      // Save button click handler
      saveBtn.addEventListener("click", () => {
        const newHref = urlInput.value
        const newText = textInput.value

        // Update URL
        const urlFormData = new FormData()
        urlFormData.append("field", fieldName)
        urlFormData.append("value", newHref)

        fetch(`/dashboard/element/${elementId}/update/`, {
          method: "POST",
          body: urlFormData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              element.setAttribute("href", newHref)

              // Now update the text
              const textFormData = new FormData()
              textFormData.append("field", textField)
              textFormData.append("value", newText)

              return fetch(`/dashboard/element/${elementId}/update/`, {
                method: "POST",
                body: textFormData,
              })
            } else {
              throw new Error("Failed to update URL")
            }
          })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              element.innerText = newText
              showNotification("Link updated successfully")
            } else {
              showNotification("Error updating link text", "error")
              element.innerText = originalText
            }
            document.body.removeChild(modal)
          })
          .catch((error) => {
            console.error("Error:", error)
            showNotification("Error updating link", "error")
            element.setAttribute("href", originalHref)
            element.innerText = originalText
            document.body.removeChild(modal)
          })
      })

      // Cancel button click handler
      cancelBtn.addEventListener("click", () => {
        document.body.removeChild(modal)
      })
    })
  })
}

function addEditModeToggle() {
  const toggleBtn = document.createElement("button")
  toggleBtn.innerHTML = '<i class="fas fa-edit"></i> Exit Edit Mode'
  toggleBtn.classList.add("edit-mode-toggle")
  document.body.appendChild(toggleBtn)

  toggleBtn.addEventListener("click", () => {
    fetch("/dashboard/toggle-edit-mode/", {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.edit_mode) {
          // Refresh to enter edit mode
          window.location.reload()
        } else {
          // Refresh to exit edit mode
          window.location.reload()
        }
      })
  })
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.classList.add("edit-notification", `edit-notification-${type}`)
  notification.innerText = message

  document.body.appendChild(notification)

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add("fade-out")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 500)
  }, 3000)
}

function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}
