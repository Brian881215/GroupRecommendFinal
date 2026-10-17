import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GroupPage from './index';

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.OPEN;
    this.send = jest.fn();
    this.close = jest.fn(() => {
      this.readyState = MockWebSocket.CLOSED;
    });
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }
}
MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;
MockWebSocket.instances = [];

const baseGroup = {
  id: 5,
  title: '測試群組',
  description: '一起吃飯吧',
  photo: '',
  meetingPlace: '政大商院一樓',
  maxNumber: 5,
  price: 300,
  diningTime: '2026-08-01T12:00:00.000Z',
  creatorId: 1,
  memberCount: 1,
  districts: '大安區',
  recommendationFlag: false,
  submitFlag: false,
};

const baseMembers = [{ userId: 1, userName: 'Alice' }];

const restaurant = (id, name) => ({
  id,
  name,
  rating: 4.5,
  reviewCount: 10,
  averageCost: 300,
  address: '台北市',
  tags: "['美食','聚餐']",
  link: 'https://example.com',
});

function mockFetch({ group = baseGroup, members = baseMembers, messagesText = '', recommend = [], recommend2 = [] } = {}) {
  return jest.fn((url, options) => {
    const method = (options && options.method) || 'GET';

    if (url.includes('/groups/members/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(members) });
    }
    if (url.includes('/groups/messages/')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve(messagesText) });
    }
    if (method === 'POST' && url.includes('/groups/recommendationFlag/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: 'ok' }) });
    }
    if (method === 'POST' && url.includes('/groups/recommendations')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    if (url.includes('/groups/recommend2DB/') || url.includes('/groups/recommend2/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(recommend2) });
    }
    if (url.includes('/groups/recommendDB/') || url.includes('/groups/recommend/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(recommend) });
    }
    if (/\/groups\/\d+$/.test(url)) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(group) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

const renderGroupPage = () =>
  render(
    <MemoryRouter initialEntries={['/group/5']}>
      <Routes>
        <Route path="/group/:groupId" element={<GroupPage />} />
      </Routes>
    </MemoryRouter>
  );

const renderGroupPageStrict = () =>
  render(
    <React.StrictMode>
      <MemoryRouter initialEntries={['/group/5']}>
        <Routes>
          <Route path="/group/:groupId" element={<GroupPage />} />
        </Routes>
      </MemoryRouter>
    </React.StrictMode>
  );

beforeEach(() => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('userName', 'Alice');
  global.WebSocket = MockWebSocket;
  MockWebSocket.instances = [];
});

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('renders group info after fetch', async () => {
  global.fetch = mockFetch();
  renderGroupPage();

  expect(await screen.findByText('測試群組')).toBeInTheDocument();
  expect(screen.getByText(/政大商院一樓/)).toBeInTheDocument();
});

test('opens the members modal and lists members', async () => {
  global.fetch = mockFetch();
  renderGroupPage();

  await screen.findByText('測試群組');
  userEvent.click(screen.getByRole('button', { name: /瀏覽群組人員/ }));

  expect(await screen.findByText('Alice')).toBeInTheDocument();
});

test('sends a chat message over the socket', async () => {
  global.fetch = mockFetch();
  renderGroupPage();

  await screen.findByText('測試群組');
  await waitFor(() => expect(MockWebSocket.instances).toHaveLength(1));

  const input = screen.getByPlaceholderText('請輸入聊天訊息');
  userEvent.type(input, '大家好');
  userEvent.click(screen.getByLabelText('送出訊息'));

  await waitFor(() => expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith(
    JSON.stringify({ userId: '1', userName: 'Alice', text: '大家好' })
  ));
});

test('shows a validation message when submitting without filling required fields', async () => {
  global.fetch = mockFetch({
    group: { ...baseGroup, recommendationFlag: true },
    recommend: [restaurant(1, '餐廳A')],
    recommend2: [restaurant(2, '餐廳B')],
  });
  renderGroupPage();

  // Loading the recommendation lists takes an extra round trip after the
  // initial group fetch (fetchGroup -> fetchRecommendationsFromDB), so give
  // this a longer timeout than the default findBy* 1000ms.
  await screen.findByText('團體推薦清單1', {}, { timeout: 3000 });
  // antd auto-inserts a space between two-character Chinese button labels
  // ("提 交", not "提交"), so match loosely rather than on the exact string.
  const submitButton = await screen.findByRole('button', { name: /提\s*交/ });
  userEvent.click(submitButton);

  expect(await screen.findByText('請填寫兩個推薦清單評分與最終決定的餐廳編號並各選擇一到多個餐廳到最愛')).toBeInTheDocument();

  expect(global.fetch.mock.calls.some(([url, options]) => options?.method === 'POST' && url.includes('/groups/recommendations'))).toBe(false);
});

test('StrictMode double-mount only ever opens one socket', async () => {
  jest.useFakeTimers({ advanceTimers: true });
  global.fetch = mockFetch();
  renderGroupPageStrict();

  await screen.findByText('測試群組');
  jest.advanceTimersByTime(10000);

  // The connect call is deferred by a tick specifically so that StrictMode's
  // synchronous dev-only mount -> cleanup -> mount cancels the doomed first
  // run before it ever opens a real connection. A regression here would show
  // up as a 2nd (stale-but-briefly-live) socket, which the server can still
  // broadcast to for a moment after it's told to close — that's what caused
  // messages to show up duplicated even after reconnects were fixed.
  expect(MockWebSocket.instances.length).toBe(1);

  jest.useRealTimers();
});
