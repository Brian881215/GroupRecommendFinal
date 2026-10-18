import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignUpPage from './SignUpPage';

// Filling a dozen antd fields (two Selects + a DatePicker) is slow in jsdom.
jest.setTimeout(20000);

jest.mock('browser-image-resizer', () => ({
  readAndCompressImage: jest.fn((file) => Promise.resolve(file)),
}));

// Same synchronous FileReader stub as CreatePage.test.js: jsdom's real one is
// unreliable for File objects that cross the async compress step.
class FakeFileReader {
  readAsDataURL() {
    this.result = 'data:image/png;base64,ZmFrZQ==';
    this.onloadend && this.onloadend();
  }
}

const renderSignUpPage = () =>
  render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/TKItest" element={<div>TKI test page</div>} />
      </Routes>
    </MemoryRouter>
  );

async function pickOption(label, option) {
  fireEvent.mouseDown(screen.getByLabelText(label));
  fireEvent.click(await screen.findByTitle(option));
}

async function fillAllFields(container) {
  const fileInput = container.querySelector('input[type="file"]');
  await act(async () => {
    userEvent.upload(fileInput, new File(['dummy'], 'me.png', { type: 'image/png' }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  await screen.findByAltText('個人封面照預覽');

  userEvent.type(screen.getByLabelText('登入帳號(個人信箱)'), 'amy@example.com');
  userEvent.type(screen.getByLabelText('密碼'), 'secret123');
  userEvent.type(screen.getByLabelText('再次輸入密碼'), 'secret123');
  userEvent.type(screen.getByLabelText('姓名'), '王小美');
  userEvent.type(screen.getByLabelText('暱稱'), '小美');
  await pickOption('性別', '女');
  userEvent.type(screen.getByLabelText('生日'), '2000/01/15{enter}');
  await pickOption('星座', '水瓶');
  userEvent.type(screen.getByLabelText('居住城市'), '台北市');
  userEvent.type(screen.getByLabelText('現在職稱'), '學生');
  await pickOption('年級', '大三');
  userEvent.type(screen.getByLabelText('大學 系所'), 'NCCU MIS');
  userEvent.type(screen.getByLabelText('自我介紹'), '喜歡吃拉麵');
}

beforeEach(() => {
  global.fetch = jest.fn();
  global.FileReader = FakeFileReader;
});

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('shows required errors and does not submit an empty form', async () => {
  renderSignUpPage();

  userEvent.click(screen.getByRole('button', { name: /下一步/ }));

  expect(await screen.findByText('請輸入姓名')).toBeInTheDocument();
  expect(screen.getByText('請上傳個人封面照')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('shows an error when the two passwords differ', async () => {
  renderSignUpPage();

  userEvent.type(screen.getByLabelText('密碼'), 'secret123');
  userEvent.type(screen.getByLabelText('再次輸入密碼'), 'different');
  userEvent.click(screen.getByRole('button', { name: /下一步/ }));

  expect(await screen.findByText('兩次密碼不一致!')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('submits the new user and moves on to the TKI test', async () => {
  global.fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve(false) }) // checkEmail
    .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 99 }) }); // create user
  const { container } = renderSignUpPage();

  await fillAllFields(container);
  userEvent.click(screen.getByRole('button', { name: /下一步/ }));

  expect(await screen.findByText('TKI test page')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

  expect(global.fetch.mock.calls[0][0]).toContain('/users/checkEmail/amy@example.com');
  const [url, options] = global.fetch.mock.calls[1];
  expect(url).toMatch(/\/users$/);
  expect(options.method).toBe('POST');
  const body = JSON.parse(options.body);
  expect(body).toMatchObject({
    photo: 'data:image/png;base64,ZmFrZQ==',
    name: '王小美',
    nickname: '小美',
    email: 'amy@example.com',
    password: 'secret123',
    bio: '喜歡吃拉麵',
    gender: '女',
    starSigns: '水瓶',
    city: '台北市',
    title: '學生',
    education: 'NCCU MIS',
    grade: '大三',
  });
  expect(new Date(body.birthday).getFullYear()).toBe(2000);
  expect(body).not.toHaveProperty('confirmPassword');
  expect(localStorage.getItem('userId')).toBe('99');
});
