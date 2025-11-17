import {
  parsePhoneNumberFromString,
  AsYouType,
  isValidPhoneNumber,
} from "libphonenumber-js";

/**
 * Validate phone number and return formatted variants.
 * @param {string} phone
 * @param {string} defaultCountry
 * @returns {{isValid: boolean, formatted?: string, national?: string, international?: string, country?: string, error?: string}}
 */
export function validatePhone(phone, defaultCountry = "IN") {
  if (!phone || typeof phone !== "string") {
    return {
      isValid: false,
      error: "Phone number is required",
    };
  }

  try {
    const parsed = parsePhoneNumberFromString(phone.trim(), defaultCountry);

    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        formatted: parsed.format("E.164"),
        national: parsed.formatNational(),
        international: parsed.formatInternational(),
        country: parsed.country,
      };
    }

    return {
      isValid: false,
      error: "Invalid phone number. Include country code, e.g. +91 9876543210.",
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Invalid phone number. Include country code, e.g. +91 9876543210.",
    };
  }
}

/**
 * Format phone number as user types.
 * @param {string} value
 * @param {string} defaultCountry
 * @returns {string}
 */
export function formatPhoneInput(value, defaultCountry = "IN") {
  if (!value) return "";
  const formatter = new AsYouType(defaultCountry);
  return formatter.input(value);
}

/**
 * Quick validation helper.
 * @param {string} phone
 * @param {string} defaultCountry
 * @returns {boolean}
 */
export function isValidPhone(phone, defaultCountry = "IN") {
  if (!phone) return false;
  try {
    return isValidPhoneNumber(phone, defaultCountry);
  } catch {
    return false;
  }
}
