$(document).ready(() => {
  var count_group = $(".slider-list .slider-item").length
  var active = 0
  var timeAutoNext = 5000 // 5 seconds for auto slide
  var runAutoRun
  var birdTimeout
  var isTransitioning = false // Flag to prevent rapid clicking

  // Add time indicator
  function updateTimeIndicator() {
    $(".slider-container").removeClass("time-running")
    setTimeout(() => {
      $(".slider-container").addClass("time-running")
    }, 50)
  }

  // Function to handle text visibility based on active slide
  function updateTextVisibility() {
    // Hide text on all slides first
    $(".slider-item .slider-content").hide()

    // Only show text on the first slide (index 0)
    if (active === 0) {
      $("#item_0 .slider-content").show()
    }
  }

  function Load() {
    if (isTransitioning) return // Prevent multiple transitions
    isTransitioning = true

    // Handle the first slide differently on first load
    if (active === 0 && $("#item_0").css("display") === "none") {
      // First load of first slide
      $("#item_0").addClass("active").css("display", "block")
    } else {
      // Normal slide transition
      $(".slider-item").removeClass("active")
      $(".slider-item").removeClass("hide")

      // Set previous slide to hide
      const prevIndex = active - 1 < 0 ? count_group - 1 : active - 1
      $("#item_" + prevIndex).addClass("hide")

      // Set current slide to active
      $("#item_" + active).addClass("active")
    }

    // Update text visibility based on active slide
    updateTextVisibility()

    // Update dots if they exist
    if ($(".dots-page").length) {
      $(".dots-page div").removeClass("active")
      $("#dot_" + active).addClass("active")
    }

    $(".slider-effect").addClass("start")
    beginPosition()
    updateTimeIndicator()

    // Clear any existing auto-run timeout
    clearTimeout(runAutoRun)
    clearTimeout(birdTimeout)

    // Make the bird visible again
    $(".slider-birt").removeClass("bird-hidden")
    $(".slider-content").removeClass("expanded")

    // Set timeout to hide the bird after 12 seconds
    birdTimeout = setTimeout(() => {
      $(".slider-birt").addClass("bird-hidden")
      if (active === 0) {
        $(".slider-content").addClass("expanded")
      }
    }, 12000)

    // Set up the next auto-run
    runAutoRun = setTimeout(() => {
      Next()
    }, timeAutoNext)

    // Reset transition flag after animation completes
    setTimeout(() => {
      isTransitioning = false
    }, 800) // Match this with your animation duration
  }

  function beginPosition() {
    setTimeout(() => {
      $(".slider-effect").removeClass("start")
    }, 3000)
  }

  function Next() {
    if (isTransitioning) return
    active = active + 1 >= count_group ? 0 : active + 1
    Load()
  }

  function Prev() {
    if (isTransitioning) return
    active = active - 1 < 0 ? count_group - 1 : active - 1
    Load()
  }

  // Next button click event with preventDefault to avoid any issues
  $("#slider-next").on("click", (e) => {
    if (e && e.preventDefault) e.preventDefault()
    Next()
    return false // Ensure no default action
  })

  // Prev button click event with preventDefault to avoid any issues
  $("#slider-prev").on("click", (e) => {
    if (e && e.preventDefault) e.preventDefault()
    Prev()
    return false // Ensure no default action
  })

  // Add touch swipe support for mobile
  let touchStartX = 0
  let touchEndX = 0

  $(".slider-container").on("touchstart", (e) => {
    touchStartX = e.originalEvent.touches[0].clientX
  })

  $(".slider-container").on("touchend", (e) => {
    touchEndX = e.originalEvent.changedTouches[0].clientX
    handleSwipe()
  })

  function handleSwipe() {
    const minSwipeDistance = 50
    const swipeDistance = touchEndX - touchStartX

    if (swipeDistance > minSwipeDistance) {
      // Swiped right - go to previous
      Prev()
    } else if (swipeDistance < -minSwipeDistance) {
      // Swiped left - go to next
      Next()
    }
  }

  // Add keyboard navigation
  $(document).keydown((e) => {
    if (e.keyCode === 37) {
      // Left arrow
      Prev()
    } else if (e.keyCode === 39) {
      // Right arrow
      Next()
    }
  })

  // Ensure images are properly loaded
  $(".slider-item img").each(function () {
    const img = $(this)
    if (img.complete) {
      img.trigger("load")
    }
    img.on("load", function () {
      // Once image is loaded, make sure it's properly positioned
      $(this).css({
        "object-position": "center center",
        display: "block",
      })
    })
  })

  // Hide text content on all slides except the first one
  $(".slider-item").each(function (index) {
    if (index !== 0) {
      $(this).find(".slider-content").hide()
    }
  })

  // Initialize the slider - make sure first slide is visible
  $("#item_0").css("display", "block")
  Load()

  // Pause slider on hover
  $(".slider-container").hover(
    () => {
      clearTimeout(runAutoRun)
    },
    () => {
      if (!isTransitioning) {
        runAutoRun = setTimeout(() => {
          Next()
        }, timeAutoNext)
      }
    },
  )

  // Fix for HTML structure issue - remove duplicate h1 inside h2
  $(".header-title-text h1").each(function () {
    const text = $(this).text()
    $(this).parent().html(text)
  })

  // WhatsApp booking functionality
  $("#whatsapp-book").on("click", () => {
    // Get form values
    const name = $("#name").val()
    const email = $("#email").val()
    const phone = $("#phone").val()
    const date = $("#date").val()
    const guests = $("#guests").val()
    const message = $("#message").val()

    // Create WhatsApp message
    let whatsappMessage = `Hello, I want to book a Merzouga Experience trip\n`
    whatsappMessage += `Name: ${name}\n`
    whatsappMessage += `Email: ${email}\n`
    whatsappMessage += `Phone: ${phone}\n`
    whatsappMessage += `Date: ${date}\n`
    whatsappMessage += `Guests: ${guests}\n`
    whatsappMessage += `Message: ${message}`

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage)

    // Open WhatsApp with the message - using wa.me instead of whatsapp.com for better compatibility
    window.open(`https://wa.me/212643562320?text=${encodedMessage}`, "_blank")
  })
})
