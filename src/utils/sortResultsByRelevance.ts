import type { User } from "@clerk/nextjs/dist/api";
import type { Tab } from "@prisma/client";

// ah figure out typings
export function sortResultsByRelevance({
  query,
  tabTitles,
  usernames,
  tabs,
  artists,
}: {
  query: string;
  tabTitles?: string[];
  usernames?: string[];
  tabs?: Tab[];
  artists?: User[];
}) {
  if ((tabs && tabs.length === 0) || (artists && artists.length === 0))
    return null;

  // we get direct matches first (start of string)
  // and put those in front of the other values (the ones that just match *somewhere* in the string)
  query = query.toLowerCase();

  if (tabTitles) {
    const uniqueTabTitles = [...new Set(tabTitles)];

    const directMatches = uniqueTabTitles
      .filter((tab) => tab.toLowerCase().startsWith(query))
      .sort((a, b) => a.length - b.length);

    const sortedValues = [
      ...directMatches,
      ...uniqueTabTitles.filter((tab) => !tab.toLowerCase().startsWith(query)),
    ];

    return sortedValues;
  } else if (usernames) {
    const directMatches = usernames
      .filter((username) => username.toLowerCase().startsWith(query))
      .sort((a, b) => a.length - b.length);

    const sortedValues = [
      ...directMatches,
      ...usernames.filter(
        (username) =>
          !username.toLowerCase().startsWith(query) &&
          // below is needed since we are passing in ALL user's usernames from clerk..
          username.toLowerCase().includes(query)
      ),
    ];

    return sortedValues;
  } else if (tabs) {
    const directMatches = tabs
      .filter((tab) => tab.title.toLowerCase().startsWith(query))
      .sort((a, b) => a.title.length - b.title.length);

    const sortedValues = [
      ...directMatches,
      ...tabs.filter((tab) => !tab.title.toLowerCase().startsWith(query)),
    ];

    return sortedValues;
  } else if (artists) {
    const directMatches = artists
      .filter((artist) => artist.username!.toLowerCase().startsWith(query))
      .sort((a, b) => a.username!.length - b.username!.length);
    // usernames are mandatory in our clerk config

    const sortedValues = [
      ...directMatches,
      ...artists.filter(
        (artist) =>
          !artist.username!.toLowerCase().startsWith(query) &&
          // below is needed since we are passing in ALL user's usernames from clerk..
          artist.username!.toLowerCase().includes(query)
      ),
    ];

    return sortedValues;
  }

  return null;
}
