const apiUrl = process.env.REACT_APP_API_URL;

async function getJson(path) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return response.json();
}

export function fetchGroup(groupId) {
  return getJson(`/groups/${groupId}`);
}

export function fetchGroupMembers(groupId) {
  return getJson(`/groups/members/${groupId}`);
}

export function fetchRecommendations(groupId) {
  return Promise.all([
    getJson(`/groups/recommend/${groupId}`),
    getJson(`/groups/recommend2/${groupId}`),
  ]).then(([list1, list2]) => ({ list1, list2 }));
}

export function fetchRecommendationsFromDB(groupId) {
  return Promise.all([
    getJson(`/groups/recommendDB/${groupId}`),
    getJson(`/groups/recommend2DB/${groupId}`),
  ]).then(([list1, list2]) => ({ list1, list2 }));
}

export function postRecommendationFlag(groupId) {
  return fetch(`${apiUrl}/groups/recommendationFlag/${groupId}`, {
    method: 'POST',
    credentials: 'include',
  }).then((response) => {
    if (!response.ok) throw new Error('Failed to update recommendation flag');
  });
}

export function postGroupRecommendation(payload) {
  return fetch(`${apiUrl}/groups/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  }).then((response) => {
    if (!response.ok) throw new Error('Failed to submit recommendations');
  });
}

// The backend stores chat messages as one comma-joined string of raw JSON
// objects (RecommendGroup.messages), not a JSON array, so this endpoint's
// body has to be wrapped in brackets before it's valid JSON.
export async function fetchGroupMessages(groupId) {
  const response = await fetch(`${apiUrl}/groups/messages/${groupId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  const text = await response.text();
  return parseMessagesResponse(text);
}

export function parseMessagesResponse(text) {
  return JSON.parse(`[${text}]`);
}
