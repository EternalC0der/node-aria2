import { EventEmitter } from 'events'
import { WebSocket as nodeWebSocket } from 'ws'
import { RequestInfo, RequestInit } from 'node-fetch'

import Deferred from './Deferred'
import promiseEvent from './promiseEvent'
import JSONRPCError from './JSONRPCError'

import { Message, Options } from './types'
const fetch = (url: RequestInfo, init?: RequestInit) => import('node-fetch').then(({ default: fetch }) => fetch(url, init))

export default class JSONRPCClient extends EventEmitter {
    deferreds: { [key: number]: Deferred }
    lastId: number
    options: Options
    socket?: any
    WebSocket: typeof nodeWebSocket
    fetch: any
    constructor(options: Options, engines?: { WebSocket?: any; fetch?: any }) {
        super()
        this.deferreds = {}
        this.lastId = 0
        this.options = options

        if (engines?.WebSocket) this.WebSocket = engines?.WebSocket
        else this.WebSocket = nodeWebSocket
        if (engines?.fetch) this.fetch = engines?.fetch.bind(this)
        else this.fetch = fetch.bind(this)
    }

    id() {
        return this.lastId++
    }

    url(protocol: string) {
        return protocol + (this.options.secure ? 's' : '') + '://' + this.options.host + ':' + this.options.port + this.options.path
    }

    websocket(message: Partial<Message> | Partial<Message>[]) {
        return new Promise<void>((resolve, reject) => {
            const cb = (err?: any) => {
                if (err) reject(err)
                else resolve()
            }
            this.socket?.send(JSON.stringify(message), cb)
            if (this.WebSocket && this.socket instanceof this.WebSocket) cb()
        })
    }

    async http(message: Partial<Message> | Partial<Message>[]) {
        const response = await this.fetch(this.url('http'), {
            method: 'POST',
            body: JSON.stringify(message),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })

        response
            .json()
            .then((msg: any) => this._onmessage(msg))
            .catch((err: any) => {
                this.emit('error', err)
            })

        return response
    }

    _buildMessage(method: string, params: any[]) {
        if (typeof method !== 'string') {
            throw new TypeError(method + ' is not a string')
        }

        const message = {
            method,
            'json-rpc': '2.0',
            id: this.id()
        }

        if (params) Object.assign(message, { params })
        return message
    }

    async batch(calls: [string, any[]][]) {
        const message: Partial<Message>[] = calls.map(([method, params]) => {
            return this._buildMessage(method, params)
        })

        await this._send(message)

        return message.map(({ id }) => {
            const { promise } = (this.deferreds[id!] = new Deferred())
            return promise
        })
    }

    async call(method: string, parameters: any[]) {
        const message = this._buildMessage(method, parameters)
        await this._send(message)

        const { promise } = (this.deferreds[message.id] = new Deferred())

        return promise
    }

    _send(message: Partial<Message> | Partial<Message>[]) {
        this.emit('output', message)

        const { socket } = this
        return socket && socket.readyState === 1 ? this.websocket(message) : this.http(message)
    }

    _onresponse({ id, error, result }: Partial<Message>) {
        const deferred = this.deferreds[id!]
        if (!deferred) return
        if (error) deferred.reject(new JSONRPCError(error))
        else deferred.resolve(result)
        delete this.deferreds[id!]
    }

    _onnotification({ method, params }: Partial<Message>) {
        this.emit(method!, params)
    }

    _onmessage(message: Partial<Message>) {
        this.emit('input', message)

        if (Array.isArray(message)) {
            for (const object of message) {
                this._onobject(object)
            }
        } else {
            this._onobject(message)
        }
    }

    _onobject(message: Partial<Message>) {
        if (message.method === undefined) this._onresponse(message)
        else if (message.id === undefined) this._onnotification(message)
        // else this._onrequest(message)
    }

    open() {
        const socket = (this.socket = new this.WebSocket(this.url('ws')))

        socket.onclose = (...args: any[]) => {
            this.emit('close', ...args)
        }
        socket.onmessage = (event: any) => {
            let message
            try {
                message = JSON.parse(event.data.toString())
            } catch (err) {
                this.emit('error', err)
                return
            }
            this._onmessage(message)
        }
        socket.onopen = (...args: any[]) => {
            this.emit('open', ...args)
        }
        socket.onerror = (...args: any[]) => {
            this.emit('error', ...args)
        }

        return promiseEvent(this, 'open')
    }

    close() {
        const { socket } = this
        socket?.close()
        return promiseEvent(this, 'close')
    }
}
