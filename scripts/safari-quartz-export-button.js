/* global document */
(function () {
  if (document.getElementById("cv-clean-btn")) return;

  const btn = document.createElement("button");
  btn.id = "cv-clean-btn";
  btn.textContent = "🧹 Clean for Export";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 9999,
    padding: "10px 15px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  });

  btn.onclick = () => {
    // Remove unwanted elements
    document
      .querySelectorAll("footer, nav.sticky, .cv-actions, .cv-controls")
      .forEach((el) => el.remove());

    // Reset body
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // Normalize wrapper (fill viewport)
    const wrapper = document.querySelector(".cv-scale-wrapper");
    if (wrapper) {
      Object.assign(wrapper.style, {
        display: "block",
        margin: "0",
        padding: "0",
        width: "100vw",
        maxWidth: "100vw",
      });
    }

    // Aggressively normalize cv-container (keep inner padding!)
    const cv = document.querySelector(".cv-container");
    if (cv) {
      Object.assign(cv.style, {
        display: "block",
        width: "100vw", // stretch full viewport width
        height: "auto",
        margin: "0",
        maxWidth: "100vw",
        minWidth: "0",
        boxShadow: "none",
        border: "none",
        containerType: "inline-size",
      });
    }

    // Neutralise the layout's bottom spacer for the export only.
    // BaseLayout adds a 4rem ::after block below <main>'s last child. Because it is a
    // pseudo-element it cannot be removed from the DOM, and it adds 64px to the exported
    // page, which breaks the A4 ratio (2101/1440 = 1.459 instead of 1.414). Hidden here,
    // so the spacer keeps doing its job on every other page and in normal browsing.
    const exportStyles = document.createElement("style");
    exportStyles.textContent =
      "main > :last-child::after { display: none !important; }";
    document.head.appendChild(exportStyles);

    // Remove button so it won’t export
    btn.remove();
  };

  document.body.appendChild(btn);
})();
