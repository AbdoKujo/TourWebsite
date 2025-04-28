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

  // Add edit mode toggle button
  addEditModeToggle()
})

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
          let jsonData = {}

          try {
            // Try to parse existing JSON
            jsonData = JSON.parse(element.dataset.jsonContent || "{}")
          } catch (error) {
            console.error("Error parsing JSON:", error)
            jsonData = {}
          }

          // Update specific parts of JSON based on data attributes
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
          } else if (formField) {
            // Update form field label
            if (!jsonData.form) jsonData.form = {}
            if (!jsonData.form.fields) jsonData.form.fields = []

            const fieldIndex = jsonData.form.fields.findIndex((f) => f.name === formField)
            if (fieldIndex !== -1) {
              jsonData.form.fields[fieldIndex].label = newText
            }
          }

          // Send the updated JSON to the server
          sendUpdate(elementId, fieldName, JSON.stringify(jsonData), originalText, element)
        } else {
          // Regular text update
          sendUpdate(elementId, fieldName, newText, originalText, element)
        }
      })

      // Cancel button click handler
      cancelBtn.addEventListener("click", () => {
        element.innerHTML = originalText
      })
    })
  })
}

function sendUpdate(elementId, fieldName, newValue, originalText, element) {
  // Send update to server
  const formData = new FormData()
  formData.append("field", fieldName)
  formData.append("value", newValue)

  fetch(`/dashboard/element/${elementId}/update/`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
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

function initEditableImages() {
  // Find all elements with data-editable="image" attribute
  const editableImages = document.querySelectorAll('[data-editable="image"]')

  editableImages.forEach((imgContainer) => {
    // Add edit indicator
    imgContainer.classList.add("editable-image")

    // Get the actual img element
    const img = imgContainer.querySelector("img")
    if (!img) return

    const elementId = imgContainer.dataset.elementId

    // Create edit button
    const editBtn = document.createElement("button")
    editBtn.innerHTML = '<i class="fas fa-edit"></i>'
    editBtn.classList.add("image-edit-btn")
    imgContainer.appendChild(editBtn)

    // Edit button click handler
    editBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // Create file input
      const fileInput = document.createElement("input")
      fileInput.type = "file"
      fileInput.accept = "image/*"

      // Trigger file selection
      fileInput.click()

      // File selection handler
      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files[0]) {
          const formData = new FormData()
          formData.append("image", fileInput.files[0])

          // Show loading indicator
          imgContainer.classList.add("loading")

          // Upload image to server
          fetch(`/dashboard/element/${elementId}/upload-image/`, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              imgContainer.classList.remove("loading")

              if (data.success) {
                // Update image source
                img.src = data.src
                showNotification("Image updated successfully")
              } else {
                showNotification("Error updating image", "error")
              }
            })
            .catch((error) => {
              imgContainer.classList.remove("loading")
              console.error("Error:", error)
              showNotification("Error updating image", "error")
            })
        }
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
      if (element.querySelector("textarea")) return

      const elementId = element.dataset.elementId
      const fieldName = element.dataset.field || "json_content"

      // Fetch the full JSON content from the server
      fetch(`/dashboard/element/${elementId}/get/`)
        .then((response) => response.json())
        .then((data) => {
          const jsonContent = data.json_content || "{}"

          // Create modal for JSON editing
          const modal = document.createElement("div")
          modal.classList.add("edit-modal")

          const modalContent = document.createElement("div")
          modalContent.classList.add("edit-modal-content")
          modalContent.style.width = "80%"
          modalContent.style.maxWidth = "800px"

          const title = document.createElement("h3")
          title.innerText = "Edit JSON Content"

          const jsonEditor = document.createElement("textarea")
          jsonEditor.value = jsonContent
          jsonEditor.style.width = "100%"
          jsonEditor.style.height = "400px"
          jsonEditor.style.fontFamily = "monospace"

          const saveBtn = document.createElement("button")
          saveBtn.innerText = "Save"
          saveBtn.classList.add("edit-save-btn")

          const cancelBtn = document.createElement("button")
          cancelBtn.innerText = "Cancel"
          cancelBtn.classList.add("edit-cancel-btn")

          modalContent.appendChild(title)
          modalContent.appendChild(jsonEditor)
          modalContent.appendChild(document.createElement("br"))
          modalContent.appendChild(saveBtn)
          modalContent.appendChild(cancelBtn)
          modal.appendChild(modalContent)
          document.body.appendChild(modal)

          // Save button click handler
          saveBtn.addEventListener("click", () => {
            try {
              // Validate JSON
              JSON.parse(jsonEditor.value)

              // Send update to server
              const formData = new FormData()
              formData.append("field", fieldName)
              formData.append("value", jsonEditor.value)

              fetch(`/dashboard/element/${elementId}/update/`, {
                method: "POST",
                body: formData,
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    showNotification("JSON content updated successfully")
                    // Reload the page to reflect changes
                    window.location.reload()
                  } else {
                    showNotification("Error updating JSON content", "error")
                  }

                  // Remove modal
                  document.body.removeChild(modal)
                })
                .catch((error) => {
                  console.error("Error:", error)
                  showNotification("Error updating JSON content", "error")
                  document.body.removeChild(modal)
                })
            } catch (error) {
              showNotification("Invalid JSON format", "error")
            }
          })

          // Cancel button click handler
          cancelBtn.addEventListener("click", () => {
            document.body.removeChild(modal)
          })
        })
        .catch((error) => {
          console.error("Error fetching element data:", error)
          showNotification("Error fetching element data", "error")
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
          .then((response) => response.json())
          .then((data) => {
            let jsonData = {}

            try {
              jsonData = JSON.parse(data.json_content || "{}")
            } catch (error) {
              jsonData = {}
            }

            // Update the highlight in the highlights array
            if (!jsonData.highlights) jsonData.highlights = []

            const index = jsonData.highlights.indexOf(highlightItem)
            if (index !== -1) {
              jsonData.highlights[index] = newText
            } else {
              jsonData.highlights.push(newText)
            }

            // Send the updated JSON to the server
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
