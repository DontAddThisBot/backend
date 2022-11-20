import fetch from "node-fetch";

export async function getTwitchProfile(
  accessToken: string,
  clientID: string,
  userID?: string
) {
  const { data } = await fetch(
    `https://api.twitch.tv/helix/users${userID ? `?id=${userID}` : ""}`,
    {
      method: "GET",
      headers: {
        "Client-ID": clientID,
        Accept: "application/vnd.twitchtv.v5+json",
        Authorization: "Bearer " + accessToken,
      },
    }
  ).then((res) => res.json());
  return data;
}
