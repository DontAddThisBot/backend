import fetch from "node-fetch";

const HOSTNAME = "http://localhost:3002/api";

export async function joinChannelByUsername(username: string) {
  const request = await fetch(
    `${HOSTNAME}/bot/join?username=${encodeURIComponent(username)}`,
    {
      method: "POST",
    }
  );
  const json = await request.json();
  return json;
}

export async function partChannelByUsername(username: string) {
  const request = await fetch(
    `${HOSTNAME}/bot/part?username=${encodeURIComponent(username)}`,
    {
      method: "POST",
    }
  );
  const json = await request.json();
  return json;
}
