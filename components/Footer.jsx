"use client";

export default function Footer({ variant = "full", fourthColumn = "contact" }) {
  const currentYear = new Date().getFullYear();

  if (variant === "simple") {
    return (
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; {currentYear} BookYourSpa. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  // Full variant
  const footerBgClass =
    fourthColumn === "cities"
      ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      : "bg-gray-900";

  const descriptionText =
    fourthColumn === "cities"
      ? "Your trusted platform for booking spa and wellness services across India."
      : "Your trusted platform for booking spa and wellness services.";

  return (
    <footer className={`${footerBgClass} text-white py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BookYourSpa</h3>
            <p className="text-gray-400">{descriptionText}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            {fourthColumn === "cities" ? (
              <>
                <h4 className="font-semibold mb-4">Cities</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Ahmedabad</li>
                  <li>Gandhinagar</li>
                  <li>More cities coming soon...</li>
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Ahmedabad, Gujarat</li>
                  <li>spameeahmedabad@gmail.com</li>
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} BookYourSpa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
