import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const NotFound = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Set document title for SEO
    document.title = "404 - Page Not Found | Test My Russian";

    // Update meta description for 404 page
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      "Page not found. The page you're looking for doesn't exist or has been moved."
    );

    // Set proper status code indication for crawlers
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", "noindex, follow");

    // Add prerender status code meta tag for bot crawlers (used by prerender.io and similar services)
    let metaStatus = document.querySelector('meta[name="prerender-status-code"]');
    if (!metaStatus) {
      metaStatus = document.createElement('meta');
      metaStatus.setAttribute('name', 'prerender-status-code');
      document.head.appendChild(metaStatus);
    }
    metaStatus.setAttribute('content', '404');

    // Add Yandex-specific meta tag
    let metaYandex = document.querySelector('meta[name="robots"][content*="unavailable_after"]');
    if (!metaYandex) {
      const yandexMeta = document.createElement('meta');
      yandexMeta.setAttribute('name', 'robots');
      yandexMeta.setAttribute('content', 'noindex');
      document.head.appendChild(yandexMeta);
    }

    // Add a hidden element to indicate this is a 404 page to crawlers
    try {
      const statusElement = document.createElement('div');
      statusElement.setAttribute('data-status-code', '404');
      statusElement.setAttribute('data-page-status', 'not-found');
      statusElement.style.display = 'none';
      statusElement.textContent = '404 Page Not Found';
      statusElement.className = 'page-status-404';
      document.body.appendChild(statusElement);

      // Add structured data for 404
      const structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "404 Error - Page Not Found",
        "description": "The requested page could not be found",
        "url": window.location.href
      });
      document.head.appendChild(structuredData);
    } catch (e) {
      // Handle error in case window/document aren't available
      console.error('Error setting 404 page metadata:', e);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
};