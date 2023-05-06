import JSONRPCClient from './JSONRPCClient'
import { Message, aria2Methods } from './types'

function prefix(str: string) {
    if (!str.startsWith('system.') && !str.startsWith('aria2.')) {
        str = 'aria2.' + str
    }
    return str
}

function unprefix(str: string) {
    const suffix = str.split('aria2.')[1]
    return suffix || str
}

export class Aria2RPC extends JSONRPCClient {
    withSecret(parameters: any[]) {
        let params = this.options.secret ? ['token:' + this.options.secret] : []
        if (Array.isArray(parameters)) {
            params = params.concat(parameters)
        }
        return params
    }

    _onnotification(notification: Partial<Message>) {
        const { method, params } = notification
        const event = unprefix(method!)
        if (event !== method) this.emit(event, params)
        return super._onnotification(notification)
    }

    call(method: aria2Methods, ...params: any[]) {
        return super.call(prefix(method), this.withSecret(params))
    }

    multicall(calls: [aria2Methods, any[]][]) {
        const multi = [
            calls.map(([method, ...params]) => {
                return { methodName: prefix(method), params: this.withSecret(params) }
            })
        ]
        return super.call('system.multicall', multi)
    }

    batch(calls: [aria2Methods, any[]][]) {
        return super.batch(calls.map(([method, ...params]) => [prefix(method), this.withSecret(params)]))
    }

    async listNotifications() {
        const events = await this.call('system.listNotifications')
        return events.map((event: string) => unprefix(event))
    }

    async listMethods() {
        const methods = await this.call('system.listMethods')
        return methods.map((method: string) => unprefix(method))
    }
}
