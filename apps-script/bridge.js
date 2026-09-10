// Runs only inside Google's HtmlService. No cross-origin fetch or opaque success responses.
(() => {
  const config = window.AZRI_CONTACT;
  const announce = () => window.top.postMessage({ type: 'azri-contact-ready', frameId: config.frameId }, config.parentOrigin);
  const resize = () => window.top.postMessage({ type: 'azri-contact-height', frameId: config.frameId, height: document.querySelector('.contact-card').getBoundingClientRect().height + 8 }, config.parentOrigin);
  const start = () => {
    window.addEventListener('message', (event) => {
      if (event.source !== window.top || event.origin !== config.parentOrigin || event.data?.type !== 'azri-contact-ack' || event.data.frameId !== config.frameId) return;
      if (window.AZRI_CONTACT_SEND) return;
      window.AZRI_CONTACT_SEND = (payload) => new Promise((resolve, reject) => {
        google.script.run.withSuccessHandler(resolve).withFailureHandler(() => reject(new Error('unknown')))
          .submitContact({ ...payload, token: config.sessionToken });
      });
      document.dispatchEvent(new Event('azri-contact-connected'));
      document.querySelector('#contact-connection').hidden = true;
      document.querySelector('.contact-card').hidden = false;
      new ResizeObserver(resize).observe(document.querySelector('.contact-card'));
      resize();
    });
    // No input is enabled until the actual top window confirms the allowed origin.
    document.querySelector('.contact-card').hidden = true;
    announce();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
