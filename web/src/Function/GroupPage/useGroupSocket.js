import { useCallback, useEffect, useRef } from 'react';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

const apiUrlNoHttp = process.env.REACT_APP_API_NO_HTTP;

// The backend socket handler is a dumb relay with no reconnect/heartbeat
// logic of its own, so a dropped connection otherwise stays dropped until
// the user manually refreshes the page.
export default function useGroupSocket(groupId, onMessage) {
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!groupId) return undefined;

    // "Was this socket closed on purpose" has to live on the socket itself,
    // not a ref shared across effect runs. In dev, StrictMode mounts this
    // effect twice (mount -> cleanup -> mount); a shared ref gets reset to
    // false by the second run before the first socket's async close event
    // fires, so that first socket looks like a surprise disconnect and
    // triggers a reconnect — leaving two live sockets that both relay every
    // broadcast (hence messages showing up duplicated).
    let cancelled = false;
    let connectTimeout = null;

    const connect = () => {
      if (cancelled) return;
      const socket = new WebSocket(`ws://${apiUrlNoHttp}/groups/ws/messages/${groupId}`);
      let intentionalClose = false;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (error) {
          console.error('Failed to parse group socket message', error);
        }
      };

      socket.onclose = () => {
        if (intentionalClose || cancelled) return;
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      socket.onerror = (error) => {
        console.error('Group socket error', error);
      };

      socket.markIntentionalClose = () => {
        intentionalClose = true;
      };

      socketRef.current = socket;
    };

    // Deferring the actual connect by a tick means StrictMode's synchronous
    // dev-only mount -> cleanup -> mount cancels the doomed first run before
    // it ever opens a real connection. That matters because closing a socket
    // client-side isn't instant on the server: a socket that did fully open
    // can still be registered there (and receive one more broadcast) for a
    // brief moment after .close() is called, which is what caused messages
    // to still show up duplicated even once reconnects were fixed.
    connectTimeout = setTimeout(connect, 0);

    return () => {
      cancelled = true;
      clearTimeout(connectTimeout);
      clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.markIntentionalClose();
        socketRef.current.close();
      }
    };
  }, [groupId]);

  const sendMessage = useCallback((payload) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  return { sendMessage };
}
