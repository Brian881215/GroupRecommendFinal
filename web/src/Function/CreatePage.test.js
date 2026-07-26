import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CreatePage from './CreatePage';

jest.mock('browser-image-resizer', () => ({
  readAndCompressImage: jest.fn((file) => Promise.resolve(file)),
}));

// jsdom's native FileReader/Blob handling is unreliable for File objects that
// cross an async boundary (see readAndCompressImage above), so stub it with a
// synchronous fake rather than fight jsdom's implementation.
class FakeFileReader {
  readAsDataURL() {
    this.result = 'data:image/png;base64,ZmFrZQ==';
    this.onloadend && this.onloadend();
  }
}

const renderCreatePage = () =>
  render(
    <MemoryRouter>
      <CreatePage />
    </MemoryRouter>
  );

async function fillTextFields() {
  userEvent.type(screen.getByLabelText('群組標題'), '找人一起吃飯');

  fireEvent.mouseDown(screen.getByLabelText('聚餐情境'));
  fireEvent.click(await screen.findByTitle('找一般朋友或新朋友'));

  userEvent.type(screen.getByLabelText('群組最大人數'), '5');
  userEvent.type(screen.getByLabelText('每人平均價格上限'), '500');
  userEvent.type(screen.getByLabelText('預期聚餐時間'), '2026-08-01 12:00{enter}');
  userEvent.type(screen.getByLabelText('集合地點'), '政大商院一樓');
  userEvent.type(screen.getByLabelText('群組聚餐描述'), '期末考壓力大，想找人聊聊');
}

async function uploadPhoto(container) {
  const fileInput = container.querySelector('input[type="file"]');
  const file = new File(['dummy'], 'cover.png', { type: 'image/png' });
  // The FileReader completion callback fires outside any React event handler,
  // so its setState must be flushed inside act() or it stays stale past this point.
  await act(async () => {
    userEvent.upload(fileInput, file);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  // Wait for the Upload list to render the file, confirming beforeUpload resolved.
  await screen.findByText('cover.png');
}

beforeEach(() => {
  localStorage.setItem('userId', '1');
  global.fetch = jest.fn();
  global.FileReader = FakeFileReader;
  // jsdom doesn't implement createObjectURL; antd's Upload list uses it for thumbnails.
  window.URL.createObjectURL = window.URL.createObjectURL || jest.fn(() => 'blob:fake-url');
});

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('warns and does not submit when no photo is uploaded', async () => {
  renderCreatePage();

  await fillTextFields();
  userEvent.click(screen.getByRole('button', { name: '創建您的群組' }));

  expect(await screen.findByText('請上傳封面照片')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('submits the group and shows a success message', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true });
  const { container } = renderCreatePage();

  await fillTextFields();
  await uploadPhoto(container);
  userEvent.click(screen.getByRole('button', { name: '創建您的群組' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toContain('/groups/1');
  expect(options.method).toBe('POST');
  const body = JSON.parse(options.body);
  expect(body.title).toBe('找人一起吃飯');
  expect(body.maxNumber).toBe('5');

  expect(await screen.findByText('群組創建成功！已獲得 25 積分')).toBeInTheDocument();
});

test('shows an error message when the request fails', async () => {
  global.fetch.mockResolvedValueOnce({ ok: false });
  const { container } = renderCreatePage();

  await fillTextFields();
  await uploadPhoto(container);
  userEvent.click(screen.getByRole('button', { name: '創建您的群組' }));

  expect(await screen.findByText('創建群組錯誤')).toBeInTheDocument();
});
