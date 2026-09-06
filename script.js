'use strict';

const tabs = [...document.querySelectorAll('[data-demo-tab]')];
const panels = [...document.querySelectorAll('[data-demo-panel]')];

function selectTab(selectedTab) {
  const target = selectedTab.dataset.demoTab;

  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.demoPanel !== target;
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    selectTab(tabs[nextIndex]);
    tabs[nextIndex].focus();
  });
});

const impactToggle = document.querySelector('.impact-toggle');
const impactDetail = document.querySelector('#impact-detail');

impactToggle?.addEventListener('click', () => {
  const willExpand = impactToggle.getAttribute('aria-expanded') !== 'true';
  impactToggle.setAttribute('aria-expanded', String(willExpand));
  impactDetail.hidden = !willExpand;
  impactToggle.lastElementChild.textContent = willExpand ? '−' : '＋';
});

document.querySelector('#year').textContent = new Date().getFullYear();
