export async function currentTab () {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  if (tabs.length < 1)
    throw new Error('no current tab!');

  if (tabs.length > 1)
    throw new Error('more than one current tab!?');

  return tabs[0];
}
