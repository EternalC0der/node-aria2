# node-aria2

Aria2 RPC client for Node.js 🌍

## Features

-   Typescript support ✅
-   Promise based API 🎁
-   Support most of aria2 methods 🎉
-   Up to date with latest aria2 version (1.35.0) ✨

# Setup

## 🚀 Run aria2 with the following command

`aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all`

This will start aria2 with RPC enabled on port `6800` by default, if you want to change the port, you can do so by adding `--rpc-listen-port=PORT` to the command. <br> Run `aria2c --help` to see all the options 🎩

## 📦 Install `node-aria2` with your favorite package manager

```bash
# npm
npm install node-aria2

# yarn
yarn add node-aria2

# pnpm
pnpm add node-aria2
```

# 📡 Usage

Default options:

```typescript
{
  host: 'localhost',
  port: 6800,
  secure: false,
  secret: '',
  path: '/jsonrpc',
}
```

`secret` is optional and refers to [--rpc-secret](https://aria2.github.io/manual/en/html/aria2c.html#cmdoption--rpc-secret). If you define it, it will be added to every call for you!

If the WebSocket is open aria2.js will use the WebSocket transport, otherwise the HTTP transport.

The `"aria2."` prefix can be omitted from both methods and notifications.

### 📍open

`aria2.open()` opens the WebSocket connection. All subsequent requests will use the WebSocket transport instead of HTTP.

```typescript
aria2
    .open()
    .then(() => console.log('open'))
    .catch((err) => console.log('error', err))
```

### 📍close

`aria2.close()` closes the WebSocket connection. All subsequent requests will use the HTTP transport instead of WebSocket.

```typescript
aria2
    .close()
    .then(() => console.log('closed'))
    .catch((err) => console.log('error', err))
```

### 📍call

`aria2.call()` calls a method. Parameters are provided as arguments.

Example using [`addUri`](https://aria2.github.io/manual/en/html/aria2c.html#aria2.addUri) method to download from a magnet link.

```typescript
const magnet =
    'magnet:?xt=urn:btih:88594AAACBDE40EF3E2510C47374EC0AA396C08E&dn=bbb_sunflower_1080p_30fps_normal.mp4&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&ws=http%3a%2f%2fdistribution.bbb3d.renderfarming.net%2fvideo%2fmp4%2fbbb_sunflower_1080p_30fps_normal.mp4'
const [guid] = await aria2.call('addUri', [magnet], { dir: '/tmp' })
```

### 📍multicall

`aria2.multicall()` is a helper for [system.multicall](https://aria2.github.io/manual/en/html/aria2c.html#system.multicall). It returns an array of results or throw if any of the call failed.

```typescript
const multicall = [
    [methodA, param1, param2],
    [methodB, param1, param2]
]

const results = await aria2.multicall(multicall)
```

### 📍batch

`aria2.batch()` is a helper for [batch](https://aria2.github.io/manual/en/html/aria2c.html#system.multicall). It behaves the same as `multicall` except it returns an array of promises which gives more flexibility in handling errors.

```typescript
const batch = [
    [methodA, param1, param2],
    [methodB, param1, param2]
]

const promises = await aria2.batch(batch)
```

### 📍listNotifications

`aria2.listNotifications()` is a helper for [system.listNotifications](https://aria2.github.io/manual/en/html/aria2c.html#system.listNotifications). The difference with `aria2.call('listNotifications')` is that it removes the `"aria2."` prefix from the results.

```typescript
const notifications = await aria2.listNotifications()
/*
[
  'onDownloadStart',
  'onDownloadPause',
  'onDownloadStop',
  'onDownloadComplete',
  'onDownloadError',
  'onBtDownloadComplete'
]
*/

// notifications logger example
notifications.forEach((notification) => {
    aria2.on(notification, (params) => {
        console.log('aria2', notification, params)
    })
})
```

### 📍listMethods

`aria2.listMethods()` is a helper for [system.listMethods](https://aria2.github.io/manual/en/html/aria2c.html#system.listMethods). The difference with `aria2.call('listMethods')` is that it removes the `"aria2."` prefix for the results.

```typescript
const methods = await aria2.listMethods()
/*
[ 'addUri',
  [...]
  'system.listNotifications' ]

*/
```

### 📍events

```typescript
// emitted when the WebSocket is open.
aria2.on('open', () => {
    console.log('aria2 OPEN')
})

// emitted when the WebSocket is closed.
aria2.on('close', () => {
    console.log('aria2 CLOSE')
})

// emitted for every message sent.
aria2.on('output', (m) => {
    console.log('aria2 OUT', m)
})

// emitted for every message received.
aria2.on('input', (m) => {
    console.log('aria2 IN', m)
})
```

Additionally every [aria2 notifications](https://aria2.github.io/manual/en/html/aria2c.html#notifications) received will be emitted as an event (with and without the `"aria2."` prefix). Only available when using WebSocket.

```typescript
aria2.on('onDownloadStart', ([guid]) => {
    console.log('aria2 onDownloadStart', guid)
})
```
