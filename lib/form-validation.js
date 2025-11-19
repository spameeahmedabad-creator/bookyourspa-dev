/**
 * Form validation utilities
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return {
      isValid: false,
      error: "Email is required",
    };
  }

  const trimmed = email.trim();
  if (trimmed === "") {
    return {
      isValid: false,
      error: "Email cannot be empty",
    };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate website URL
 * @param {string} url - URL to validate
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateWebsite(url) {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "Website URL is required",
    };
  }

  const trimmed = url.trim();
  if (trimmed === "") {
    return {
      isValid: false,
      error: "Website URL cannot be empty",
    };
  }

  try {
    // Try to create URL object
    let urlToValidate = trimmed;

    // If URL doesn't start with http:// or https://, add https://
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      urlToValidate = `https://${trimmed}`;
    }

    const urlObj = new URL(urlToValidate);

    // Check if it's http or https
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: "Website must use http:// or https://",
      };
    }

    // Check if it has a valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        isValid: false,
        error: "Please enter a valid website URL",
      };
    }

    return {
      isValid: true,
      formatted: urlObj.href, // Return properly formatted URL
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Please enter a valid website URL (e.g., https://example.com)",
    };
  }
}

/**
 * Validate image URL
 * @param {string} url - Image URL to validate
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateImageUrl(url) {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "Image URL is required",
    };
  }

  const trimmed = url.trim();
  if (trimmed === "") {
    return {
      isValid: false,
      error: "Image URL cannot be empty",
    };
  }

  try {
    const urlObj = new URL(trimmed);

    // Check if it's http or https
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: "Image URL must use http:// or https://",
      };
    }

    // Check for common image extensions (optional, as some URLs don't have extensions)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const hasImageExtension = imageExtensions.some((ext) =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    // If it doesn't have an image extension, still allow it (could be a CDN URL)
    // But warn if it looks completely wrong
    if (
      !hasImageExtension &&
      !urlObj.pathname.includes("image") &&
      !urlObj.hostname.includes("imgur") &&
      !urlObj.hostname.includes("cloudinary") &&
      !urlObj.hostname.includes("unsplash")
    ) {
      // Still valid, just no obvious image indicator
    }

    return {
      isValid: true,
    };
  } catch (error) {
    return {
      isValid: false,
      error:
        "Please enter a valid image URL (e.g., https://example.com/image.jpg)",
    };
  }
}

/**
 * Validate gallery - at least one image required
 * @param {string[]} gallery - Array of image URLs
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return {
      isValid: false,
      error: "Gallery must be an array",
    };
  }

  // Filter out empty strings
  const validImages = gallery.filter((url) => url && url.trim() !== "");

  if (validImages.length === 0) {
    return {
      isValid: false,
      error: "At least one gallery image is required",
    };
  }

  // Validate each image URL
  for (let i = 0; i < validImages.length; i++) {
    const validation = validateImageUrl(validImages[i]);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Gallery image ${i + 1}: ${validation.error}`,
      };
    }
  }

  return {
    isValid: true,
  };
}
