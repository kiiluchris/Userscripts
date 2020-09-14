

(function () {
  const adbContainer = document.getElementById('adbWarnContainer');
  adbContainer && adbContainer.remove();

  const serverChoices = ['RapidVideo', 'FE'];
  const serverChoicesSortOrder = Object.entries(serverChoices)
    .reduce((acc, [k, s]) => {
      acc[s] = +k;
      return acc;
    }, {} as { [key: string]: number });
  const elementSortValue = (el: HTMLElement) => serverChoicesSortOrder[el.innerText.trim()];

  const select = document.getElementById('selectServer')!! as HTMLSelectElement;
  if (select && serverChoices.includes(select.selectedOptions[0].innerText.trim())) return;
  const feServerUrl = [...select.options]
    .filter((el) => serverChoices.includes(el.innerText.trim()))
    .sort((a, b) => elementSortValue(a) - elementSortValue(b))[0].value;
  if (window.location.href.slice(window.location.origin.length) === feServerUrl) return;
  window.location.href = feServerUrl;
}());
