'use client'

import React from 'react'

export function HydrationFix(): React.JSX.Element {
  return (
    <script
      id="hydration-fix"
      dangerouslySetInnerHTML={{
        __html: `
          // Fix for hydration mismatch caused by browser extensions
          (function() {
            // List of attributes commonly injected by extensions that cause hydration issues
            const extensionAttributes = [
              'bis_register',
              'cz-shortcut-listen',
              'data-lt-installed',
              'data-extension-installed',
              'form_signature',
              'alternative_form_signature',
              'field_signature',
              'visibility_annotation',
              '__processed_d9b3df05-c66d-480f-8883-65f024753ebd__'
            ];

            // Remove extension attributes from body immediately
            if (document.body) {
              extensionAttributes.forEach(attr => {
                if (document.body.hasAttribute(attr)) {
                  document.body.removeAttribute(attr);
                }
              });
            }

            // Watch for dynamic injection and remove immediately
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.target === document.body) {
                  const attributeName = mutation.attributeName;
                  if (attributeName && extensionAttributes.includes(attributeName)) {
                    document.body.removeAttribute(attributeName);
                  }
                }
              });
            });

            // Start observing when DOM is ready
            if (document.body) {
              observer.observe(document.body, {
                attributes: true,
                attributeFilter: extensionAttributes
              });
            } else {
              // Wait for body to be available
              document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                  extensionAttributes.forEach(attr => {
                    if (document.body.hasAttribute(attr)) {
                      document.body.removeAttribute(attr);
                    }
                  });

                  observer.observe(document.body, {
                    attributes: true,
                    attributeFilter: extensionAttributes
                  });
                }
              });
            }
          })();
        `,
      }}
    />
  )
}
